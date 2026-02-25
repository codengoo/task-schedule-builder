/**
 * Example: Creating a complex task with multiple triggers and actions
 */

import { TaskSchedulerBuilder, createTask } from 'task-scheduler-builder'

async function createComplexTask() {
  const task = TaskSchedulerBuilder.create()
    .name('ComplexMaintenanceTask')
    .description('Comprehensive system maintenance with multiple triggers')
    .author('IT Operations')

    // Multiple triggers
    .addTimeTrigger(new Date('2024-01-01T03:00:00'), {
      repetitionInterval: 'PT12H',
    })
    .addLogonTrigger({ userId: 'Administrator' })
    .addStartupTrigger({ delay: 'PT10M' })

    // Multiple actions (executed in sequence)
    .addAction('powershell.exe', '-File C:\\Maintenance\\cleanup.ps1', 'C:\\Maintenance')
    .addAction('powershell.exe', '-File C:\\Maintenance\\optimize.ps1', 'C:\\Maintenance')

    // Principal configuration
    .setPrincipal({
      userId: 'SYSTEM',
      runLevel: 'HighestAvailable',
      logonType: 'ServiceAccount',
    })

    // Advanced settings
    .setSettings({
      enabled: true,
      hidden: false,
      priority: 4,
      executionTimeLimit: 'PT4H',
      multipleInstancesPolicy: 'Queue',
      allowDemandStart: true,
      allowHardTerminate: true,
      disallowStartIfOnBatteries: false,
      stopIfGoingOnBatteries: false,
      startWhenAvailable: true,
      runOnlyIfNetworkAvailable: false,
      wakeToRun: false,
      restartOnFailure: {
        interval: 'PT15M',
        count: 3,
      },
    })
    .build()

  const result = await createTask(task, { force: true })

  if (result.success) {
    console.log('✓ Complex maintenance task created successfully!')
    console.log(`  Task name: ${task.name}`)
    console.log(`  Triggers: ${task.triggers.length}`)
    console.log(`  Actions: ${task.actions.length}`)
    console.log(`  Run level: ${task.principal?.runLevel}`)
  }
  else {
    console.error('✗ Failed to create task:', result.error)
  }
}

createComplexTask()
