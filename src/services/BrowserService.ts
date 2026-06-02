import * as fs from 'fs';
import * as https from 'https';
import * as http from 'http';
import { truncateToTokenBudget } from '../utils/tokenUtils';
import { createLogger } from '../utils/dev/logger';
import type { Browser } from 'puppeteer-core';

const log = createLogger('browser');
const CONTENT_BUDGET = 4000;

const BROWSER_CANDIDATES = [
  // Windows — Chrome
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  // Windows — Edge
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  // macOS
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  // Linux
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
  '/snap/bin/chromium',
];

export class BrowserService {
  private browser: Browser | null = null;
  private executablePath: string | null = null;

  private findExecutable(): string {
    if (this.executablePath) return this.executablePath;

    for (const p of BROWSER_CANDIDATES) {
      if (fs.existsSync(p)) {
        log('info', `Found browser at: ${p}`);
        this.executablePath = p;
        return p;
      }
    }

    throw new Error(
      'No Chromium-based browser found on this machine.\n' +
      'Install Google Chrome or Microsoft Edge to enable web browsing.\n' +
      'Checked paths:\n' + BROWSER_CANDIDATES.slice(0, 4).join('\n'),
    );
  }

  private hasBrowser(): boolean {
    try {
      this.findExecutable();
      return true;
    } catch {
      return false;
    }
  }

  private async getBrowser(): Promise<Browser> {
    if (this.browser?.isConnected()) return this.browser;

    const executablePath = this.findExecutable();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const puppeteer = require('puppeteer-core') as typeof import('puppeteer-core');
    this.browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
    });
    log('info', 'Headless browser launched');
    return this.browser;
  }

  public async browseUrl(url: string): Promise<string> {
    if (!this.hasBrowser()) {
      return this.fetchUrlFallback(url);
    }

    const browser = await this.getBrowser();
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(20_000);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => {
        document
          .querySelectorAll('script,style,nav,footer,header,aside,noscript')
          .forEach(el => el.remove());
      });
      const title = await page.title();
      const text  = await page.evaluate(
        () => (document.body as HTMLElement | null)?.innerText ?? '',
      );
      return truncateToTokenBudget(`[${title}] ${url}\n\n${text}`, CONTENT_BUDGET);
    } finally {
      await page.close();
    }
  }

  public async searchWeb(query: string): Promise<string> {
    if (!this.hasBrowser()) {
      return `Browser not available. Search query: "${query}"\nInstall Chrome or Edge to enable web search.`;
    }

    const browser = await this.getBrowser();
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(20_000);
    try {
      const url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&ia=web`;
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      const results = await page.evaluate(() =>
        Array.from(document.querySelectorAll('[data-testid="result"]'))
          .slice(0, 8)
          .map(el => {
            const title   = (el.querySelector('h2') as HTMLElement | null)?.innerText ?? '';
            const snippet = (el.querySelector('[data-result="snippet"]') as HTMLElement | null)?.innerText ?? '';
            const href    = (el.querySelector('a') as HTMLAnchorElement | null)?.href ?? '';
            return `${title}\n${href}\n${snippet}`;
          })
          .join('\n\n---\n\n'),
      );

      return results || 'No results found.';
    } finally {
      await page.close();
    }
  }

  // Plain HTTP/S fallback when no browser is installed
  private fetchUrlFallback(url: string): Promise<string> {
    return new Promise((resolve) => {
      const client = url.startsWith('https') ? https : http;
      const req = client.get(url, { headers: { 'User-Agent': 'Jarvis/1.0' } }, (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (c: Buffer) => chunks.push(c));
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf8');
          const text = body
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<style[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s{2,}/g, ' ')
            .trim();
          resolve(truncateToTokenBudget(`[${url}]\n\n${text}`, CONTENT_BUDGET));
        });
      });
      req.on('error', (err) => resolve(`Failed to fetch ${url}: ${err.message}`));
      req.setTimeout(15_000, () => { req.destroy(); resolve(`Timeout fetching ${url}`); });
    });
  }

  public async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      log('info', 'Browser closed');
    }
  }
}
