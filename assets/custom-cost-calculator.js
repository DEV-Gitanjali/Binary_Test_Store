document.addEventListener('submit', function (event) {
  const form = event.target;
  if (!form.classList || !form.classList.contains('cost-calc__form')) return;

  const fields = form.querySelectorAll('[data-error-message]');
  let firstInvalid = null;

  fields.forEach((field) => {
    const message = field.dataset.errorMessage;
    if (message) {
      if (!field.validity.valid) {
        field.setCustomValidity(message);
        if (!firstInvalid) firstInvalid = field;
      } else {
        field.setCustomValidity('');
      }
    }
  });

  if (firstInvalid) {
    event.preventDefault();
    firstInvalid.reportValidity();
    return;
  }

  if (!form.hasAttribute('data-cost-calc-form')) return;

  event.preventDefault();

  const submitBtn = form.querySelector('[data-cost-calc-submit]');
  const messageBox = form.querySelector('[data-form-message]');

  if (submitBtn) submitBtn.classList.add('is-loading');
  if (messageBox) {
    messageBox.hidden = true;
    messageBox.classList.remove('cost-calc__message--success', 'cost-calc__message--error');
  }

  fetch(form.action, {
    method: form.method || 'post',
    body: new FormData(form),
  })
    .then((response) => {
      if (!response.ok) throw new Error('Request failed');
      if (messageBox) {
        messageBox.textContent = form.dataset.successMessage;
        messageBox.classList.add('cost-calc__message--success');
        messageBox.hidden = false;
      }
      form.reset();
    })
    .catch(() => {
      if (messageBox) {
        messageBox.textContent = form.dataset.errorMessage;
        messageBox.classList.add('cost-calc__message--error');
        messageBox.hidden = false;
      }
    })
    .finally(() => {
      if (submitBtn) submitBtn.classList.remove('is-loading');
    });
});
