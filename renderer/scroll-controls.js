'use strict';

class ScrollControls {
  constructor(scrollContainer) {
    this.container = scrollContainer;
    this.fab = null;
    this.autoScroll = true;
    this.lastScrollTop = 0;
    this.unreadCount = 0;
    this.observer = null;
  }

  mount() {
    this.fab = document.createElement('button');
    this.fab.id = 'scroll-to-bottom';
    this.fab.className = 'scroll-fab hidden';
    this.fab.title = 'Scroll to bottom';
    this.fab.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
      <span class="scroll-fab-badge hidden">0</span>
    `;

    document.body.appendChild(this.fab);
    this.fab.addEventListener('click', () => this.scrollToBottom(true));

    this.container.addEventListener('scroll', () => this.onScroll());
    this.setupMutationObserver();
  }

  onScroll() {
    const { scrollTop, scrollHeight, clientHeight } = this.container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const isNearBottom = distanceFromBottom < 80;

    this.autoScroll = isNearBottom;

    if (isNearBottom) {
      this.hideFab();
      this.unreadCount = 0;
    } else {
      this.showFab();
    }

    this.lastScrollTop = scrollTop;
  }

  setupMutationObserver() {
    this.observer = new MutationObserver(() => {
      if (this.autoScroll) {
        this.scrollToBottom(false);
      } else {
        this.unreadCount++;
        this.updateBadge();
      }
    });

    this.observer.observe(this.container, { childList: true, subtree: true });
  }

  scrollToBottom(smooth = true) {
    this.container.scrollTo({
      top: this.container.scrollHeight,
      behavior: smooth ? 'smooth' : 'instant',
    });
    this.unreadCount = 0;
    this.updateBadge();
  }

  showFab() {
    this.fab.classList.remove('hidden');
  }

  hideFab() {
    this.fab.classList.add('hidden');
  }

  updateBadge() {
    const badge = this.fab.querySelector('.scroll-fab-badge');
    if (badge) {
      badge.textContent = this.unreadCount > 99 ? '99+' : String(this.unreadCount);
      badge.classList.toggle('hidden', this.unreadCount === 0);
    }
  }

  destroy() {
    this.observer?.disconnect();
    this.fab?.remove();
  }
}

window.ScrollControls = ScrollControls;
