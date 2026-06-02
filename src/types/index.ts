export type AgentEvent =
  | { type: 'text'; text: string }
  | { type: 'text_done' }
  | { type: 'tool_start'; id: string; name: string; summary: string }
  | { type: 'tool_done'; id: string; result: string; isError: boolean }
  | { type: 'confirm'; id: string; action: string; detail: string }
  | { type: 'done' }
  | { type: 'error'; message: string };

export interface JarvisConfig {
  anthropicApiKey: string;
  model: string;
  maxTokens: number;
}
