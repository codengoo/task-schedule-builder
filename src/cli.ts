import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as os from 'node:os'
import type { ExecutionResult, TaskConfig, TaskInfo } from './types'
import { toXml } from './xml'

const execAsync = promisify(exec)

/**
 * Creates a temporary XML file for the task
 */
async function createTempXmlFile(xml: string): Promise<string> {
  const tempDir = os.tmpdir()
  const tempFile = path.join(tempDir, `task-${Date.now()}.xml`)
  await fs.writeFile(tempFile, xml, 'utf-16le')
  return tempFile
}

/**
 * Deletes a temporary file
 */
async function deleteTempFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath)
  }
  catch (error) {
    // Ignore errors when deleting temp files
  }
}

/**
 * Creates a scheduled task in Windows Task Scheduler
 */
export async function createTask(config: TaskConfig, options?: {
  force?: boolean
  runAsSystem?: boolean
}): Promise<ExecutionResult> {
  const xml = toXml(config)
  const tempFile = await createTempXmlFile(xml)

  try {
    const forceFlag = options?.force ? '/F' : ''
    const command = `schtasks /Create /TN "${config.name}" /XML "${tempFile}" ${forceFlag}`

    const { stdout, stderr } = await execAsync(command)

    return {
      success: true,
      output: stdout,
      error: stderr || undefined,
    }
  }
  catch (error: any) {
    return {
      success: false,
      output: '',
      error: error.message,
    }
  }
  finally {
    await deleteTempFile(tempFile)
  }
}

/**
 * Lists all scheduled tasks
 */
export async function listTasks(filter?: string): Promise<TaskInfo[]> {
  try {
    const command = 'schtasks /Query /FO CSV /V /NH'
    const { stdout } = await execAsync(command)

    const lines = stdout.split('\n').filter(line => line.trim())
    const tasks: TaskInfo[] = []

    for (const line of lines) {
      // CSV format: TaskName, Next Run Time, Status, Logon Mode, Last Run Time, ...
      const fields = line.split('","').map(field => field.replace(/^"|"$/g, ''))

      if (fields.length >= 5) {
        const name = fields[0].replace(/\\/g, '')
        const nextRunTime = fields[1]
        const status = fields[2]
        const lastRunTime = fields[4]

        if (!filter || name.toLowerCase().includes(filter.toLowerCase())) {
          tasks.push({
            name,
            nextRunTime: nextRunTime !== 'N/A' ? nextRunTime : undefined,
            status,
            lastRunTime: lastRunTime !== 'N/A' ? lastRunTime : undefined,
          })
        }
      }
    }

    return tasks
  }
  catch (error: any) {
    console.error('Failed to list tasks:', error.message)
    return []
  }
}

/**
 * Deletes a scheduled task
 */
export async function deleteTask(taskName: string, options?: {
  force?: boolean
}): Promise<ExecutionResult> {
  try {
    const forceFlag = options?.force ? '/F' : ''
    const command = `schtasks /Delete /TN "${taskName}" ${forceFlag}`

    const { stdout, stderr } = await execAsync(command)

    return {
      success: true,
      output: stdout,
      error: stderr || undefined,
    }
  }
  catch (error: any) {
    return {
      success: false,
      output: '',
      error: error.message,
    }
  }
}

/**
 * Runs a scheduled task immediately
 */
export async function runTask(taskName: string): Promise<ExecutionResult> {
  try {
    const command = `schtasks /Run /TN "${taskName}"`
    const { stdout, stderr } = await execAsync(command)

    return {
      success: true,
      output: stdout,
      error: stderr || undefined,
    }
  }
  catch (error: any) {
    return {
      success: false,
      output: '',
      error: error.message,
    }
  }
}

/**
 * Gets detailed information about a specific task
 */
export async function getTaskInfo(taskName: string): Promise<TaskInfo | null> {
  try {
    const command = `schtasks /Query /TN "${taskName}" /FO LIST /V`
    const { stdout } = await execAsync(command)

    const lines = stdout.split('\n')
    const info: any = {}

    for (const line of lines) {
      const [key, ...valueParts] = line.split(':')
      const value = valueParts.join(':').trim()
      if (key && value) {
        info[key.trim()] = value
      }
    }

    return {
      name: info['TaskName'] || taskName,
      nextRunTime: info['Next Run Time'] !== 'N/A' ? info['Next Run Time'] : undefined,
      status: info['Status'] || 'Unknown',
      lastRunTime: info['Last Run Time'] !== 'N/A' ? info['Last Run Time'] : undefined,
    }
  }
  catch (error: any) {
    return null
  }
}

/**
 * Checks if a task exists
 */
export async function taskExists(taskName: string): Promise<boolean> {
  const info = await getTaskInfo(taskName)
  return info !== null
}
