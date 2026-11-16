/* SmartLifePro · Atelier Motion v2
   Presentation-only. Does not modify Data, Finance, Main, routes, or native bridges.
   Reveals the app after the initial render; motion uses class observation rather
   than replacing application controller functions. */
(function (root) {
  'use strict';
  const doc = root.document;
  if (!doc) return;
  const html = doc.documentElement;
  let ready = false;
  let observer = null;
  let activeId = '';
  let cleanupTimer = 0;
  let pressedTile = null;

  function activate() {
    if (ready) return;
    ready = true;
    // Remove the legacy APK-only home prepaint BEFORE revealing the interface.
    doc.getElementById('smarty-prepaint')?.remove();
    activeId = doc.querySelector('#app-root > .view.active')?.id || '';
    html.classList.add('slp-ui-ready');
    const splash = doc.getElementById('slp-boot-splash');
    if (splash) {
      splash.setAttribute('aria-hidden', 'true');
      cleanupTimer = root.setTimeout(function () {
        splash.remove();
      }, 520);
    }
  }

  function afterInitialPaint() {
    root.requestAnimationFrame(function () {
      root.requestAnimationFrame(activate);
    });
  }

  function routeChanged() {
    if (!ready || doc.hidden) return;
    const next = doc.querySelector('#app-root > .view.active');
    if (!next || next.id === activeId) return;
    activeId = next.id;
    if (root.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    // Only animate navigation to a different view, never DOM data refreshes.
    next.classList.remove('slp-route-enter');
    void next.offsetWidth; // restart the one-shot route animation
    next.classList.add('slp-route-enter');
  }

  function monitorViews() {
    if (observer || !root.MutationObserver) return;
    const views = doc.querySelectorAll('#app-root > .view');
    if (!views.length) return;
    observer = new root.MutationObserver(routeChanged);
    views.forEach(function (view) {
      observer.observe(view, { attributes: true, attributeFilter: ['class'] });
    });
  }

  // Lightweight touch feedback: one light spot per press, no animation loop.
  function onPress(event) {
    const t = event.target?.closest?.('.bento-tile,.sw-home-card,.sw-finance-card,.dock-main-btn,.slp-savings-summary');
    if (!t || !html.classList.contains('slp-ui-ready')) return;
    const bounds = t.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    pressedTile = t;
    t.style.setProperty('--slp-touch-x', ((event.clientX - bounds.left) / bounds.width * 100).toFixed(1) + '%');
    t.style.setProperty('--slp-touch-y', ((event.clientY - bounds.top) / bounds.height * 100).toFixed(1) + '%');
    t.classList.add('slp-liquid-pressed');
  }
  function releasePress() {
    if (pressedTile) pressedTile.classList.remove('slp-liquid-pressed');
    pressedTile = null;
  }

  /* UI-only correction for the shopping/receipt dialogs.
     The receipt photo, scanned items, totals and saved prices are NOT modified.
     Fields are normalized only when newly created, never on each keystroke. */
  function installCompactReceiptUI() {
    const detail = doc.getElementById('modal-list-detail');
    const finish = doc.getElementById('modal-finish-list');
    if (!detail && !finish) return;
    if (doc.getElementById('slp-shopping-comfort-style')) return;

    const style = doc.createElement('style');
    style.id = 'slp-shopping-comfort-style';
    style.textContent = `
      /* The product list gets the majority of the visible dialog. */
      #modal-list-detail > .settings-card {
        box-sizing: border-box !important;
        width: min(96vw, 480px) !important;
        max-width: 480px !important;
        height: min(92dvh, 760px) !important;
        max-height: 92dvh !important;
        padding: 13px 14px !important;
        display: flex !important;
        flex-direction: column !important;
        overflow: hidden !important;
      }
      #modal-finish-list > .settings-card {
        box-sizing: border-box !important;
        width: min(96vw, 480px) !important;
        max-width: 480px !important;
        max-height: 92dvh !important;
        padding: 13px 14px !important;
      }
      #modal-list-detail > .settings-card > div:first-child,
      #modal-finish-list > .settings-card > div:first-child {
        flex: 0 0 auto !important;
        margin-bottom: 6px !important;
      }
      #modal-list-detail #detail-list-title {font-size: 18px !important; line-height: 1.25 !important;}
      #modal-list-detail #detail-items-list,
      #modal-finish-list #finish-items-list {
        flex: 1 1 auto !important;
        min-height: 125px !important;
        overflow-y: auto !important;
        overscroll-behavior: contain;
        -webkit-overflow-scrolling: touch;
        padding: 0 3px 0 0 !important;
        margin-bottom: 5px !important;
      }
      /* Both previous grey cards become compact accounting lines. */
      #modal-list-detail #slp-receipt-detail-summary,
      #modal-list-detail #slp-receipt-paid-box,
      #modal-finish-list #slp-receipt-finish-summary {
        flex: 0 0 auto !important;
        background: transparent !important;
        box-shadow: none !important;
        border: 0 !important;
        border-radius: 0 !important;
        padding: 2px 3px !important;
        margin: 1px 0 !important;
        font-size: 11px !important;
        line-height: 1.3 !important;
      }
      #modal-list-detail #slp-receipt-detail-summary .slp-receipt-row,
      #modal-list-detail #slp-receipt-paid-box .slp-receipt-row,
      #modal-finish-list #slp-receipt-finish-summary .slp-receipt-row {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        min-height: 18px !important;
      }
      #modal-list-detail #slp-receipt-detail-summary .slp-receipt-small,
      #modal-list-detail #slp-receipt-paid-box .slp-receipt-small,
      #modal-finish-list #slp-receipt-finish-summary .slp-receipt-small {
        display: none !important;
      }
      #modal-list-detail #slp-receipt-photo-actions {
        flex: 0 0 auto !important;
        display: flex !important;
        gap: 6px !important;
        margin: 0 0 5px !important;
      }
      #modal-list-detail #slp-receipt-photo-actions > button,
      #modal-list-detail #slp-receipt-photo-actions > label {
        box-sizing: border-box !important;
        flex: 1 1 0 !important;
        min-width: 0 !important;
        min-height: 33px !important;
        padding: 5px 7px !important;
        font-size: 11px !important;
        line-height: 1.25 !important;
        border-radius: 9px !important;
      }
      #modal-list-detail .receipt-row,
      #modal-finish-list #finish-items-list .receipt-row {
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) minmax(95px, 106px) !important;
        grid-template-rows: auto auto;
        gap: 3px 7px !important;
        align-items: center !important;
        padding: 8px 1px !important;
      }
      #modal-list-detail .receipt-row .receipt-name,
      #modal-finish-list .receipt-row .receipt-name {
        min-width: 0 !important;
        overflow-wrap: anywhere;
        grid-column: 1;
        grid-row: 1;
        line-height: 1.3 !important;
        font-size: 13px !important;
      }
      #modal-list-detail .receipt-row .receipt-input,
      #modal-finish-list .receipt-row .receipt-input {
        grid-column: 2;
        grid-row: 1;
        width: 100% !important;
        box-sizing: border-box !important;
        min-width: 0 !important;
        min-height: 39px !important;
        padding: 8px 9px !important;
      }
      #modal-list-detail .receipt-row .slp-receipt-quantity,
      #modal-finish-list .receipt-row .slp-receipt-quantity {
        grid-column: 1;
        grid-row: 2;
        justify-content: flex-start !important;
        margin: 0 !important;
        min-width: 0 !important;
      }
      #modal-list-detail .receipt-row .slp-receipt-line,
      #modal-finish-list .receipt-row .slp-receipt-line {
        grid-column: 2;
        grid-row: 2;
        margin: 0 !important;
        font-size: 10px !important;
        line-height: 1.3 !important;
        overflow-wrap: anywhere;
      }
      /* Android text fields must keep left-to-right decimal caret order.
         The JS below changes type=number to type=text + decimal keyboard. */
      #modal-list-detail input.slp-comfort-decimal,
      #modal-finish-list input.slp-comfort-decimal {
        direction: ltr !important;
        text-align: left !important;
        unicode-bidi: plaintext !important;
        font-variant-numeric: tabular-nums;
        letter-spacing: normal !important;
        font-size: 16px !important;
        font-weight: 750 !important;
        color: var(--text-color) !important;
        background: var(--input-bg, #fff) !important;
        caret-color: var(--primary, #15826b) !important;
        outline-offset: 1px;
      }
      #modal-list-detail input.slp-comfort-decimal:focus,
      #modal-finish-list input.slp-comfort-decimal:focus {
        outline: 2px solid var(--primary, #15826b) !important;
      }
      #modal-list-detail #slp-receipt-paid-input {
        box-sizing: border-box !important;
        width: 98px !important;
        max-width: 45% !important;
        min-height: 34px !important;
        padding: 5px 7px !important;
      }
      #modal-list-detail .receipt-total,
      #modal-finish-list .receipt-total {
        flex: 0 0 auto !important;
        margin-top: 4px !important;
        padding: 3px 0 !important;
        font-size: 12px !important;
      }
      #modal-list-detail .receipt-total + div,
      #modal-finish-list .receipt-total + div {
        flex: 0 0 auto !important;
        margin-top: 6px !important;
      }
      @media (max-width: 360px) {
        #modal-list-detail > .settings-card,
        #modal-finish-list > .settings-card {padding: 11px !important;}
        #modal-list-detail .receipt-row,
        #modal-finish-list #finish-items-list .receipt-row {
          grid-template-columns: minmax(0,1fr) 96px !important;
        }
      }
    `;
    doc.head.appendChild(style);

    const fieldSelector = [
      '#detail-items-list .detail-input',
      '#finish-items-list .receipt-input',
      '#slp-receipt-paid-input',
      '#finish-manual-total',
      '#modal-list-detail .slp-receipt-quantity input',
      '#modal-finish-list .slp-receipt-quantity input'
    ].join(',');

    function prepareFields() {
      // Never overwrite an input's value or caret on input events.
      doc.querySelectorAll(fieldSelector).forEach(function (field) {
        if (field.dataset.slpComfortDecimal === '1') return;
        field.dataset.slpComfortDecimal = '1';
        field.classList.add('slp-comfort-decimal');
        if (field.type === 'number') field.type = 'text';
        field.setAttribute('inputmode', 'decimal');
        field.setAttribute('dir', 'ltr');
        field.setAttribute('autocomplete', 'off');
        field.setAttribute('autocorrect', 'off');
        field.setAttribute('spellcheck', 'false');
        field.addEventListener('focus', function () {
          // Editing a stored price should replace it rather than append digits.
          if (field.classList.contains('receipt-input')) field.select?.();
          root.setTimeout(function () {
            if (doc.activeElement === field) {
              field.scrollIntoView?.({block: 'nearest', inline: 'nearest'});
            }
          }, 180);
        });
      });
    }

    prepareFields();
    if (root.MutationObserver) {
      const watcher = new root.MutationObserver(function (records) {
        // New rows from history/finish/receipt; no reformatting on keystrokes.
        if (records.some(function (record) { return record.addedNodes?.length; })) prepareFields();
      });
      if (detail) watcher.observe(detail, {childList: true, subtree: true});
      if (finish) watcher.observe(finish, {childList: true, subtree: true});
    }
  }

  function init() {
    monitorViews();
    installCompactReceiptUI();
    doc.addEventListener('pointerdown', onPress, { passive: true });
    doc.addEventListener('pointerup', releasePress, { passive: true });
    doc.addEventListener('pointercancel', releasePress, { passive: true });
    if (doc.readyState === 'complete') afterInitialPaint();
    else root.addEventListener('load', afterInitialPaint, { once: true });
    // Safety: even if a script throws during boot, the application stays usable.
    root.setTimeout(activate, 3800);
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
  root.SmartyProMotion = { reveal: activate };
})(window);
