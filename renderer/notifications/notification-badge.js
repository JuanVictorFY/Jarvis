'use strict';
class NotificationBadge {
  constructor(el) {
    this.el = el;
    this.count = 0;
  }
  increment() { this.count++; this._update(); }
  reset()     { this.count = 0; this._update(); }
  _update() {
    this.el.textContent = this.count > 0 ? String(this.count > 99 ? '99+' : this.count) : '';
    this.el.hidden = this.count === 0;
  }
}
module.exports = NotificationBadge;
