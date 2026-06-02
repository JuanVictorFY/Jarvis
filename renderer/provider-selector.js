'use strict';

class ProviderSelector {
  constructor(container, onProviderChange) {
    this.container = container;
    this.onProviderChange = onProviderChange;
    this.providers = [];
    this.activeProvider = 'anthropic';
  }

  async init() {
    this.providers = await window.jarvis?.providers?.list() ?? [];
    this.activeProvider = (await window.jarvis?.providers?.getConfig())?.activeProvider ?? 'anthropic';
    this.render();
  }

  render() {
    this.container.innerHTML = '';

    const label = document.createElement('label');
    label.className = 'settings-label';
    label.textContent = 'AI Provider';

    const select = document.createElement('select');
    select.className = 'provider-select';
    select.id = 'provider-select';

    for (const provider of this.providers) {
      const option = document.createElement('option');
      option.value = provider.id;
      option.textContent = provider.name;
      option.selected = provider.id === this.activeProvider;
      if (!provider.configured) {
        option.textContent += ' (not configured)';
      }
      select.appendChild(option);
    }

    select.addEventListener('change', async (e) => {
      const newProvider = e.target.value;
      await window.jarvis?.providers?.setActive(newProvider);
      this.activeProvider = newProvider;
      this.onProviderChange?.(newProvider);
      this.updateModelList(newProvider);
    });

    const row = document.createElement('div');
    row.className = 'settings-row';
    row.appendChild(label);
    row.appendChild(select);
    this.container.appendChild(row);

    this.renderModelSelector();
    this.renderApiKeyFields();
  }

  renderModelSelector() {
    const provider = this.providers.find((p) => p.id === this.activeProvider);
    if (!provider) { return; }

    const label = document.createElement('label');
    label.className = 'settings-label';
    label.textContent = 'Model';

    const select = document.createElement('select');
    select.id = 'model-select';
    select.className = 'model-select';

    for (const model of provider.models) {
      const option = document.createElement('option');
      option.value = model;
      option.textContent = model;
      select.appendChild(option);
    }

    select.addEventListener('change', async (e) => {
      await window.jarvis?.providers?.setModel(this.activeProvider, e.target.value);
    });

    const row = document.createElement('div');
    row.className = 'settings-row';
    row.appendChild(label);
    row.appendChild(select);
    this.container.appendChild(row);
  }

  renderApiKeyFields() {
    for (const provider of this.providers) {
      const label = document.createElement('label');
      label.textContent = `${provider.name} API Key`;
      label.className = 'settings-label';

      const input = document.createElement('input');
      input.type = 'password';
      input.placeholder = `Enter ${provider.name} API key`;
      input.className = 'api-key-input';
      input.dataset.provider = provider.id;

      input.addEventListener('change', async (e) => {
        const key = e.target.value.trim();
        await window.jarvis?.providers?.setApiKey(provider.id, key);
      });

      const row = document.createElement('div');
      row.className = 'settings-row';
      row.appendChild(label);
      row.appendChild(input);
      this.container.appendChild(row);
    }
  }

  updateModelList(providerId) {
    const provider = this.providers.find((p) => p.id === providerId);
    const modelSelect = document.getElementById('model-select');
    if (!provider || !modelSelect) { return; }
    modelSelect.innerHTML = '';
    for (const model of provider.models) {
      const option = document.createElement('option');
      option.value = model;
      option.textContent = model;
      modelSelect.appendChild(option);
    }
  }
}

window.ProviderSelector = ProviderSelector;
