class ServicesGrid extends HTMLElement {
  connectedCallback() {
    this.querySelectorAll('.services-grid__card[data-href]').forEach((card) => {
      card.addEventListener('click', (event) => {
        if (event.target.closest('a, button')) return;
        const href = card.dataset.href;
        if (href) window.location.assign(href);
      });
    });
  }
}

customElements.define('services-grid', ServicesGrid);
