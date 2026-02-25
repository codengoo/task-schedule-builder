export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type LogonType =
  | "S4U"
  | "InteractiveToken"
  | "Password"
  | "InteractiveTokenOrPassword";

export type RunLevel = "LeastPrivilege" | "HighestAvailable";

export type MultipleInstancesPolicy =
  | "IgnoreNew"
  | "Queue"
  | "Parallel"
  | "StopExisting";

export interface RegistrationInfo {
  URI?: string;
  SecurityDescriptor?: string;
  Source?: string;
  Date?: Date;
  Author?: string;
  Version?: string;
  Description?: string;
  Documentation?: string;
}

export interface Repetition {
  Interval: string;
  Duration?: string;
  StopAtDurationEnd?: boolean;
}

export interface TimeTrigger {
  type: "time";
  StartBoundary: Date;
  Enabled?: boolean;
  Repetition?: Repetition;
}

export interface LogonTrigger {
  type: "logon";
  Enabled?: boolean;
  UserId?: string;
}

export interface StartupTrigger {
  type: "startup";
  Enabled?: boolean;
  Delay?: string;
}

export type Trigger = TimeTrigger | LogonTrigger | StartupTrigger;

export interface ExecAction {
  Command: string;
  Arguments?: string | string[];
  WorkingDirectory?: string | string[];
}

export interface RestartOnFailure {
  Interval: string;
  Count: number;
}

export interface TaskSettings {
  AllowDemandStart?: boolean;
  RestartOnFailure?: RestartOnFailure;
  MultipleInstancesPolicy?: MultipleInstancesPolicy;
  DisallowStartIfOnBatteries?: boolean;
  StopIfGoingOnBatteries?: boolean;
  AllowHardTerminate?: boolean;
  StartWhenAvailable?: boolean;
  RunOnlyIfNetworkAvailable?: boolean;
  WakeToRun?: boolean;
  Enabled?: boolean;
  Hidden?: boolean;
  ExecutionTimeLimit?: string;
  Priority?: number;
  RunOnlyIfIdle?: boolean;
}

export interface Principals {
  Principal: {
    UserId?: string;
    LogonType?: LogonType;
    GroupId?: string;
    DisplayName?: string;
    RunLevel?: RunLevel;
  };
}

export interface TaskConfig {
  name: string;
  RegistrationInfo?: RegistrationInfo;
  Triggers: Trigger[];
  Actions: ExecAction[];
  Principals?: Principals;
  Settings?: TaskSettings;
}

export interface TaskInfo {
  name: string;
  nextRunTime?: string;
  status: string;
  lastRunTime?: string;
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
}
