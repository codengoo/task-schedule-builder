/**
 * Task Scheduler trigger types
 */
export type TriggerType = 'time' | 'logon' | 'startup' | 'idle' | 'event'

/**
 * Task execution level
 */
export type ExecutionLevel = 'LeastPrivilege' | 'HighestAvailable'

/**
 * Task run level (matches schema runLevelType)
 */
export type RunLevel = 'LeastPrivilege' | 'HighestAvailable'

/**
 * Day of week for weekly triggers
 */
export type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'

/**
 * Logon type for principal (matches schema logonType)
 */
export type LogonType = 'Password' | 'S4U' | 'InteractiveToken' | 'InteractiveTokenOrPassword'

/**
 * Time trigger configuration
 */
export interface TimeTrigger {
  type: 'time'
  StartBoundary: Date
  Enabled?: boolean
  Repetition?: {
    Interval: string // PT1H for 1 hour, PT30M for 30 minutes
    Duration?: string // PT24H for 24 hours
    StopAtDurationEnd?: boolean
  }
}

/**
 * Logon trigger configuration
 */
export interface LogonTrigger {
  type: 'logon'
  Enabled?: boolean
  UserId?: string
}

/**
 * Startup trigger configuration
 */
export interface StartupTrigger {
  type: 'startup'
  Enabled?: boolean
  Delay?: string // PT5M for 5 minutes
}

/**
 * Daily schedule configuration
 */
export interface DailySchedule {
  type: 'daily'
  StartBoundary: Date
  DaysInterval: number // Repeat every N days
}

/**
 * Weekly schedule configuration
 */
export interface WeeklySchedule {
  type: 'weekly'
  StartBoundary: Date
  WeeksInterval: number // Repeat every N weeks
  DaysOfWeek: DayOfWeek[]
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
  Command: string
  Arguments?: string
  WorkingDirectory?: string
}

/**
 * Principal (user context) configuration (matches schema principalType)
 */
export interface Principal {
  UserId?: string
  LogonType?: LogonType
  RunLevel?: RunLevel
  GroupId?: string
  DisplayName?: string
}

/**
 * Principals wrapper (matches schema principalsType)
 * Schema requires Principal to be wrapped in Principals element
 */
export interface Principals {
  Principal: Principal
}

/**
 * Task settings
 */
export interface TaskSettings {
  AllowDemandStart?: boolean
  AllowHardTerminate?: boolean
  DisallowStartIfOnBatteries?: boolean
  Enabled?: boolean
  ExecutionTimeLimit?: string // PT72H for 72 hours
  Hidden?: boolean
  MultipleInstancesPolicy?: 'IgnoreNew' | 'Parallel' | 'Queue'
  Priority?: number // 0-10, 7 is normal
  RestartOnFailure?: {
    Interval: string
    Count: number
  }
  RunOnlyIfIdle?: boolean
  RunOnlyIfNetworkAvailable?: boolean
  StartWhenAvailable?: boolean
  StopIfGoingOnBatteries?: boolean
  WakeToRun?: boolean
}

/**
 * Registration info metadata
 */
export interface RegistrationInfo {
  Description?: string
  Author?: string
  Version?: string
  Date?: Date
  Documentation?: string
  URI?: string
}

/**
 * Complete task configuration (matches schema taskType)
 */
export interface TaskConfig {
  name: string
  version?: string // Task version attribute (default: "1.3")
  RegistrationInfo?: RegistrationInfo
  Triggers: Trigger[]
  Actions: ExecAction[]
  Principals?: Principals // Note: Schema requires Principals wrapper
  Settings?: TaskSettings
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
