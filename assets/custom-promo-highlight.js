class PromoHighlight extends HTMLElement {
  connectedCallback() {
    this.querySelectorAll('.promo-highlight__card[data-href]').forEach((card) => {
      card.addEventListener('click', (event) => {
        if (event.target.closest('a, button')) return;
        const href = card.dataset.href;
        if (href) window.location.assign(href);
      });
    });

    this.list = this.querySelector('.promo-highlight__list');
    this.items = this.list ? Array.from(this.list.children) : [];
    this.dots = Array.from(this.querySelectorAll('.promo-highlight__dot'));

    if (!this.list || !this.items.length || !this.dots.length) return;

    this.dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const item = this.items[Number(dot.dataset.index)];
        if (item) this.list.scrollTo({ left: item.offsetLeft, behavior: 'smooth' });
      });
    });

    let ticking = false;
    this.list.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        this.updateActiveDot();
        ticking = false;
      });
    });
  }

  updateActiveDot() {
    const scrollLeft = this.list.scrollLeft;
    let closestIndex = 0;
    let closestDistance = Infinity;

    this.items.forEach((item, index) => {
      const distance = Math.abs(item.offsetLeft - scrollLeft);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    this.dots.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === closestIndex);
    });
  }
}

customElements.define('promo-highlight', PromoHighlight);
