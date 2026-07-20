class FranchiseCarousel extends HTMLElement {
  connectedCallback() {
    this.list = this.querySelector('.franchise-carousel__list');
    this.prevBtn = this.querySelector('.franchise-carousel__nav-btn--prev');
    this.nextBtn = this.querySelector('.franchise-carousel__nav-btn--next');
    this.items = this.list ? Array.from(this.list.children) : [];
    this.dots = Array.from(this.querySelectorAll('.franchise-carousel__dot'));

    if (!this.list) return;

    this.prevBtn?.addEventListener('click', () => this.scrollByCard(-1));
    this.nextBtn?.addEventListener('click', () => this.scrollByCard(1));

    this.dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const item = this.items[Number(dot.dataset.index)];
        if (item) this.list.scrollTo({ left: item.offsetLeft, behavior: 'smooth' });
      });
    });

    let ticking = false;
    this.list.addEventListener(
      'scroll',
      () => {
        this.updateNavState();
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          this.updateActiveDot();
          ticking = false;
        });
      },
      { passive: true }
    );
    window.addEventListener('resize', () => this.updateNavState());

    this.updateNavState();
    this.updateActiveDot();
  }

  updateActiveDot() {
    if (!this.dots.length) return;
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

  scrollByCard(direction) {
    const item = this.list.querySelector('.franchise-carousel__item');
    if (!item) return;
    const gap = parseFloat(getComputedStyle(this.list).columnGap || getComputedStyle(this.list).gap || 0);
    const distance = item.getBoundingClientRect().width + gap;
    this.list.scrollBy({ left: distance * direction, behavior: 'smooth' });
  }

  updateNavState() {
    if (!this.prevBtn || !this.nextBtn) return;
    const { scrollLeft, scrollWidth, clientWidth } = this.list;
    const atStart = scrollLeft <= 1;
    const atEnd = scrollLeft + clientWidth >= scrollWidth - 1;

    this.prevBtn.classList.toggle('is-disabled', atStart);
    this.prevBtn.disabled = atStart;
    this.nextBtn.classList.toggle('is-disabled', atEnd);
    this.nextBtn.disabled = atEnd;
  }
}

customElements.define('franchise-carousel', FranchiseCarousel);
