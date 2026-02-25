export interface Settings {
  AllowDemandStart?: boolean;
  RestartOnFailure?: boolean;
  MultipleInstancesPolicy?: MultipleInstancesPolicy;
  DisallowStartIfOnBatteries?: boolean;
  StopIfGoingOnBatteries?: boolean;
  AllowHardTerminate?: boolean;
  StartWhenAvailable?: boolean;
  NetworkProfileName?: string;
  RunOnlyIfNetworkAvailable?: boolean;
  WakeToRun?: boolean;
  Enabled?: boolean;
  Hidden?: boolean;
  DeleteExpiredTaskAfter?: string;
  IdleSettings?: IdleSettings;
  NetworkSettings?: NetworkSettings;
  ExecutionTimeLimit?: string;
  Priority?: number;
  RunOnlyIfIdle?: boolean;
  UseUnifiedSchedulingEngine?: boolean;
  DisallowStartOnRemoteAppSession?: boolean;
}

export type MultipleInstancesPolicy =
  | "IgnoreNew"
  | "Queue"
  | "Parallel"
  | "StopExisting";

export interface IdleSettings {
  Duration?: string;
  WaitTimeout?: string;
  StopOnIdleEnd?: boolean;
  RestartOnIdle?: boolean;
}

export interface NetworkSettings {
  Name?: string;
  Id?: string;
}
