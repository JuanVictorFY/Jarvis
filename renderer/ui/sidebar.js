'use strict';
class Sidebar {
  constructor(el) {
    this.el = el;
    this.open = false;
  }
  toggle() { this.open ? this.hide() : this.show(); }
  show() { this.open = true; this.el.classList.add('sidebar--open'); }
  hide() { this.open = false; this.el.classList.remove('sidebar--open'); }
}
module.exports = Sidebar;
