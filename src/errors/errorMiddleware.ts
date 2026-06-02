import { reportError } from './errorReporter';

type Handler = (ctx: Record<string, unknown>) => Promise<void>;

export function withErrorMiddleware(handler: Handler): Handler {
  return async (ctx) => {
    try {
      await handler(ctx);
    } catch (err) {
      reportError(err);
      throw err;
    }
  };
}
// validated
