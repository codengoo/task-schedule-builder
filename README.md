# task-scheduler-builder

A TypeScript library for creating, managing, and deleting Windows Task Scheduler tasks with a fluent builder API.

## Features

- 🏗️ **Fluent Builder Pattern** - Easy-to-use chainable API for task creation
- 📝 **Type-Safe** - Full TypeScript support with comprehensive type definitions
- 🔄 **XML Generation** - Automatically generates Windows Task Scheduler XML format
- 📥 **XML Template Loading** - Load and customize existing XML templates
- ✅ **Schema Compliant** - Follows official [Windows Task Scheduler XML schema](http://schemas.microsoft.com/windows/2004/02/mit/task)
- 🖥️ **CLI Integration** - Seamless integration with Windows `schtasks` command
- 📋 **Task Management** - List, create, delete, and run scheduled tasks
- 🎯 **Comprehensive Metadata** - Full support for RegistrationInfo (version, URI, documentation)
- ✅ **Well Tested** - Comprehensive test suite with high coverage

## Installation

```bash
npm install task-scheduler-builder
# or
pnpm add task-scheduler-builder
# or
yarn add task-scheduler-builder
```

## Documentation

- [Quick Start Guide](./QUICKSTART.md) - Get started in 5 minutes
- [Schema Compliance Guide](./SCHEMA_COMPLIANCE.md) - Detailed XML schema compliance documentation
- [Examples](./examples) - Real-world usage examples
- [Contributing](./CONTRIBUTING.md) - Contribution guidelines

## Requirements

- Windows operating system
- Node.js 18 or higher
- Administrator privileges (for creating/deleting tasks)

## Quick Start

```typescript
import { TaskSchedulerBuilder, createTask } from 'task-scheduler-builder'

// Create a task that runs every day at 9 AM
const task = TaskSchedulerBuilder.create()
  .name('MyDailyBackup')
  .description('Daily backup task')
  .author('System Administrator')
  .addTimeTrigger(new Date('2024-01-01T09:00:00'))
  .addAction('C:\\Scripts\\backup.bat')
  .enabled(true)
  .build()

// Apply the task to Windows Task Scheduler
const result = await createTask(task, { force: true })

if (result.success) {
  console.log('Task created successfully!')
} else {
  console.error('Failed to create task:', result.error)
}
```

## Usage Examples

### Basic Time-Based Task

```typescript
import { TaskSchedulerBuilder, createTask } from 'task-scheduler-builder'

const task = TaskSchedulerBuilder.create()
  .name('SimpleTask')
  .description('Runs notepad every hour')
  .addTimeTrigger(new Date(), {
    repetitionInterval: 'PT1H', // Every 1 hour
    repetitionDuration: 'PT24H', // For 24 hours
  })
  .addAction('notepad.exe')
  .build()

await createTask(task, { force: true })
```

### Task with Multiple Triggers

```typescript
const task = TaskSchedulerBuilder.create()
  .name('MultiTriggerTask')
  .description('Runs on multiple events')
  .addTimeTrigger(new Date('2024-06-01T08:00:00'))
  .addLogonTrigger({ userId: 'DOMAIN\\User' })
  .addStartupTrigger({ delay: 'PT5M' })
  .addAction('C:\\Scripts\\startup.ps1')
  .build()
```

### Task with Highest Privileges

```typescript
const task = TaskSchedulerBuilder.create()
  .name('AdminTask')
  .description('Task requiring admin privileges')
  .addTimeTrigger(new Date())
  .addAction('powershell.exe', '-File C:\\Scripts\\admin.ps1')
  .runWithHighestPrivileges()
  .hidden()
  .build()

await createTask(task, { force: true })
```

### Complex Task Configuration

```typescript
const task = TaskSchedulerBuilder.create()
  .name('ComplexBackupTask')
  .description('Advanced backup with retry logic')
  .author('IT Department')
  .addTimeTrigger(new Date('2024-01-01T02:00:00'), {
    repetitionInterval: 'PT12H',
  })
  .addAction('powershell.exe', '-File C:\\Backup\\backup.ps1', 'C:\\Backup')
  .setPrincipal({
    userId: 'SYSTEM',
    runLevel: 'HighestAvailable',
    logonType: 'ServiceAccount',
  })
  .setSettings({
    enabled: true,
    hidden: false,
    priority: 4,
    executionTimeLimit: 'PT2H',
    multipleInstancesPolicy: 'Queue',
    startWhenAvailable: true,
    restartOnFailure: {
      interval: 'PT10M',
      count: 3,
    },
  })
  .build()

await createTask(task, { force: true })
```

### Task with Registration Info

```typescript
// Using setRegistrationInfo for comprehensive metadata
const task = TaskSchedulerBuilder.create()
  .name('EnterpriseTask')
  .setRegistrationInfo({
    author: 'IT Department',
    description: 'Production backup task',
    version: '2.1.0',
    date: new Date(),
    uri: '\\Enterprise\\Backup\\DailyBackup',
    documentation: 'See https://wiki.company.com/backup-procedures',
  })
  .addTimeTrigger(new Date('2024-01-01T02:00:00'))
  .addAction('C:\\Scripts\\backup.ps1')
  .build()

// Or use individual helper methods
const task2 = TaskSchedulerBuilder.create()
  .name('MyTask')
  .author('John Doe')
  .description('My custom task')
  .version('1.0.0')
  .uri('\\MyTasks\\Custom')
  .documentation('Task documentation here')
  .registrationDate(new Date())
  .addTimeTrigger(new Date())
  .addAction('notepad.exe')
  .build()

await createTask(task, { force: true })
```

### Load Task from XML Template

```typescript
// Load an existing XML template and customize it
const task = TaskSchedulerBuilder.create('path/to/template.xml')
  .name('CustomizedTask')
  .description('Task based on template')
  // Add or override triggers
  .addLogonTrigger({ userId: 'Administrator' })
  // Template values are preserved, you can override them
  .setSettings({
    priority: 3,
    executionTimeLimit: 'PT3H',
  })
  .build()

await createTask(task, { force: true })

// All attributes from the XML template are loaded:
// - RegistrationInfo (author, description, version, URI, etc.)
// - Triggers (time, logon, startup)
// - Actions (exec commands)
// - Principal (user context, run level)
// - Settings (all task settings)
```

#### List All Tasks

```typescript
import { listTasks } from 'task-scheduler-builder'

const tasks = await listTasks()

tasks.forEach(task => {
  console.log(`${task.name} - ${task.status}`)
  console.log(`  Next Run: ${task.nextRunTime}`)
  console.log(`  Last Run: ${task.lastRunTime}`)
})
```

#### Filter Tasks

```typescript
const backupTasks = await listTasks('Backup')
console.log(`Found ${backupTasks.length} backup tasks`)
```

#### Get Task Information

```typescript
import { getTaskInfo } from 'task-scheduler-builder'

const info = await getTaskInfo('MyTask')

if (info) {
  console.log('Task Name:', info.name)
  console.log('Status:', info.status)
  console.log('Next Run:', info.nextRunTime)
}
```

#### Check if Task Exists

```typescript
import { taskExists } from 'task-scheduler-builder'

if (await taskExists('MyTask')) {
  console.log('Task exists!')
}
```

#### Delete a Task

```typescript
import { deleteTask } from 'task-scheduler-builder'

const result = await deleteTask('MyTask', { force: true })

if (result.success) {
  console.log('Task deleted successfully!')
}
```

#### Run a Task Immediately

```typescript
import { runTask } from 'task-scheduler-builder'

const result = await runTask('MyTask')

if (result.success) {
  console.log('Task started!')
}
```

## API Reference

### TaskSchedulerBuilder

The main builder class for creating task configurations.

#### Methods

**Registration Info:**
- **`name(name: string)`** - Set the task name (required)
- **`description(description: string)`** - Set the task description (legacy, prefer setRegistrationInfo)
- **`author(author: string)`** - Set the task author (legacy, prefer setRegistrationInfo)
- **`setRegistrationInfo(info: RegistrationInfo)`** - Set complete registration metadata
- **`version(version: string)`** - Set the task version
- **`uri(uri: string)`** - Set the task URI/path in Task Scheduler
- **`documentation(doc: string)`** - Set task documentation/notes
- **`registrationDate(date: Date)`** - Set the registration date

**Triggers:**
- **`addTimeTrigger(startTime: Date, options?)`** - Add a time-based trigger
- **`addLogonTrigger(options?)`** - Add a logon trigger
- **`addStartupTrigger(options?)`** - Add a startup trigger
- **`addDailySchedule(startTime: Date, daysInterval?)`** - Add a daily schedule
- **`addWeeklySchedule(startTime: Date, daysOfWeek, weeksInterval?)`** - Add a weekly schedule

**Actions:**
- **`addAction(path: string, args?, workingDir?)`** - Add an execution action

**Principal & Settings:**
- **`setPrincipal(options)`** - Set the user context
- **`setSettings(settings)`** - Set task settings
- **`runWithHighestPrivileges()`** - Run with admin privileges
- **`hidden()`** - Make the task hidden
- **`enabled(enabled?)`** - Enable/disable the task

**Build:**
- **`build()`** - Build the task configuration

### CLI Functions

- **`createTask(config, options?)`** - Create a scheduled task
- **`deleteTask(taskName, options?)`** - Delete a scheduled task
- **`listTasks(filter?)`** - List all scheduled tasks
- **`runTask(taskName)`** - Run a task immediately
- **`getTaskInfo(taskName)`** - Get detailed task information
- **`taskExists(taskName)`** - Check if a task exists

### XML Generation

- **`toXml(config)`** - Convert task configuration to XML format compliant with [Windows Task Scheduler Schema v1.2](http://schemas.microsoft.com/windows/2004/02/mit/task)

The generated XML follows the official schema structure:
- **RegistrationInfo**: Date, Author, Version, Description, URI, Documentation
- **Triggers**: CalendarTrigger, LogonTrigger, BootTrigger
- **Principal**: UserId, LogonType, RunLevel (no Principals wrapper)
- **Settings**: All task execution settings
- **Actions**: Exec actions with Command, Arguments, WorkingDirectory

## Time Duration Format

Windows Task Scheduler uses ISO 8601 duration format:

- `PT1H` - 1 hour
- `PT30M` - 30 minutes
- `PT1H30M` - 1 hour 30 minutes
- `PT24H` - 24 hours
- `P1D` - 1 day

## Types

### TriggerType
```typescript
type TriggerType = 'time' | 'logon' | 'startup' | 'idle' | 'event'
```

### RunLevel
```typescript
type RunLevel = 'LimitedUser' | 'HighestAvailable'
```

### LogonType
```typescript
type LogonType = 'Password' | 'S4U' | 'InteractiveToken' | 'ServiceAccount'
```

### DayOfWeek
```typescript
type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'
```

## Error Handling

All CLI functions return an `ExecutionResult` object:

```typescript
interface ExecutionResult {
  success: boolean
  output: string
  error?: string
}
```

Example error handling:

```typescript
const result = await createTask(task)

if (!result.success) {
  console.error('Error:', result.error)
  // Handle error...
}
```

## Best Practices

1. **Always use `force: true`** when creating tasks to overwrite existing ones
2. **Check task existence** before creating to avoid conflicts
3. **Use absolute paths** for executables and working directories
4. **Set execution time limits** to prevent tasks from running indefinitely
5. **Configure restart on failure** for critical tasks
6. **Use appropriate privileges** - only use `HighestAvailable` when necessary

## Development

### Build

```bash
pnpm build
```

### Test

```bash
pnpm test
```

Note: Integration tests require Windows and administrator privileges.

### Lint

```bash
pnpm lint
pnpm lint:fix
```

### Type Check

```bash
pnpm typecheck
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please use the GitHub issue tracker.

## Related

- [Windows Task Scheduler Documentation](https://docs.microsoft.com/en-us/windows/win32/taskschd/task-scheduler-start-page)
- [Schtasks Command Reference](https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/schtasks)
