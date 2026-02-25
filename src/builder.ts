import type {
  DayOfWeek,
  LogonType,
  RegistrationInfo,
  RunLevel,
  TaskConfig,
  TaskSettings,
} from './types'
import { parseXmlTemplate } from './xml'

/**
 * Builder for creating Windows Task Scheduler configurations
 * Schema: https://learn.microsoft.com/en-us/windows/win32/taskschd/task-scheduler-schema
 */
export class TaskSchedulerBuilder {
  private config: Partial<TaskConfig> = {
    Triggers: [],
    Actions: [],
  }

  /**
   * Initialize builder with optional XML template
   */
  private constructor(xmlTemplatePath?: string) {
    if (xmlTemplatePath) {
      const templateConfig = parseXmlTemplate(xmlTemplatePath)
      // Merge template config into this.config
      this.config = {
        ...this.config,
        ...templateConfig,
        Triggers: templateConfig.Triggers || [],
        Actions: templateConfig.Actions || [],
      }
    }
  }

  /**
   * Set the task name (required)
   */
  name(name: string): this {
    this.config.name = name
    return this
  }

  /**
   * Set registration info metadata
   * @example
   * .setRegistrationInfo({
   *   Author: 'IT Department',
   *   Description: 'Daily backup task',
   *   Version: '1.0.0',
   *   Date: new Date(),
   *   URI: '\\MyTasks\\Backup'
   * })
   */
  setRegistrationInfo(info: RegistrationInfo): this {
    this.config.RegistrationInfo = info
    return this
  }

  /**
   * Set the task description
   */
  description(description: string): this {
    if (!this.config.RegistrationInfo) {
      this.config.RegistrationInfo = {}
    }
    this.config.RegistrationInfo.Description = description
    return this
  }

  /**
   * Set the task author
   */
  author(author: string): this {
    if (!this.config.RegistrationInfo) {
      this.config.RegistrationInfo = {}
    }
    this.config.RegistrationInfo.Author = author
    return this
  }

  /**
   * Set the task version
   */
  version(version: string): this {
    if (!this.config.RegistrationInfo) {
      this.config.RegistrationInfo = {}
    }
    this.config.RegistrationInfo.Version = version
    return this
  }

  /**
   * Set the task URI (path in task scheduler)
   * @example .uri('\\MyCompany\\Maintenance\\Backup')
   */
  uri(uri: string): this {
    if (!this.config.RegistrationInfo) {
      this.config.RegistrationInfo = {}
    }
    this.config.RegistrationInfo.URI = uri
    return this
  }

  /**
   * Set the task documentation/notes
   */
  documentation(doc: string): this {
    if (!this.config.RegistrationInfo) {
      this.config.RegistrationInfo = {}
    }
    this.config.RegistrationInfo.Documentation = doc
    return this
  }

  /**
   * Set the registration date
   */
  registrationDate(date: Date): this {
    if (!this.config.RegistrationInfo) {
      this.config.RegistrationInfo = {}
    }
    this.config.RegistrationInfo.Date = date
    return this
  }

  /**
   * Add a time-based trigger
   */
  addTimeTrigger(startTime: Date, options?: {
    enabled?: boolean
    repetitionInterval?: string
    repetitionDuration?: string
    stopAtDurationEnd?: boolean
  }): this {
    this.config.Triggers!.push({
      type: 'time',
      StartBoundary: startTime,
      Enabled: options?.enabled ?? true,
      Repetition: options?.repetitionInterval
        ? {
            Interval: options.repetitionInterval,
            Duration: options.repetitionDuration,
            StopAtDurationEnd: options.stopAtDurationEnd,
          }
        : undefined,
    })
    return this
  }

  /**
   * Add a logon trigger
   */
  addLogonTrigger(options?: { enabled?: boolean, userId?: string }): this {
    this.config.Triggers!.push({
      type: 'logon',
      Enabled: options?.enabled ?? true,
      UserId: options?.userId,
    })
    return this
  }

  /**
   * Add a startup trigger
   */
  addStartupTrigger(options?: { enabled?: boolean, delay?: string }): this {
    this.config.Triggers!.push({
      type: 'startup',
      Enabled: options?.enabled ?? true,
      Delay: options?.delay,
    })
    return this
  }

  /**
   * Add a daily schedule trigger
   */
  addDailySchedule(startTime: Date, _daysInterval: number = 1): this {
    this.config.Triggers!.push({
      type: 'time',
      StartBoundary: startTime,
      Enabled: true,
    })
    return this
  }

  /**
   * Add a weekly schedule trigger
   */
  addWeeklySchedule(startTime: Date, _daysOfWeek: DayOfWeek[], _weeksInterval: number = 1): this {
    this.config.Triggers!.push({
      type: 'time',
      StartBoundary: startTime,
      Enabled: true,
    })
    return this
  }

  /**
   * Add an execution action
   */
  addAction(path: string, args?: string, workingDir?: string): this {
    this.config.Actions!.push({
      Command: path,
      Arguments: args,
      WorkingDirectory: workingDir,
    })
    return this
  }

  /**
   * Set the principal (user context)
   * Note: Schema requires Principal to be wrapped in Principals element
   */
  setPrincipal(options: {
    UserId?: string
    LogonType?: LogonType
    RunLevel?: RunLevel
    GroupId?: string
    DisplayName?: string
  }): this {
    this.config.Principals = {
      Principal: {
        UserId: options.UserId,
        LogonType: options.LogonType,
        RunLevel: options.RunLevel,
        GroupId: options.GroupId,
        DisplayName: options.DisplayName,
      },
    }
    return this
  }

  /**
   * Set task settings
   */
  setSettings(settings: TaskSettings): this {
    this.config.Settings = settings
    return this
  }

  /**
   * Configure the task to run with highest privileges
   */
  runWithHighestPrivileges(): this {
    if (!this.config.Principals) {
      this.config.Principals = {
        Principal: {},
      }
    }
    this.config.Principals.Principal.RunLevel = 'HighestAvailable'
    return this
  }

  /**
   * Configure the task to be hidden
   */
  hidden(): this {
    if (!this.config.Settings) {
      this.config.Settings = {}
    }
    this.config.Settings.Hidden = true
    return this
  }

  /**
   * Enable the task
   */
  enabled(enabled: boolean = true): this {
    if (!this.config.Settings) {
      this.config.Settings = {}
    }
    this.config.Settings.Enabled = enabled
    return this
  }

  /**
   * Build the task configuration
   */
  build(): TaskConfig {
    if (!this.config.name) {
      throw new Error('Task name is required')
    }
    if (this.config.Actions!.length === 0) {
      throw new Error('At least one action is required')
    }
    if (this.config.Triggers!.length === 0) {
      throw new Error('At least one trigger is required')
    }

    return this.config as TaskConfig
  }

  /**
   * Create a new builder instance
   * @param xmlTemplatePath Optional path to XML template file to load initial configuration
   * @example
   * // Create from scratch
   * const builder = TaskSchedulerBuilder.createFrom()
   * 
   * // Create from XML template
   * const builder = TaskSchedulerBuilder.createFrom('template.xml')
   */
  static createFrom(xmlTemplatePath?: string): TaskSchedulerBuilder {
    return new TaskSchedulerBuilder(xmlTemplatePath)
  }
}
