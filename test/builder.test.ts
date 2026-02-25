import { describe, expect, it } from 'vitest'
import { TaskSchedulerBuilder } from '../src/builder'

describe('taskSchedulerBuilder', () => {
  it('should create a basic task configuration', () => {
    const task = TaskSchedulerBuilder.createFrom()
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
      TaskSchedulerBuilder.createFrom()
        .addTimeTrigger(new Date())
        .addAction('test.exe')
        .build()
    }).toThrow('Task name is required')
  })

  it('should throw error if no actions are added', () => {
    expect(() => {
      TaskSchedulerBuilder.createFrom()
        .name('TestTask')
        .addTimeTrigger(new Date())
        .build()
    }).toThrow('At least one action is required')
  })

  it('should throw error if no triggers are added', () => {
    expect(() => {
      TaskSchedulerBuilder.createFrom()
        .name('TestTask')
        .addAction('test.exe')
        .build()
    }).toThrow('At least one trigger is required')
  })

  it('should support method chaining', () => {
    const builder = TaskSchedulerBuilder.createFrom()
    const result = builder.name('Test')

    expect(result).toBe(builder)
  })

  it('should add multiple triggers', () => {
    const task = TaskSchedulerBuilder.createFrom()
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
    const task = TaskSchedulerBuilder.createFrom()
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
    const task = TaskSchedulerBuilder.createFrom()
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
    const task = TaskSchedulerBuilder.createFrom()
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
    const task = TaskSchedulerBuilder.createFrom()
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
    const task = TaskSchedulerBuilder.createFrom()
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
    const task = TaskSchedulerBuilder.createFrom()
      .name('TestTask')
      .addTimeTrigger(new Date())
      .addAction('test.exe')
      .runWithHighestPrivileges()
      .build()

    expect(task.principal?.runLevel).toBe('HighestAvailable')
  })

  it('should configure task settings', () => {
    const task = TaskSchedulerBuilder.createFrom()
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
    const task = TaskSchedulerBuilder.createFrom()
      .name('TestTask')
      .addTimeTrigger(new Date())
      .addAction('test.exe')
      .hidden()
      .build()

    expect(task.settings?.hidden).toBe(true)
  })

  it('should configure enabled state using helper method', () => {
    const task = TaskSchedulerBuilder.createFrom()
      .name('TestTask')
      .addTimeTrigger(new Date())
      .addAction('test.exe')
      .enabled(false)
      .build()

    expect(task.settings?.enabled).toBe(false)
  })

  it('should set author', () => {
    const task = TaskSchedulerBuilder.createFrom()
      .name('TestTask')
      .author('John Doe')
      .addTimeTrigger(new Date())
      .addAction('test.exe')
      .build()

    expect(task.author).toBe('John Doe')
  })

  it('should build a complete complex task', () => {
    const startTime = new Date('2024-06-01T09:00:00')

    const task = TaskSchedulerBuilder.createFrom()
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

    const task = TaskSchedulerBuilder.createFrom()
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

    const task = TaskSchedulerBuilder.createFrom()
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
    const task = TaskSchedulerBuilder.createFrom()
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

describe('taskSchedulerBuilder - XML Template Loading', () => {
  const templatePath = 'test/fixtures/test-template.xml'

  it('should load task configuration from XML template', () => {
    const task = TaskSchedulerBuilder.createFrom(templatePath)
      .name('TestTask')
      .build()

    // Check RegistrationInfo
    expect(task.registrationInfo?.author).toBe('Test Author')
    expect(task.registrationInfo?.description).toBe('Test template task')
    expect(task.registrationInfo?.version).toBe('1.0.0')
    expect(task.registrationInfo?.uri).toBe('\\Test\\Template')
    expect(task.registrationInfo?.documentation).toBe('Test documentation')

    // Check triggers (should have 2 from template)
    expect(task.triggers).toHaveLength(2)
    expect(task.triggers[0].type).toBe('time')
    expect(task.triggers[1].type).toBe('logon')

    // Check actions (should have 2 from template)
    expect(task.actions).toHaveLength(2)
    expect(task.actions[0].path).toBe('cmd.exe')
    expect(task.actions[0].arguments).toBe('/c echo test')
    expect(task.actions[0].workingDirectory).toBe('C:\\Test')
    expect(task.actions[1].path).toBe('notepad.exe')

    // Check principal
    expect(task.principal?.userId).toBe('SYSTEM')
    expect(task.principal?.logonType).toBe('ServiceAccount')
    expect(task.principal?.runLevel).toBe('HighestAvailable')

    // Check settings
    expect(task.settings?.enabled).toBe(true)
    expect(task.settings?.hidden).toBe(false)
    expect(task.settings?.priority).toBe(5)
    expect(task.settings?.wakeToRun).toBe(true)
    expect(task.settings?.multipleInstancesPolicy).toBe('Queue')
    expect(task.settings?.restartOnFailure?.interval).toBe('PT10M')
    expect(task.settings?.restartOnFailure?.count).toBe(3)
  })

  it('should allow overriding template values', () => {
    const task = TaskSchedulerBuilder.createFrom(templatePath)
      .name('OverriddenTask')
      .description('Overridden description')
      .setSettings({
        priority: 3,
        hidden: true,
      })
      .addAction('powershell.exe', '-Command echo override')
      .build()

    expect(task.name).toBe('OverriddenTask')
    expect(task.description).toBe('Overridden description')
    expect(task.settings?.priority).toBe(3)
    expect(task.settings?.hidden).toBe(true)
    
    // Should have template actions plus new action
    expect(task.actions).toHaveLength(3)
    expect(task.actions[2].path).toBe('powershell.exe')
  })

  it('should load time trigger with repetition from template', () => {
    const task = TaskSchedulerBuilder.createFrom(templatePath)
      .name('TestTask')
      .build()

    const timeTrigger = task.triggers[0]
    expect(timeTrigger.type).toBe('time')
    
    if (timeTrigger.type === 'time') {
      expect(timeTrigger.repetition?.interval).toBe('PT1H')
      expect(timeTrigger.repetition?.duration).toBe('PT12H')
      expect(timeTrigger.repetition?.stopAtDurationEnd).toBe(true)
    }
  })

  it('should load logon trigger from template', () => {
    const task = TaskSchedulerBuilder.createFrom(templatePath)
      .name('TestTask')
      .build()

    const logonTrigger = task.triggers[1]
    expect(logonTrigger.type).toBe('logon')
    
    if (logonTrigger.type === 'logon') {
      expect(logonTrigger.userId).toBe('TestUser')
      expect(logonTrigger.enabled).toBe(true)
    }
  })

  it('should create builder without template path', () => {
    // Should work exactly as before when no template provided
    const task = TaskSchedulerBuilder.createFrom()
      .name('NoTemplateTask')
      .addTimeTrigger(new Date())
      .addAction('test.exe')
      .build()

    expect(task.name).toBe('NoTemplateTask')
    expect(task.triggers).toHaveLength(1)
    expect(task.actions).toHaveLength(1)
  })
})
