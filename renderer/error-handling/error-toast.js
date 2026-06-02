'use strict';
class ErrorToast {
  constructor() {
    this.queue = [];
    this.el = null;
  }
  init() {
    this.el = document.createElement('div');
    this.el.className = 'error-toast-container';
    document.body.appendChild(this.el);
  }
  show(message, level = 'error') {
    const toast = document.createElement('div');
    toast.className = `error-toast error-toast--${level}`;
    toast.textContent = message;
    this.el.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }
}
module.exports = new ErrorToast();
// v2
