import { XMLBuilder, XMLParser } from 'fast-xml-parser'
import { readFileSync } from 'node:fs'
import type { ExecAction, TaskConfig, Trigger } from './types'

const parser = new XMLParser({
  ignoreDeclaration: true,
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
})

const builder = new XMLBuilder({
  format: true,
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  suppressEmptyNode: true,
})

/**
 * Converts a Date object to Task Scheduler XML format (ISO 8601)
 */
function formatDate(date: Date): string {
  return date.toISOString().split('.')[0]
}

/**
 * Parses an XML date string to Date object
 */
function parseDate(dateStr: string): Date | undefined {
  if (!dateStr)
    return undefined
  try {
    return new Date(dateStr)
  }
  catch {
    return undefined
  }
}

/**
 * Parses XML template file and returns partial TaskConfig
 */
export function parseXmlTemplate(xmlPath: string): Partial<TaskConfig> {
  // Try to read with both encodings
  let xmlContent: string
  
  // First try UTF-8 (most common for test files)
  xmlContent = readFileSync(xmlPath, 'utf-8')
  
  //If content looks garbled or short, try UTF-16LE
  if (xmlContent.length < 100 || !xmlContent.includes('<Task')) {
    try {
      xmlContent = readFileSync(xmlPath, 'utf-16le')
    }
    catch {
      // Use UTF-8 if UTF-16LE fails
    }
  }

  const parsed = parser.parse(xmlContent)
  const task = parsed.Task

  if (!task) {
    return { Triggers: [], Actions: [] }
  }

  const config: Partial<TaskConfig> = {
    Triggers: [],
    Actions: [],
  }

  // Parse RegistrationInfo
  if (task.RegistrationInfo) {
    const regInfo = task.RegistrationInfo
    config.RegistrationInfo = {
      Author: regInfo.Author,
      Description: regInfo.Description,
      Version: regInfo.Version,
      URI: regInfo.URI,
      Documentation: regInfo.Documentation,
      Date: parseDate(regInfo.Date),
    }
  }

  // Parse Triggers
  if (task.Triggers) {
    const triggers = task.Triggers

    // Parse CalendarTrigger
    if (triggers.CalendarTrigger) {
      const calendarTriggers = Array.isArray(triggers.CalendarTrigger)
        ? triggers.CalendarTrigger
        : [triggers.CalendarTrigger]

      for (const ct of calendarTriggers) {
        const trigger: Trigger = {
          type: 'time',
          StartBoundary: ct.StartBoundary ? new Date(ct.StartBoundary) : new Date(),
          Enabled: ct.Enabled,
        }

        // Parse Repetition
        if (ct.Repetition) {
          trigger.Repetition = {
            Interval: ct.Repetition.Interval,
            Duration: ct.Repetition.Duration,
            StopAtDurationEnd: ct.Repetition.StopAtDurationEnd,
          }
        }

        config.Triggers!.push(trigger)
      }
    }

    // Parse LogonTrigger
    if (triggers.LogonTrigger) {
      const logonTriggers = Array.isArray(triggers.LogonTrigger)
        ? triggers.LogonTrigger
        : [triggers.LogonTrigger]

      for (const lt of logonTriggers) {
        config.Triggers!.push({
          type: 'logon',
          Enabled: lt.Enabled,
          UserId: lt.UserId,
        })
      }
    }

    // Parse BootTrigger (Startup)
    if (triggers.BootTrigger) {
      const bootTriggers = Array.isArray(triggers.BootTrigger)
        ? triggers.BootTrigger
        : [triggers.BootTrigger]

      for (const bt of bootTriggers) {
        config.Triggers!.push({
          type: 'startup',
          Enabled: bt.Enabled,
          Delay: bt.Delay,
        })
      }
    }
  }

  // Parse Actions
  if (task.Actions?.Exec) {
    const execs = Array.isArray(task.Actions.Exec)
      ? task.Actions.Exec
      : [task.Actions.Exec]

    for (const exec of execs) {
      const action: ExecAction = {
        Command: exec.Command || '',
        Arguments: exec.Arguments,
        WorkingDirectory: exec.WorkingDirectory,
      }
      config.Actions!.push(action)
    }
  }

  // Parse Principal (wrapped in Principals)
  if (task.Principals?.Principal) {
    const principalData = task.Principals.Principal
    config.Principals = {
      Principal: {
        UserId: principalData.UserId,
        LogonType: principalData.LogonType,
        RunLevel: principalData.RunLevel,
        GroupId: principalData.GroupId,
        DisplayName: principalData.DisplayName,
      },
    }
  }
  // Fallback: support old format without Principals wrapper
  else if (task.Principal) {
    config.Principals = {
      Principal: {
        UserId: task.Principal.UserId,
        LogonType: task.Principal.LogonType,
        RunLevel: task.Principal.RunLevel,
        GroupId: task.Principal.GroupId,
        DisplayName: task.Principal.DisplayName,
      },
    }
  }

  // Parse Settings
  if (task.Settings) {
    const settings = task.Settings
    config.Settings = {
      Enabled: settings.Enabled,
      Hidden: settings.Hidden,
      AllowDemandStart: settings.AllowStartOnDemand,
      AllowHardTerminate: settings.AllowHardTerminate,
      DisallowStartIfOnBatteries: settings.DisallowStartIfOnBatteries,
      StopIfGoingOnBatteries: settings.StopIfGoingOnBatteries,
      StartWhenAvailable: settings.StartWhenAvailable,
      RunOnlyIfNetworkAvailable: settings.RunOnlyIfNetworkAvailable,
      RunOnlyIfIdle: settings.RunOnlyIfIdle,
      WakeToRun: settings.WakeToRun,
      ExecutionTimeLimit: settings.ExecutionTimeLimit,
      Priority: settings.Priority ? Number.parseInt(settings.Priority) : undefined,
      MultipleInstancesPolicy: settings.MultipleInstancesPolicy,
    }

    // Parse RestartOnFailure
    if (settings.RestartOnFailure) {
      config.Settings.RestartOnFailure = {
        Interval: settings.RestartOnFailure.Interval,
        Count: Number.parseInt(settings.RestartOnFailure.Count),
      }
    }
  }

  return config
}

/**
 * Converts a TaskConfig to Windows Task Scheduler XML format
 */
export function toXml(config: TaskConfig): string {
  const {
    RegistrationInfo: registrationInfo,
    Triggers: triggers,
    Actions: actions,
    Principals: principals,
    Settings: settings,
  } = config

  // Build triggers
  const triggersObj: any = {}
  
  for (const trigger of triggers) {
    if (trigger.type === 'time') {
      if (!triggersObj.CalendarTrigger) {
        triggersObj.CalendarTrigger = []
      }
      
      const calendarTrigger: any = {
        StartBoundary: formatDate(trigger.StartBoundary),
        Enabled: trigger.Enabled ?? true,
        ScheduleByDay: {
          DaysInterval: 1,
        },
      }

      if (trigger.Repetition) {
        calendarTrigger.Repetition = {
          Interval: trigger.Repetition.Interval,
          ...(trigger.Repetition.Duration && { Duration: trigger.Repetition.Duration }),
          ...(trigger.Repetition.StopAtDurationEnd !== undefined && { 
            StopAtDurationEnd: trigger.Repetition.StopAtDurationEnd 
          }),
        }
      }

      triggersObj.CalendarTrigger.push(calendarTrigger)
    }
    else if (trigger.type === 'logon') {
      if (!triggersObj.LogonTrigger) {
        triggersObj.LogonTrigger = []
      }
      
      triggersObj.LogonTrigger.push({
        Enabled: trigger.Enabled ?? true,
        ...(trigger.UserId && { UserId: trigger.UserId }),
      })
    }
    else if (trigger.type === 'startup') {
      if (!triggersObj.BootTrigger) {
        triggersObj.BootTrigger = []
      }
      
      triggersObj.BootTrigger.push({
        Enabled: trigger.Enabled ?? true,
        ...(trigger.Delay && { Delay: trigger.Delay }),
      })
    }
  }

  // Build actions
  const actionsObj = {
    '@_Context': 'Author',
    Exec: actions.map(action => ({
      Command: action.Command,
      ...(action.Arguments && { Arguments: action.Arguments }),
      ...(action.WorkingDirectory && { WorkingDirectory: action.WorkingDirectory }),
    })),
  }

  // Build principal (wrapped in Principals)
  const principalObj = {
    '@_id': 'Author',
    ...(principals?.Principal.UserId && { UserId: principals.Principal.UserId }),
    ...(principals?.Principal.LogonType && { LogonType: principals.Principal.LogonType }),
    ...(principals?.Principal.RunLevel && { RunLevel: principals.Principal.RunLevel }),
    ...(principals?.Principal.GroupId && { GroupId: principals.Principal.GroupId }),
    ...(principals?.Principal.DisplayName && { DisplayName: principals.Principal.DisplayName }),
  }

  const principalsObj = {
    Principal: principalObj,
  }

  // Build settings
  const settingsObj: any = {
    MultipleInstancesPolicy: settings?.MultipleInstancesPolicy ?? 'IgnoreNew',
    DisallowStartIfOnBatteries: settings?.DisallowStartIfOnBatteries ?? false,
    StopIfGoingOnBatteries: settings?.StopIfGoingOnBatteries ?? true,
    AllowHardTerminate: settings?.AllowHardTerminate ?? true,
    StartWhenAvailable: settings?.StartWhenAvailable ?? false,
    RunOnlyIfNetworkAvailable: settings?.RunOnlyIfNetworkAvailable ?? false,
    IdleSettings: {
      Duration: 'PT10M',
      WaitTimeout: 'PT1H',
      StopOnIdleEnd: true,
      RestartOnIdle: false,
    },
    AllowStartOnDemand: settings?.AllowDemandStart ?? true,
    Enabled: settings?.Enabled ?? true,
    Hidden: settings?.Hidden ?? false,
    RunOnlyIfIdle: settings?.RunOnlyIfIdle ?? false,
    WakeToRun: settings?.WakeToRun ?? false,
    ExecutionTimeLimit: settings?.ExecutionTimeLimit ?? 'PT72H',
    Priority: settings?.Priority ?? 7,
  }

  if (settings?.RestartOnFailure) {
    settingsObj.RestartOnFailure = {
      Interval: settings.RestartOnFailure.Interval,
      Count: settings.RestartOnFailure.Count,
    }
  }

  // Build registration info
  const registrationInfoObj: any = {}
  if (registrationInfo?.Date) {
    registrationInfoObj.Date = formatDate(registrationInfo.Date)
  }
  if (registrationInfo?.Author) {
    registrationInfoObj.Author = registrationInfo.Author
  }
  if (registrationInfo?.Version) {
    registrationInfoObj.Version = registrationInfo.Version
  }
  if (registrationInfo?.Description) {
    registrationInfoObj.Description = registrationInfo.Description
  }
  if (registrationInfo?.URI) {
    registrationInfoObj.URI = registrationInfo.URI
  }
  if (registrationInfo?.Documentation) {
    registrationInfoObj.Documentation = registrationInfo.Documentation
  }

  // Build the complete task object
  const taskObj = {
    '?xml': {
      '@_version': '1.0',
      '@_encoding': 'UTF-16',
    },
    Task: {
      '@_version': '1.3',
      '@_xmlns': 'http://schemas.microsoft.com/windows/2004/02/mit/task',
      ...(Object.keys(registrationInfoObj).length > 0 && { RegistrationInfo: registrationInfoObj }),
      Triggers: triggersObj,
      Principals: principalsObj,
      Settings: settingsObj,
      Actions: actionsObj,
    },
  }

  return builder.build(taskObj)
}
