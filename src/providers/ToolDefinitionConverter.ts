import type Anthropic from '@anthropic-ai/sdk';
import type { ProviderToolDefinition } from './AIProvider';

export function anthropicToolToProvider(tool: Anthropic.Tool): ProviderToolDefinition {
  return {
    name: tool.name,
    description: tool.description ?? '',
    parameters: tool.input_schema as Record<string, unknown>,
  };
}

export function providerToolToOpenAI(tool: ProviderToolDefinition): Record<string, unknown> {
  return {
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  };
}

export function providerToolToGemini(tool: ProviderToolDefinition): Record<string, unknown> {
  return {
    functionDeclarations: [
      {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    ],
  };
}

export function convertToolsForProvider(
  tools: Anthropic.Tool[],
  target: 'anthropic' | 'openai' | 'gemini'
): ProviderToolDefinition[] | unknown[] {
  const providerTools = tools.map(anthropicToolToProvider);

  switch (target) {
    case 'anthropic':
      return providerTools;
    case 'openai':
      return providerTools.map(providerToolToOpenAI);
    case 'gemini':
      return providerTools.map(providerToolToGemini);
    default:
      return providerTools;
  }
}
