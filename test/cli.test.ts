import { describe, expect, it } from 'vitest'
import { createTask, deleteTask, listTasks, runTask, getTaskInfo, taskExists } from '../src/cli'
import { TaskSchedulerBuilder } from '../src/builder'

// These tests require Windows and should be run with caution
// They will create and delete actual scheduled tasks
describe.skipIf(process.platform !== 'win32')('cli integration', () => {
  const testTaskName = `TestTask_${Date.now()}`

  it('should create a task', async () => {
    const task = TaskSchedulerBuilder.create()
      .name(testTaskName)
      .description('Test task for unit tests')
      .addTimeTrigger(new Date(Date.now() + 86400000)) // Tomorrow
      .addAction('notepad.exe')
      .build()

    const result = await createTask(task, { force: true })

    expect(result.success).toBe(true)
    expect(result.error).toBeUndefined()

    // Clean up
    await deleteTask(testTaskName, { force: true })
  }, 10000)

  it('should check if task exists', async () => {
    const task = TaskSchedulerBuilder.create()
      .name(testTaskName)
      .addTimeTrigger(new Date(Date.now() + 86400000))
      .addAction('notepad.exe')
      .build()

    // Create task
    await createTask(task, { force: true })

    // Check existence
    const exists = await taskExists(testTaskName)
    expect(exists).toBe(true)

    // Clean up
    await deleteTask(testTaskName, { force: true })

    // Check again
    const existsAfterDelete = await taskExists(testTaskName)
    expect(existsAfterDelete).toBe(false)
  }, 10000)

  it('should list tasks', async () => {
    const tasks = await listTasks()

    expect(Array.isArray(tasks)).toBe(true)
    // Windows always has some default tasks
    expect(tasks.length).toBeGreaterThan(0)

    tasks.forEach((task) => {
      expect(task).toHaveProperty('name')
      expect(task).toHaveProperty('status')
    })
  }, 10000)

  it('should filter tasks when listing', async () => {
    const task = TaskSchedulerBuilder.create()
      .name(testTaskName)
      .addTimeTrigger(new Date(Date.now() + 86400000))
      .addAction('notepad.exe')
      .build()

    await createTask(task, { force: true })

    const tasks = await listTasks(testTaskName)
    expect(tasks.length).toBeGreaterThanOrEqual(1)
    expect(tasks.some(t => t.name.includes(testTaskName))).toBe(true)

    // Clean up
    await deleteTask(testTaskName, { force: true })
  }, 10000)

  it('should get task info', async () => {
    const task = TaskSchedulerBuilder.create()
      .name(testTaskName)
      .description('Test description')
      .addTimeTrigger(new Date(Date.now() + 86400000))
      .addAction('notepad.exe')
      .build()

    await createTask(task, { force: true })

    const info = await getTaskInfo(testTaskName)
    expect(info).not.toBeNull()
    expect(info?.name).toContain(testTaskName)
    expect(info?.status).toBeDefined()

    // Clean up
    await deleteTask(testTaskName, { force: true })
  }, 10000)

  it('should delete a task', async () => {
    const task = TaskSchedulerBuilder.create()
      .name(testTaskName)
      .addTimeTrigger(new Date(Date.now() + 86400000))
      .addAction('notepad.exe')
      .build()

    await createTask(task, { force: true })

    const result = await deleteTask(testTaskName, { force: true })
    expect(result.success).toBe(true)

    // Verify deletion
    const exists = await taskExists(testTaskName)
    expect(exists).toBe(false)
  }, 10000)

  it('should handle task creation with force flag', async () => {
    const task = TaskSchedulerBuilder.create()
      .name(testTaskName)
      .addTimeTrigger(new Date(Date.now() + 86400000))
      .addAction('notepad.exe')
      .build()

    // Create task first time
    const result1 = await createTask(task, { force: true })
    expect(result1.success).toBe(true)

    // Create same task again with force (should overwrite)
    const result2 = await createTask(task, { force: true })
    expect(result2.success).toBe(true)

    // Clean up
    await deleteTask(testTaskName, { force: true })
  }, 15000)

  it('should create a complex task', async () => {
    const task = TaskSchedulerBuilder.create()
      .name(testTaskName)
      .description('Complex test task')
      .author('Test Suite')
      .addTimeTrigger(new Date(Date.now() + 86400000), {
        repetitionInterval: 'PT1H',
        repetitionDuration: 'PT24H',
      })
      .addAction('cmd.exe', '/c echo Hello World')
      .runWithHighestPrivileges()
      .hidden()
      .setSettings({
        executionTimeLimit: 'PT2H',
        priority: 5,
      })
      .build()

    const result = await createTask(task, { force: true })
    expect(result.success).toBe(true)

    const exists = await taskExists(testTaskName)
    expect(exists).toBe(true)

    // Clean up
    await deleteTask(testTaskName, { force: true })
  }, 10000)

  it('should return null for non-existent task info', async () => {
    const info = await getTaskInfo('NonExistentTask_XYZ_123')
    expect(info).toBeNull()
  })

  it('should handle errors gracefully', async () => {
    const result = await deleteTask('NonExistentTask_XYZ_123')
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })
})

// Unit tests that don't require actual task creation
describe('cli unit tests', () => {
  it('should export all expected functions', () => {
    expect(typeof createTask).toBe('function')
    expect(typeof deleteTask).toBe('function')
    expect(typeof listTasks).toBe('function')
    expect(typeof runTask).toBe('function')
    expect(typeof getTaskInfo).toBe('function')
    expect(typeof taskExists).toBe('function')
  })
})
