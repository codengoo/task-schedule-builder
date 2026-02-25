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
 */
export class TaskSchedulerBuilder {
  private config: Partial<TaskConfig> = {
    triggers: [],
    actions: [],
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
        triggers: templateConfig.triggers || [],
        actions: templateConfig.actions || [],
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
   * Set the task description (legacy method, prefer setRegistrationInfo)
   */
  description(description: string): this {
    this.config.description = description
    return this
  }

  /**
   * Set the task author (legacy method, prefer setRegistrationInfo)
   */
  author(author: string): this {
    this.config.author = author
    return this
  }

  /**
   * Set registration info metadata
   * @example
   * .setRegistrationInfo({
   *   author: 'IT Department',
   *   description: 'Daily backup task',
   *   version: '1.0.0',
   *   date: new Date(),
   *   uri: '\\MyTasks\\Backup'
   * })
   */
  setRegistrationInfo(info: RegistrationInfo): this {
    this.config.registrationInfo = info
    return this
  }

  /**
   * Set the task version
   */
  version(version: string): this {
    if (!this.config.registrationInfo) {
      this.config.registrationInfo = {}
    }
    this.config.registrationInfo.version = version
    return this
  }

  /**
   * Set the task URI (path in task scheduler)
   * @example .uri('\\MyCompany\\Maintenance\\Backup')
   */
  uri(uri: string): this {
    if (!this.config.registrationInfo) {
      this.config.registrationInfo = {}
    }
    this.config.registrationInfo.uri = uri
    return this
  }

  /**
   * Set the task documentation/notes
   */
  documentation(doc: string): this {
    if (!this.config.registrationInfo) {
      this.config.registrationInfo = {}
    }
    this.config.registrationInfo.documentation = doc
    return this
  }

  /**
   * Set the registration date
   */
  registrationDate(date: Date): this {
    if (!this.config.registrationInfo) {
      this.config.registrationInfo = {}
    }
    this.config.registrationInfo.date = date
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
    this.config.triggers!.push({
      type: 'time',
      startBoundary: startTime,
      enabled: options?.enabled ?? true,
      repetition: options?.repetitionInterval
        ? {
            interval: options.repetitionInterval,
            duration: options.repetitionDuration,
            stopAtDurationEnd: options.stopAtDurationEnd,
          }
        : undefined,
    })
    return this
  }

  /**
   * Add a logon trigger
   */
  addLogonTrigger(options?: { enabled?: boolean, userId?: string }): this {
    this.config.triggers!.push({
      type: 'logon',
      enabled: options?.enabled ?? true,
      userId: options?.userId,
    })
    return this
  }

  /**
   * Add a startup trigger
   */
  addStartupTrigger(options?: { enabled?: boolean, delay?: string }): this {
    this.config.triggers!.push({
      type: 'startup',
      enabled: options?.enabled ?? true,
      delay: options?.delay,
    })
    return this
  }

  /**
   * Add a daily schedule trigger
   */
  addDailySchedule(startTime: Date, _daysInterval: number = 1): this {
    this.config.triggers!.push({
      type: 'time',
      startBoundary: startTime,
      enabled: true,
    })
    return this
  }

  /**
   * Add a weekly schedule trigger
   */
  addWeeklySchedule(startTime: Date, _daysOfWeek: DayOfWeek[], _weeksInterval: number = 1): this {
    this.config.triggers!.push({
      type: 'time',
      startBoundary: startTime,
      enabled: true,
    })
    return this
  }

  /**
   * Add an execution action
   */
  addAction(path: string, args?: string, workingDir?: string): this {
    this.config.actions!.push({
      path,
      arguments: args,
      workingDirectory: workingDir,
    })
    return this
  }

  /**
   * Set the principal (user context)
   */
  setPrincipal(options: {
    userId?: string
    logonType?: LogonType
    runLevel?: RunLevel
  }): this {
    this.config.principal = options
    return this
  }

  /**
   * Set task settings
   */
  setSettings(settings: TaskSettings): this {
    this.config.settings = settings
    return this
  }

  /**
   * Configure the task to run with highest privileges
   */
  runWithHighestPrivileges(): this {
    if (!this.config.principal) {
      this.config.principal = {}
    }
    this.config.principal.runLevel = 'HighestAvailable'
    return this
  }

  /**
   * Configure the task to be hidden
   */
  hidden(): this {
    if (!this.config.settings) {
      this.config.settings = {}
    }
    this.config.settings.hidden = true
    return this
  }

  /**
   * Enable the task
   */
  enabled(enabled: boolean = true): this {
    if (!this.config.settings) {
      this.config.settings = {}
    }
    this.config.settings.enabled = enabled
    return this
  }

  /**
   * Build the task configuration
   */
  build(): TaskConfig {
    if (!this.config.name) {
      throw new Error('Task name is required')
    }
    if (this.config.actions!.length === 0) {
      throw new Error('At least one action is required')
    }
    if (this.config.triggers!.length === 0) {
      throw new Error('At least one trigger is required')
    }

    return this.config as TaskConfig
  }

  /**
   * Create a new builder instance
   * @param xmlTemplatePath Optional path to XML template file to load initial configuration
   * @example
   * // Create from scratch
   * const builder = TaskSchedulerBuilder.create()
   * 
   * // Create from XML template
   * const builder = TaskSchedulerBuilder.create('template.xml')
   */
  static create(xmlTemplatePath?: string): TaskSchedulerBuilder {
    return new TaskSchedulerBuilder(xmlTemplatePath)
  }
}
