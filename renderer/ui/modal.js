'use strict';
class Modal {
  constructor(templateId) {
    this.template = document.getElementById(templateId);
    this.overlay = null;
  }
  open(data = {}) {
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    const content = this.template.content.cloneNode(true);
    this.overlay.appendChild(content);
    document.body.appendChild(this.overlay);
    this.overlay.addEventListener('click', (e) => { if (e.target === this.overlay) this.close(); });
    return this.overlay;
  }
  close() { this.overlay?.remove(); this.overlay = null; }
}
module.exports = Modal;
