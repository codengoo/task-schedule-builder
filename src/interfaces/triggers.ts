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

export interface EventTrigger extends TriggerBase {
  Subscription: string;
  Delay?: string;
  PeriodOfOccurrence?: string;
  NumberOfOccurrences: number;
  MatchingElement?: string | string[];
  ValueQueries?:
  | {
    Value: string | string[];
  }
  | {
    Value: string | string[];
  }[];
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

export interface CalendarTrigger extends TriggerBase {
  RandomDelay?: string;

  ScheduleByDay?: {
    DaysInterval?: number | number[];
  };

  ScheduleByWeek?: {
    WeeksInterval?: number | number[];
    DaysOfWeek?: DaysOfWeek | DaysOfWeek[];
  };

  ScheduleByMonth: {
    DaysOfMonth?: {
      Day?: string | "Last" | (string | "Last")[];
    };

    Months: Months | Months[];
  };

  ScheduleByMonthDayOfWeek: {
    Weeks: {
      Week: string | "Last" | (string | "Last")[];
    };
    DaysOfWeek: DaysOfWeek | DaysOfWeek[];
    Months: Months | Months[];
  };
}

export type Months = Partial<Record<(typeof MONTH_KEYS)[number], "">>;
export type DaysOfWeek = Partial<
  Record<(typeof DAYS_OF_WEEK_KEYS)[number], "">
>;
