export class JarvisError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'JarvisError';
  }
}

export class ConfigError extends JarvisError {
  constructor(message: string, cause?: unknown) {
    super(message, 'CONFIG_ERROR', cause);
    this.name = 'ConfigError';
  }
}

export class AgentError extends JarvisError {
  constructor(message: string, cause?: unknown) {
    super(message, 'AGENT_ERROR', cause);
    this.name = 'AgentError';
  }
}

export class ToolExecutionError extends JarvisError {
  constructor(
    public readonly toolName: string,
    message: string,
    cause?: unknown
  ) {
    super(`Tool '${toolName}' failed: ${message}`, 'TOOL_ERROR', cause);
    this.name = 'ToolExecutionError';
  }
}

export class FileServiceError extends JarvisError {
  constructor(
    public readonly filePath: string,
    message: string,
    cause?: unknown
  ) {
    super(message, 'FILE_ERROR', cause);
    this.name = 'FileServiceError';
  }
}

export class ShellServiceError extends JarvisError {
  constructor(
    public readonly command: string,
    message: string,
    public readonly exitCode?: number,
    cause?: unknown
  ) {
    super(message, 'SHELL_ERROR', cause);
    this.name = 'ShellServiceError';
  }
}

export class BrowserServiceError extends JarvisError {
  constructor(message: string, cause?: unknown) {
    super(message, 'BROWSER_ERROR', cause);
    this.name = 'BrowserServiceError';
  }
}

export class ApiKeyMissingError extends ConfigError {
  constructor() {
    super('Anthropic API key is not configured. Please set it in Settings.');
    this.name = 'ApiKeyMissingError';
  }
}

export function isJarvisError(err: unknown): err is JarvisError {
  return err instanceof JarvisError;
}

export function toErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }
  return String(err);
}
