/**
 * Example: Creating a task that runs on system startup
 */

import { TaskSchedulerBuilder, createTask } from 'task-scheduler-builder'

async function createStartupTask() {
  const task = TaskSchedulerBuilder.create()
    .name('StartupMonitor')
    .description('Monitors system after startup')
    .addStartupTrigger({ delay: 'PT5M' }) // Wait 5 minutes after startup
    .addAction('powershell.exe', '-File C:\\Scripts\\monitor.ps1', 'C:\\Scripts')
    .runWithHighestPrivileges()
    .hidden()
    .build()

  const result = await createTask(task, { force: true })

  if (result.success) {
    console.log('✓ Startup task created successfully!')
  }
  else {
    console.error('✗ Failed to create task:', result.error)
  }
}

createStartupTask()
