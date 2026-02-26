import { DAYS_OF_WEEK_KEYS, MONTH_KEYS } from "../constants";

export interface Triggers {
  BootTrigger?: BootTrigger | BootTrigger[];
  RegistrationTrigger?: RegistrationTrigger | RegistrationTrigger[];
  IdleTrigger?: IdleTrigger | IdleTrigger[];
  TimeTrigger?: TimeTrigger | TimeTrigger[];
  EventTrigger?: EventTrigger | EventTrigger[];
  LogonTrigger?: LogonTrigger | LogonTrigger[];
  SessionStateChangeTrigger?:
  | SessionStateChangeTrigger
  | SessionStateChangeTrigger[];
  CalendarTrigger?: CalendarTrigger | CalendarTrigger[];
}

export enum SessionStateChange {
  ConsoleConnect = "ConsoleConnect",
  ConsoleDisconnect = "ConsoleDisconnect",
  RemoteConnect = "RemoteConnect",
  RemoteDisconnect = "RemoteDisconnect",
  SessionLock = "SessionLock",
  SessionUnlock = "SessionUnlock",
}

export interface TriggerBase {
  "@_id"?: string;
  Enabled?: boolean;
  StartBoundary?: string;
  EndBoundary?: string;
  ExecutionTimeLimit?: string;
  Repetition?: Repetition;
}

export interface Repetition {
  Interval: string;
  Duration?: string;
  StopAtDurationEnd?: boolean;
}

export interface BootTrigger extends TriggerBase {
  Delay?: string;
}

export interface RegistrationTrigger extends TriggerBase {
  Delay?: string;
}

export interface IdleTrigger extends TriggerBase { }

export interface TimeTrigger extends TriggerBase {
  RandomDelay?: string;
}

export interface NamedValue {
  "#text": string;
  "@_name": string;
}

export interface EventTrigger extends TriggerBase {
  Subscription: string;
  Delay?: string;
  PeriodOfOccurrence?: string;
  NumberOfOccurrences?: number;
  MatchingElement?: string;
  ValueQueries?: {
    Value: NamedValue | NamedValue[];
  };
}

export interface LogonTrigger extends TriggerBase {
  UserId?: string;
  Delay?: string;
}

export interface SessionStateChangeTrigger extends TriggerBase {
  UserId?: string;
  Delay?: string;
  StateChange: SessionStateChange;
}

export interface DailySchedule {
  DaysInterval?: number;
}

export interface WeeklySchedule {
  WeeksInterval?: number;
  DaysOfWeek?: DaysOfWeek;
}

export interface MonthlySchedule {
  DaysOfMonth?: {
    Day?: string | string[];
  };
  Months?: Months;
}

export interface MonthlyDayOfWeekSchedule {
  Weeks?: {
    Week?: string | string[];
  };
  DaysOfWeek: DaysOfWeek;
  Months?: Months;
}

// xs:choice — exactly one schedule type must be present
export type CalendarSchedule =
  | { ScheduleByDay: DailySchedule; ScheduleByWeek?: never; ScheduleByMonth?: never; ScheduleByMonthDayOfWeek?: never }
  | { ScheduleByDay?: never; ScheduleByWeek: WeeklySchedule; ScheduleByMonth?: never; ScheduleByMonthDayOfWeek?: never }
  | { ScheduleByDay?: never; ScheduleByWeek?: never; ScheduleByMonth: MonthlySchedule; ScheduleByMonthDayOfWeek?: never }
  | { ScheduleByDay?: never; ScheduleByWeek?: never; ScheduleByMonth?: never; ScheduleByMonthDayOfWeek: MonthlyDayOfWeekSchedule };

export type CalendarTrigger = TriggerBase & { RandomDelay?: string } & CalendarSchedule;

export type Months = Partial<Record<(typeof MONTH_KEYS)[number], "">>;
export type DaysOfWeek = Partial<
  Record<(typeof DAYS_OF_WEEK_KEYS)[number], "">
>;
