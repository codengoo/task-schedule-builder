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

export type LogonType =
  | "S4U"
  | "InteractiveToken"
  | "Password"
  | "InteractiveTokenOrPassword";

export type RunLevel = "LeastPrivilege" | "HighestAvailable";
export type ProcessTokenSidType = "None" | "Unrestricted";

export interface RequiredPrivilege {
  Privilege: PrivilegeType | PrivilegeType[];
}

export type PrivilegeType =
  | "SeCreateTokenPrivilege"
  | "SeAssignPrimaryTokenPrivilege"
  | "SeLockMemoryPrivilege"
  | "SeIncreaseQuotaPrivilege"
  | "SeUnsolicitedInputPrivilege"
  | "SeMachineAccountPrivilege"
  | "SeTcbPrivilege"
  | "SeSecurityPrivilege"
  | "SeTakeOwnershipPrivilege"
  | "SeLoadDriverPrivilege"
  | "SeSystemProfilePrivilege"
  | "SeSystemtimePrivilege"
  | "SeProfileSingleProcessPrivilege"
  | "SeIncreaseBasePriorityPrivilege"
  | "SeCreatePagefilePrivilege"
  | "SeCreatePermanentPrivilege"
  | "SeBackupPrivilege"
  | "SeRestorePrivilege"
  | "SeShutdownPrivilege"
  | "SeDebugPrivilege"
  | "SeAuditPrivilege"
  | "SeSystemEnvironmentPrivilege"
  | "SeChangeNotifyPrivilege"
  | "SeRemoteShutdownPrivilege"
  | "SeUndockPrivilege"
  | "SeSyncAgentPrivilege"
  | "SeEnableDelegationPrivilege"
  | "SeManageVolumePrivilege"
  | "SeImpersonatePrivilege"
  | "SeCreateGlobalPrivilege"
  | "SeTrustedCredManAccessPrivilege"
  | "SeRelabelPrivilege"
  | "SeIncreaseWorkingSetPrivilege"
  | "SeTimeZonePrivilege"
  | "SeCreateSymbolicLinkPrivilege";
