export interface Actions {
  "@_Context"?: string;
  Exec?: ExecType | ExecType[];
  ComHandler?: ComHandlerType | ComHandlerType[];
  SendEmail?: SendEmailType | SendEmailType[];
  ShowMessage?: ShowMessageType | ShowMessageType[];
}

export interface ExecType {
  "@_id"?: string;
  Command: string;
  Arguments?: string;
  WorkingDirectory?: string;
}

export interface ComHandlerType {
  "@_id"?: string;
  ClassId: string;
  Data?: any;
}

export interface SendEmailType {
  "@_id"?: string;
  Server: string;
  Subject?: string;
  To?: string;
  Cc?: string;
  Bcc?: string;
  ReplyTo?: string;
  From?: string;
  HeaderFields?: HeaderFieldsType;
  Body?: string;
  Attachments?: AttachmentsType;
}

export interface HeaderFieldsType {
  HeaderField: HeaderFieldType | HeaderFieldType[];
}

export interface HeaderFieldType {
  Name: string;
  Value: string;
}

export interface AttachmentsType {
  File: string | string[];
}

export interface ShowMessageType {
  "@_id"?: string;
  Title: string;
  Body: string;
}
