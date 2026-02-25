/**
 * Task Scheduler trigger types
 */
export type TriggerType = 'time' | 'logon' | 'startup' | 'idle' | 'event'

/**
 * Task execution level
 */
export type ExecutionLevel = 'LeastPrivilege' | 'HighestAvailable'

/**
 * Task run level
 */
export type RunLevel = 'LimitedUser' | 'HighestAvailable'

/**
 * Day of week for weekly triggers
 */
export type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'

/**
 * Logon type for principal
 */
export type LogonType = 'Password' | 'S4U' | 'InteractiveToken' | 'ServiceAccount'

/**
 * Time trigger configuration
 */
export interface TimeTrigger {
  type: 'time'
  startBoundary: Date
  enabled?: boolean
  repetition?: {
    interval: string // PT1H for 1 hour, PT30M for 30 minutes
    duration?: string // PT24H for 24 hours
    stopAtDurationEnd?: boolean
  }
}

/**
 * Logon trigger configuration
 */
export interface LogonTrigger {
  type: 'logon'
  enabled?: boolean
  userId?: string
}

/**
 * Startup trigger configuration
 */
export interface StartupTrigger {
  type: 'startup'
  enabled?: boolean
  delay?: string // PT5M for 5 minutes
}

/**
 * Daily schedule configuration
 */
export interface DailySchedule {
  type: 'daily'
  startBoundary: Date
  daysInterval: number // Repeat every N days
}

/**
 * Weekly schedule configuration
 */
export interface WeeklySchedule {
  type: 'weekly'
  startBoundary: Date
  weeksInterval: number // Repeat every N weeks
  daysOfWeek: DayOfWeek[]
}

/**
 * Trigger union type
 */
export type Trigger = TimeTrigger | LogonTrigger | StartupTrigger

/**
 * Schedule union type
 */
export type Schedule = DailySchedule | WeeklySchedule

/**
 * Action to execute
 */
export interface ExecAction {
  path: string
  arguments?: string
  workingDirectory?: string
}

/**
 * Principal (user context) configuration
 */
export interface Principal {
  userId?: string
  logonType?: LogonType
  runLevel?: RunLevel
}

/**
 * Task settings
 */
export interface TaskSettings {
  allowDemandStart?: boolean
  allowHardTerminate?: boolean
  disallowStartIfOnBatteries?: boolean
  enabled?: boolean
  executionTimeLimit?: string // PT72H for 72 hours
  hidden?: boolean
  multipleInstancesPolicy?: 'IgnoreNew' | 'Parallel' | 'Queue'
  priority?: number // 0-10, 7 is normal
  restartOnFailure?: {
    interval: string
    count: number
  }
  runOnlyIfIdle?: boolean
  runOnlyIfNetworkAvailable?: boolean
  startWhenAvailable?: boolean
  stopIfGoingOnBatteries?: boolean
  wakeToRun?: boolean
}

/**
 * Registration info metadata
 */
export interface RegistrationInfo {
  description?: string
  author?: string
  version?: string
  date?: Date
  documentation?: string
  uri?: string
}

/**
 * Complete task configuration
 */
export interface TaskConfig {
  name: string
  registrationInfo?: RegistrationInfo
  // Legacy fields for backward compatibility
  description?: string
  author?: string
  triggers: Trigger[]
  actions: ExecAction[]
  principal?: Principal
  settings?: TaskSettings
}

/**
 * Task list item
 */
export interface TaskInfo {
  name: string
  nextRunTime?: string
  status: string
  lastRunTime?: string
}

/**
 * CLI execution result
 */
export interface ExecutionResult {
  success: boolean
  output: string
  error?: string
}
