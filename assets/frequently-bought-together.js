if (!customElements.get('frequently-bought-together')) {
  customElements.define(
    'frequently-bought-together',
    class FrequentlyBoughtTogether extends HTMLElement {
      constructor() {
        super();

        this.checkboxes = Array.from(this.querySelectorAll('.frequently-bought-together__checkbox'));
        this.totalElement = this.querySelector('[data-fbt-total]');
        this.addButton = this.querySelector('[data-fbt-add-button]');
        this.buttonLabel = this.querySelector('[data-fbt-button-label]');
        this.spinner = this.querySelector('.loading__spinner');
        this.errorWrapper = this.querySelector('.frequently-bought-together__error-message-wrapper');
        this.errorMessage = this.errorWrapper?.querySelector('.frequently-bought-together__error-message');

        this.currentPriceCents = parseInt(this.totalElement?.dataset.currentPriceCents || '0', 10);
        this.currency = this.dataset.currency;
        this.locale = this.dataset.locale || document.documentElement.lang || 'en';
        this.baseButtonLabel = this.buttonLabel ? this.buttonLabel.textContent.trim() : '';

        this.checkboxes.forEach((checkbox) => {
          checkbox.addEventListener('change', this.updateTotal.bind(this));
        });

        this.addButton?.addEventListener('click', this.onAddButtonClick.bind(this));

        this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');

        this.updateTotal();
      }

      formatMoney(cents) {
        try {
          return new Intl.NumberFormat(this.locale, { style: 'currency', currency: this.currency }).format(
            cents / 100
          );
        } catch (error) {
          return (cents / 100).toFixed(2);
        }
      }

      getCheckedItems() {
        return this.checkboxes.filter((checkbox) => checkbox.checked && !checkbox.disabled);
      }

      updateTotal() {
        const checkedTotal = this.getCheckedItems().reduce(
          (sum, checkbox) => sum + parseInt(checkbox.dataset.priceCents || '0', 10),
          0
        );
        const total = this.currentPriceCents + checkedTotal;

        if (this.totalElement) {
          this.totalElement.textContent = this.formatMoney(total);
        }

        const itemCount = this.getCheckedItems().length + 1;
        if (this.buttonLabel) {
          this.buttonLabel.textContent = this.baseButtonLabel.replace(/\d+/, itemCount);
        }
      }

      handleError(message) {
        if (!this.errorWrapper) return;
        this.errorWrapper.hidden = !message;
        if (this.errorMessage) this.errorMessage.textContent = message || '';
      }

      onAddButtonClick() {
        if (this.addButton.getAttribute('aria-disabled') === 'true') return;

        this.handleError(false);
        this.addButton.setAttribute('aria-disabled', 'true');
        this.addButton.classList.add('loading');
        this.spinner?.classList.remove('hidden');

        const items = [{ id: parseInt(this.addButton.dataset.variantId, 10), quantity: 1 }];
        this.getCheckedItems().forEach((checkbox) => {
          items.push({ id: parseInt(checkbox.dataset.variantId, 10), quantity: 1 });
        });

        const config = fetchConfig('javascript');
        config.headers['X-Requested-With'] = 'XMLHttpRequest';

        const body = { items };
        if (this.cart) {
          body.sections = this.cart.getSectionsToRender().map((section) => section.id);
          body.sections_url = window.location.pathname;
        }
        config.body = JSON.stringify(body);

        fetch(`${routes.cart_add_url}`, config)
          .then((response) => response.json())
          .then((response) => {
            if (response.status) {
              this.handleError(response.description || response.message);
              return;
            }

            if (this.cart) {
              this.cart.renderContents(response);
            } else {
              window.location = window.routes.cart_url;
            }
          })
          .catch(() => {
            this.handleError(window.cartStrings?.error || 'Something went wrong, please try again.');
          })
          .finally(() => {
            this.addButton.classList.remove('loading');
            this.addButton.removeAttribute('aria-disabled');
            this.spinner?.classList.add('hidden');
          });
      }
    }
  );
}
