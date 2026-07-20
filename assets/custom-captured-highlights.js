class CapturedHighlights extends HTMLElement {
  connectedCallback() {
    this.list = this.querySelector('.captured-highlights__list');
    if (!this.list) return;

    this.items = Array.from(this.list.children);
    this.prevBtn = this.querySelector('.captured-highlights__nav-btn--prev');
    this.nextBtn = this.querySelector('.captured-highlights__nav-btn--next');
    this.dots = Array.from(this.querySelectorAll('.captured-highlights__dot'));
    this.tabs = Array.from(this.querySelectorAll('.captured-highlights__tab'));
    this.isStatic = this.list.classList.contains('captured-highlights__list--static');
    this.infinite = this.dataset.infinite === 'true';
    this.autoplay = this.dataset.autoplay === 'true';
    this.autoplaySpeed = Number(this.dataset.autoplaySpeed) || 5000;
    this.tabsEnabled = this.dataset.tabsEnabled === 'true';

    this.tabs.forEach((tab) => {
      tab.addEventListener('click', () => this.activateTab(tab.dataset.tab));
    });

    if (this.tabsEnabled) {
      this.activateTab('photo');
    }

    this.querySelectorAll('.captured-highlights__play').forEach((btn) => {
      btn.addEventListener('click', (event) => this.playVideo(event));
    });

    if (this.isStatic) return;

    this.prevBtn?.addEventListener('click', () => this.scrollByCard(-1));
    this.nextBtn?.addEventListener('click', () => this.scrollByCard(1));

    this.dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const item = this.visibleItems()[Number(dot.dataset.index)];
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

  visibleItems() {
    return this.items.filter((item) => !item.hasAttribute('hidden'));
  }

  activateTab(name) {
    this.tabs.forEach((tab) => {
      tab.classList.toggle('is-active', tab.dataset.tab === name);
    });
    this.items.forEach((item) => {
      const matches = item.getAttribute('data-tab-content') === name;
      item.toggleAttribute('hidden', !matches);
    });
    if (this.list) this.list.scrollLeft = 0;
    this.buildDots();
    this.updateNavState();
  }

  buildDots() {
    if (!this.dots.length) return;
    const visible = this.visibleItems();
    this.dots.forEach((dot, index) => {
      dot.style.display = index < visible.length ? '' : 'none';
      dot.classList.toggle('is-active', index === 0);
    });
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
    const visible = this.visibleItems();
    if (!visible.length) return;
    const scrollLeft = this.list.scrollLeft;
    let closestIndex = 0;
    let closestDistance = Infinity;

    visible.forEach((item, index) => {
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
    const item = this.visibleItems()[0];
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

  playVideo(event) {
    const button = event.currentTarget;
    const media = button.closest('.captured-highlights__media');
    const card = button.closest('.captured-highlights__card');
    if (!media || !card) return;

    const videoFile = card.dataset.videoFile;
    const videoUrl = card.dataset.videoUrl;
    let embed = null;

    if (videoFile) {
      embed = document.createElement('video');
      embed.src = videoFile;
      embed.controls = true;
      embed.autoplay = true;
      embed.playsInline = true;
    } else if (videoUrl) {
      const src = this.getEmbedUrl(videoUrl);
      if (src) {
        embed = document.createElement('iframe');
        embed.src = src;
        embed.allow = 'autoplay; fullscreen; picture-in-picture';
        embed.allowFullscreen = true;
      }
    }

    if (!embed) return;

    media.querySelectorAll('img, .captured-highlights__overlay, .captured-highlights__play').forEach((el) => el.remove());
    media.appendChild(embed);
  }

  getEmbedUrl(url) {
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1`;

    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;

    return null;
  }
}

customElements.define('captured-highlights', CapturedHighlights);
