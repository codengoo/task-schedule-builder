import { describe, expect, it } from 'vitest'
import { TaskSchedulerBuilder } from '../src/builder'

describe('taskSchedulerBuilder', () => {
  it('should create a basic task configuration', () => {
    const task = TaskSchedulerBuilder.create()
      .name('TestTask')
      .description('A test task')
      .addTimeTrigger(new Date('2024-01-01T10:00:00'))
      .addAction('notepad.exe')
      .build()

    expect(task.name).toBe('TestTask')
    expect(task.description).toBe('A test task')
    expect(task.triggers).toHaveLength(1)
    expect(task.actions).toHaveLength(1)
  })

  it('should throw error if name is missing', () => {
    expect(() => {
      TaskSchedulerBuilder.create()
        .addTimeTrigger(new Date())
        .addAction('test.exe')
        .build()
    }).toThrow('Task name is required')
  })

  it('should throw error if no actions are added', () => {
    expect(() => {
      TaskSchedulerBuilder.create()
        .name('TestTask')
        .addTimeTrigger(new Date())
        .build()
    }).toThrow('At least one action is required')
  })

  it('should throw error if no triggers are added', () => {
    expect(() => {
      TaskSchedulerBuilder.create()
        .name('TestTask')
        .addAction('test.exe')
        .build()
    }).toThrow('At least one trigger is required')
  })

  it('should support method chaining', () => {
    const builder = TaskSchedulerBuilder.create()
    const result = builder.name('Test')

    expect(result).toBe(builder)
  })

  it('should add multiple triggers', () => {
    const task = TaskSchedulerBuilder.create()
      .name('TestTask')
      .addTimeTrigger(new Date())
      .addLogonTrigger()
      .addStartupTrigger()
      .addAction('test.exe')
      .build()

    expect(task.triggers).toHaveLength(3)
    expect(task.triggers[0].type).toBe('time')
    expect(task.triggers[1].type).toBe('logon')
    expect(task.triggers[2].type).toBe('startup')
  })

  it('should add multiple actions', () => {
    const task = TaskSchedulerBuilder.create()
      .name('TestTask')
      .addTimeTrigger(new Date())
      .addAction('cmd.exe', '/c echo hello')
      .addAction('notepad.exe', 'test.txt', 'C:\\')
      .build()

    expect(task.actions).toHaveLength(2)
    expect(task.actions[0].path).toBe('cmd.exe')
    expect(task.actions[0].arguments).toBe('/c echo hello')
    expect(task.actions[1].workingDirectory).toBe('C:\\')
  })

  it('should configure time trigger with repetition', () => {
    const task = TaskSchedulerBuilder.create()
      .name('TestTask')
      .addTimeTrigger(new Date(), {
        repetitionInterval: 'PT1H',
        repetitionDuration: 'PT12H',
        stopAtDurationEnd: true,
      })
      .addAction('test.exe')
      .build()

    const trigger = task.triggers[0]
    expect(trigger.type).toBe('time')
    if (trigger.type === 'time') {
      expect(trigger.repetition).toBeDefined()
      expect(trigger.repetition?.interval).toBe('PT1H')
      expect(trigger.repetition?.duration).toBe('PT12H')
      expect(trigger.repetition?.stopAtDurationEnd).toBe(true)
    }
  })

  it('should configure logon trigger with userId', () => {
    const task = TaskSchedulerBuilder.create()
      .name('TestTask')
      .addLogonTrigger({ userId: 'DOMAIN\\User' })
      .addAction('test.exe')
      .build()

    const trigger = task.triggers[0]
    expect(trigger.type).toBe('logon')
    if (trigger.type === 'logon') {
      expect(trigger.userId).toBe('DOMAIN\\User')
    }
  })

  it('should configure startup trigger with delay', () => {
    const task = TaskSchedulerBuilder.create()
      .name('TestTask')
      .addStartupTrigger({ delay: 'PT5M' })
      .addAction('test.exe')
      .build()

    const trigger = task.triggers[0]
    expect(trigger.type).toBe('startup')
    if (trigger.type === 'startup') {
      expect(trigger.delay).toBe('PT5M')
    }
  })

  it('should set principal configuration', () => {
    const task = TaskSchedulerBuilder.create()
      .name('TestTask')
      .addTimeTrigger(new Date())
      .addAction('test.exe')
      .setPrincipal({
        userId: 'SYSTEM',
        runLevel: 'HighestAvailable',
        logonType: 'Password',
      })
      .build()

    expect(task.principal).toBeDefined()
    expect(task.principal?.userId).toBe('SYSTEM')
    expect(task.principal?.runLevel).toBe('HighestAvailable')
    expect(task.principal?.logonType).toBe('Password')
  })

  it('should set highest privileges using helper method', () => {
    const task = TaskSchedulerBuilder.create()
      .name('TestTask')
      .addTimeTrigger(new Date())
      .addAction('test.exe')
      .runWithHighestPrivileges()
      .build()

    expect(task.principal?.runLevel).toBe('HighestAvailable')
  })

  it('should configure task settings', () => {
    const task = TaskSchedulerBuilder.create()
      .name('TestTask')
      .addTimeTrigger(new Date())
      .addAction('test.exe')
      .setSettings({
        enabled: true,
        hidden: true,
        allowDemandStart: true,
        multipleInstancesPolicy: 'Queue',
        priority: 5,
      })
      .build()

    expect(task.settings).toBeDefined()
    expect(task.settings?.enabled).toBe(true)
    expect(task.settings?.hidden).toBe(true)
    expect(task.settings?.priority).toBe(5)
  })

  it('should configure hidden task using helper method', () => {
    const task = TaskSchedulerBuilder.create()
      .name('TestTask')
      .addTimeTrigger(new Date())
      .addAction('test.exe')
      .hidden()
      .build()

    expect(task.settings?.hidden).toBe(true)
  })

  it('should configure enabled state using helper method', () => {
    const task = TaskSchedulerBuilder.create()
      .name('TestTask')
      .addTimeTrigger(new Date())
      .addAction('test.exe')
      .enabled(false)
      .build()

    expect(task.settings?.enabled).toBe(false)
  })

  it('should set author', () => {
    const task = TaskSchedulerBuilder.create()
      .name('TestTask')
      .author('John Doe')
      .addTimeTrigger(new Date())
      .addAction('test.exe')
      .build()

    expect(task.author).toBe('John Doe')
  })

  it('should build a complete complex task', () => {
    const startTime = new Date('2024-06-01T09:00:00')

    const task = TaskSchedulerBuilder.create()
      .name('ComplexTask')
      .description('A complex scheduled task')
      .author('System Administrator')
      .addTimeTrigger(startTime, {
        repetitionInterval: 'PT30M',
        repetitionDuration: 'PT24H',
      })
      .addLogonTrigger({ userId: 'Administrator' })
      .addAction('powershell.exe', '-File C:\\Scripts\\backup.ps1', 'C:\\Scripts')
      .setPrincipal({
        userId: 'SYSTEM',
        runLevel: 'HighestAvailable',
        logonType: 'ServiceAccount',
      })
      .setSettings({
        enabled: true,
        hidden: false,
        allowDemandStart: true,
        multipleInstancesPolicy: 'Queue',
        priority: 4,
        executionTimeLimit: 'PT2H',
        restartOnFailure: {
          interval: 'PT10M',
          count: 3,
        },
      })
      .build()

    expect(task.name).toBe('ComplexTask')
    expect(task.triggers).toHaveLength(2)
    expect(task.actions).toHaveLength(1)
    expect(task.principal?.runLevel).toBe('HighestAvailable')
    expect(task.settings?.priority).toBe(4)
  })

  it('should set RegistrationInfo using setRegistrationInfo', () => {
    const regDate = new Date('2024-01-01T00:00:00Z')

    const task = TaskSchedulerBuilder.create()
      .name('TestTask')
      .setRegistrationInfo({
        author: 'IT Department',
        description: 'Backup task',
        version: '1.0.0',
        date: regDate,
        uri: '\\MyTasks\\Backup',
        documentation: 'See wiki for details',
      })
      .addTimeTrigger(new Date())
      .addAction('test.exe')
      .build()

    expect(task.registrationInfo).toBeDefined()
    expect(task.registrationInfo?.author).toBe('IT Department')
    expect(task.registrationInfo?.description).toBe('Backup task')
    expect(task.registrationInfo?.version).toBe('1.0.0')
    expect(task.registrationInfo?.date).toBe(regDate)
    expect(task.registrationInfo?.uri).toBe('\\MyTasks\\Backup')
    expect(task.registrationInfo?.documentation).toBe('See wiki for details')
  })

  it('should set RegistrationInfo using individual helper methods', () => {
    const regDate = new Date('2024-06-01T00:00:00Z')

    const task = TaskSchedulerBuilder.create()
      .name('TestTask')
      .author('Admin')
      .description('Test task')
      .version('2.0.0')
      .uri('\\Tasks\\Test')
      .documentation('Important notes')
      .registrationDate(regDate)
      .addTimeTrigger(new Date())
      .addAction('test.exe')
      .build()

    // Legacy fields should still work
    expect(task.author).toBe('Admin')
    expect(task.description).toBe('Test task')

    // New fields in registrationInfo
    expect(task.registrationInfo?.version).toBe('2.0.0')
    expect(task.registrationInfo?.uri).toBe('\\Tasks\\Test')
    expect(task.registrationInfo?.documentation).toBe('Important notes')
    expect(task.registrationInfo?.date).toBe(regDate)
  })

  it('should merge legacy fields with RegistrationInfo', () => {
    const task = TaskSchedulerBuilder.create()
      .name('TestTask')
      .author('Legacy Author')
      .description('Legacy Description')
      .version('1.0.0')
      .addTimeTrigger(new Date())
      .addAction('test.exe')
      .build()

    // Both legacy and new format should be accessible
    expect(task.author).toBe('Legacy Author')
    expect(task.description).toBe('Legacy Description')
    expect(task.registrationInfo?.version).toBe('1.0.0')
  })
})

