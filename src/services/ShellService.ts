import { execSync } from 'child_process';
import { truncateToTokenBudget } from '../utils/tokenUtils';

const OUTPUT_TOKEN_BUDGET = 2000;

export class ShellService {
  public runCommand(command: string, cwd?: string): string {
    try {
      const output = execSync(command, {
        cwd,
        encoding: 'utf8',
        timeout: 30_000,
        maxBuffer: 10 * 1024 * 1024,
      });
      return truncateToTokenBudget(output || '(no output)', OUTPUT_TOKEN_BUDGET);
    } catch (err) {
      const e = err as NodeJS.ErrnoException & {
        stdout?: string;
        stderr?: string;
        status?: number;
      };
      const combined = `STDOUT:\n${e.stdout ?? ''}\n\nSTDERR:\n${e.stderr ?? ''}`;
      return `Exit ${e.status ?? 1}:\n${truncateToTokenBudget(combined, OUTPUT_TOKEN_BUDGET)}`;
    }
  }
}
