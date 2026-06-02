export interface Plugin {
  id: string;
  name: string;
  version: string;
  activate(api: PluginAPI): void;
  deactivate(): void;
}

export interface PluginAPI {
  sendMessage: (text: string) => void;
  onMessage: (cb: (msg: string) => void) => () => void;
}

export class PluginManager {
  private plugins = new Map<string, Plugin>();
  private active = new Set<string>();

  register(plugin: Plugin): void {
    this.plugins.set(plugin.id, plugin);
  }

  activate(id: string, api: PluginAPI): void {
    const p = this.plugins.get(id);
    if (!p || this.active.has(id)) return;
    p.activate(api);
    this.active.add(id);
  }

  deactivate(id: string): void {
    const p = this.plugins.get(id);
    if (!p || !this.active.has(id)) return;
    p.deactivate();
    this.active.delete(id);
  }

  list(): Plugin[] { return [...this.plugins.values()]; }
  isActive(id: string): boolean { return this.active.has(id); }
}
// patch 1
// patch 2
// patch 3
// patch 4
// patch 5
// patch 6
// patch 7
// patch 8
// patch 9
// patch 10
// patch 11
// patch 12
// patch 13
// patch 14
// patch 15
// patch 16
// patch 17
// patch 18
