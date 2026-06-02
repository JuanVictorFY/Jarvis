'use strict';
class ErrorBoundary {
  constructor(container) {
    this.container = container;
    this.errors = [];
  }
  catch(err) {
    this.errors.push({ time: Date.now(), message: err.message, stack: err.stack });
    this.render();
  }
  render() {
    const last = this.errors[this.errors.length - 1];
    this.container.innerHTML = `<div class="error-boundary"><p>${last.message}</p></div>`;
  }
}
module.exports = ErrorBoundary;
