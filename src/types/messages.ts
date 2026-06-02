// ─── Messages: Webview → Extension ───────────────────────────────────────────

export interface SendMessageCommand {
  type: 'sendMessage';
  text: string;
}

export interface ClearHistoryCommand {
  type: 'clearHistory';
}

export interface RequestContextCommand {
  type: 'requestContext';
}

export interface ApplyCodeCommand {
  type: 'applyCode';
  code: string;
  language: string;
}

export interface RunTerminalCommand {
  type: 'runTerminal';
  command: string;
}

export type WebviewToExtensionMessage =
  | SendMessageCommand
  | ClearHistoryCommand
  | RequestContextCommand
  | ApplyCodeCommand
  | RunTerminalCommand;

// ─── Messages: Extension → Webview ───────────────────────────────────────────

export interface AssistantChunkMessage {
  type: 'assistantChunk';
  text: string;
}

export interface AssistantDoneMessage {
  type: 'assistantDone';
}

export interface AssistantErrorMessage {
  type: 'assistantError';
  error: string;
}

export interface ContextSnapshotMessage {
  type: 'contextSnapshot';
  fileName: string;
  language: string;
  selection: string;
  diagnostics: string;
}

export interface HistoryClearedMessage {
  type: 'historyCleared';
}

export type ExtensionToWebviewMessage =
  | AssistantChunkMessage
  | AssistantDoneMessage
  | AssistantErrorMessage
  | ContextSnapshotMessage
  | HistoryClearedMessage;
