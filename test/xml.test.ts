import { describe, expect, it } from 'vitest'
import { TaskSchedulerBuilder } from '../src/builder'
import { toXml } from '../src/xml'

describe('xml generation', () => {
  it('should generate valid XML for a basic task', () => {
    const task = TaskSchedulerBuilder.createFrom()
      .name('TestTask')
      .description('Test description')
      .addTimeTrigger(new Date('2024-01-01T10:00:00Z'))
      .addAction('notepad.exe')
      .build()

    const xml = toXml(task)

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-16"?>')
    expect(xml).toContain('<Task version=\"1.3\"')
    expect(xml).toContain('<Description>Test description</Description>')
    expect(xml).toContain('<Command>notepad.exe</Command>')
    expect(xml).toContain('<CalendarTrigger>')
    expect(xml).toContain('2024-01-01T10:00:00')
  })

  it('should escape XML special characters', () => {
    const task = TaskSchedulerBuilder.createFrom()
      .name('TestTask')
      .description('Test with <special> & "characters"')
      .addTimeTrigger(new Date())
      .addAction('cmd.exe', '/c echo "hello & goodbye"')
      .build()

    const xml = toXml(task)

    expect(xml).toContain('&lt;special&gt; &amp; &quot;characters&quot;')
    expect(xml).toContain('/c echo &quot;hello &amp; goodbye&quot;')
  })

  it('should generate XML with multiple triggers', () => {
    const task = TaskSchedulerBuilder.createFrom()
      .name('TestTask')
      .addTimeTrigger(new Date())
      .addLogonTrigger()
      .addStartupTrigger()
      .addAction('test.exe')
      .build()

    const xml = toXml(task)

    expect(xml).toContain('<CalendarTrigger>')
    expect(xml).toContain('<LogonTrigger>')
    expect(xml).toContain('<BootTrigger>')
  })

  it('should generate XML with repetition', () => {
    const task = TaskSchedulerBuilder.createFrom()
      .name('TestTask')
      .addTimeTrigger(new Date(), {
        repetitionInterval: 'PT1H',
        repetitionDuration: 'PT12H',
        stopAtDurationEnd: true,
      })
      .addAction('test.exe')
      .build()

    const xml = toXml(task)

    expect(xml).toContain('<Repetition>')
    expect(xml).toContain('<Interval>PT1H</Interval>')
    expect(xml).toContain('<Duration>PT12H</Duration>')
    expect(xml).toContain('<StopAtDurationEnd>true</StopAtDurationEnd>')
  })

  it('should generate XML with logon trigger userId', () => {
    const task = TaskSchedulerBuilder.createFrom()
      .name('TestTask')
      .addLogonTrigger({ userId: 'DOMAIN\\User' })
      .addAction('test.exe')
      .build()

    const xml = toXml(task)

    expect(xml).toContain('<LogonTrigger>')
    expect(xml).toContain('<UserId>DOMAIN\\User</UserId>')
  })

  it('should generate XML with startup trigger delay', () => {
    const task = TaskSchedulerBuilder.createFrom()
      .name('TestTask')
      .addStartupTrigger({ delay: 'PT5M' })
      .addAction('test.exe')
      .build()

    const xml = toXml(task)

    expect(xml).toContain('<BootTrigger>')
    expect(xml).toContain('<Delay>PT5M</Delay>')
  })

  it('should generate XML with multiple actions', () => {
    const task = TaskSchedulerBuilder.createFrom()
      .name('TestTask')
      .addTimeTrigger(new Date())
      .addAction('cmd.exe', '/c echo hello', 'C:\\')
      .addAction('notepad.exe')
      .build()

    const xml = toXml(task)

    expect(xml).toContain('<Command>cmd.exe</Command>')
    expect(xml).toContain('<Arguments>/c echo hello</Arguments>')
    expect(xml).toContain('<WorkingDirectory>C:\\</WorkingDirectory>')
    expect(xml).toContain('<Command>notepad.exe</Command>')
  })

  it('should generate XML with principal configuration', () => {
    const task = TaskSchedulerBuilder.createFrom()
      .name('TestTask')
      .addTimeTrigger(new Date())
      .addAction('test.exe')
      .setPrincipal({
        UserId: 'Administrator',
        RunLevel: 'HighestAvailable',
        LogonType: 'Password',
      })
      .build()

    const xml = toXml(task)

    expect(xml).toContain('<Principals>')
    expect(xml).toContain('<UserId>Administrator</UserId>')
    expect(xml).toContain('<RunLevel>HighestAvailable</RunLevel>')
    expect(xml).toContain('<LogonType>Password</LogonType>')
  })

  it('should generate XML with default principal when not specified', () => {
    const task = TaskSchedulerBuilder.createFrom()
      .name('TestTask')
      .addTimeTrigger(new Date())
      .addAction('test.exe')
      .build()

    const xml = toXml(task)

    // When no principal is specified, the XML should not include default values
    // Windows Task Scheduler will use appropriate defaults
    expect(xml).toContain('<Principals>')
    expect(xml).toContain('<Principal id="Author"')
  })

  it('should generate XML with custom settings', () => {
    const task = TaskSchedulerBuilder.createFrom()
      .name('TestTask')
      .addTimeTrigger(new Date())
      .addAction('test.exe')
      .setSettings({
        Enabled: false,
        Hidden: true,
        Priority: 3,
        ExecutionTimeLimit: 'PT1H',
        MultipleInstancesPolicy: 'Parallel',
        AllowDemandStart: false,
        StartWhenAvailable: true,
        WakeToRun: true,
      })
      .build()

    const xml = toXml(task)

    expect(xml).toContain('<Enabled>false</Enabled>')
    expect(xml).toContain('<Hidden>true</Hidden>')
    expect(xml).toContain('<Priority>3</Priority>')
    expect(xml).toContain('<ExecutionTimeLimit>PT1H</ExecutionTimeLimit>')
    expect(xml).toContain('<MultipleInstancesPolicy>Parallel</MultipleInstancesPolicy>')
    expect(xml).toContain('<AllowStartOnDemand>false</AllowStartOnDemand>')
    expect(xml).toContain('<StartWhenAvailable>true</StartWhenAvailable>')
    expect(xml).toContain('<WakeToRun>true</WakeToRun>')
  })

  it('should generate XML with restart on failure', () => {
    const task = TaskSchedulerBuilder.createFrom()
      .name('TestTask')
      .addTimeTrigger(new Date())
      .addAction('test.exe')
      .setSettings({
        RestartOnFailure: {
          Interval: 'PT10M',
          Count: 3,
        },
      })
      .build()

    const xml = toXml(task)

    expect(xml).toContain('<RestartOnFailure>')
    expect(xml).toContain('<Interval>PT10M</Interval>')
    expect(xml).toContain('<Count>3</Count>')
  })

  it('should generate XML with author', () => {
    const task = TaskSchedulerBuilder.createFrom()
      .name('TestTask')
      .author('John Doe')
      .addTimeTrigger(new Date())
      .addAction('test.exe')
      .build()

    const xml = toXml(task)

    expect(xml).toContain('<Author>John Doe</Author>')
  })

  it('should generate well-formed XML structure', () => {
    const task = TaskSchedulerBuilder.createFrom()
      .name('TestTask')
      .description('Test')
      .addTimeTrigger(new Date())
      .addAction('test.exe')
      .build()

    const xml = toXml(task)

    // Check basic XML structure per http://schemas.microsoft.com/windows/2004/02/mit/task
    expect(xml).toMatch(/<\?xml version="1\.0" encoding="UTF-16"\?>/)
    expect(xml).toMatch(/<Task version="1\.3"/)
    expect(xml).toContain('<RegistrationInfo>')
    expect(xml).toContain('</RegistrationInfo>')
    expect(xml).toContain('<Triggers>')
    expect(xml).toContain('</Triggers>')
    expect(xml).toContain('<Principals>')
    expect(xml).toContain('<Principal id="Author"')
    expect(xml).toContain('<Settings>')
    expect(xml).toContain('</Settings>')
    expect(xml).toContain('<Actions')
    expect(xml).toContain('</Actions>')
    expect(xml).toContain('</Task>')
  })

  it('should handle disabled triggers', () => {
    const task = TaskSchedulerBuilder.createFrom()
      .name('TestTask')
      .addTimeTrigger(new Date(), { enabled: false })
      .addAction('test.exe')
      .build()

    const xml = toXml(task)

    expect(xml).toContain('<Enabled>false</Enabled>')
  })

  it('should generate XML with RegistrationInfo fields', () => {
    const task = TaskSchedulerBuilder.createFrom()
      .name('TestTask')
      .setRegistrationInfo({
        Author: 'John Doe',
        Description: 'Test task',
        Version: '1.2.3',
        Date: new Date('2024-01-01T10:00:00Z'),
        URI: '\\MyTasks\\Test',
        Documentation: 'See documentation for details',
      })
      .addTimeTrigger(new Date())
      .addAction('test.exe')
      .build()

    const xml = toXml(task)

    expect(xml).toContain('<Author>John Doe</Author>')
    expect(xml).toContain('<Description>Test task</Description>')
    expect(xml).toContain('<Version>1.2.3</Version>')
    expect(xml).toContain('<Date>2024-01-01T10:00:00</Date>')
    expect(xml).toContain('<URI>\\MyTasks\\Test</URI>')
    expect(xml).toContain('<Documentation>See documentation for details</Documentation>')
  })

  it('should generate XML with builder helper methods for RegistrationInfo', () => {
    const task = TaskSchedulerBuilder.createFrom()
      .name('TestTask')
      .author('Admin')
      .description('Test description')
      .version('2.0.0')
      .uri('\\Tasks\\MyTask')
      .documentation('Important task')
      .registrationDate(new Date('2024-06-01T00:00:00Z'))
      .addTimeTrigger(new Date())
      .addAction('test.exe')
      .build()

    const xml = toXml(task)

    expect(xml).toContain('<Author>Admin</Author>')
    expect(xml).toContain('<Description>Test description</Description>')
    expect(xml).toContain('<Version>2.0.0</Version>')
    expect(xml).toContain('<URI>\\Tasks\\MyTask</URI>')
    expect(xml).toContain('<Documentation>Important task</Documentation>')
    expect(xml).toContain('<Date>2024-06-01T00:00:00</Date>')
  })

  it('should properly order RegistrationInfo elements per schema', () => {
    const task = TaskSchedulerBuilder.createFrom()
      .name('TestTask')
      .setRegistrationInfo({
        Documentation: 'Docs',
        URI: '\\Test',
        Version: '1.0',
        Description: 'Desc',
        Author: 'Auth',
        Date: new Date('2024-01-01T00:00:00Z'),
      })
      .addTimeTrigger(new Date())
      .addAction('test.exe')
      .build()

    const xml = toXml(task)

    // Per schema, order should be: Date, Author, Version, Description, URI, Documentation
    const datePos = xml.indexOf('<Date>')
    const authorPos = xml.indexOf('<Author>')
    const versionPos = xml.indexOf('<Version>')
    const descPos = xml.indexOf('<Description>')
    const uriPos = xml.indexOf('<URI>')
    const docPos = xml.indexOf('<Documentation>')

    expect(datePos).toBeLessThan(authorPos)
    expect(authorPos).toBeLessThan(versionPos)
    expect(versionPos).toBeLessThan(descPos)
    expect(descPos).toBeLessThan(uriPos)
    expect(uriPos).toBeLessThan(docPos)
  })
})

