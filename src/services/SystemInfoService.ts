import os from 'os';

export interface SystemInfo {
  platform: string;
  arch: string;
  hostname: string;
  username: string;
  homeDir: string;
  totalMemoryMB: number;
  freeMemoryMB: number;
  cpuModel: string;
  cpuCores: number;
  uptimeSeconds: number;
  nodeVersion: string;
  electronVersion: string;
}

export class SystemInfoService {
  getSystemInfo(): SystemInfo {
    const cpus = os.cpus();
    return {
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      username: os.userInfo().username,
      homeDir: os.homedir(),
      totalMemoryMB: Math.round(os.totalmem() / 1024 / 1024),
      freeMemoryMB: Math.round(os.freemem() / 1024 / 1024),
      cpuModel: cpus[0]?.model ?? 'Unknown',
      cpuCores: cpus.length,
      uptimeSeconds: Math.round(os.uptime()),
      nodeVersion: process.versions.node ?? 'unknown',
      electronVersion: process.versions.electron ?? 'unknown',
    };
  }

  getMemoryUsageMB(): { rss: number; heapUsed: number; heapTotal: number; external: number } {
    const mem = process.memoryUsage();
    return {
      rss: Math.round(mem.rss / 1024 / 1024),
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
      external: Math.round(mem.external / 1024 / 1024),
    };
  }

  formatSystemInfo(info: SystemInfo): string {
    return [
      `Platform: ${info.platform} (${info.arch})`,
      `Hostname: ${info.hostname}`,
      `User: ${info.username}`,
      `Home: ${info.homeDir}`,
      `CPU: ${info.cpuModel} (${info.cpuCores} cores)`,
      `Memory: ${info.freeMemoryMB} MB free / ${info.totalMemoryMB} MB total`,
      `Uptime: ${Math.round(info.uptimeSeconds / 3600)}h ${Math.round((info.uptimeSeconds % 3600) / 60)}m`,
    ].join('\n');
  }
}
