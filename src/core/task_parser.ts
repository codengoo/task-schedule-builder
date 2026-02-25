import { XMLParser } from "fast-xml-parser";
import fs from "fs";
import {
  Actions,
  AttachmentType,
  CalendarTrigger,
  ComHandlerType,
  DaysOfWeek,
  EventTrigger,
  ExecType,
  HeaderFieldType,
  IdleSettings,
  IdleTrigger,
  LogonTrigger,
  LogonType,
  Months,
  MultipleInstancesPolicy,
  NetworkSettings,
  Principal,
  Principals,
  PrivilegeType,
  ProcessTokenSidType,
  RegistrationInfo,
  RegistrationTrigger,
  RestartOnFailure,
  Repetition,
  RequiredPrivilege,
  RunLevel,
  SendEmailType,
  SessionStateChange,
  SessionStateChangeTrigger,
  Settings,
  Task,
  TimeTrigger,
  Triggers,
} from "../interfaces";
import {
  compactObject,
  isRecord,
  toArray,
  toBoolean,
  toEnum,
  toNumber,
  toNumberOrNumberArray,
  toString,
  toStringArray,
  toStringOrStringArray,
} from "../utils/parser_utils";

const parser = new XMLParser({
  ignoreDeclaration: true,
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

export class TaskParser {
  private task: Task;

  constructor(filePath: string) {
    const content = this.loadFile(filePath);
    if (!content.trim().length) {
      throw new Error("File is empty");
    }

    this.task = this.parseFile(content);
  }

  private loadFile(filePath: string) {
    const content = fs.readFileSync(filePath, "utf-8");
    return content;
  }

  private parseFile(content: string): Task {
    const parsed = parser.parse(content);
    console.log(parsed);

    if (!isRecord(parsed) || !isRecord(parsed.Task)) {
      throw new Error("Invalid Task XML");
    }

    const task = parsed.Task;
    const result: Task = {
      "@_version": toString(task["@_version"]) === "1.2" ? "1.2" : "1.2",
      "@_xmlns":
        toString(task["@_xmlns"]) ===
        "http://schemas.microsoft.com/windows/2004/02/mit/task"
          ? "http://schemas.microsoft.com/windows/2004/02/mit/task"
          : "http://schemas.microsoft.com/windows/2004/02/mit/task",
      Actions: {},
    };

    if (isRecord(task.RegistrationInfo)) {
      result.RegistrationInfo = this.parseRegistrationInfo(
        task.RegistrationInfo,
      );
    }

    if (isRecord(task.Triggers)) {
      result.Triggers = this.parseTriggers(task.Triggers);
    }

    if (isRecord(task.Settings)) {
      result.Settings = this.parseSettings(task.Settings);
    }

    if (isRecord(task.Principals)) {
      result.Principals = this.parsePrincipals(task.Principals);
    }

    if (task.Data !== undefined) {
      result.Data = task.Data;
    }

    if (isRecord(task.Actions)) {
      result.Actions = this.parseActions(task.Actions);
    }

    if (!Object.keys(result.Actions).length) {
      result.Actions = {};
    }

    return result;
  }

  private parseRegistrationInfo(
    registrationInfo: Record<string, unknown>,
  ): RegistrationInfo {
    const info: RegistrationInfo = {};

    info.URI = toString(registrationInfo.URI);
    info.SecurityDescriptor = toString(registrationInfo.SecurityDescriptor);
    info.Source = toString(registrationInfo.Source);
    info.Date = toString(registrationInfo.Date);
    info.Author = toString(registrationInfo.Author);
    info.Version = toString(registrationInfo.Version);
    info.Description = toString(registrationInfo.Description);
    info.Documentation = toString(registrationInfo.Documentation);

    return compactObject(info);
  }

  private parseTriggers(triggers: Record<string, unknown>): Triggers {
    const parsedTriggers: Triggers = {};

    const boot = this.parseTriggerCollection(triggers.BootTrigger, (value) =>
      this.parseBootTrigger(value),
    );
    if (boot !== undefined) parsedTriggers.BootTrigger = boot;

    const registration = this.parseTriggerCollection(
      triggers.RegistrationTrigger,
      (value) => this.parseRegistrationTrigger(value),
    );
    if (registration !== undefined)
      parsedTriggers.RegistrationTrigger = registration;

    const idle = this.parseTriggerCollection(triggers.IdleTrigger, (value) =>
      this.parseIdleTrigger(value),
    );
    if (idle !== undefined) parsedTriggers.IdleTrigger = idle;

    const time = this.parseTriggerCollection(triggers.TimeTrigger, (value) =>
      this.parseTimeTrigger(value),
    );
    if (time !== undefined) parsedTriggers.TimeTrigger = time;

    const event = this.parseTriggerCollection(triggers.EventTrigger, (value) =>
      this.parseEventTrigger(value),
    );
    if (event !== undefined) parsedTriggers.EventTrigger = event;

    const logon = this.parseTriggerCollection(triggers.LogonTrigger, (value) =>
      this.parseLogonTrigger(value),
    );
    if (logon !== undefined) parsedTriggers.LogonTrigger = logon;

    const session = this.parseTriggerCollection(
      triggers.SessionStateChangeTrigger,
      (value) => this.parseSessionStateChangeTrigger(value),
    );
    if (session !== undefined) {
      parsedTriggers.SessionStateChangeTrigger = session;
    }

    const calendar = this.parseTriggerCollection(
      triggers.CalendarTrigger,
      (value) => this.parseCalendarTrigger(value),
    );
    if (calendar !== undefined) parsedTriggers.CalendarTrigger = calendar;

    return parsedTriggers;
  }

  private parseActions(actions: Record<string, unknown>): Actions {
    const result: Actions = {};

    const contextFromAttr = toString(actions["@_Context"]);
    const context = contextFromAttr ?? toString(actions.Context);
    if (context !== undefined) result.Context = context;

    const exec = this.parseExec(actions.Exec);
    if (exec !== undefined) result.Exec = exec;

    const comHandler = this.parseComHandler(actions.ComHandler);
    if (comHandler !== undefined) result.ComHandler = comHandler;

    const sendEmail = this.parseSendEmail(actions.SendEmail);
    if (sendEmail !== undefined) result.SendEmail = sendEmail;

    return result;
  }

  private parseSettings(settings: Record<string, unknown>): Settings {
    const result: Settings = {};

    result.AllowDemandStart = toBoolean(settings.AllowDemandStart);
    result.RestartOnFailure = this.parseRestartOnFailure(
      settings.RestartOnFailure,
    );
    result.MultipleInstancesPolicy = toEnum(
      settings.MultipleInstancesPolicy,
      MultipleInstancesPolicy,
    );
    result.DisallowStartIfOnBatteries = toBoolean(
      settings.DisallowStartIfOnBatteries,
    );
    result.StopIfGoingOnBatteries = toBoolean(settings.StopIfGoingOnBatteries);
    result.AllowHardTerminate = toBoolean(settings.AllowHardTerminate);
    result.StartWhenAvailable = toBoolean(settings.StartWhenAvailable);
    result.NetworkProfileName = toString(settings.NetworkProfileName);
    result.RunOnlyIfNetworkAvailable = toBoolean(
      settings.RunOnlyIfNetworkAvailable,
    );
    result.WakeToRun = toBoolean(settings.WakeToRun);
    result.Enabled = toBoolean(settings.Enabled);
    result.Hidden = toBoolean(settings.Hidden);
    result.DeleteExpiredTaskAfter = toString(settings.DeleteExpiredTaskAfter);
    result.ExecutionTimeLimit = toString(settings.ExecutionTimeLimit);
    result.Priority = toNumber(settings.Priority);
    result.RunOnlyIfIdle = toBoolean(settings.RunOnlyIfIdle);
    result.UseUnifiedSchedulingEngine = toBoolean(
      settings.UseUnifiedSchedulingEngine,
    );
    result.DisallowStartOnRemoteAppSession = toBoolean(
      settings.DisallowStartOnRemoteAppSession,
    );

    const idleSettings = this.parseIdleSettings(settings.IdleSettings);
    if (idleSettings !== undefined) result.IdleSettings = idleSettings;

    const networkSettings = this.parseNetworkSettings(settings.NetworkSettings);
    if (networkSettings !== undefined) result.NetworkSettings = networkSettings;

    return compactObject(result);
  }

  private parseRestartOnFailure(value: unknown): RestartOnFailure | undefined {
    if (!isRecord(value)) return undefined;

    const interval = toString(value.Interval);
    const count = toNumber(value.Count);
    if (interval === undefined || count === undefined) {
      return undefined;
    }

    return {
      Interval: interval,
      Count: count,
    };
  }

  private parsePrincipals(principals: Record<string, unknown>): Principals {
    const result: Principals = {};
    const principal = this.parsePrincipal(principals.Principal);
    if (principal !== undefined) {
      result.Principal = principal;
    }
    return result;
  }

  private parsePrincipal(value: unknown): Principal | undefined {
    if (!isRecord(value)) return undefined;

    const principal: Principal = {};
    principal.UserId = toString(value.UserId);
    principal.LogonType = toEnum(value.LogonType, LogonType);
    principal.GroupId = toString(value.GroupId);
    principal.DisplayName = toString(value.DisplayName);
    principal.RunLevel = toEnum(value.RunLevel, RunLevel);
    principal.ProcessTokenSidType = toEnum(
      value.ProcessTokenSidType,
      ProcessTokenSidType,
    );

    const requiredPrivileges = this.parseRequiredPrivilege(
      value.RequiredPrivileges,
    );
    if (requiredPrivileges !== undefined) {
      principal.RequiredPrivileges = requiredPrivileges;
    }

    const compactPrincipal = compactObject(principal);
    return Object.keys(compactPrincipal).length ? compactPrincipal : undefined;
  }

  private parseRequiredPrivilege(
    value: unknown,
  ): RequiredPrivilege | undefined {
    if (!isRecord(value)) return undefined;
    const privileges = toStringArray(value.Privilege)
      .map((item) => toEnum(item, PrivilegeType))
      .filter((item): item is PrivilegeType => item !== undefined);

    if (!privileges.length) return undefined;
    return {
      Privilege: privileges.length === 1 ? privileges[0] : privileges,
    };
  }

  private parseIdleSettings(value: unknown): IdleSettings | undefined {
    if (!isRecord(value)) return undefined;
    const idleSettings: IdleSettings = {
      Duration: toString(value.Duration),
      WaitTimeout: toString(value.WaitTimeout),
      StopOnIdleEnd: toBoolean(value.StopOnIdleEnd),
      RestartOnIdle: toBoolean(value.RestartOnIdle),
    };
    const compactIdleSettings = compactObject(idleSettings);
    return Object.keys(compactIdleSettings).length
      ? compactIdleSettings
      : undefined;
  }

  private parseNetworkSettings(value: unknown): NetworkSettings | undefined {
    if (!isRecord(value)) return undefined;
    const networkSettings: NetworkSettings = {
      Name: toString(value.Name),
      Id: toString(value.Id),
    };
    const compactNetworkSettings = compactObject(networkSettings);
    return Object.keys(compactNetworkSettings).length
      ? compactNetworkSettings
      : undefined;
  }

  private parseExec(value: unknown): ExecType | undefined {
    if (!isRecord(value)) return undefined;

    const command = toString(value.Command);
    if (command === undefined) return undefined;

    const argumentsValue = toStringOrStringArray(value.Arguments);
    const workingDirectory = toStringOrStringArray(value.WorkingDirectory);

    return compactObject({
      Command: command,
      Arguments: argumentsValue,
      WorkingDirectory: workingDirectory,
    });
  }

  private parseComHandler(value: unknown): ComHandlerType | undefined {
    if (!isRecord(value)) return undefined;

    const classId = toString(value.ClassId);
    const date = toString(value.Date);
    if (classId === undefined || date === undefined) return undefined;

    return {
      ClassId: classId,
      Date: date,
    };
  }

  private parseSendEmail(value: unknown): SendEmailType | undefined {
    if (!isRecord(value)) return undefined;

    const server = toString(value.Server);
    const subject = toString(value.Subject);
    const to = toString(value.To);
    const from = toString(value.From);
    if (
      server === undefined ||
      subject === undefined ||
      to === undefined ||
      from === undefined
    ) {
      return undefined;
    }

    const sendEmail: SendEmailType = {
      Server: server,
      Subject: subject,
      To: to,
      From: from,
      Cc: toString(value.Cc),
      Bcc: toString(value.Bcc),
      Body: toString(value.Body),
      ReplyTo: toString(value.ReplyTo),
    };

    const headerFields = this.parseHeaderFields(value.HeaderFields);
    if (headerFields !== undefined) {
      sendEmail.HeaderFields = headerFields;
    }

    const attachments = this.parseAttachments(value.Attachments);
    if (attachments !== undefined) {
      sendEmail.Attachments = attachments;
    }

    return compactObject(sendEmail);
  }

  private parseHeaderFields(
    value: unknown,
  ): { [key: string]: string } | undefined {
    if (!isRecord(value)) return undefined;

    const headerFieldItems = toArray(value.HeaderField)
      .map((item) => this.parseHeaderField(item))
      .filter((item): item is HeaderFieldType => item !== undefined);

    if (!headerFieldItems.length) return undefined;

    const result: { [key: string]: string } = {};
    for (const item of headerFieldItems) {
      result[item.Name] = item.Value;
    }
    return result;
  }

  private parseHeaderField(value: unknown): HeaderFieldType | undefined {
    if (!isRecord(value)) return undefined;
    const name = toString(value.Name);
    const fieldValue = toString(value.Value);
    if (name === undefined || fieldValue === undefined) return undefined;
    return {
      Name: name,
      Value: fieldValue,
    };
  }

  private parseAttachments(value: unknown): AttachmentType | undefined {
    if (!isRecord(value)) return undefined;
    const files = toStringOrStringArray(value.File);
    if (files === undefined) return undefined;
    return {
      File: files,
    };
  }

  private parseBootTrigger(value: unknown): RegistrationTrigger | undefined {
    if (!isRecord(value)) return undefined;
    return compactObject({
      ...this.parseTriggerBase(value),
      Delay: toString(value.Delay),
    });
  }

  private parseRegistrationTrigger(
    value: unknown,
  ): RegistrationTrigger | undefined {
    if (!isRecord(value)) return undefined;
    return compactObject({
      ...this.parseTriggerBase(value),
      Delay: toString(value.Delay),
    });
  }

  private parseIdleTrigger(value: unknown): IdleTrigger | undefined {
    if (!isRecord(value)) return undefined;
    return compactObject({
      ...this.parseTriggerBase(value),
    });
  }

  private parseTimeTrigger(value: unknown): TimeTrigger | undefined {
    if (!isRecord(value)) return undefined;
    return compactObject({
      ...this.parseTriggerBase(value),
      RandomDelay: toString(value.RandomDelay),
    });
  }

  private parseEventTrigger(value: unknown): EventTrigger | undefined {
    if (!isRecord(value)) return undefined;

    const subscription = toString(value.Subscription);
    const numberOfOccurrences = toNumber(value.NumberOfOccurrences);
    if (subscription === undefined || numberOfOccurrences === undefined) {
      return undefined;
    }

    const eventTrigger: EventTrigger = {
      ...this.parseTriggerBase(value),
      Subscription: subscription,
      NumberOfOccurrences: numberOfOccurrences,
      Delay: toString(value.Delay),
      PeriodOfOccurrence: toString(value.PeriodOfOccurrence),
      MatchingElement: toStringOrStringArray(value.MatchingElement),
    };

    const valueQueries = this.parseValueQueries(value.ValueQueries);
    if (valueQueries !== undefined) {
      eventTrigger.ValueQueries = valueQueries;
    }

    return compactObject(eventTrigger);
  }

  private parseValueQueries(value: unknown):
    | {
        Value: string | string[];
      }
    | {
        Value: string | string[];
      }[]
    | undefined {
    if (!isRecord(value)) return undefined;

    const entries = toArray(value)
      .map((item) => {
        if (!isRecord(item)) return undefined;
        const parsed = toStringOrStringArray(item.Value);
        if (parsed === undefined) return undefined;
        return {
          Value: parsed,
        };
      })
      .filter(
        (
          item,
        ): item is {
          Value: string | string[];
        } => item !== undefined,
      );

    if (!entries.length) return undefined;
    return entries.length === 1 ? entries[0] : entries;
  }

  private parseLogonTrigger(value: unknown): LogonTrigger | undefined {
    if (!isRecord(value)) return undefined;
    return compactObject({
      ...this.parseTriggerBase(value),
      UserId: toString(value.UserId),
      Delay: toString(value.Delay),
    });
  }

  private parseSessionStateChangeTrigger(
    value: unknown,
  ): SessionStateChangeTrigger | undefined {
    if (!isRecord(value)) return undefined;

    const stateChange = toEnum(value.StateChange, SessionStateChange);
    if (stateChange === undefined) return undefined;

    return compactObject({
      ...this.parseTriggerBase(value),
      UserId: toString(value.UserId),
      Delay: toString(value.Delay),
      StateChange: stateChange,
    });
  }

  private parseCalendarTrigger(value: unknown): CalendarTrigger | undefined {
    if (!isRecord(value)) return undefined;

    const calendarTrigger: Partial<CalendarTrigger> = {
      ...this.parseTriggerBase(value),
      RandomDelay: toString(value.RandomDelay),
    };

    const scheduleByDay = this.parseScheduleByDay(value.ScheduleByDay);
    if (scheduleByDay !== undefined) {
      calendarTrigger.ScheduleByDay = scheduleByDay;
    }

    const scheduleByWeek = this.parseScheduleByWeek(value.ScheduleByWeek);
    if (scheduleByWeek !== undefined) {
      calendarTrigger.ScheduleByWeek = scheduleByWeek;
    }

    const scheduleByMonth = this.parseScheduleByMonth(value.ScheduleByMonth);
    if (scheduleByMonth !== undefined) {
      calendarTrigger.ScheduleByMonth = scheduleByMonth;
    }

    const scheduleByMonthDayOfWeek = this.parseScheduleByMonthDayOfWeek(
      value.ScheduleByMonthDayOfWeek,
    );
    if (scheduleByMonthDayOfWeek !== undefined) {
      calendarTrigger.ScheduleByMonthDayOfWeek = scheduleByMonthDayOfWeek;
    }

    const compactCalendarTrigger = compactObject(calendarTrigger);
    return Object.keys(compactCalendarTrigger).length
      ? (compactCalendarTrigger as CalendarTrigger)
      : undefined;
  }

  private parseScheduleByDay(
    value: unknown,
  ): { DaysInterval?: number | number[] } | undefined {
    if (!isRecord(value)) return undefined;
    const parsed = toNumberOrNumberArray(value.DaysInterval);
    if (parsed === undefined) return undefined;
    return {
      DaysInterval: parsed,
    };
  }

  private parseScheduleByWeek(value: unknown):
    | {
        WeeksInterval?: number | number[];
        DaysOfWeek?: DaysOfWeek | DaysOfWeek[];
      }
    | undefined {
    if (!isRecord(value)) return undefined;
    const weeksInterval = toNumberOrNumberArray(value.WeeksInterval);
    const daysOfWeek = this.parseDaysOfWeekOrArray(value.DaysOfWeek);
    if (weeksInterval === undefined && daysOfWeek === undefined)
      return undefined;
    return compactObject({
      WeeksInterval: weeksInterval,
      DaysOfWeek: daysOfWeek,
    });
  }

  private parseScheduleByMonth(value: unknown):
    | {
        DaysOfMonth?: {
          Day?: string | "Last" | (string | "Last")[];
        };
        Months: Months | Months[];
      }
    | undefined {
    if (!isRecord(value)) return undefined;

    const months = this.parseMonthsOrArray(value.Months);
    if (months === undefined) return undefined;

    const daysOfMonth = this.parseDaysOfMonth(value.DaysOfMonth);

    return compactObject({
      DaysOfMonth: daysOfMonth,
      Months: months,
    });
  }

  private parseScheduleByMonthDayOfWeek(value: unknown):
    | {
        Weeks: {
          Week: string | "Last" | (string | "Last")[];
        };
        DaysOfWeek: DaysOfWeek | DaysOfWeek[];
        Months: Months | Months[];
      }
    | undefined {
    if (!isRecord(value)) return undefined;

    const weeks = this.parseWeeks(value.Weeks);
    const daysOfWeek = this.parseDaysOfWeekOrArray(value.DaysOfWeek);
    const months = this.parseMonthsOrArray(value.Months);
    if (
      weeks === undefined ||
      daysOfWeek === undefined ||
      months === undefined
    ) {
      return undefined;
    }

    return {
      Weeks: weeks,
      DaysOfWeek: daysOfWeek,
      Months: months,
    };
  }

  private parseWeeks(
    value: unknown,
  ): { Week: string | "Last" | (string | "Last")[] } | undefined {
    if (!isRecord(value)) return undefined;
    const week = toStringOrStringArray(value.Week);
    if (week === undefined) return undefined;
    return {
      Week: week,
    };
  }

  private parseDaysOfMonth(
    value: unknown,
  ): { Day?: string | "Last" | (string | "Last")[] } | undefined {
    if (!isRecord(value)) return undefined;
    const day = toStringOrStringArray(value.Day);
    if (day === undefined) return undefined;
    return {
      Day: day,
    };
  }

  private parseDaysOfWeekOrArray(
    value: unknown,
  ): DaysOfWeek | DaysOfWeek[] | undefined {
    const parsed = this.parseCollection(value, (item) =>
      this.parseDaysOfWeek(item),
    );
    return parsed;
  }

  private parseDaysOfWeek(value: unknown): DaysOfWeek | undefined {
    if (!isRecord(value)) return undefined;

    const daysOfWeek: DaysOfWeek = {};
    if (value.Monday !== undefined) daysOfWeek.Monday = "";
    if (value.Tuesday !== undefined) daysOfWeek.Tuesday = "";
    if (value.Wednesday !== undefined) daysOfWeek.Wednesday = "";
    if (value.Thursday !== undefined) daysOfWeek.Thursday = "";
    if (value.Friday !== undefined) daysOfWeek.Friday = "";
    if (value.Saturday !== undefined) daysOfWeek.Saturday = "";
    if (value.Sunday !== undefined) daysOfWeek.Sunday = "";

    return Object.keys(daysOfWeek).length ? daysOfWeek : undefined;
  }

  private parseMonthsOrArray(value: unknown): Months | Months[] | undefined {
    const parsed = this.parseCollection(value, (item) =>
      this.parseMonths(item),
    );
    return parsed;
  }

  private parseMonths(value: unknown): Months | undefined {
    if (!isRecord(value)) return undefined;

    const months: Months = {};
    if (value.January !== undefined) months.January = "";
    if (value.February !== undefined) months.February = "";
    if (value.March !== undefined) months.March = "";
    if (value.April !== undefined) months.April = "";
    if (value.May !== undefined) months.May = "";
    if (value.June !== undefined) months.June = "";
    if (value.July !== undefined) months.July = "";
    if (value.August !== undefined) months.August = "";
    if (value.September !== undefined) months.September = "";
    if (value.October !== undefined) months.October = "";
    if (value.November !== undefined) months.November = "";
    if (value.December !== undefined) months.December = "";

    return Object.keys(months).length ? months : undefined;
  }

  private parseTriggerBase(value: Record<string, unknown>) {
    return compactObject({
      "@_id": toString(value["@_id"]),
      Enabled: toBoolean(value.Enabled),
      StartBoundary: toString(value.StartBoundary),
      EndBoundary: toString(value.EndBoundary),
      ExecutionTimeLimit: toString(value.ExecutionTimeLimit),
      Repetition: this.parseRepetition(value.Repetition),
    });
  }

  private parseRepetition(value: unknown): Repetition | undefined {
    if (!isRecord(value)) return undefined;
    const interval = toString(value.Interval);
    if (interval === undefined) return undefined;

    return compactObject({
      Interval: interval,
      Duration: toString(value.Duration),
      StopAtDurationEnd: toBoolean(value.StopAtDurationEnd),
    });
  }

  private parseTriggerCollection<T>(
    value: unknown,
    parseItem: (item: unknown) => T | undefined,
  ): T | T[] | undefined {
    if (value === undefined || value === null) return undefined;
    if (Array.isArray(value)) {
      const parsed = value
        .map((item) => parseItem(item))
        .filter((item): item is T => item !== undefined);
      if (!parsed.length) return undefined;
      return parsed;
    }

    return parseItem(value);
  }

  private parseCollection<T>(
    value: unknown,
    parseItem: (item: unknown) => T | undefined,
  ): T | T[] | undefined {
    const values = toArray(value)
      .map((item) => parseItem(item))
      .filter((item): item is T => item !== undefined);

    if (!values.length) return undefined;
    return values.length === 1 ? values[0] : values;
  }

  public getTask(): Task {
    return this.task;
  }
}
