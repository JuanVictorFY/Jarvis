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
const tokenUtils_1 = require("../utils/tokenUtils");
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
class BrowserService {
    browser = null;
    findExecutable() {
        for (const p of BROWSER_CANDIDATES) {
            if (fs.existsSync(p)) {
                return p;
            }
        }
        throw new Error('No browser found. Install Google Chrome or Microsoft Edge.');
    }
    async getBrowser() {
        if (this.browser?.isConnected()) {
            return this.browser;
        }
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const puppeteer = require('puppeteer-core');
        this.browser = await puppeteer.launch({
            executablePath: this.findExecutable(),
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
        });
        return this.browser;
    }
    async browseUrl(url) {
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
            const text = await page.evaluate(() => document.body?.innerText ?? '');
            return (0, tokenUtils_1.truncateToTokenBudget)(`[${title}] ${url}\n\n${text}`, CONTENT_BUDGET);
        }
        finally {
            await page.close();
        }
    }
    async searchWeb(query) {
        const browser = await this.getBrowser();
        const page = await browser.newPage();
        try {
            const url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&ia=web`;
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15_000 });
            const results = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('[data-testid="result"]'))
                    .slice(0, 8)
                    .map((el) => {
                    const title = el.querySelector('h2')?.innerText ?? '';
                    const snippet = el.querySelector('[data-result="snippet"]')?.innerText ?? '';
                    const href = el.querySelector('a')?.href ?? '';
                    return `${title}\n${href}\n${snippet}`;
                })
                    .join('\n\n---\n\n');
            });
            return results || 'No results found.';
        }
        finally {
            await page.close();
        }
    }
    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
}
exports.BrowserService = BrowserService;
//# sourceMappingURL=BrowserService.js.map