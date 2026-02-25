# Windows Task Scheduler XML Schema Compliance

This document details how `task-scheduler-builder` complies with the official Windows Task Scheduler XML schema.

## Schema Reference

The library generates XML conforming to:
- **Schema URI**: `http://schemas.microsoft.com/windows/2004/02/mit/task`
- **Version**: 1.2
- **Encoding**: UTF-16

## XML Structure

The generated XML follows this structure per the official schema:

```xml
<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo>
    <Date>...</Date>
    <Author>...</Author>
    <Version>...</Version>
    <Description>...</Description>
    <URI>...</URI>
    <Documentation>...</Documentation>
  </RegistrationInfo>
  <Triggers>
    <!-- Trigger elements -->
  </Triggers>
  <Principal id="Author">
    <UserId>...</UserId>
    <LogonType>...</LogonType>
    <RunLevel>...</RunLevel>
  </Principal>
  <Settings>
    <!-- Settings elements -->
  </Settings>
  <Actions Context="Author">
    <!-- Action elements -->
  </Actions>
</Task>
```

## Key Schema Compliance Points

### 1. RegistrationInfo Element Order

Per schema, child elements must appear in this order:
1. `<Date>` - Registration date
2. `<Author>` - Task author
3. `<Version>` - Task version
4. `<Description>` - Task description
5. `<URI>` - Task path in scheduler
6. `<Documentation>` - Additional documentation

**Implementation:**
```typescript
.setRegistrationInfo({
  date: new Date(),
  author: 'IT Department',
  version: '1.0.0',
  description: 'Backup task',
  uri: '\\MyCompany\\Tasks\\Backup',
  documentation: 'See wiki for details'
})
```

### 2. Principal (Not Principals)

❌ **Incorrect** (older versions had this):
```xml
<Principals>
  <Principal id="Author">
    <!-- ... -->
  </Principal>
</Principals>
```

✅ **Correct** (per schema):
```xml
<Principal id="Author">
  <UserId>SYSTEM</UserId>
  <LogonType>ServiceAccount</LogonType>
  <RunLevel>HighestAvailable</RunLevel>
</Principal>
```

**Implementation:**
```typescript
.setPrincipal({
  userId: 'SYSTEM',
  logonType: 'ServiceAccount',
  runLevel: 'HighestAvailable'
})
```

### 3. Trigger Types

**Supported trigger types per schema:**

#### CalendarTrigger (Time-based)
```xml
<CalendarTrigger>
  <StartBoundary>2024-01-01T10:00:00</StartBoundary>
  <Enabled>true</Enabled>
  <ScheduleByDay>
    <DaysInterval>1</DaysInterval>
  </ScheduleByDay>
  <Repetition>
    <Interval>PT1H</Interval>
    <Duration>PT24H</Duration>
    <StopAtDurationEnd>false</StopAtDurationEnd>
  </Repetition>
</CalendarTrigger>
```

**Implementation:**
```typescript
.addTimeTrigger(new Date('2024-01-01T10:00:00'), {
  repetitionInterval: 'PT1H',
  repetitionDuration: 'PT24H',
  stopAtDurationEnd: false
})
```

#### LogonTrigger
```xml
<LogonTrigger>
  <Enabled>true</Enabled>
  <UserId>DOMAIN\User</UserId>
</LogonTrigger>
```

**Implementation:**
```typescript
.addLogonTrigger({ userId: 'DOMAIN\\User' })
```

#### BootTrigger (Startup)
```xml
<BootTrigger>
  <Enabled>true</Enabled>
  <Delay>PT5M</Delay>
</BootTrigger>
```

**Implementation:**
```typescript
.addStartupTrigger({ delay: 'PT5M' })
```

### 4. Settings Element

Settings must follow specific order per schema:
1. MultipleInstancesPolicy
2. DisallowStartIfOnBatteries
3. StopIfGoingOnBatteries
4. AllowHardTerminate
5. StartWhenAvailable
6. RunOnlyIfNetworkAvailable
7. IdleSettings
8. AllowStartOnDemand
9. Enabled
10. Hidden
11. RunOnlyIfIdle
12. WakeToRun
13. ExecutionTimeLimit
14. Priority
15. RestartOnFailure (optional)

**Implementation:**
```typescript
.setSettings({
  enabled: true,
  hidden: false,
  priority: 7,
  executionTimeLimit: 'PT72H',
  multipleInstancesPolicy: 'IgnoreNew',
  startWhenAvailable: true,
  restartOnFailure: {
    interval: 'PT10M',
    count: 3
  }
})
```

### 5. Actions Element

Actions must have `Context="Author"` attribute per schema:

```xml
<Actions Context="Author">
  <Exec>
    <Command>C:\Scripts\backup.bat</Command>
    <Arguments>--full</Arguments>
    <WorkingDirectory>C:\Scripts</WorkingDirectory>
  </Exec>
</Actions>
```

**Implementation:**
```typescript
.addAction(
  'C:\\Scripts\\backup.bat',
  '--full',
  'C:\\Scripts'
)
```

## ISO 8601 Duration Format

Per schema, duration values use ISO 8601 format:

| Format | Meaning |
|--------|---------|
| PT1H | 1 hour |
| PT30M | 30 minutes |
| PT1H30M | 1 hour 30 minutes |
| PT24H | 24 hours |
| P1D | 1 day |
| PT10S | 10 seconds |

## Date/Time Format

Dates must be in ISO 8601 format without milliseconds:
- Format: `YYYY-MM-DDTHH:mm:ss`
- Example: `2024-01-01T10:30:00`

The library automatically formats JavaScript Date objects correctly:
```typescript
.addTimeTrigger(new Date('2024-01-01T10:30:00'))
// Generates: <StartBoundary>2024-01-01T10:30:00</StartBoundary>
```

## XML Escaping

All text content is properly escaped per XML standards:

| Character | Escaped As |
|-----------|------------|
| `&` | `&amp;` |
| `<` | `&lt;` |
| `>` | `&gt;` |
| `"` | `&quot;` |
| `'` | `&apos;` |

**Example:**
```typescript
.description('Task with <special> & "characters"')
// Generates: <Description>Task with &lt;special&gt; &amp; &quot;characters&quot;</Description>
```

## Validation

The library validates task configurations before generating XML:

✅ **Valid:**
```typescript
TaskSchedulerBuilder.create()
  .name('MyTask')           // Required
  .addTimeTrigger(new Date()) // At least one trigger required
  .addAction('notepad.exe')   // At least one action required
  .build()
```

❌ **Invalid (throws error):**
```typescript
TaskSchedulerBuilder.create()
  .addTimeTrigger(new Date())
  .build()
// Error: Task name is required
```

## Backward Compatibility

The library maintains backward compatibility with legacy field usage:

```typescript
// Legacy approach (still works)
.author('John Doe')
.description('My task')

// New approach (recommended)
.setRegistrationInfo({
  author: 'John Doe',
  description: 'My task',
  version: '1.0.0',
  uri: '\\MyTasks\\Task1'
})

// Mixed approach (also works)
.author('John Doe')
.description('My task')
.version('1.0.0')
.uri('\\MyTasks\\Task1')
```

All approaches generate schema-compliant XML with properly merged metadata.

## Testing Schema Compliance

The library includes comprehensive tests to ensure schema compliance:

- **17 XML generation tests** - Validate correct XML structure
- **20 builder tests** - Test API functionality
- **Element order tests** - Verify schema element ordering
- **Escape tests** - Ensure proper XML escaping

Run tests:
```bash
npm test
```

## References

- [Task Scheduler Schema](http://schemas.microsoft.com/windows/2004/02/mit/task)
- [Task Scheduler Reference (Microsoft Docs)](https://docs.microsoft.com/en-us/windows/win32/taskschd/task-scheduler-schema)
- [ISO 8601 Duration](https://en.wikipedia.org/wiki/ISO_8601#Durations)
- [schtasks Command Reference](https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/schtasks)

## Troubleshooting

### XML Validation Errors

If Windows rejects your XML:

1. **Check element order** - Elements must be in schema-specified order
2. **Validate dates** - Use ISO 8601 format without milliseconds
3. **Check durations** - Use proper ISO 8601 duration format (PT1H, not 1h)
4. **Verify structure** - Use `<Principal>` not `<Principals>`

### Debug Generated XML

Export the XML to inspect it:
```typescript
const task = TaskSchedulerBuilder.create()
  .name('MyTask')
  .addTimeTrigger(new Date())
  .addAction('notepad.exe')
  .build()

const xml = toXml(task)
console.log(xml)  // Inspect the generated XML
```

### Manual Validation

Save XML to file and validate manually:
```typescript
import { writeFileSync } from 'fs'

const xml = toXml(task)
writeFileSync('task.xml', xml, 'utf-16le')

// Then try to import with:
// schtasks /Create /TN "TestTask" /XML "task.xml"
```
