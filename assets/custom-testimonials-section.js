class TestimonialsCarousel extends HTMLElement {
  connectedCallback() {
    this.list = this.querySelector('.testimonials-carousel__list');
    if (!this.list) return;

    this.items = Array.from(this.list.children);
    this.prevBtn = this.querySelector('.testimonials-carousel__nav-btn--prev');
    this.nextBtn = this.querySelector('.testimonials-carousel__nav-btn--next');
    this.dots = Array.from(this.querySelectorAll('.testimonials-carousel__dot'));
    this.isStatic = this.list.classList.contains('testimonials-carousel__list--static');
    this.infinite = this.dataset.infinite === 'true';
    this.autoplay = this.dataset.autoplay === 'true';
    this.autoplaySpeed = Number(this.dataset.autoplaySpeed) || 5000;

    if (this.isStatic) return;

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

    if (this.autoplay && this.items.length > 1) {
      this.startAutoplay();
      this.addEventListener('mouseenter', () => this.stopAutoplay());
      this.addEventListener('mouseleave', () => this.startAutoplay());
      this.addEventListener('focusin', () => this.stopAutoplay());
      this.addEventListener('focusout', () => this.startAutoplay());
    }
  }

  disconnectedCallback() {
    this.stopAutoplay();
  }

  startAutoplay() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.stopAutoplay();
    this.autoplayTimer = setInterval(() => this.advance(), this.autoplaySpeed);
  }

  stopAutoplay() {
    clearInterval(this.autoplayTimer);
  }

  advance() {
    const { scrollLeft, scrollWidth, clientWidth } = this.list;
    const atEnd = scrollLeft + clientWidth >= scrollWidth - 1;
    if (atEnd) {
      if (this.infinite) this.list.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      this.scrollByCard(1);
    }
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
    const item = this.list.querySelector('.testimonials-carousel__item');
    if (!item) return;
    const gap = parseFloat(getComputedStyle(this.list).columnGap || getComputedStyle(this.list).gap || 0);
    const distance = item.getBoundingClientRect().width + gap;
    const { scrollLeft, scrollWidth, clientWidth } = this.list;

    if (direction > 0 && scrollLeft + clientWidth >= scrollWidth - 1 && this.infinite) {
      this.list.scrollTo({ left: 0, behavior: 'smooth' });
      return;
    }
    if (direction < 0 && scrollLeft <= 1 && this.infinite) {
      this.list.scrollTo({ left: scrollWidth, behavior: 'smooth' });
      return;
    }
    this.list.scrollBy({ left: distance * direction, behavior: 'smooth' });
  }

  updateNavState() {
    if (!this.prevBtn || !this.nextBtn) return;

    if (this.infinite) {
      this.prevBtn.classList.remove('is-disabled');
      this.prevBtn.disabled = false;
      this.nextBtn.classList.remove('is-disabled');
      this.nextBtn.disabled = false;
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = this.list;
    const atStart = scrollLeft <= 1;
    const atEnd = scrollLeft + clientWidth >= scrollWidth - 1;

    this.prevBtn.classList.toggle('is-disabled', atStart);
    this.prevBtn.disabled = atStart;
    this.nextBtn.classList.toggle('is-disabled', atEnd);
    this.nextBtn.disabled = atEnd;
  }
}

customElements.define('testimonials-carousel', TestimonialsCarousel);
