import * as fs from 'fs';
import * as path from 'path';
import { truncateToTokenBudget } from '../utils/tokenUtils';

const READ_TOKEN_BUDGET = 4000;

export class FileSystemService {
  public readFile(filePath: string): string {
    const content = fs.readFileSync(filePath, 'utf8');
    return truncateToTokenBudget(content, READ_TOKEN_BUDGET);
  }

  public writeFile(filePath: string, content: string): void {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf8');
  }

  public listDirectory(dirPath: string): string {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    return entries
      .map((e) => (e.isDirectory() ? `📁 ${e.name}/` : `📄 ${e.name}`))
      .join('\n');
  }
}
