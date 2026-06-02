'use strict';
class NotificationCenter {
  constructor(container) {
    this.container = container;
    this.items = [];
  }
  add(n) {
    this.items.unshift(n);
    if (this.items.length > 50) this.items.pop();
    this.render();
  }
  render() {
    this.container.innerHTML = this.items.map(n =>
      `<div class="notif notif--${n.type}">
        <span class="notif-title">${n.title}</span>
        <span class="notif-body">${n.body}</span>
      </div>`
    ).join('');
  }
}
module.exports = NotificationCenter;
// patch 1
// patch 2
// patch 3
