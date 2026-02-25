import { RegistrationInfo } from "./registration"
import { Triggers } from "./triggers"

export interface Task {
  "@_version"?: "1.2"
  "@_xmlns"?: "http://schemas.microsoft.com/windows/2004/02/mit/task"

  RegistrationInfo?: RegistrationInfo
  Triggers?: Triggers
  //   Settings?: Settings
  //   Principals?: Principals
  Data?: any

  //   Actions: Actions
}