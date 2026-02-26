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

export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

export * from "./interfaces";
