export interface Triggers {
    BootTrigger?: BootTrigger[]
    RegistrationTrigger?: RegistrationTrigger[]
    IdleTrigger?: IdleTrigger[]
    TimeTrigger?: TimeTrigger[]
    // EventTrigger?: EventTrigger[]
    LogonTrigger?: LogonTrigger[]
    // SessionStateChangeTrigger?: SessionStateChangeTrigger[]
    CalendarTrigger?: CalendarTrigger[]
}

export interface TriggerBase {
    '@_id'?: string
    Enabled?: boolean
    StartBoundary?: string
    EndBoundary?: string
    ExecutionTimeLimit?: string
    Repetition?: Repetition
}

export interface Repetition {
    Interval: string
    Duration?: string
    StopAtDurationEnd?: boolean
}

export interface BootTrigger extends TriggerBase {
    Delay?: string
}

export interface RegistrationTrigger extends TriggerBase {
    Delay?: string
}

export interface IdleTrigger extends TriggerBase { }

export interface TimeTrigger extends TriggerBase {
    RandomDelay?: string
}

export interface LogonTrigger extends TriggerBase {
    UserId?: string
    Delay?: string
}

export interface CalendarTrigger extends TriggerBase {
    RandomDelay?: string

    ScheduleByDay?: {
        DaysInterval?: number
    }

    ScheduleByWeek?: {
        WeeksInterval?: number
        DaysOfWeek?: DaysOfWeek
    }

    ScheduleByMonth: {
        DaysOfMonth?: {
            Day?: number | "Last"
        }

        Months: Months
    }


    ScheduleByMonthDayOfWeek: {
        Weeks: {
            Week: 1 | 2 | 3 | 4 | "Last"
        }
    }
}

export interface DaysOfWeek {
    Monday?: ""
    Tuesday?: ""
    Wednesday?: ""
    Thursday?: ""
    Friday?: ""
    Saturday?: ""
    Sunday?: ""
}

export interface Months {
    January?: ""
    February?: ""
    March?: ""
    April?: ""
    May?: ""
    June?: ""
    July?: ""
    August?: ""
    September?: ""
    October?: ""
    November?: ""
    December?: ""
}