import { TaskSchedulerBuilder } from './src/builder.ts'
import { toXml } from './src/xml.ts'

const task = TaskSchedulerBuilder.createFrom()
  .name('TestTask')
  .author('John Doe')
  .description('A test task')
  .addTimeTrigger(new Date('2024-01-01T10:00:00'))
  .addAction('notepad.exe', 'test.txt')
  .runWithHighestPrivileges()
  .setSettings({
    Enabled: true,
    Hidden: false,
    Priority: 5,
  })
  .build()

const xml = toXml(task)
console.log(xml)
