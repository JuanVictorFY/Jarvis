import https from 'https';
import { app } from 'electron';

interface GithubRelease {
  tag_name: string;
  html_url: string;
  published_at: string;
  body: string;
}

interface UpdateInfo {
  available: boolean;
  currentVersion: string;
  latestVersion?: string;
  releaseUrl?: string;
  releaseNotes?: string;
}

export class UpdateCheckerService {
  private readonly repoOwner = 'JuanVictorFY';
  private readonly repoName = 'jarvis';

  async checkForUpdates(): Promise<UpdateInfo> {
    const currentVersion = app.getVersion();
    try {
      const release = await this.fetchLatestRelease();
      const latestVersion = release.tag_name.replace(/^v/, '');
      const available = this.isNewerVersion(latestVersion, currentVersion);
      return {
        available,
        currentVersion,
        latestVersion,
        releaseUrl: release.html_url,
        releaseNotes: release.body,
      };
    } catch {
      return { available: false, currentVersion };
    }
  }

  private fetchLatestRelease(): Promise<GithubRelease> {
    const url = `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/releases/latest`;
    return new Promise((resolve, reject) => {
      const req = https.get(url, { headers: { 'User-Agent': 'Jarvis-App' } }, (res) => {
        let data = '';
        res.on('data', (chunk: Buffer) => { data += chunk.toString(); });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data) as GithubRelease);
          } catch {
            reject(new Error('Failed to parse GitHub release response'));
          }
        });
      });
      req.on('error', reject);
      req.setTimeout(10_000, () => {
        req.destroy();
        reject(new Error('Update check timed out'));
      });
    });
  }

  private isNewerVersion(latest: string, current: string): boolean {
    const parse = (v: string): number[] => v.split('.').map(Number);
    const [lMaj, lMin, lPatch] = parse(latest);
    const [cMaj, cMin, cPatch] = parse(current);
    if (lMaj !== cMaj) { return (lMaj ?? 0) > (cMaj ?? 0); }
    if (lMin !== cMin) { return (lMin ?? 0) > (cMin ?? 0); }
    return (lPatch ?? 0) > (cPatch ?? 0);
  }
}
