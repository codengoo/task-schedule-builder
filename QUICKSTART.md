# Quick Start Guide

This guide will help you get started with `task-scheduler-builder` in minutes.

## Installation

```bash
npm install task-scheduler-builder
```

## Your First Task

Create a simple task that runs Notepad every hour:

```typescript
import { TaskSchedulerBuilder, createTask } from 'task-scheduler-builder'

// Build the task configuration
const task = TaskSchedulerBuilder.create()
  .name('MyFirstTask')
  .description('Opens Notepad every hour')
  .addTimeTrigger(new Date(), {
    repetitionInterval: 'PT1H', // Every hour
  })
  .addAction('notepad.exe')
  .enabled(true)
  .build()

// Create the task in Windows Task Scheduler
const result = await createTask(task, { force: true })

if (result.success) {
  console.log('✓ Task created successfully!')
} else {
  console.error('✗ Error:', result.error)
}
```

## Common Patterns

### Daily Task at Specific Time

```typescript
const task = TaskSchedulerBuilder.create()
  .name('DailyReport')
  .addTimeTrigger(new Date('2024-06-01T09:00:00'))
  .addAction('C:\\Scripts\\report.bat')
  .build()

await createTask(task, { force: true })
```

### Task with Admin Privileges

```typescript
const task = TaskSchedulerBuilder.create()
  .name('AdminTask')
  .addTimeTrigger(new Date())
  .addAction('powershell.exe', '-File C:\\Scripts\\admin.ps1')
  .runWithHighestPrivileges()
  .build()

await createTask(task, { force: true })
```

### Startup Task

```typescript
const task = TaskSchedulerBuilder.create()
  .name('StartupTask')
  .addStartupTrigger({ delay: 'PT5M' }) // 5 minutes after startup
  .addAction('C:\\Scripts\\startup.bat')
  .build()

await createTask(task, { force: true })
```

### List and Manage Tasks

```typescript
import { listTasks, deleteTask, runTask } from 'task-scheduler-builder'

// List all tasks
const tasks = await listTasks()
console.log(`Found ${tasks.length} tasks`)

// Run a task immediately
await runTask('MyFirstTask')

// Delete a task
await deleteTask('MyFirstTask', { force: true })
```

## Time Format Reference

| Format | Meaning |
|--------|---------|
| PT1H | 1 hour |
| PT30M | 30 minutes |
| PT1H30M | 1.5 hours |
| PT24H | 24 hours |
| P1D | 1 day |

## Next Steps

- Check out the [examples/](./examples/) directory for more use cases
- Read the full [README.md](./README.md) for detailed API reference
- Review [CONTRIBUTING.md](./CONTRIBUTING.md) to contribute to the project

## Requirements

- Windows OS
- Node.js 18+
- Administrator privileges (for creating/deleting tasks)

## Troubleshooting

**Task creation fails with "Access Denied"**
- Make sure you run your Node.js script with Administrator privileges

**Task doesn't run**
- Check the task status using `getTaskInfo(taskName)`
- Verify the trigger time is in the future
- Ensure the executable path is correct and absolute

**Cannot find task after creation**
- Use `taskExists(taskName)` to verify creation
- Check Windows Task Scheduler UI (`taskschd.msc`)

## Support

For issues, please visit the GitHub repository and create an issue.
