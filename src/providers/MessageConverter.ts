import type Anthropic from '@anthropic-ai/sdk';
import type { ProviderMessage } from './AIProvider';

type AnthropicMessage = Anthropic.MessageParam;

export function anthropicToProvider(messages: AnthropicMessage[]): ProviderMessage[] {
  return messages.flatMap((msg): ProviderMessage[] => {
    if (typeof msg.content === 'string') {
      return [{ role: msg.role, content: msg.content }];
    }

    const textBlocks = msg.content
      .filter((block): block is Anthropic.TextBlockParam => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    if (!textBlocks) {
      return [];
    }

    return [{ role: msg.role, content: textBlocks }];
  });
}

export function providerToOpenAI(messages: ProviderMessage[]): Array<{
  role: string;
  content: string;
}> {
  return messages.map((m) => ({ role: m.role, content: m.content }));
}

export function providerToGemini(messages: ProviderMessage[]): Array<{
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}> {
  return messages.map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }));
}

export function estimateMessageTokens(messages: ProviderMessage[]): number {
  const totalChars = messages.reduce((sum, m) => sum + m.content.length, 0);
  return Math.ceil(totalChars / 4);
}
