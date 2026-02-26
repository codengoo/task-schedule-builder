import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Task } from '../src/interfaces'

type ExecCallback = (error: Error | null, stdout: string, stderr: string) => void

const execMock = vi.fn<(command: string, callback: ExecCallback) => any>()

vi.mock('node:child_process', () => ({
    exec: (command: string, callback: ExecCallback) => execMock(command, callback),
}))

const { TaskController: TaskSchedulerSetup } = await import('../src/core/task-setup')
const { TaskScheduleIO: TaskScheduleController } = await import('../src/core/task-controller')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const fixturePath = path.resolve(__dirname, 'fixtures', 'test-template.xml')

describe('TaskController.register', () => {
    beforeEach(() => {
        execMock.mockReset()
        execMock.mockImplementation((command, callback) => {
            callback(null, 'SUCCESS', '')
            return {} as any
        })
    })

    it('registers using RegistrationInfo URI when taskName is omitted', async () => {
        const controller = new TaskController(fixturePath)
        const result = await controller.register(undefined, { force: true, runAsSystem: true })

        expect(result.success).toBe(true)
        expect(execMock).toHaveBeenCalledTimes(1)

        const command = execMock.mock.calls[0][0]
        expect(command).toContain('schtasks')
        expect(command).toContain('/Create')
        expect(command).toContain(String.raw`/TN "\Test\Template"`)
        expect(command).toContain('/XML')
        expect(command).toContain('/F')
        expect(command).toContain('/RU SYSTEM')
    })

    it('honors explicit task name and credentials', async () => {
        const controller = new TaskController(fixturePath)
        await controller.register('CustomTask', { user: 'DOMAIN\\User', password: 'secret' })

        const command = execMock.mock.calls[0][0]
        expect(command).toContain('/TN "CustomTask"')
        expect(command).toContain(String.raw`/RU "DOMAIN\User"`)
        expect(command).toContain('/RP "secret"')
    })

    it('throws when no task name can be resolved', async () => {
        const source = new TaskScheduleIO(fixturePath)
        const task = JSON.parse(JSON.stringify(source.getTask())) as Task
        if (task.RegistrationInfo) {
            delete (task.RegistrationInfo as any).URI
        }

        const controller = TaskController.fromTask(task)
        await expect(controller.register()).rejects.toThrow(/Task name is required/i)
    })

    it('returns failure when schtasks exits with an error', async () => {
        execMock.mockImplementation((command, callback) => {
            callback(new Error('boom'), '', 'Failed to register')
            return {} as any
        })

        const controller = new TaskController(fixturePath)
        const result = await controller.register('BrokenTask')

        expect(result.success).toBe(false)
        expect(result.error).toContain('boom')
    })

    it('throws when both runAsSystem and user are provided', async () => {
        const controller = new TaskController(fixturePath)
        await expect(controller.register('Task', { runAsSystem: true, user: 'User' }))
            .rejects.toThrow(/runAsSystem/)
    })

    it('throws when password is provided without user credentials', async () => {
        const controller = new TaskController(fixturePath)
        await expect(controller.register('Task', { password: 'secret' }))
            .rejects.toThrow(/password/) // message mentions password requirement
    })
})
