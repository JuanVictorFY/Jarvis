'use strict';

class MessageSearch {
  constructor(messagesContainer) {
    this.container = messagesContainer;
    this.searchBar = null;
    this.input = null;
    this.results = [];
    this.currentIndex = -1;
    this.isOpen = false;
    this.highlights = [];
  }

  open() {
    if (this.isOpen) {
      this.input?.focus();
      return;
    }
    this.isOpen = true;

    this.searchBar = document.createElement('div');
    this.searchBar.className = 'search-bar anim-fade-in-down';
    this.searchBar.innerHTML = `
      <input type="text" class="search-input" placeholder="Search messages..." autocomplete="off" />
      <span class="search-count"></span>
      <button class="search-nav-btn" id="search-prev" title="Previous (Shift+Enter)">↑</button>
      <button class="search-nav-btn" id="search-next" title="Next (Enter)">↓</button>
      <button class="search-close-btn" id="search-close" title="Close (Escape)">✕</button>
    `;

    document.body.prepend(this.searchBar);

    this.input = this.searchBar.querySelector('.search-input');
    this.input.addEventListener('input', () => this.search(this.input.value));
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.shiftKey ? this.prev() : this.next();
      } else if (e.key === 'Escape') {
        this.close();
      }
    });
    this.input.focus();

    this.searchBar.querySelector('#search-prev').addEventListener('click', () => this.prev());
    this.searchBar.querySelector('#search-next').addEventListener('click', () => this.next());
    this.searchBar.querySelector('#search-close').addEventListener('click', () => this.close());
  }

  close() {
    this.clearHighlights();
    this.searchBar?.remove();
    this.searchBar = null;
    this.input = null;
    this.results = [];
    this.currentIndex = -1;
    this.isOpen = false;
  }

  search(query) {
    this.clearHighlights();
    if (!query.trim()) {
      this.updateCount(0, 0);
      return;
    }

    const messages = this.container.querySelectorAll('.message-text, .message-content');
    this.results = [];

    messages.forEach((el) => {
      const text = el.textContent ?? '';
      if (text.toLowerCase().includes(query.toLowerCase())) {
        this.results.push(el);
        this.highlight(el, query);
      }
    });

    this.currentIndex = this.results.length > 0 ? 0 : -1;
    this.scrollToCurrent();
    this.updateCount(this.currentIndex + 1, this.results.length);
  }

  highlight(el, query) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) { textNodes.push(node); }

    textNodes.forEach((textNode) => {
      const text = textNode.textContent;
      const lowerText = text.toLowerCase();
      const lowerQuery = query.toLowerCase();
      const idx = lowerText.indexOf(lowerQuery);
      if (idx === -1) { return; }

      const mark = document.createElement('mark');
      mark.className = 'search-highlight';
      const range = document.createRange();
      range.setStart(textNode, idx);
      range.setEnd(textNode, idx + query.length);
      range.surroundContents(mark);
      this.highlights.push(mark);
    });
  }

  clearHighlights() {
    this.highlights.forEach((mark) => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent ?? ''), mark);
        parent.normalize();
      }
    });
    this.highlights = [];
  }

  next() {
    if (this.results.length === 0) { return; }
    this.currentIndex = (this.currentIndex + 1) % this.results.length;
    this.scrollToCurrent();
    this.updateCount(this.currentIndex + 1, this.results.length);
  }

  prev() {
    if (this.results.length === 0) { return; }
    this.currentIndex = (this.currentIndex - 1 + this.results.length) % this.results.length;
    this.scrollToCurrent();
    this.updateCount(this.currentIndex + 1, this.results.length);
  }

  scrollToCurrent() {
    this.results.forEach((el, i) => {
      el.classList.toggle('search-result-active', i === this.currentIndex);
    });
    this.results[this.currentIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  updateCount(current, total) {
    const countEl = this.searchBar?.querySelector('.search-count');
    if (countEl) {
      countEl.textContent = total === 0 ? 'No results' : `${current} / ${total}`;
    }
  }
}

window.MessageSearch = MessageSearch;
