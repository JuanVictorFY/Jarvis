import * as fs from 'fs';
import { truncateToTokenBudget } from '../utils/tokenUtils';
import type { Browser } from 'puppeteer-core';

const CONTENT_BUDGET = 4000;

const BROWSER_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
];

export class BrowserService {
  private browser: Browser | null = null;

  private findExecutable(): string {
    for (const p of BROWSER_CANDIDATES) {
      if (fs.existsSync(p)) {
        return p;
      }
    }
    throw new Error(
      'No browser found. Install Google Chrome or Microsoft Edge.',
    );
  }

  private async getBrowser(): Promise<Browser> {
    if (this.browser?.isConnected()) {
      return this.browser;
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const puppeteer = require('puppeteer-core') as typeof import('puppeteer-core');
    this.browser = await puppeteer.launch({
      executablePath: this.findExecutable(),
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    });
    return this.browser;
  }

  public async browseUrl(url: string): Promise<string> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15_000 });
      await page.evaluate(() => {
        document
          .querySelectorAll('script,style,nav,footer,header,aside,noscript')
          .forEach((el) => el.remove());
      });
      const title = await page.title();
      const text = await page.evaluate(
        () => (document.body as HTMLElement | null)?.innerText ?? '',
      );
      return truncateToTokenBudget(`[${title}] ${url}\n\n${text}`, CONTENT_BUDGET);
    } finally {
      await page.close();
    }
  }

  public async searchWeb(query: string): Promise<string> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    try {
      const url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&ia=web`;
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15_000 });

      const results = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('[data-testid="result"]'))
          .slice(0, 8)
          .map((el) => {
            const title = (el.querySelector('h2') as HTMLElement | null)?.innerText ?? '';
            const snippet = (el.querySelector('[data-result="snippet"]') as HTMLElement | null)?.innerText ?? '';
            const href = (el.querySelector('a') as HTMLAnchorElement | null)?.href ?? '';
            return `${title}\n${href}\n${snippet}`;
          })
          .join('\n\n---\n\n');
      });

      return results || 'No results found.';
    } finally {
      await page.close();
    }
  }

  public async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
