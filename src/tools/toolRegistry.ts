import type Anthropic from '@anthropic-ai/sdk';

export interface ToolDefinition {
  schema: Anthropic.Tool;
  requiresConfirmation: boolean;
  category: 'filesystem' | 'shell' | 'browser' | 'memory' | 'system';
}

export class ToolRegistry {
  private readonly tools = new Map<string, ToolDefinition>();

  register(definition: ToolDefinition): void {
    this.tools.set(definition.schema.name, definition);
  }

  unregister(name: string): void {
    this.tools.delete(name);
  }

  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  requiresConfirmation(name: string): boolean {
    return this.tools.get(name)?.requiresConfirmation ?? false;
  }

  getSchemas(): Anthropic.Tool[] {
    return Array.from(this.tools.values()).map((def) => def.schema);
  }

  getByCategory(category: ToolDefinition['category']): ToolDefinition[] {
    return Array.from(this.tools.values()).filter((def) => def.category === category);
  }

  listNames(): string[] {
    return Array.from(this.tools.keys());
  }

  size(): number {
    return this.tools.size;
  }
}

export const globalToolRegistry = new ToolRegistry();
