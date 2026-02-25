import { readFileSync } from 'node:fs'
import type { ExecAction, Principal, TaskConfig, TaskSettings, Trigger } from './types'

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
 * Extracts text content from an XML tag
 */
function extractTagContent(xml: string, tagName: string): string | undefined {
  const regex = new RegExp(`<${tagName}[^>]*>([^<]*)</${tagName}>`, 'i')
  const match = regex.exec(xml)
  return match ? match[1].trim() : undefined
}

/**
 * Extracts boolean value from XML tag
 */
function extractBooleanTag(xml: string, tagName: string): boolean | undefined {
  const content = extractTagContent(xml, tagName)
  if (content === undefined)
    return undefined
  return content.toLowerCase() === 'true'
}

/**
 * Parses XML template file and returns partial TaskConfig
 */
export function parseXmlTemplate(xmlPath: string): Partial<TaskConfig> {
  const xmlContent = readFileSync(xmlPath, 'utf-16le')
  const config: Partial<TaskConfig> = {
    triggers: [],
    actions: [],
  }

  // Parse RegistrationInfo
  const regInfoMatch = /<RegistrationInfo>([\s\S]*?)<\/RegistrationInfo>/i.exec(xmlContent)
  if (regInfoMatch) {
    const regInfoXml = regInfoMatch[1]
    config.registrationInfo = {
      author: extractTagContent(regInfoXml, 'Author'),
      description: extractTagContent(regInfoXml, 'Description'),
      version: extractTagContent(regInfoXml, 'Version'),
      uri: extractTagContent(regInfoXml, 'URI'),
      documentation: extractTagContent(regInfoXml, 'Documentation'),
      date: parseDate(extractTagContent(regInfoXml, 'Date') || ''),
    }

    // Legacy fields for backward compatibility
    config.author = config.registrationInfo.author
    config.description = config.registrationInfo.description
  }

  // Parse Triggers
  const triggersMatch = /<Triggers>([\s\S]*?)<\/Triggers>/i.exec(xmlContent)
  if (triggersMatch) {
    const triggersXml = triggersMatch[1]

    // Parse CalendarTrigger
    const calendarTriggerRegex = /<CalendarTrigger>([\s\S]*?)<\/CalendarTrigger>/gi
    let match
    while ((match = calendarTriggerRegex.exec(triggersXml)) !== null) {
      const triggerXml = match[1]
      const startBoundary = extractTagContent(triggerXml, 'StartBoundary')
      const enabled = extractBooleanTag(triggerXml, 'Enabled')

      const trigger: Trigger = {
        type: 'time',
        startBoundary: startBoundary ? new Date(startBoundary) : new Date(),
        enabled,
      }

      // Parse Repetition
      const repetitionMatch = /<Repetition>([\s\S]*?)<\/Repetition>/i.exec(triggerXml)
      if (repetitionMatch) {
        const repXml = repetitionMatch[1]
        const interval = extractTagContent(repXml, 'Interval')
        const duration = extractTagContent(repXml, 'Duration')
        const stopAtDurationEnd = extractBooleanTag(repXml, 'StopAtDurationEnd')

        if (interval) {
          trigger.repetition = {
            interval,
            duration,
            stopAtDurationEnd,
          }
        }
      }

      config.triggers!.push(trigger)
    }

    // Parse LogonTrigger
    const logonTriggerRegex = /<LogonTrigger>([\s\S]*?)<\/LogonTrigger>/gi
    while ((match = logonTriggerRegex.exec(triggersXml)) !== null) {
      const triggerXml = match[1]
      config.triggers!.push({
        type: 'logon',
        enabled: extractBooleanTag(triggerXml, 'Enabled'),
        userId: extractTagContent(triggerXml, 'UserId'),
      })
    }

    // Parse BootTrigger (Startup)
    const bootTriggerRegex = /<BootTrigger>([\s\S]*?)<\/BootTrigger>/gi
    while ((match = bootTriggerRegex.exec(triggersXml)) !== null) {
      const triggerXml = match[1]
      config.triggers!.push({
        type: 'startup',
        enabled: extractBooleanTag(triggerXml, 'Enabled'),
        delay: extractTagContent(triggerXml, 'Delay'),
      })
    }
  }

  // Parse Actions
  const actionsMatch = /<Actions[^>]*>([\s\S]*?)<\/Actions>/i.exec(xmlContent)
  if (actionsMatch) {
    const actionsXml = actionsMatch[1]
    const execRegex = /<Exec>([\s\S]*?)<\/Exec>/gi
    let match
    while ((match = execRegex.exec(actionsXml)) !== null) {
      const execXml = match[1]
      const action: ExecAction = {
        path: extractTagContent(execXml, 'Command') || '',
        arguments: extractTagContent(execXml, 'Arguments'),
        workingDirectory: extractTagContent(execXml, 'WorkingDirectory'),
      }
      config.actions!.push(action)
    }
  }

  // Parse Principal
  const principalMatch = /<Principal[^>]*>([\s\S]*?)<\/Principal>/i.exec(xmlContent)
  if (principalMatch) {
    const principalXml = principalMatch[1]
    config.principal = {
      userId: extractTagContent(principalXml, 'UserId'),
      logonType: extractTagContent(principalXml, 'LogonType') as Principal['logonType'],
      runLevel: extractTagContent(principalXml, 'RunLevel') as Principal['runLevel'],
    }
  }

  // Parse Settings
  const settingsMatch = /<Settings>([\s\S]*?)<\/Settings>/i.exec(xmlContent)
  if (settingsMatch) {
    const settingsXml = settingsMatch[1]
    config.settings = {
      enabled: extractBooleanTag(settingsXml, 'Enabled'),
      hidden: extractBooleanTag(settingsXml, 'Hidden'),
      allowDemandStart: extractBooleanTag(settingsXml, 'AllowStartOnDemand'),
      allowHardTerminate: extractBooleanTag(settingsXml, 'AllowHardTerminate'),
      disallowStartIfOnBatteries: extractBooleanTag(settingsXml, 'DisallowStartIfOnBatteries'),
      stopIfGoingOnBatteries: extractBooleanTag(settingsXml, 'StopIfGoingOnBatteries'),
      startWhenAvailable: extractBooleanTag(settingsXml, 'StartWhenAvailable'),
      runOnlyIfNetworkAvailable: extractBooleanTag(settingsXml, 'RunOnlyIfNetworkAvailable'),
      runOnlyIfIdle: extractBooleanTag(settingsXml, 'RunOnlyIfIdle'),
      wakeToRun: extractBooleanTag(settingsXml, 'WakeToRun'),
      executionTimeLimit: extractTagContent(settingsXml, 'ExecutionTimeLimit'),
      priority: extractTagContent(settingsXml, 'Priority') ? Number.parseInt(extractTagContent(settingsXml, 'Priority')!) : undefined,
      multipleInstancesPolicy: extractTagContent(settingsXml, 'MultipleInstancesPolicy') as TaskSettings['multipleInstancesPolicy'],
    }

    // Parse RestartOnFailure
    const restartMatch = /<RestartOnFailure>([\s\S]*?)<\/RestartOnFailure>/i.exec(settingsXml)
    if (restartMatch) {
      const restartXml = restartMatch[1]
      const interval = extractTagContent(restartXml, 'Interval')
      const count = extractTagContent(restartXml, 'Count')
      if (interval && count) {
        config.settings.restartOnFailure = {
          interval,
          count: Number.parseInt(count),
        }
      }
    }
  }

  return config
}

/**
 * Escapes XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Generates XML for a trigger
 */
function generateTriggerXml(trigger: Trigger, _index: number): string {

  if (trigger.type === 'time') {
    const repetition = trigger.repetition
      ? `
      <Repetition>
        <Interval>${escapeXml(trigger.repetition.interval)}</Interval>
        ${trigger.repetition.duration ? `<Duration>${escapeXml(trigger.repetition.duration)}</Duration>` : ''}
        ${trigger.repetition.stopAtDurationEnd !== undefined ? `<StopAtDurationEnd>${trigger.repetition.stopAtDurationEnd}</StopAtDurationEnd>` : ''}
      </Repetition>`
      : ''

    return `
    <CalendarTrigger>
      <StartBoundary>${formatDate(trigger.startBoundary)}</StartBoundary>
      <Enabled>${trigger.enabled ?? true}</Enabled>
      <ScheduleByDay>
        <DaysInterval>1</DaysInterval>
      </ScheduleByDay>${repetition}
    </CalendarTrigger>`
  }

  if (trigger.type === 'logon') {
    return `
    <LogonTrigger>
      <Enabled>${trigger.enabled ?? true}</Enabled>
      ${trigger.userId ? `<UserId>${escapeXml(trigger.userId)}</UserId>` : ''}
    </LogonTrigger>`
  }

  if (trigger.type === 'startup') {
    return `
    <BootTrigger>
      <Enabled>${trigger.enabled ?? true}</Enabled>
      ${trigger.delay ? `<Delay>${escapeXml(trigger.delay)}</Delay>` : ''}
    </BootTrigger>`
  }

  return ''
}

/**
 * Converts a TaskConfig to Windows Task Scheduler XML format
 */
export function toXml(config: TaskConfig): string {
  const {
    description,
    author,
    registrationInfo,
    triggers,
    actions,
    principal,
    settings,
  } = config

  // Merge legacy fields with registrationInfo for backward compatibility
  const regInfo = {
    ...registrationInfo,
    // Only use legacy fields if not already in registrationInfo
    author: registrationInfo?.author || author,
    description: registrationInfo?.description || description,
  }

  const triggersXml = triggers.map((trigger, index) => generateTriggerXml(trigger, index)).join('')

  const actionsXml = actions
    .map(
      action => `
      <Exec>
        <Command>${escapeXml(action.path)}</Command>
        ${action.arguments ? `<Arguments>${escapeXml(action.arguments)}</Arguments>` : ''}
        ${action.workingDirectory ? `<WorkingDirectory>${escapeXml(action.workingDirectory)}</WorkingDirectory>` : ''}
      </Exec>`,
    )
    .join('')

  // Principal (user context) - no wrapper element per schema
  const principalXml = `
  <Principal id="Author">
    ${principal?.userId ? `<UserId>${escapeXml(principal.userId)}</UserId>` : ''}
    ${principal?.logonType ? `<LogonType>${principal.logonType}</LogonType>` : ''}
    ${principal?.runLevel ? `<RunLevel>${principal.runLevel}</RunLevel>` : ''}
  </Principal>`

  // Settings with proper order per schema
  const settingsXml = `
  <Settings>
    <MultipleInstancesPolicy>${settings?.multipleInstancesPolicy ?? 'IgnoreNew'}</MultipleInstancesPolicy>
    <DisallowStartIfOnBatteries>${settings?.disallowStartIfOnBatteries ?? false}</DisallowStartIfOnBatteries>
    <StopIfGoingOnBatteries>${settings?.stopIfGoingOnBatteries ?? true}</StopIfGoingOnBatteries>
    <AllowHardTerminate>${settings?.allowHardTerminate ?? true}</AllowHardTerminate>
    <StartWhenAvailable>${settings?.startWhenAvailable ?? false}</StartWhenAvailable>
    <RunOnlyIfNetworkAvailable>${settings?.runOnlyIfNetworkAvailable ?? false}</RunOnlyIfNetworkAvailable>
    <IdleSettings>
      <Duration>PT10M</Duration>
      <WaitTimeout>PT1H</WaitTimeout>
      <StopOnIdleEnd>true</StopOnIdleEnd>
      <RestartOnIdle>false</RestartOnIdle>
    </IdleSettings>
    <AllowStartOnDemand>${settings?.allowDemandStart ?? true}</AllowStartOnDemand>
    <Enabled>${settings?.enabled ?? true}</Enabled>
    <Hidden>${settings?.hidden ?? false}</Hidden>
    <RunOnlyIfIdle>${settings?.runOnlyIfIdle ?? false}</RunOnlyIfIdle>
    <WakeToRun>${settings?.wakeToRun ?? false}</WakeToRun>
    <ExecutionTimeLimit>${settings?.executionTimeLimit ?? 'PT72H'}</ExecutionTimeLimit>
    <Priority>${settings?.priority ?? 7}</Priority>${
  settings?.restartOnFailure
    ? `
    <RestartOnFailure>
      <Interval>${escapeXml(settings.restartOnFailure.interval)}</Interval>
      <Count>${settings.restartOnFailure.count}</Count>
    </RestartOnFailure>`
    : ''
}
  </Settings>`

  // Build RegistrationInfo XML
  const registrationInfoXml = `
  <RegistrationInfo>
    ${regInfo.date ? `<Date>${formatDate(regInfo.date)}</Date>` : ''}
    ${regInfo.author ? `<Author>${escapeXml(regInfo.author)}</Author>` : ''}
    ${regInfo.version ? `<Version>${escapeXml(regInfo.version)}</Version>` : ''}
    ${regInfo.description ? `<Description>${escapeXml(regInfo.description)}</Description>` : ''}
    ${regInfo.uri ? `<URI>${escapeXml(regInfo.uri)}</URI>` : ''}
    ${regInfo.documentation ? `<Documentation>${escapeXml(regInfo.documentation)}</Documentation>` : ''}
  </RegistrationInfo>`

  return `<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">${registrationInfoXml}
  <Triggers>${triggersXml}
  </Triggers>${principalXml}${settingsXml}
  <Actions Context="Author">${actionsXml}
  </Actions>
</Task>`
}
