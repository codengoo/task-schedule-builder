/**
 * Example: Creating a task from an XML template
 * This example shows how to load an existing XML template and customize it
 */

import { TaskSchedulerBuilder, createTask } from 'task-scheduler-builder'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function createTaskFromTemplate() {
  // Load template XML and customize it
  const templatePath = join(__dirname, 'template.xml')
  
  const task = TaskSchedulerBuilder.create(templatePath)
    // Override/customize the template values
    .name('CustomizedMaintenanceTask')
    .description('Customized maintenance task based on template')
    
    // Add additional trigger
    .addLogonTrigger({ userId: 'Administrator' })
    
    // Add additional action
    .addAction('cmd.exe', '/c echo Task completed', 'C:\\')
    
    // Override some settings
    .setSettings({
      enabled: true,
      priority: 3,
      executionTimeLimit: 'PT3H',
    })
    .build()

  const result = await createTask(task, { force: true })

  if (result.success) {
    console.log('✓ Task created from template successfully!')
    console.log(`  Task name: ${task.name}`)
    console.log(`  Triggers: ${task.triggers.length}`)
    console.log(`  Actions: ${task.actions.length}`)
    console.log(`  Template loaded from: ${templatePath}`)
  }
  else {
    console.error('✗ Failed to create task:', result.error)
  }
}

// Example 2: Load template and check loaded values
async function inspectTemplate() {
  const templatePath = join(__dirname, 'template.xml')
  
  const task = TaskSchedulerBuilder.create(templatePath)
    .name('InspectTemplateTask')
    .build()

  console.log('\n=== Template Values ===')
  console.log('Author:', task.registrationInfo?.author)
  console.log('Description:', task.registrationInfo?.description)
  console.log('Version:', task.registrationInfo?.version)
  console.log('Run Level:', task.principal?.runLevel)
  console.log('Priority:', task.settings?.priority)
  console.log('Triggers:', task.triggers.length)
  console.log('Actions:', task.actions.length)
}

createTaskFromTemplate()
inspectTemplate()
