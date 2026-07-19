class FranchiseCarousel extends HTMLElement {
  connectedCallback() {
    this.list = this.querySelector('.franchise-carousel__list');
    this.prevBtn = this.querySelector('.franchise-carousel__nav-btn--prev');
    this.nextBtn = this.querySelector('.franchise-carousel__nav-btn--next');

    if (!this.list) return;

    this.prevBtn?.addEventListener('click', () => this.scrollByCard(-1));
    this.nextBtn?.addEventListener('click', () => this.scrollByCard(1));
    this.list.addEventListener('scroll', () => this.updateNavState(), { passive: true });
    window.addEventListener('resize', () => this.updateNavState());

    this.updateNavState();
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
