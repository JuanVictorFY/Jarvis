import type Anthropic from '@anthropic-ai/sdk';

export const TOOLS: Anthropic.Tool[] = [
  {
    name: 'read_file',
    description: 'Read the full contents of any file on the computer. Use absolute paths.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'Absolute path to the file' },
      },
      required: ['path'],
    },
  },
  {
    name: 'write_file',
    description: 'Create or overwrite a file. Requires user confirmation.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'Absolute path of the file to write' },
        content: { type: 'string', description: 'File content' },
      },
      required: ['path', 'content'],
    },
  },
  {
    name: 'list_directory',
    description: 'List all files and subdirectories inside a directory.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'Absolute path to the directory' },
      },
      required: ['path'],
    },
  },
  {
    name: 'run_command',
    description: 'Execute a shell command. ALWAYS requires explicit user confirmation before running.',
    input_schema: {
      type: 'object' as const,
      properties: {
        command: { type: 'string', description: 'Shell command to run' },
        cwd: { type: 'string', description: 'Working directory (optional, defaults to home)' },
      },
      required: ['command'],
    },
  },
  {
    name: 'browse_url',
    description: 'Open a URL in a headless browser and return the visible page text.',
    input_schema: {
      type: 'object' as const,
      properties: {
        url: { type: 'string', description: 'Full URL including https://' },
      },
      required: ['url'],
    },
  },
  {
    name: 'search_web',
    description: 'Search the web via DuckDuckGo and return the top results with titles, URLs, and snippets.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Search query' },
      },
      required: ['query'],
    },
  },
];

export type ToolName =
  | 'read_file'
  | 'write_file'
  | 'list_directory'
  | 'run_command'
  | 'browse_url'
  | 'search_web';

export const REQUIRES_CONFIRMATION = new Set<ToolName>(['run_command', 'write_file']);

// Same tools with cache_control on the last entry so Anthropic caches the full tool block.
export const TOOLS_WITH_CACHE: Anthropic.Tool[] = TOOLS.map((tool, i) =>
  i === TOOLS.length - 1
    ? { ...tool, cache_control: { type: 'ephemeral' as const } }
    : tool,
);
