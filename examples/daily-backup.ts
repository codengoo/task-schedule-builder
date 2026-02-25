/**
 * Example: Creating a simple daily backup task
 */

import { TaskSchedulerBuilder, createTask } from 'task-scheduler-builder'

async function createDailyBackupTask() {
  // Create a task that runs every day at 2 AM
  const task = TaskSchedulerBuilder.create()
    .name('DailyBackup')
    .description('Runs daily backup script')
    .author('System Administrator')
    .addTimeTrigger(new Date('2024-01-01T02:00:00'))
    .addAction('C:\\Backup\\backup.bat')
    .runWithHighestPrivileges()
    .setSettings({
      enabled: true,
      executionTimeLimit: 'PT2H', // 2 hours max
      startWhenAvailable: true,
      restartOnFailure: {
        interval: 'PT10M',
        count: 3,
      },
    })
    .build()

  // Create the task
  const result = await createTask(task, { force: true })

  if (result.success) {
    console.log('✓ Daily backup task created successfully!')
  }
  else {
    console.error('✗ Failed to create task:', result.error)
  }
}

createDailyBackupTask()
