'use strict';
const errorToast = require('./error-toast');

window.addEventListener('error', (event) => {
  console.error('[GlobalError]', event.error);
  errorToast.show(event.error?.message || 'Unknown error');
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[UnhandledRejection]', event.reason);
  errorToast.show(event.reason?.message || 'Promise rejected');
  event.preventDefault();
});
// stable
