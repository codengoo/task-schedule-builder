/**
 * Example: Managing and listing scheduled tasks
 */

import {
  listTasks,
  getTaskInfo,
  deleteTask,
  runTask,
  taskExists,
} from 'task-scheduler-builder'

async function manageScheduledTasks() {
  // List all tasks
  console.log('=== All Scheduled Tasks ===')
  const allTasks = await listTasks()
  console.log(`Total tasks: ${allTasks.length}\n`)

  allTasks.slice(0, 5).forEach((task) => {
    console.log(`Task: ${task.name}`)
    console.log(`  Status: ${task.status}`)
    console.log(`  Next Run: ${task.nextRunTime || 'N/A'}`)
    console.log()
  })

  // Filter tasks by name
  console.log('=== Backup Tasks ===')
  const backupTasks = await listTasks('Backup')
  backupTasks.forEach((task) => {
    console.log(`- ${task.name} (${task.status})`)
  })
  console.log()

  // Get detailed info about a specific task
  const taskName = 'MyCustomTask'

  if (await taskExists(taskName)) {
    console.log(`=== Details for ${taskName} ===`)
    const info = await getTaskInfo(taskName)

    if (info) {
      console.log(`Name: ${info.name}`)
      console.log(`Status: ${info.status}`)
      console.log(`Next Run: ${info.nextRunTime || 'N/A'}`)
      console.log(`Last Run: ${info.lastRunTime || 'N/A'}`)
    }
    console.log()

    // Run the task immediately
    console.log(`Running task: ${taskName}`)
    const runResult = await runTask(taskName)

    if (runResult.success) {
      console.log('✓ Task started successfully!')
    }
    console.log()

    // Delete the task
    console.log(`Deleting task: ${taskName}`)
    const deleteResult = await deleteTask(taskName, { force: true })

    if (deleteResult.success) {
      console.log('✓ Task deleted successfully!')
    }
  }
  else {
    console.log(`Task "${taskName}" does not exist.`)
  }
}

manageScheduledTasks()
