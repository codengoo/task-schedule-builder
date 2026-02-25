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
    expect(task.RegistrationInfo?.Description).toBe('A test task')
    expect(task.Triggers).toHaveLength(1)
    expect(task.Actions).toHaveLength(1)
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

    expect(task.Triggers).toHaveLength(3)
    expect(task.Triggers[0].type).toBe('time')
    expect(task.Triggers[1].type).toBe('logon')
    expect(task.Triggers[2].type).toBe('startup')
  })

  it('should add multiple actions', () => {
    const task = TaskSchedulerBuilder.createFrom()
      .name('TestTask')
      .addTimeTrigger(new Date())
      .addAction('cmd.exe', '/c echo hello')
      .addAction('notepad.exe', 'test.txt', 'C:\\')
      .build()

    expect(task.Actions).toHaveLength(2)
    expect(task.Actions[0].Command).toBe('cmd.exe')
    expect(task.Actions[0].Arguments).toBe('/c echo hello')
    expect(task.Actions[1].WorkingDirectory).toBe('C:\\')
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

    const trigger = task.Triggers[0]
    expect(trigger.type).toBe('time')
    if (trigger.type === 'time') {
      expect(trigger.Repetition).toBeDefined()
      expect(trigger.Repetition?.Interval).toBe('PT1H')
      expect(trigger.Repetition?.Duration).toBe('PT12H')
      expect(trigger.Repetition?.StopAtDurationEnd).toBe(true)
    }
  })

  it('should configure logon trigger with userId', () => {
    const task = TaskSchedulerBuilder.createFrom()
      .name('TestTask')
      .addLogonTrigger({ userId: 'DOMAIN\\User' })
      .addAction('test.exe')
      .build()

    const trigger = task.Triggers[0]
    expect(trigger.type).toBe('logon')
    if (trigger.type === 'logon') {
      expect(trigger.UserId).toBe('DOMAIN\\User')
    }
  })

  it('should configure startup trigger with delay', () => {
    const task = TaskSchedulerBuilder.createFrom()
      .name('TestTask')
      .addStartupTrigger({ delay: 'PT5M' })
      .addAction('test.exe')
      .build()

    const trigger = task.Triggers[0]
    expect(trigger.type).toBe('startup')
    if (trigger.type === 'startup') {
      expect(trigger.Delay).toBe('PT5M')
    }
  })

  it('should set principal configuration', () => {
    const task = TaskSchedulerBuilder.createFrom()
      .name('TestTask')
      .addTimeTrigger(new Date())
      .addAction('test.exe')
      .setPrincipal({
        UserId: 'SYSTEM',
        RunLevel: 'HighestAvailable',
        LogonType: 'Password',
      })
      .build()

    expect(task.Principals).toBeDefined()
    expect(task.Principals?.Principal.UserId).toBe('SYSTEM')
    expect(task.Principals?.Principal.RunLevel).toBe('HighestAvailable')
    expect(task.Principals?.Principal.LogonType).toBe('Password')
  })

  it('should set highest privileges using helper method', () => {
    const task = TaskSchedulerBuilder.createFrom()
      .name('TestTask')
      .addTimeTrigger(new Date())
      .addAction('test.exe')
      .runWithHighestPrivileges()
      .build()

    expect(task.Principals?.Principal.RunLevel).toBe('HighestAvailable')
  })

  it('should configure task settings', () => {
    const task = TaskSchedulerBuilder.createFrom()
      .name('TestTask')
      .addTimeTrigger(new Date())
      .addAction('test.exe')
      .setSettings({
        Enabled: true,
        Hidden: true,
        AllowDemandStart: true,
        MultipleInstancesPolicy: 'Queue',
        Priority: 5,
      })
      .build()

    expect(task.Settings).toBeDefined()
    expect(task.Settings?.Enabled).toBe(true)
    expect(task.Settings?.Hidden).toBe(true)
    expect(task.Settings?.Priority).toBe(5)
  })

  it('should configure hidden task using helper method', () => {
    const task = TaskSchedulerBuilder.createFrom()
      .name('TestTask')
      .addTimeTrigger(new Date())
      .addAction('test.exe')
      .hidden()
      .build()

    expect(task.Settings?.Hidden).toBe(true)
  })

  it('should configure enabled state using helper method', () => {
    const task = TaskSchedulerBuilder.createFrom()
      .name('TestTask')
      .addTimeTrigger(new Date())
      .addAction('test.exe')
      .enabled(false)
      .build()

    expect(task.Settings?.Enabled).toBe(false)
  })

  it('should set author', () => {
    const task = TaskSchedulerBuilder.createFrom()
      .name('TestTask')
      .author('John Doe')
      .addTimeTrigger(new Date())
      .addAction('test.exe')
      .build()

    expect(task.RegistrationInfo?.Author).toBe('John Doe')
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
        UserId: 'SYSTEM',
        RunLevel: 'HighestAvailable',
        LogonType: 'S4U',
      })
      .setSettings({
        Enabled: true,
        Hidden: false,
        AllowDemandStart: true,
        MultipleInstancesPolicy: 'Queue',
        Priority: 4,
        ExecutionTimeLimit: 'PT2H',
        RestartOnFailure: {
          Interval: 'PT10M',
          Count: 3,
        },
      })
      .build()

    expect(task.name).toBe('ComplexTask')
    expect(task.Triggers).toHaveLength(2)
    expect(task.Actions).toHaveLength(1)
    expect(task.Principals?.Principal.RunLevel).toBe('HighestAvailable')
    expect(task.Settings?.Priority).toBe(4)
  })

  it('should set RegistrationInfo using setRegistrationInfo', () => {
    const regDate = new Date('2024-01-01T00:00:00Z')

    const task = TaskSchedulerBuilder.createFrom()
      .name('TestTask')
      .setRegistrationInfo({
        Author: 'IT Department',
        Description: 'Backup task',
        Version: '1.0.0',
        Date: regDate,
        URI: '\\MyTasks\\Backup',
        Documentation: 'See wiki for details',
      })
      .addTimeTrigger(new Date())
      .addAction('test.exe')
      .build()

    expect(task.RegistrationInfo).toBeDefined()
    expect(task.RegistrationInfo?.Author).toBe('IT Department')
    expect(task.RegistrationInfo?.Description).toBe('Backup task')
    expect(task.RegistrationInfo?.Version).toBe('1.0.0')
    expect(task.RegistrationInfo?.Date).toBe(regDate)
    expect(task.RegistrationInfo?.URI).toBe('\\MyTasks\\Backup')
    expect(task.RegistrationInfo?.Documentation).toBe('See wiki for details')
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

    expect(task.RegistrationInfo?.Author).toBe('Admin')
    expect(task.RegistrationInfo?.Description).toBe('Test task')
    expect(task.RegistrationInfo?.Version).toBe('2.0.0')
    expect(task.RegistrationInfo?.URI).toBe('\\Tasks\\Test')
    expect(task.RegistrationInfo?.Documentation).toBe('Important notes')
    expect(task.RegistrationInfo?.Date).toBe(regDate)
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

    expect(task.RegistrationInfo?.Author).toBe('Legacy Author')
    expect(task.RegistrationInfo?.Description).toBe('Legacy Description')
    expect(task.RegistrationInfo?.Version).toBe('1.0.0')
  })
})

describe('taskSchedulerBuilder - XML Template Loading', () => {
  const templatePath = 'test/fixtures/test-template.xml'

  it('should load task configuration from XML template', () => {
    const task = TaskSchedulerBuilder.createFrom(templatePath)
      .name('TestTask')
      .build()

    // Check RegistrationInfo
    expect(task.RegistrationInfo?.Author).toBe('Test Author')
    expect(task.RegistrationInfo?.Description).toBe('Test template task')
    expect(task.RegistrationInfo?.Version).toBe('1.0.0')
    expect(task.RegistrationInfo?.URI).toBe('\\Test\\Template')
    expect(task.RegistrationInfo?.Documentation).toBe('Test documentation')

    // Check triggers (should have 2 from template)
    expect(task.Triggers).toHaveLength(2)
    expect(task.Triggers[0].type).toBe('time')
    expect(task.Triggers[1].type).toBe('logon')

    // Check actions (should have 2 from template)
    expect(task.Actions).toHaveLength(2)
    expect(task.Actions[0].Command).toBe('cmd.exe')
    expect(task.Actions[0].Arguments).toBe('/c echo test')
    expect(task.Actions[0].WorkingDirectory).toBe('C:\\Test')
    expect(task.Actions[1].Command).toBe('notepad.exe')

    // Check principal
    expect(task.Principals?.Principal.UserId).toBe('SYSTEM')
    expect(task.Principals?.Principal.LogonType).toBe('S4U')
    expect(task.Principals?.Principal.RunLevel).toBe('HighestAvailable')

    // Check settings
    expect(task.Settings?.Enabled).toBe(true)
    expect(task.Settings?.Hidden).toBe(false)
    expect(task.Settings?.Priority).toBe(5)
    expect(task.Settings?.WakeToRun).toBe(true)
    expect(task.Settings?.MultipleInstancesPolicy).toBe('Queue')
    expect(task.Settings?.RestartOnFailure?.Interval).toBe('PT10M')
    expect(task.Settings?.RestartOnFailure?.Count).toBe(3)
  })

  it('should allow overriding template values', () => {
    const task = TaskSchedulerBuilder.createFrom(templatePath)
      .name('OverriddenTask')
      .description('Overridden description')
      .setSettings({
        Priority: 3,
        Hidden: true,
      })
      .addAction('powershell.exe', '-Command echo override')
      .build()

    expect(task.name).toBe('OverriddenTask')
    expect(task.RegistrationInfo?.Description).toBe('Overridden description')
    expect(task.Settings?.Priority).toBe(3)
    expect(task.Settings?.Hidden).toBe(true)
    
    // Should have template actions plus new action
    expect(task.Actions).toHaveLength(3)
    expect(task.Actions[2].Command).toBe('powershell.exe')
  })

  it('should load time trigger with repetition from template', () => {
    const task = TaskSchedulerBuilder.createFrom(templatePath)
      .name('TestTask')
      .build()

    const timeTrigger = task.Triggers[0]
    expect(timeTrigger.type).toBe('time')
    
    if (timeTrigger.type === 'time') {
      expect(timeTrigger.Repetition?.Interval).toBe('PT1H')
      expect(timeTrigger.Repetition?.Duration).toBe('PT12H')
      expect(timeTrigger.Repetition?.StopAtDurationEnd).toBe(true)
    }
  })

  it('should load logon trigger from template', () => {
    const task = TaskSchedulerBuilder.createFrom(templatePath)
      .name('TestTask')
      .build()

    const logonTrigger = task.Triggers[1]
    expect(logonTrigger.type).toBe('logon')
    
    if (logonTrigger.type === 'logon') {
      expect(logonTrigger.UserId).toBe('TestUser')
      expect(logonTrigger.Enabled).toBe(true)
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
    expect(task.Triggers).toHaveLength(1)
    expect(task.Actions).toHaveLength(1)
  })
})
