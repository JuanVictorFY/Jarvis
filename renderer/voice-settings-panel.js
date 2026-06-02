'use strict';

class VoiceSettingsPanel {
  constructor() {
    this.panel = null;
    this.supportedLanguages = [
      { code: 'en-US', name: 'English (US)' },
      { code: 'en-GB', name: 'English (UK)' },
      { code: 'es-ES', name: 'Español (España)' },
      { code: 'es-MX', name: 'Español (México)' },
      { code: 'fr-FR', name: 'Français' },
      { code: 'de-DE', name: 'Deutsch' },
      { code: 'pt-BR', name: 'Português (Brasil)' },
    ];
  }

  render(container, currentConfig, onSave) {
    const section = document.createElement('div');
    section.className = 'settings-section';
    section.innerHTML = `
      <h3 class="settings-section-title">Voice Recognition</h3>

      <label class="settings-row">
        <span class="settings-label">Enable voice input</span>
        <input type="checkbox" id="voice-enabled" ${currentConfig.enabled ? 'checked' : ''} />
      </label>

      <label class="settings-row">
        <span class="settings-label">Language</span>
        <select id="voice-language">
          ${this.supportedLanguages
            .map(
              (l) =>
                `<option value="${l.code}" ${currentConfig.language === l.code ? 'selected' : ''}>${l.name}</option>`
            )
            .join('')}
        </select>
      </label>

      <label class="settings-row">
        <span class="settings-label">Mode</span>
        <select id="voice-mode">
          <option value="manual" ${currentConfig.mode === 'manual' ? 'selected' : ''}>Manual (click button)</option>
          <option value="push-to-talk" ${currentConfig.mode === 'push-to-talk' ? 'selected' : ''}>Push to talk (hold V)</option>
          <option value="continuous" ${currentConfig.mode === 'continuous' ? 'selected' : ''}>Continuous</option>
        </select>
      </label>

      <label class="settings-row">
        <span class="settings-label">Silence timeout (ms)</span>
        <input type="number" id="voice-silence-timeout" value="${currentConfig.silenceTimeoutMs}"
               min="500" max="10000" step="500" />
      </label>

      <button id="voice-save-btn" class="settings-btn-primary">Save voice settings</button>
    `;

    container.appendChild(section);

    section.querySelector('#voice-save-btn').addEventListener('click', () => {
      const config = {
        enabled: section.querySelector('#voice-enabled').checked,
        language: section.querySelector('#voice-language').value,
        mode: section.querySelector('#voice-mode').value,
        silenceTimeoutMs: parseInt(section.querySelector('#voice-silence-timeout').value, 10),
      };
      onSave(config);
    });

    this.panel = section;
  }

  destroy() {
    this.panel?.remove();
    this.panel = null;
  }
}

window.VoiceSettingsPanel = VoiceSettingsPanel;
