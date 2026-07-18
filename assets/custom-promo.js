class PromoCards extends HTMLElement {
  connectedCallback() {
    this.querySelectorAll('.promo-card[data-href]').forEach((card) => {
      card.addEventListener('click', (event) => {
        if (event.target.closest('a, button')) return;
        const href = card.dataset.href;
        if (href) window.location.assign(href);
      });
    });
  }
}

customElements.define('promo-cards', PromoCards);
