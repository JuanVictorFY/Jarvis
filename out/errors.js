"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyMissingError = exports.BrowserServiceError = exports.ShellServiceError = exports.FileServiceError = exports.ToolExecutionError = exports.AgentError = exports.ConfigError = exports.JarvisError = void 0;
exports.isJarvisError = isJarvisError;
exports.toErrorMessage = toErrorMessage;
class JarvisError extends Error {
    code;
    cause;
    constructor(message, code, cause) {
        super(message);
        this.code = code;
        this.cause = cause;
        this.name = 'JarvisError';
    }
}
exports.JarvisError = JarvisError;
class ConfigError extends JarvisError {
    constructor(message, cause) {
        super(message, 'CONFIG_ERROR', cause);
        this.name = 'ConfigError';
    }
}
exports.ConfigError = ConfigError;
class AgentError extends JarvisError {
    constructor(message, cause) {
        super(message, 'AGENT_ERROR', cause);
        this.name = 'AgentError';
    }
}
exports.AgentError = AgentError;
class ToolExecutionError extends JarvisError {
    toolName;
    constructor(toolName, message, cause) {
        super(`Tool '${toolName}' failed: ${message}`, 'TOOL_ERROR', cause);
        this.toolName = toolName;
        this.name = 'ToolExecutionError';
    }
}
exports.ToolExecutionError = ToolExecutionError;
class FileServiceError extends JarvisError {
    filePath;
    constructor(filePath, message, cause) {
        super(message, 'FILE_ERROR', cause);
        this.filePath = filePath;
        this.name = 'FileServiceError';
    }
}
exports.FileServiceError = FileServiceError;
class ShellServiceError extends JarvisError {
    command;
    exitCode;
    constructor(command, message, exitCode, cause) {
        super(message, 'SHELL_ERROR', cause);
        this.command = command;
        this.exitCode = exitCode;
        this.name = 'ShellServiceError';
    }
}
exports.ShellServiceError = ShellServiceError;
class BrowserServiceError extends JarvisError {
    constructor(message, cause) {
        super(message, 'BROWSER_ERROR', cause);
        this.name = 'BrowserServiceError';
    }
}
exports.BrowserServiceError = BrowserServiceError;
class ApiKeyMissingError extends ConfigError {
    constructor() {
        super('Anthropic API key is not configured. Please set it in Settings.');
        this.name = 'ApiKeyMissingError';
    }
}
exports.ApiKeyMissingError = ApiKeyMissingError;
function isJarvisError(err) {
    return err instanceof JarvisError;
}
function toErrorMessage(err) {
    if (err instanceof Error) {
        return err.message;
    }
    return String(err);
}
//# sourceMappingURL=errors.js.map