/**
 * Example: Creating a task with repetition (runs every hour)
 */

import { TaskSchedulerBuilder, createTask } from 'task-scheduler-builder'

async function createHourlyTask() {
  // Get the current time and round to the next hour
  const now = new Date()
  const startTime = new Date(now)
  startTime.setHours(startTime.getHours() + 1, 0, 0, 0)

  const task = TaskSchedulerBuilder.create()
    .name('HourlyHealthCheck')
    .description('Runs health check every hour')
    .author('Monitoring Team')
    .addTimeTrigger(startTime, {
      repetitionInterval: 'PT1H', // Every 1 hour
      repetitionDuration: 'P1D', // For 1 day (then repeats daily)
      stopAtDurationEnd: false,
    })
    .addAction('powershell.exe', '-File C:\\Monitoring\\healthcheck.ps1')
    .setSettings({
      enabled: true,
      multipleInstancesPolicy: 'IgnoreNew', // Don't start if already running
      startWhenAvailable: true,
      executionTimeLimit: 'PT10M', // 10 minutes max
    })
    .build()

  const result = await createTask(task, { force: true })

  if (result.success) {
    console.log('✓ Hourly task created successfully!')
    console.log(`  Start time: ${startTime.toLocaleString()}`)
    console.log('  Repeats: Every hour')
  }
  else {
    console.error('✗ Failed to create task:', result.error)
  }
}

createHourlyTask()
