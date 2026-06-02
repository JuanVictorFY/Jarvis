"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserService = void 0;
const fs = __importStar(require("fs"));
const https = __importStar(require("https"));
const http = __importStar(require("http"));
const tokenUtils_1 = require("../utils/tokenUtils");
const logger_1 = require("../utils/dev/logger");
const log = (0, logger_1.createLogger)('browser');
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
class BrowserService {
    browser = null;
    executablePath = null;
    findExecutable() {
        if (this.executablePath)
            return this.executablePath;
        for (const p of BROWSER_CANDIDATES) {
            if (fs.existsSync(p)) {
                log('info', `Found browser at: ${p}`);
                this.executablePath = p;
                return p;
            }
        }
        throw new Error('No Chromium-based browser found on this machine.\n' +
            'Install Google Chrome or Microsoft Edge to enable web browsing.\n' +
            'Checked paths:\n' + BROWSER_CANDIDATES.slice(0, 4).join('\n'));
    }
    hasBrowser() {
        try {
            this.findExecutable();
            return true;
        }
        catch {
            return false;
        }
    }
    async getBrowser() {
        if (this.browser?.isConnected())
            return this.browser;
        const executablePath = this.findExecutable();
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const puppeteer = require('puppeteer-core');
        this.browser = await puppeteer.launch({
            executablePath,
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
        });
        log('info', 'Headless browser launched');
        return this.browser;
    }
    async browseUrl(url) {
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
            const text = await page.evaluate(() => document.body?.innerText ?? '');
            return (0, tokenUtils_1.truncateToTokenBudget)(`[${title}] ${url}\n\n${text}`, CONTENT_BUDGET);
        }
        finally {
            await page.close();
        }
    }
    async searchWeb(query) {
        if (!this.hasBrowser()) {
            return `Browser not available. Search query: "${query}"\nInstall Chrome or Edge to enable web search.`;
        }
        const browser = await this.getBrowser();
        const page = await browser.newPage();
        await page.setDefaultNavigationTimeout(20_000);
        try {
            const url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&ia=web`;
            await page.goto(url, { waitUntil: 'domcontentloaded' });
            const results = await page.evaluate(() => Array.from(document.querySelectorAll('[data-testid="result"]'))
                .slice(0, 8)
                .map(el => {
                const title = el.querySelector('h2')?.innerText ?? '';
                const snippet = el.querySelector('[data-result="snippet"]')?.innerText ?? '';
                const href = el.querySelector('a')?.href ?? '';
                return `${title}\n${href}\n${snippet}`;
            })
                .join('\n\n---\n\n'));
            return results || 'No results found.';
        }
        finally {
            await page.close();
        }
    }
    // Plain HTTP/S fallback when no browser is installed
    fetchUrlFallback(url) {
        return new Promise((resolve) => {
            const client = url.startsWith('https') ? https : http;
            const req = client.get(url, { headers: { 'User-Agent': 'Jarvis/1.0' } }, (res) => {
                const chunks = [];
                res.on('data', (c) => chunks.push(c));
                res.on('end', () => {
                    const body = Buffer.concat(chunks).toString('utf8');
                    const text = body
                        .replace(/<script[\s\S]*?<\/script>/gi, '')
                        .replace(/<style[\s\S]*?<\/style>/gi, '')
                        .replace(/<[^>]+>/g, ' ')
                        .replace(/\s{2,}/g, ' ')
                        .trim();
                    resolve((0, tokenUtils_1.truncateToTokenBudget)(`[${url}]\n\n${text}`, CONTENT_BUDGET));
                });
            });
            req.on('error', (err) => resolve(`Failed to fetch ${url}: ${err.message}`));
            req.setTimeout(15_000, () => { req.destroy(); resolve(`Timeout fetching ${url}`); });
        });
    }
    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            log('info', 'Browser closed');
        }
    }
}
exports.BrowserService = BrowserService;
//# sourceMappingURL=BrowserService.js.map