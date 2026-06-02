export type AgentEvent =
  | { type: 'text'; text: string }
  | { type: 'text_done' }
  | { type: 'tool_start'; id: string; name: string; summary: string }
  | { type: 'tool_done'; id: string; result: string; isError: boolean }
  | { type: 'confirm'; id: string; action: string; detail: string }
  | { type: 'done'; inputTokens: number; outputTokens: number }
  | { type: 'error'; message: string };

export interface JarvisConfig {
  anthropicApiKey: string;
  model: string;
  maxTokens: number;
  openaiApiKey: string;
  geminiApiKey: string;
  ollamaBaseUrl: string;
  defaultProvider: string;
  theme: string;
  enableVoice?: boolean;
  language?: string;
}
