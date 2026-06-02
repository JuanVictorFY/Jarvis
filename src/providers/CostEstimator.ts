export interface ModelPricing {
  inputCostPer1kTokens: number;
  outputCostPer1kTokens: number;
  currency: string;
}

const MODEL_PRICING: Record<string, ModelPricing> = {
  'claude-sonnet-4-6': { inputCostPer1kTokens: 0.003, outputCostPer1kTokens: 0.015, currency: 'USD' },
  'claude-opus-4-8': { inputCostPer1kTokens: 0.015, outputCostPer1kTokens: 0.075, currency: 'USD' },
  'claude-haiku-4-5-20251001': { inputCostPer1kTokens: 0.00025, outputCostPer1kTokens: 0.00125, currency: 'USD' },
  'gpt-4o': { inputCostPer1kTokens: 0.005, outputCostPer1kTokens: 0.015, currency: 'USD' },
  'gpt-4o-mini': { inputCostPer1kTokens: 0.00015, outputCostPer1kTokens: 0.0006, currency: 'USD' },
  'gemini-2.0-flash': { inputCostPer1kTokens: 0.0001, outputCostPer1kTokens: 0.0004, currency: 'USD' },
  'gemini-1.5-pro': { inputCostPer1kTokens: 0.00125, outputCostPer1kTokens: 0.005, currency: 'USD' },
};

export function estimateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number | null {
  const pricing = MODEL_PRICING[model];
  if (!pricing) { return null; }
  return (
    (inputTokens / 1000) * pricing.inputCostPer1kTokens +
    (outputTokens / 1000) * pricing.outputCostPer1kTokens
  );
}

export function formatCost(usd: number | null): string {
  if (usd === null) { return 'N/A'; }
  if (usd < 0.001) { return `$${(usd * 1000).toFixed(4)}m`; }
  return `$${usd.toFixed(4)}`;
}

export function getPricing(model: string): ModelPricing | undefined {
  return MODEL_PRICING[model];
}

export function listPricedModels(): string[] {
  return Object.keys(MODEL_PRICING);
}
