export interface Actions {
  Context?: string;
  Exec?: ExecType;
  ComHandler?: ComHandlerType;
  SendEmail?: SendEmailType;
}

export interface ExecType {
  Command: string;
  Arguments?: string | string[];
  WorkingDirectory?: string | string[];
}

export interface ComHandlerType {
  ClassId: string;
  Date: string;
}

export interface SendEmailType {
  Server: string;
  Subject: string;
  To: string;
  From: string;
  Cc?: string;
  Bcc?: string;
  Body?: string;
  ReplyTo?: string;
  HeaderFields?: { [key: string]: string };
  Attachments?: AttachmentType;
}

export interface AttachmentType {
  File: string | string[];
}

export interface HeaderField {
  HeaderField: HeaderFieldType | HeaderFieldType[];
}

export interface HeaderFieldType {
  Name: string;
  Value: string;
}
