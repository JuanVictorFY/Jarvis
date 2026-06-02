export interface PluginMeta {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  path: string;
}

export class PluginStore {
  private meta: PluginMeta[] = [];

  add(m: PluginMeta): void { this.meta.push(m); }
  toggle(id: string, enabled: boolean): void {
    const m = this.meta.find(x => x.id === id);
    if (m) m.enabled = enabled;
  }
  getAll(): PluginMeta[] { return [...this.meta]; }
  getEnabled(): PluginMeta[] { return this.meta.filter(m => m.enabled); }
}
