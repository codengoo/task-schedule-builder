/**
 * Example: Creating a complex task with multiple triggers and actions
 */

import { TaskSchedulerBuilder, createTask } from 'task-scheduler-builder'

async function createComplexTask() {
  const task = TaskSchedulerBuilder.createFrom()
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
      UserId: 'SYSTEM',
      RunLevel: 'HighestAvailable',
      LogonType: 'S4U',
    })

    // Advanced settings
    .setSettings({
      Enabled: true,
      Hidden: false,
      Priority: 4,
      ExecutionTimeLimit: 'PT4H',
      MultipleInstancesPolicy: 'Queue',
      AllowDemandStart: true,
      AllowHardTerminate: true,
      DisallowStartIfOnBatteries: false,
      StopIfGoingOnBatteries: false,
      StartWhenAvailable: true,
      RunOnlyIfNetworkAvailable: false,
      WakeToRun: false,
      RestartOnFailure: {
        Interval: 'PT15M',
        Count: 3,
      },
    })
    .build()

  const result = await createTask(task, { force: true })

  if (result.success) {
    console.log('✓ Complex maintenance task created successfully!')
    console.log(`  Task name: ${task.name}`)
    console.log(`  Triggers: ${task.Triggers.length}`)
    console.log(`  Actions: ${task.Actions.length}`)
    console.log(`  Run level: ${task.Principals?.Principal.RunLevel}`)
  }
  else {
    console.error('✗ Failed to create task:', result.error)
  }
}

createComplexTask()
