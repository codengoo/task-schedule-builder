export interface Principals {
  Principal?: Principal;
}

export interface Principal {
  UserId?: string;
  LogonType?: LogonType;
  GroupId?: string;
  DisplayName?: string;
  RunLevel?: RunLevel;
  ProcessTokenSidType?: ProcessTokenSidType;
  RequiredPrivileges?: RequiredPrivilege;
}

export enum LogonType {
  S4U = "S4U",
  InteractiveToken = "InteractiveToken",
  Password = "Password",
  InteractiveTokenOrPassword = "InteractiveTokenOrPassword",
}

export enum RunLevel {
  LeastPrivilege = "LeastPrivilege",
  HighestAvailable = "HighestAvailable",
}

export enum ProcessTokenSidType {
  None = "None",
  Unrestricted = "Unrestricted",
}

export interface RequiredPrivilege {
  Privilege: PrivilegeType | PrivilegeType[];
}

export enum PrivilegeType {
  SeCreateTokenPrivilege = "SeCreateTokenPrivilege",
  SeAssignPrimaryTokenPrivilege = "SeAssignPrimaryTokenPrivilege",
  SeLockMemoryPrivilege = "SeLockMemoryPrivilege",
  SeIncreaseQuotaPrivilege = "SeIncreaseQuotaPrivilege",
  SeUnsolicitedInputPrivilege = "SeUnsolicitedInputPrivilege",
  SeMachineAccountPrivilege = "SeMachineAccountPrivilege",
  SeTcbPrivilege = "SeTcbPrivilege",
  SeSecurityPrivilege = "SeSecurityPrivilege",
  SeTakeOwnershipPrivilege = "SeTakeOwnershipPrivilege",
  SeLoadDriverPrivilege = "SeLoadDriverPrivilege",
  SeSystemProfilePrivilege = "SeSystemProfilePrivilege",
  SeSystemtimePrivilege = "SeSystemtimePrivilege",
  SeProfileSingleProcessPrivilege = "SeProfileSingleProcessPrivilege",
  SeIncreaseBasePriorityPrivilege = "SeIncreaseBasePriorityPrivilege",
  SeCreatePagefilePrivilege = "SeCreatePagefilePrivilege",
  SeCreatePermanentPrivilege = "SeCreatePermanentPrivilege",
  SeBackupPrivilege = "SeBackupPrivilege",
  SeRestorePrivilege = "SeRestorePrivilege",
  SeShutdownPrivilege = "SeShutdownPrivilege",
  SeDebugPrivilege = "SeDebugPrivilege",
  SeAuditPrivilege = "SeAuditPrivilege",
  SeSystemEnvironmentPrivilege = "SeSystemEnvironmentPrivilege",
  SeChangeNotifyPrivilege = "SeChangeNotifyPrivilege",
  SeRemoteShutdownPrivilege = "SeRemoteShutdownPrivilege",
  SeUndockPrivilege = "SeUndockPrivilege",
  SeSyncAgentPrivilege = "SeSyncAgentPrivilege",
  SeEnableDelegationPrivilege = "SeEnableDelegationPrivilege",
  SeManageVolumePrivilege = "SeManageVolumePrivilege",
  SeImpersonatePrivilege = "SeImpersonatePrivilege",
  SeCreateGlobalPrivilege = "SeCreateGlobalPrivilege",
  SeTrustedCredManAccessPrivilege = "SeTrustedCredManAccessPrivilege",
  SeRelabelPrivilege = "SeRelabelPrivilege",
  SeIncreaseWorkingSetPrivilege = "SeIncreaseWorkingSetPrivilege",
  SeTimeZonePrivilege = "SeTimeZonePrivilege",
  SeCreateSymbolicLinkPrivilege = "SeCreateSymbolicLinkPrivilege",
}
