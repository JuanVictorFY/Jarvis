'use strict';
class Tooltip {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'tooltip';
    this.el.hidden = true;
    document.body.appendChild(this.el);
  }
  attach(target, text) {
    target.addEventListener('mouseenter', (e) => {
      this.el.textContent = text;
      this.el.hidden = false;
      const r = target.getBoundingClientRect();
      this.el.style.left = `${r.left + r.width / 2}px`;
      this.el.style.top = `${r.top - 30}px`;
    });
    target.addEventListener('mouseleave', () => { this.el.hidden = true; });
  }
}
module.exports = new Tooltip();
