import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { TaskScheduleController } from '../src/core/task-controller'
import type { Task } from '../src/interfaces'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const fixturePath = path.resolve(__dirname, 'fixtures', 'test-template.xml')

describe('TaskScheduleIO.setTask', () => {
    it('accepts valid task objects', () => {
        const source = new TaskScheduleController(fixturePath)
        const task = source.getTask()

        expect(task).toBeDefined()

        const io = new TaskScheduleController()
        expect(() => io.setTask(task as Task)).not.toThrow()
    })

    it('rejects task objects that violate the schema', () => {
        const source = new TaskScheduleController(fixturePath)
        const task = source.getTask()
        expect(task).toBeDefined()

        const invalidTask = JSON.parse(JSON.stringify(task)) as Task
        delete (invalidTask as any).Actions

        const io = new TaskScheduleController()
        expect(() => io.setTask(invalidTask)).toThrow(/XML validation/i)
    })
})
