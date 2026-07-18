class CustomSlideshow extends HTMLElement {
  constructor() {
    super();
    this.slides = Array.from(this.querySelectorAll('.custom-slideshow__slide'));
    this.prevButton = this.querySelector('.custom-slideshow__arrow--prev');
    this.nextButton = this.querySelector('.custom-slideshow__arrow--next');
    this.dots = Array.from(this.querySelectorAll('.custom-slideshow__dot'));
    this.counterCurrent = this.querySelector('.custom-slideshow__pagination-current');
    this.playPauseButton = this.querySelector('.custom-slideshow__playpause');

    this.currentIndex = Math.max(
      this.slides.findIndex((slide) => slide.classList.contains('is-active')),
      0
    );
    this.autoplayEnabled = this.dataset.autoplay === 'true';
    this.autoplaySpeed = parseInt(this.dataset.speed, 10) || 5000;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.desktopQuery = window.matchMedia('(min-width: 750px)');

    this.onKeydown = this.onKeydown.bind(this);
  }

  connectedCallback() {
    if (this.slides.length === 0) return;

    if (this.prevButton) this.prevButton.addEventListener('click', () => this.goToSlide(this.currentIndex - 1));
    if (this.nextButton) this.nextButton.addEventListener('click', () => this.goToSlide(this.currentIndex + 1));
    this.dots.forEach((dot) => {
      dot.addEventListener('click', () => this.goToSlide(parseInt(dot.dataset.index, 10)));
    });
    if (this.playPauseButton) {
      this.playPauseButton.addEventListener('click', () => this.toggleAutoplay());
    }

    this.addEventListener('mouseenter', () => this.pauseAutoplayTimer());
    this.addEventListener('mouseleave', () => this.resumeAutoplayTimer());
    this.addEventListener('focusin', () => this.pauseAutoplayTimer());
    this.addEventListener('focusout', () => this.resumeAutoplayTimer());
    this.addEventListener('keydown', this.onKeydown);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAutoplayTimer();
      } else {
        this.resumeAutoplayTimer();
      }
    });

    this.desktopQuery.addEventListener('change', () => this.playActiveVideo());

    this.renderSlide(this.currentIndex);

    if (this.autoplayEnabled && this.slides.length > 1) {
      this.startAutoplayTimer();
    }
  }

  disconnectedCallback() {
    this.pauseAutoplayTimer();
  }

  onKeydown(event) {
    if (event.key === 'ArrowLeft') this.goToSlide(this.currentIndex - 1);
    if (event.key === 'ArrowRight') this.goToSlide(this.currentIndex + 1);
  }

  goToSlide(index) {
    const total = this.slides.length;
    this.currentIndex = ((index % total) + total) % total;
    this.renderSlide(this.currentIndex);
    this.resetAutoplayTimer();
  }

  renderSlide(index) {
    this.slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === index;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      slide.setAttribute('tabindex', '-1');
      this.pauseSlideVideos(slide);
    });

    this.dots.forEach((dot, dotIndex) => {
      dot.setAttribute('aria-current', dotIndex === index ? 'true' : 'false');
    });

    if (this.counterCurrent) this.counterCurrent.textContent = index + 1;

    this.playActiveVideo();
  }

  getActiveVideo() {
    const activeSlide = this.slides[this.currentIndex];
    if (!activeSlide) return null;
    const selector = this.desktopQuery.matches
      ? '.custom-slideshow__media-inner--desktop video'
      : '.custom-slideshow__media-inner--mobile video';
    return activeSlide.querySelector(selector);
  }

  playActiveVideo() {
    if (this.reducedMotion.matches) return;
    const video = this.getActiveVideo();
    if (video) video.play().catch(() => {});
  }

  pauseSlideVideos(slide) {
    slide.querySelectorAll('video').forEach((video) => video.pause());
  }

  startAutoplayTimer() {
    if (this.reducedMotion.matches) return;
    this.stopAutoplayTimer();
    this.autoplayTimer = window.setInterval(() => {
      this.goToSlide(this.currentIndex + 1);
    }, this.autoplaySpeed);
  }

  stopAutoplayTimer() {
    if (this.autoplayTimer) window.clearInterval(this.autoplayTimer);
    this.autoplayTimer = null;
  }

  resetAutoplayTimer() {
    if (this.autoplayEnabled && !this.userPaused) this.startAutoplayTimer();
  }

  pauseAutoplayTimer() {
    this.stopAutoplayTimer();
  }

  resumeAutoplayTimer() {
    if (this.autoplayEnabled && !this.userPaused) this.startAutoplayTimer();
  }

  toggleAutoplay() {
    this.userPaused = !this.userPaused;
    this.playPauseButton.classList.toggle('is-paused', this.userPaused);
    this.playPauseButton.setAttribute('aria-label', this.userPaused ? 'Play slideshow' : 'Pause slideshow');
    if (this.userPaused) {
      this.stopAutoplayTimer();
    } else {
      this.startAutoplayTimer();
    }
  }
}

customElements.define('custom-slideshow', CustomSlideshow);
