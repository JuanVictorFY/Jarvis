'use strict';
class ImagePreview {
  constructor(container) {
    this.container = container;
    this.images = [];
  }
  add(dataUrl, name) {
    this.images.push({ dataUrl, name });
    this.render();
  }
  remove(index) {
    this.images.splice(index, 1);
    this.render();
  }
  render() {
    this.container.innerHTML = this.images.map((img, i) => `
      <div class="img-preview-item">
        <img src="${img.dataUrl}" alt="${img.name}">
        <button class="img-remove" data-index="${i}">×</button>
      </div>`).join('');
    this.container.querySelectorAll('.img-remove').forEach(btn =>
      btn.addEventListener('click', () => this.remove(Number(btn.dataset.index)))
    );
  }
  getAll() { return [...this.images]; }
}
module.exports = ImagePreview;
