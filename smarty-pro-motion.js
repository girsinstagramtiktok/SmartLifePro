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

  /* SmartLifePro · Inicio adaptable + modo oscuro coherente + Ajustes iOS.
     No sustituye datos, funciones de Smarty ni handlers de tarjetas. */
  function installHomeAndSettingsFixes() {
    // Compatibilidad con WebViews antiguas y los mocks ligeros de pruebas.
    if (!doc.createElement || !doc.head || !doc.body) return;
    if (doc.getElementById('slp-home-settings-fix-v3')) return;
    const style = doc.createElement('style');
    style.id = 'slp-home-settings-fix-v3';
    style.textContent = `
      /* El perfil ya está en la mascota de la cabecera; el chat tiene botón propio. */
      #view-home.bento-home .slp-profile-shortcut,
      #view-home.bento-home .slp-classic-mini-mark {display:none!important}
      #view-home.bento-home.slp-home-circular .slp-classic-only{display:none!important}
      #view-home.bento-home.slp-home-classic .slp-circular-only{display:none!important}

      /* Mantener la vista completa entre cabecera y dock, sin que las tarjetas queden debajo. */
      #view-home.bento-home.active {
        height:100%!important;min-height:0!important;box-sizing:border-box!important;
        display:flex!important;flex-direction:column!important;overflow:hidden!important;
      }
      #app-root > #view-home.bento-home:not(.active){display:none!important}
      #view-home.bento-home .slp-ref-header {
        flex:0 0 61px!important;min-height:61px!important;height:61px!important;
        padding:calc(6px + env(safe-area-inset-top)) 12px 6px!important;
        gap:6px!important;
      }
      #view-home.bento-home .slp-ref-header .bento-header-actions{gap:5px!important}
      #view-home.bento-home .slp-ref-header .bento-round-icon{
        width:38px!important;height:38px!important;flex:0 0 38px!important;
        border-radius:50%!important;padding:8px!important;
      }
      #view-home.bento-home .slp-ref-header .bento-mascot {
        width:43px!important;height:43px!important;flex:0 0 43px!important;
        border-radius:50%!important;
      }
      #view-home.bento-home .slp-ref-header .bento-brand strong{font-size:18px!important}
      #view-home.bento-home .slp-ref-content{
        box-sizing:border-box!important;flex:1 1 0!important;min-height:0!important;
        overflow-y:hidden!important;overflow-x:hidden!important;
        padding:4px 11px calc(76px + env(safe-area-inset-bottom))!important;
        gap:7px!important;align-content:start!important;
      }
      #app-root:has(#view-home.active.bento-home) .bottom-dock{
        bottom:calc(8px + env(safe-area-inset-bottom))!important;
        left:11px!important;right:11px!important;height:62px!important;
        border-radius:23px!important;
      }
      #app-root:has(#view-home.active.bento-home) .bottom-dock .dock-main-btn{
        height:66px!important;width:49px!important;border-radius:17px!important;
      }
      /* Las secciones siempre tienen encabezado, tarjetas y scroll horizontal propios. */
      #view-home.bento-home .bento-wallet,
      #view-home.bento-home .bento-categories {
        min-height:0!important;min-width:0!important;box-sizing:border-box!important;
        display:flex!important;flex-direction:column!important;gap:5px!important;
        margin:0!important;overflow:hidden!important;
      }
      #view-home.bento-home .bento-section-head{
        min-height:20px!important;height:20px!important;flex:0 0 20px!important;
        align-items:center!important;padding:0 1px!important;
      }
      #view-home.bento-home .bento-section-head h2{
        font-size:15px!important;line-height:1.15!important;letter-spacing:-.4px!important;
      }
      #view-home.bento-home .bento-wallet-items {
        display:flex!important;flex:1 1 auto!important;min-height:0!important;
        height:auto!important;overflow-x:auto!important;overflow-y:hidden!important;
        padding:2px 2px 3px!important;gap:8px!important;
        scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch;
      }
      #view-home.bento-home .sw-home-card {
        box-sizing:border-box!important;min-height:0!important;max-height:none!important;
        height:100%!important;width:57%!important;min-width:154px!important;
        max-width:190px!important;flex:0 0 57%!important;
        padding:9px 11px!important;gap:2px!important;
        border-radius:19px!important;scroll-snap-align:start;
      }
      #view-home.bento-home .sw-home-card .sw-banklogo{
        width:29px!important;height:29px!important;flex:0 0 29px!important;
        border-radius:9px!important;
      }
      #view-home.bento-home .sw-home-card-name{font-size:11px!important;line-height:1.14!important}
      #view-home.bento-home .sw-home-totals{gap:2px!important}
      #view-home.bento-home .sw-home-totals small{font-size:9px!important}
      #view-home.bento-home .sw-home-totals strong{
        font-size:13px!important;line-height:1.08!important;
        white-space:nowrap!important;overflow:hidden;text-overflow:ellipsis;
      }
      #view-home.bento-home .bento-categories{padding:0!important}
      #view-home.bento-home .bento-category-grid{
        display:grid!important;min-height:0!important;flex:1 1 0!important;
        grid-template-columns:repeat(2,minmax(0,1fr))!important;
        grid-template-rows:repeat(2,minmax(0,1fr))!important;
        gap:6px!important;
      }
      #view-home.bento-home .bento-category-pill{
        min-height:0!important;padding:4px 8px!important;border-radius:16px!important;
      }
      #view-home.bento-home .bento-cat-left{font-size:10px!important;gap:4px!important}
      #view-home.bento-home .bento-category-pill strong{font-size:17px!important}

      /* CIRCULAR: anillo menor y dos indicadores circulares, no óvalos. */
      #view-home.bento-home.slp-home-circular .slp-ref-content{
        display:grid!important;grid-template-columns:minmax(0,1fr)!important;
        grid-template-rows:199px 98px 137px 118px!important;
      }
      #view-home.bento-home.slp-home-circular .slp-ref-hero{
        min-height:0!important;max-height:199px!important;
        padding:0!important;gap:0!important;
      }
      #view-home.bento-home.slp-home-circular .slp-ref-ring {
        width:159px!important;min-width:0!important;max-width:159px!important;
        height:159px!important;aspect-ratio:1!important;
        margin:0 auto!important;flex:0 0 159px!important;
      }
      #view-home.bento-home.slp-home-circular .slp-ref-ring-center{
        inset:20px!important;gap:0!important;
      }
      #view-home.bento-home.slp-home-circular .slp-ref-percent {
        font-size:37px!important;line-height:1!important;letter-spacing:-1px!important;
      }
      #view-home.bento-home.slp-home-circular .slp-ref-percent-caption{
        font-size:9px!important;line-height:1.15!important;
      }
      #view-home.bento-home.slp-home-circular .slp-ref-remaining-caption{
        margin-top:7px!important;font-size:9px!important;line-height:1!important;
      }
      #view-home.bento-home.slp-home-circular .slp-ref-remaining{
        font-size:16px!important;line-height:1.1!important;
        white-space:nowrap!important;overflow:visible!important;
        overflow-wrap:normal!important;
      }
      #view-home.bento-home.slp-home-circular .slp-ref-total{
        min-height:23px!important;height:23px!important;
        margin:6px 0 0!important;padding:3px 10px!important;font-size:10px!important;
        border-radius:13px!important;
      }
      #view-home.bento-home.slp-home-circular .slp-ref-total strong{font-size:11px!important}
      #view-home.bento-home.slp-home-circular .slp-ref-month{
        margin:3px 0 0!important;font-size:10px!important;line-height:1.1!important;
      }
      #view-home.bento-home.slp-home-circular .slp-ref-stats{
        display:flex!important;align-items:center!important;justify-content:space-evenly!important;
        gap:9px!important;min-height:0!important;
      }
      #view-home.bento-home.slp-home-circular .slp-ref-stat{
        box-sizing:border-box!important;width:94px!important;height:94px!important;
        min-height:94px!important;max-height:94px!important;
        flex:0 0 94px!important;aspect-ratio:1!important;
        border-radius:50%!important;
        padding:8px 7px!important;gap:1px!important;
        align-items:center!important;justify-content:center!important;
        text-align:center!important;
      }
      #view-home.bento-home.slp-home-circular .slp-ref-stat svg{
        width:16px!important;height:16px!important;
      }
      #view-home.bento-home.slp-home-circular .slp-ref-stat-label{
        font-size:9px!important;line-height:1.1!important;
      }
      #view-home.bento-home.slp-home-circular .slp-ref-stat strong{
        font-size:16px!important;line-height:1.08!important;
        white-space:normal!important;max-width:100%!important;
        overflow-wrap:anywhere!important;letter-spacing:-.5px!important;
      }
      #view-home.bento-home.slp-home-circular .bento-wallet{
        height:137px!important;padding:0!important;background:transparent!important;border:0!important;
      }
      #view-home.bento-home.slp-home-circular .bento-categories{
        height:118px!important;min-height:0!important;
      }

      /* BENTO: cuatro bloques enteros, banco y categorías sin taparse. */
      #view-home.bento-home.slp-home-classic .slp-ref-content{
        display:grid!important;grid-template-columns:minmax(0,1fr)!important;
        grid-template-rows:66px 183px 27px 149px 111px!important;
        gap:7px!important;
      }
      #view-home.bento-home.slp-home-classic .bento-intro{
        min-height:0!important;max-height:none!important;height:66px!important;
        padding:0 1px!important;
      }
      #view-home.bento-home.slp-home-classic .bento-intro h1{
        font-size:24px!important;line-height:1.04!important;
        letter-spacing:-1px!important;margin:0 0 2px!important;
      }
      #view-home.bento-home.slp-home-classic .bento-intro p{
        font-size:10px!important;line-height:1.15!important;
      }
      #view-home.bento-home.slp-home-classic .bento-metrics{
        width:100%!important;height:183px!important;min-height:0!important;
        max-height:183px!important;overflow:visible!important;
        display:grid!important;grid-template-rows:1.13fr .87fr!important;
        gap:7px!important;
      }
      #view-home.bento-home.slp-home-classic .bento-tile{
        box-sizing:border-box!important;padding:10px 12px!important;
        min-height:0!important;border-radius:20px!important;
      }
      #view-home.bento-home.slp-home-classic .bento-amount,
      #view-home.bento-home.slp-home-classic .bento-main-amount{
        font-size:clamp(19px,5.8vw,27px)!important;letter-spacing:-.6px!important;
      }
      #view-home.bento-home.slp-home-classic .bento-percent-number{
        font-size:44px!important;letter-spacing:-1.6px!important;
      }
      #view-home.bento-home.slp-home-classic .bento-helper{
        font-size:9px!important;line-height:1.13!important;
      }
      #view-home.bento-home.slp-home-classic .bento-budget-row{
        height:27px!important;min-height:27px!important;max-height:27px!important;
        padding:4px 11px!important;font-size:11px!important;
      }
      #view-home.bento-home.slp-home-classic .bento-wallet{
        height:149px!important;min-height:0!important;padding:0!important;
        background:transparent!important;border:0!important;
      }
      #view-home.bento-home.slp-home-classic .bento-categories{
        height:111px!important;min-height:0!important;
      }

      /* Compactación adicional en teléfonos con menor alto disponible. */
      @media (max-height:740px){
        #view-home.bento-home .slp-ref-header{
          height:55px!important;min-height:55px!important;flex-basis:55px!important;
        }
        #view-home.bento-home .slp-ref-content{
          padding-bottom:calc(69px + env(safe-area-inset-bottom))!important;gap:5px!important;
        }
        #app-root:has(#view-home.active.bento-home) .bottom-dock{height:57px!important}
        #view-home.bento-home.slp-home-circular .slp-ref-content{
          grid-template-rows:168px 81px 116px 99px!important;
        }
        #view-home.bento-home.slp-home-circular .slp-ref-hero{max-height:168px!important}
        #view-home.bento-home.slp-home-circular .slp-ref-ring{
          width:132px!important;height:132px!important;flex-basis:132px!important;
        }
        #view-home.bento-home.slp-home-circular .slp-ref-ring-center{inset:15px!important}
        #view-home.bento-home.slp-home-circular .slp-ref-percent{font-size:32px!important}
        #view-home.bento-home.slp-home-circular .slp-ref-remaining{font-size:14px!important}
        #view-home.bento-home.slp-home-circular .slp-ref-total{margin-top:4px!important}
        #view-home.bento-home.slp-home-circular .slp-ref-stat{
          width:78px!important;height:78px!important;min-height:78px!important;
          max-height:78px!important;flex-basis:78px!important;padding:5px!important;
        }
        #view-home.bento-home.slp-home-circular .slp-ref-stat svg{width:13px!important;height:13px!important}
        #view-home.bento-home.slp-home-circular .slp-ref-stat strong{font-size:13px!important}
        #view-home.bento-home.slp-home-circular .slp-ref-stat-label{font-size:8px!important}
        #view-home.bento-home.slp-home-circular .bento-wallet{height:116px!important}
        #view-home.bento-home.slp-home-circular .bento-categories{height:99px!important}
        #view-home.bento-home.slp-home-classic .slp-ref-content{
          grid-template-rows:50px 157px 25px 132px 98px!important;
        }
        #view-home.bento-home.slp-home-classic .bento-intro{height:50px!important}
        #view-home.bento-home.slp-home-classic .bento-intro h1{font-size:21px!important}
        #view-home.bento-home.slp-home-classic .bento-metrics{
          height:157px!important;max-height:157px!important;
        }
        #view-home.bento-home.slp-home-classic .bento-tile{padding:8px 10px!important}
        #view-home.bento-home.slp-home-classic .bento-percent-number{font-size:36px!important}
        #view-home.bento-home.slp-home-classic .bento-wallet{height:132px!important}
        #view-home.bento-home.slp-home-classic .bento-categories{height:99px!important}
      }
      /* En pantallas excepcionalmente bajas se prioriza accesibilidad sobre corte de contenido. */
      @media (max-height:580px){
        #view-home.bento-home .slp-ref-content{overflow-y:auto!important;overscroll-behavior:contain}
      }

      /* MODO OSCURO GLOBAL: las paletas claras se aplicaban por estilos inline.
         Estos tokens importantes restauran fondo, tarjetas, navegación y diálogos. */
      body.dark-mode,
      body.dark-mode #app-root,
      body.dark-mode #view-home.bento-home,
      body.dark-mode .slp-ref-sheet,
      body.dark-mode .modal-overlay .settings-card {
        --b-bg:#0d1420!important;--b-ink:#ecf3fc!important;
        --b-muted:#a5b6c9!important;--b-balance:#1c2b3e!important;
        --b-balance-ink:#f5f8ff!important;--b-percent:#6050cd!important;
        --b-percent-ink:#ffffff!important;--b-spent:#195344!important;
        --b-spent-ink:#effffa!important;--b-daily:#343247!important;
        --b-daily-ink:#ffeaf3!important;--b-budget:#26374a!important;
        --b-chart:#182436!important;--b-cat-a:#254139!important;
        --b-cat-b:#343151!important;--b-cat-c:#453629!important;
        --b-cat-d:#46303d!important;--b-nav:#111d2d!important;
        --b-nav-ink:#edf6ff!important;--b-plus:#426bff!important;
        --b-accent:#5ecfb2!important;
        --primary:#5ecfb2!important;--bg-body:#0d1420!important;
        --text-color:#ecf3fc!important;--text-sec:#a5b6c9!important;
        --glass-bg:#182436!important;--item-bg:#1c2b3e!important;
        --input-bg:#26374a!important;--sheet-bg:#182436!important;
        --dock-bg:#111d2d!important;--glass-border:rgba(208,224,244,.12)!important;
        --sp-ink:#edf4ff!important;--sp-muted:#a5b6c9!important;
        --sp-surface:#182436!important;--sp-surface-alt:#26374a!important;
        --sp-stroke:rgba(207,225,247,.13)!important;
        --sp-stroke-strong:rgba(207,225,247,.2)!important;
        --sp-shadow:0 5px 18px rgba(0,0,0,.25)!important;
        --slp-surface:#182436!important;
        color-scheme:dark;
      }
      body.dark-mode{background:#0d1420!important}
      body.dark-mode #bg-layer{background:#0d1420!important}
      body.dark-mode #app-root,
      body.dark-mode #app-root > .view,
      body.dark-mode #view-home.bento-home{
        background:#0d1420!important;color:#ecf3fc!important;
      }
      body.dark-mode #app-root > .view:not(.bento-home) :is(
        .glass-card,.settings-card,.item-row,.history-card,.list-card,.slp-settings-group,
        .chart-container,.slp-money-tile,.sw-finance-card,.slp-design-setting
      ){
        background:#182436!important;color:#ecf3fc!important;
        border-color:rgba(207,225,247,.12)!important;
        box-shadow:0 4px 18px rgba(0,0,0,.16)!important;
      }
      body.dark-mode #app-root :is(.top-bar,.glass-pill,.bottom-dock),
      body.dark-mode .modal-overlay .settings-card{
        background:#182436!important;color:#ecf3fc!important;
        border-color:rgba(207,225,247,.14)!important;
      }
      body.dark-mode #app-root :is(input:not([type=checkbox]):not([type=radio]):not([type=color]),select,textarea),
      body.dark-mode .modal-overlay :is(input,select,textarea){
        background:#26374a!important;color:#f2f7ff!important;
        border-color:rgba(207,225,247,.19)!important;
        -webkit-text-fill-color:#f2f7ff!important;
      }
      body.dark-mode #app-root input::placeholder,
      body.dark-mode .modal-overlay input::placeholder{color:#a5b6c9!important;opacity:.85}
      body.dark-mode #view-home.bento-home .bento-wallet{background:transparent!important}
      body.dark-mode #view-home.bento-home.slp-home-classic .bento-balance{background:var(--b-balance)!important}
      body.dark-mode #view-home.bento-home.slp-home-classic .bento-percent{background:var(--b-percent)!important}
      body.dark-mode #view-home.bento-home.slp-home-classic .bento-spent{background:var(--b-spent)!important}
      body.dark-mode #view-home.bento-home.slp-home-classic .bento-daily{background:var(--b-daily)!important}
      body.dark-mode #view-home.bento-home .bento-category-pill:nth-child(1){background:var(--b-cat-a)!important}
      body.dark-mode #view-home.bento-home .bento-category-pill:nth-child(2){background:var(--b-cat-b)!important}
      body.dark-mode #view-home.bento-home .bento-category-pill:nth-child(3){background:var(--b-cat-c)!important}
      body.dark-mode #view-home.bento-home .bento-category-pill:nth-child(4){background:var(--b-cat-d)!important}
      body.dark-mode #view-home.bento-home .slp-ref-stat{
        background:#1c2b3e!important;border-color:rgba(207,225,247,.13)!important;
      }
      body.dark-mode #view-home.bento-home .slp-ref-ring{
        background:#182436!important;color:#ecf3fc!important;
      }
      body.dark-mode #view-home.bento-home .slp-ref-total{
        background:#26374a!important;color:#edf6ff!important;
      }
      body.dark-mode #view-home.bento-home .bento-budget-row{
        background:#26374a!important;color:#edf6ff!important;
      }
      body.dark-mode #view-home.bento-home .bento-see-all{
        color:#8be5c9!important;
      }
      body.dark-mode #view-home.bento-home .slp-ref-ring-track{
        stroke:#30475a!important;
      }
      body.dark-mode #view-home.bento-home .slp-ref-ring-fill{
        stroke:#50c58c!important;
      }
      body.dark-mode #view-home.bento-home .bento-balance{
        background:#1c2b3e!important;color:#f5f8ff!important;
      }
      body.dark-mode #view-home.bento-home .bento-balance .bento-kicker,
      body.dark-mode #view-home.bento-home .bento-balance .bento-helper{
        color:#c4d5e5!important;
      }
      body.dark-mode #view-home.bento-home .bento-percent{color:#fff!important}
      body.dark-mode #view-home.bento-home .bento-spent{color:#effffa!important}
      body.dark-mode #view-home.bento-home .bento-daily{color:#ffeaf3!important}
      body.dark-mode #view-home.bento-home .slp-ref-header .bento-round-icon{
        background:#26374a!important;color:#edf6ff!important;
      }
      body.dark-mode #view-home.bento-home .slp-ref-header .bento-mascot{
        background:#273a4d!important;
      }
      body.dark-mode #app-root .bottom-dock button{
        color:#e9f3ff!important;
      }
      body.dark-mode #app-root .bottom-dock .dock-btn{color:#dceaf8!important}
      body.dark-mode #app-root .bottom-dock .dock-main-btn{background:#426bff!important}
      body.dark-mode #view-settings .slp-settings-group summary,
      body.dark-mode #view-settings .setting-item {color:#ecf3fc!important}
      body.dark-mode #view-settings .slp-settings-group[open]>summary{
        border-bottom-color:rgba(207,225,247,.12)!important;
      }
      body.dark-mode #view-settings .slp-settings-group summary::before{
        background:#26374a!important;border-color:rgba(207,225,247,.15)!important;
      }
      body.dark-mode #slp-home-design-settings .slp-design-options button,
      body.dark-mode #bento-theme-settings .bento-preset{
        background:#26374a!important;color:#ecf3fc!important;
      }
      body.dark-mode #view-settings .slp-settings-inside .setting-item{
        border-bottom-color:rgba(207,225,247,.09)!important;
      }

      /* Ajustes: grupos estilo iOS, controles grandes y consistentes. */
      #view-settings.slp-settings-modern .scroll-content{
        padding:8px 12px calc(102px + env(safe-area-inset-bottom))!important;
      }
      #view-settings.slp-settings-modern .settings-card.full-width{
        margin:0!important;padding:0!important;background:transparent!important;
        border:0!important;box-shadow:none!important;
      }
      #view-settings.slp-settings-modern .slp-settings-group,
      #view-settings.slp-settings-modern #slp-home-design-settings .slp-design-setting{
        border-radius:21px!important;border:1px solid var(--sp-stroke)!important;
        background:var(--sp-surface)!important;
        box-shadow:0 4px 14px rgba(14,40,50,.055)!important;
        overflow:hidden!important;margin:9px 0 12px!important;
      }
      #view-settings.slp-settings-modern .slp-settings-group>summary{
        box-sizing:border-box!important;display:flex!important;align-items:center!important;
        gap:12px!important;min-height:59px!important;
        padding:12px 15px!important;font-size:14px!important;font-weight:760!important;
        letter-spacing:-.2px!important;cursor:pointer;
      }
      #view-settings.slp-settings-modern .slp-settings-group>summary::before{
        content:''!important;display:block!important;width:35px!important;height:35px!important;
        flex:0 0 35px!important;border-radius:12px!important;
        background:linear-gradient(140deg,color-mix(in srgb,var(--b-accent) 20%,var(--b-chart)),var(--b-budget))!important;
        border:1px solid var(--sp-stroke)!important;
      }
      #view-settings.slp-settings-modern .slp-settings-group>summary span:first-child{
        flex:1 1 auto!important;min-width:0!important;
      }
      #view-settings.slp-settings-modern .slp-settings-group>summary .slp-chevron{
        display:block!important;color:var(--sp-muted)!important;font-size:22px!important;
        transition:transform .2s ease;
      }
      #view-settings.slp-settings-modern .slp-settings-group[open]>summary .slp-chevron{
        transform:rotate(180deg);
      }
      #view-settings.slp-settings-modern .slp-settings-inside{
        padding:3px 14px 13px!important;
      }
      #view-settings.slp-settings-modern .slp-settings-inside .setting-item{
        display:flex!important;align-items:center!important;gap:12px!important;
        min-height:51px!important;padding:10px 3px!important;
        font-size:13px!important;font-weight:600!important;
        border-bottom:1px solid var(--sp-stroke)!important;
      }
      #view-settings.slp-settings-modern .slp-settings-inside .setting-item:last-child{border-bottom:0!important}
      #view-settings.slp-settings-modern .setting-input,
      #view-settings.slp-settings-modern .setting-select,
      #view-settings.slp-settings-modern select{
        min-height:39px!important;padding:7px 11px!important;
        border-radius:12px!important;border:1px solid var(--sp-stroke)!important;
        background:var(--sp-surface-alt)!important;color:var(--sp-ink)!important;
        font-size:13px!important;
      }
      #view-settings.slp-settings-modern .switch-wrap{
        width:49px!important;height:29px!important;flex:0 0 49px!important;
      }
      #view-settings.slp-settings-modern .switch-wrap .slider{
        border-radius:22px!important;background:color-mix(in srgb,var(--b-muted) 28%,var(--b-chart))!important;
        border:1px solid var(--sp-stroke)!important;
        box-shadow:inset 0 1px 2px rgba(0,0,0,.08);
      }
      #view-settings.slp-settings-modern .switch-wrap .slider:before{
        width:23px!important;height:23px!important;left:2px!important;bottom:2px!important;
        background:#fff!important;border-radius:50%!important;
        box-shadow:0 2px 5px rgba(0,0,0,.17)!important;
      }
      #view-settings.slp-settings-modern .switch-wrap input:checked+.slider{
        background:var(--b-accent)!important;border-color:transparent!important;
      }
      #view-settings.slp-settings-modern .switch-wrap input:checked+.slider:before{
        transform:translateX(20px)!important;
      }
      #view-settings.slp-settings-modern :is(.btn-full,.btn-data,.slp-action,.bento-preset,.bento-reset,.lang-btn-opt,.font-btn,.theme-btn){
        border-radius:13px!important;min-height:39px!important;
        transition:transform .14s ease,background .2s ease,box-shadow .2s ease;
      }
      #view-settings.slp-settings-modern :is(.btn-full,.btn-data,.slp-action):active{
        transform:scale(.985)!important;
      }
      #view-settings.slp-settings-modern #slp-home-design-settings .slp-design-options button{
        border-radius:16px!important;min-height:98px!important;
        box-shadow:none!important;
      }
      #view-settings.slp-settings-modern .slp-settings-group :focus-visible{
        outline:2px solid var(--b-accent)!important;outline-offset:2px!important;
      }
      @media(prefers-reduced-motion:reduce){
        #view-settings.slp-settings-modern *{transition:none!important;animation:none!important}
      }

      /* ================================================================
         SmartLifePro / v4 — corrección estructural del Inicio y Ajustes
         Causa real: Inicio se mostraba con display:flex aun sin .active.
         Nunca forzar display en vistas inactivas.
         ================================================================ */
      #app-root > #view-home.bento-home:not(.active){display:none!important}
      #app-root > #view-settings:not(.active){display:none!important}
      #app-root > #view-settings.active{
        position:relative!important;inset:auto!important;
        display:flex!important;flex:1 1 100%!important;
        width:100%!important;height:100%!important;min-height:0!important;
        padding:0!important;margin:0!important;overflow:hidden!important;
        flex-direction:column!important;align-items:stretch!important;
        justify-content:flex-start!important;transform:none!important;
      }
      #app-root > #view-settings.active > .top-bar{
        flex:0 0 auto!important;align-self:stretch!important;
        margin:calc(8px + env(safe-area-inset-top)) 13px 8px!important;
        padding:12px 17px!important;min-height:54px!important;
        border-radius:23px!important;
      }
      #app-root > #view-settings.active > .scroll-content{
        display:block!important;position:relative!important;inset:auto!important;
        flex:1 1 auto!important;align-self:stretch!important;
        width:100%!important;min-height:0!important;
        margin:0!important;overflow-x:hidden!important;overflow-y:auto!important;
        padding:2px 13px calc(96px + env(safe-area-inset-bottom))!important;
        scroll-padding-top:10px!important;
      }
      #app-root > #view-settings.active .settings-card.full-width{
        display:block!important;width:100%!important;max-width:none!important;
        margin:0!important;padding:0!important;min-height:0!important;
        transform:none!important;box-shadow:none!important;border:0!important;
        background:transparent!important;
      }
      /* El selector de diseño es una preferencia, no la pantalla entera. */
      #view-settings.slp-settings-modern #slp-home-design-settings{
        margin:0 0 12px!important;
      }
      #view-settings.slp-settings-modern #slp-home-design-settings .slp-design-setting{
        padding:15px!important;margin:2px 0 10px!important;
        border-radius:22px!important;
        background:var(--sp-surface)!important;
        border:1px solid var(--sp-stroke)!important;
        box-shadow:0 5px 16px rgba(22,55,44,.06)!important;
      }
      #view-settings.slp-settings-modern #slp-home-design-settings h3{
        font-size:15px!important;line-height:1.25!important;letter-spacing:-.2px;
      }
      #view-settings.slp-settings-modern #slp-home-design-settings p{
        margin:6px 0 11px!important;font-size:11.5px!important;
        line-height:1.45!important;color:var(--sp-muted)!important;
      }
      #view-settings.slp-settings-modern #slp-home-design-settings .slp-design-options{
        gap:10px!important;
      }
      #view-settings.slp-settings-modern #slp-home-design-settings .slp-design-options button{
        min-height:96px!important;padding:10px 8px!important;
        display:flex!important;flex-direction:column!important;gap:7px!important;
        justify-content:center!important;
        border:1.5px solid var(--sp-stroke)!important;
        border-radius:18px!important;
        background:var(--sp-surface-alt)!important;color:var(--sp-ink)!important;
        box-shadow:none!important;
      }
      #view-settings.slp-settings-modern #slp-home-design-settings .slp-design-options button[aria-pressed="true"]{
        background:color-mix(in srgb,var(--b-accent) 11%,var(--sp-surface))!important;
        border:2px solid var(--b-accent)!important;
        box-shadow:0 0 0 3px color-mix(in srgb,var(--b-accent) 12%,transparent)!important;
      }
      #view-settings.slp-settings-modern #slp-home-design-settings .slp-design-preview{
        width:min(100%,90px)!important;height:48px!important;
        border-radius:12px!important;padding:7px!important;
      }
      #view-settings.slp-settings-modern #slp-home-design-settings .slp-design-preview-circle i{
        width:37px!important;height:37px!important;border-width:6px!important;
      }
      #view-settings.slp-settings-modern #slp-home-design-settings .slp-design-options strong{
        font-size:11px!important;font-weight:750!important;
      }
      /* Preferencias estilo iOS: celdas, tarjetas, tipografía y controles. */
      #view-settings.slp-settings-modern .slp-settings-group{
        margin:9px 0 12px!important;border-radius:22px!important;
        background:var(--sp-surface)!important;
        box-shadow:0 5px 16px rgba(18,54,43,.06)!important;
      }
      #view-settings.slp-settings-modern .slp-settings-group>summary{
        min-height:55px!important;padding:10px 13px!important;
        gap:11px!important;font-size:13.5px!important;
      }
      #view-settings.slp-settings-modern .slp-settings-group>summary::before{
        content:'⚙'!important;display:grid!important;place-items:center!important;
        width:35px!important;height:35px!important;flex:0 0 35px!important;
        font:700 18px/1 system-ui,sans-serif!important;
        border:0!important;border-radius:11px!important;
        background:color-mix(in srgb,var(--b-accent) 18%,var(--sp-surface))!important;
        color:var(--b-ink)!important;
      }
      #view-settings.slp-settings-modern .slp-settings-group[data-group="general-0"]>summary::before{content:'◉'!important;background:#e2edff!important;color:#316fce!important}
      #view-settings.slp-settings-modern .slp-settings-group[data-group="general-1"]>summary::before{content:'Aa'!important;font-size:14px!important;background:#e8e1ff!important;color:#6654c6!important}
      #view-settings.slp-settings-modern .slp-settings-group[data-group="general-2"]>summary::before{content:'✦'!important;background:#dff7e9!important;color:#1b8962!important}
      #view-settings.slp-settings-modern .slp-settings-group[data-group="general-3"]>summary::before{content:'▣'!important;background:#fff0de!important;color:#ae6d16!important}
      #view-settings.slp-settings-modern .slp-settings-group[data-group="android-pro-settings"]>summary::before{content:'✧'!important;background:#dceefd!important;color:#2878b8!important}
      #view-settings.slp-settings-modern .slp-theme-group>summary::before{content:'◐'!important;background:#efe5ff!important;color:#7755b5!important}
      #view-settings.slp-settings-modern .slp-settings-inside{
        padding:3px 13px 13px!important;
      }
      #view-settings.slp-settings-modern .slp-settings-inside .setting-item{
        gap:9px!important;padding:11px 3px!important;min-height:50px!important;
        margin-top:0!important;font-size:12.5px!important;
        border-bottom:1px solid var(--sp-stroke)!important;
      }
      #view-settings.slp-settings-modern .setting-item>span:first-child{
        flex:1 1 auto;min-width:0;
      }
      #view-settings.slp-settings-modern :is(.lang-grid,.font-selector-grid){
        display:grid!important;gap:7px!important;
        margin:8px 0!important;
      }
      #view-settings.slp-settings-modern .lang-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}
      #view-settings.slp-settings-modern .font-selector-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important}
      #view-settings.slp-settings-modern :is(.lang-btn-opt,.font-btn){
        box-sizing:border-box!important;min-width:0!important;
        display:flex!important;flex-direction:column!important;
        align-items:center!important;justify-content:center!important;
        padding:9px 4px!important;min-height:63px!important;
        margin:0!important;gap:5px!important;
        border:1px solid var(--sp-stroke)!important;
        border-radius:15px!important;
        background:var(--sp-surface-alt)!important;color:var(--sp-ink)!important;
        box-shadow:none!important;transform:none!important;cursor:pointer;
      }
      #view-settings.slp-settings-modern :is(.lang-btn-opt.selected,.font-btn.active){
        border:2px solid var(--b-accent)!important;
        background:color-mix(in srgb,var(--b-accent) 11%,var(--sp-surface))!important;
      }
      #view-settings.slp-settings-modern .font-btn small,
      #view-settings.slp-settings-modern .lang-btn-opt span{font-size:10px!important;font-weight:700!important}
      #view-settings.slp-settings-modern :is(.btn-data-row){
        display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;
        gap:9px!important;
      }
      #view-settings.slp-settings-modern :is(.btn-data,.text-btn-small,.slp-action,.bento-preset,.bento-reset){
        display:inline-flex;align-items:center;justify-content:center;gap:7px;
        border-radius:13px!important;min-height:40px!important;
        border:1px solid var(--sp-stroke)!important;
        background:var(--sp-surface-alt)!important;
        color:var(--sp-ink)!important;
        box-shadow:none!important;
        font-size:11px!important;font-weight:730!important;
        text-decoration:none!important;
      }
      #view-settings.slp-settings-modern .btn-data{
        min-width:0!important;padding:10px 8px!important;flex-direction:column!important;
      }
      #view-settings.slp-settings-modern .btn-data svg{width:19px!important;height:19px!important}
      #view-settings.slp-settings-modern :is(.btn-full,.slp-primary){
        border:0!important;background:var(--b-nav)!important;
        color:var(--b-nav-ink,#ffffff)!important;border-radius:14px!important;
        min-height:43px!important;font-size:12px!important;
        box-shadow:0 4px 11px rgba(20,57,45,.12)!important;
      }
      #view-settings.slp-settings-modern :is(select,.setting-input,.setting-select){
        box-sizing:border-box!important;min-width:0!important;max-width:100%!important;
        border-radius:12px!important;border:1px solid var(--sp-stroke)!important;
        background:var(--sp-surface-alt)!important;color:var(--sp-ink)!important;
        min-height:38px!important;
      }
      #view-settings.slp-settings-modern .switch-wrap{
        position:relative!important;width:48px!important;height:29px!important;flex:0 0 48px!important;
      }
      #view-settings.slp-settings-modern .switch-wrap .slider{
        border-radius:999px!important;
        background:color-mix(in srgb,var(--b-muted) 23%,var(--sp-surface))!important;
        border:1px solid var(--sp-stroke)!important;
      }
      #view-settings.slp-settings-modern .switch-wrap .slider:before{
        height:23px!important;width:23px!important;left:2px!important;bottom:2px!important;
        border-radius:50%!important;background:#fff!important;
        box-shadow:0 2px 5px rgba(0,0,0,.19)!important;
      }
      #view-settings.slp-settings-modern .switch-wrap input:checked+.slider{
        background:var(--b-accent)!important;
      }
      #view-settings.slp-settings-modern .switch-wrap input:checked+.slider:before{
        transform:translateX(19px)!important;
      }
      /* Restaurar el dock blanco en píldora y el '+' cuadrado redondeado. */
      #app-root .bottom-dock,
      #app-root:has(#view-home.active.bento-home) .bottom-dock{
        position:absolute!important;left:12px!important;right:12px!important;
        bottom:calc(9px + env(safe-area-inset-bottom))!important;
        height:63px!important;min-height:63px!important;
        border-radius:999px!important;padding:0 9px!important;
        background:var(--b-chart,#ffffff)!important;
        border:1px solid color-mix(in srgb,var(--b-ink) 7%,transparent)!important;
        box-shadow:0 9px 23px rgba(13,54,39,.13)!important;
      }
      #app-root .bottom-dock .dock-btn,
      #app-root:has(#view-home.active.bento-home) .bottom-dock .dock-btn{
        padding:0!important;border-radius:0!important;
        width:100%!important;height:53px!important;
        background:transparent!important;
        transform:none!important;color:var(--b-ink,#164234)!important;
      }
      #app-root .bottom-dock .dock-btn::before,
      #app-root .bottom-dock .dock-btn::after{
        display:none!important;content:none!important;
      }
      #app-root .bottom-dock #dock-plus-btn,
      #app-root:has(#view-home.active.bento-home) .bottom-dock #dock-plus-btn{
        display:grid!important;place-items:center!important;
        width:55px!important;height:55px!important;min-width:55px!important;
        margin:0!important;border-radius:19px!important;
        background:#1728ee!important;color:#fff!important;
        transform:none!important;
        box-shadow:0 3px 10px rgba(18,32,190,.22),inset 0 1px 2px rgba(255,255,255,.42)!important;
      }
      #app-root .bottom-dock #dock-plus-btn svg,
      #app-root:has(#view-home.active.bento-home) #dock-plus-btn svg{
        width:29px!important;height:29px!important;stroke:#ffffff!important;
      }
      #app-root .bottom-dock #dock-plus-btn svg line{stroke:#ffffff!important}
      #app-root .bottom-dock .dock-btn.active:not(#dock-plus-btn){
        color:var(--b-nav,#174c39)!important;
      }
      /* Nueva cuadrícula de alturas: encabezado, tarjetas y categorías CABEN.
         Respetar WebView con 360x768 CSS píxeles. */
      #view-home.bento-home .slp-ref-content{
        overflow-y:auto!important;overflow-x:hidden!important;
        scroll-behavior:auto!important;
        padding:2px 11px calc(78px + env(safe-area-inset-bottom))!important;
        gap:5px!important;align-content:start!important;
      }
      #view-home.bento-home .bento-wallet,
      #view-home.bento-home .bento-categories{
        overflow:visible!important;min-height:0!important;min-width:0!important;
        display:flex!important;flex-direction:column!important;
      }
      #view-home.bento-home .bento-wallet-items{
        overflow-x:auto!important;overflow-y:hidden!important;
        min-height:0!important;max-height:none!important;
        height:auto!important;flex:1 1 0!important;padding:2px 2px 5px!important;
      }
      #view-home.bento-home .sw-home-card{
        min-height:0!important;max-height:none!important;
        height:100%!important;padding:9px 10px!important;
      }
      #view-home.bento-home .bento-categories .bento-category-grid{
        min-height:0!important;grid-template-rows:repeat(2,minmax(0,1fr))!important;
        flex:1 1 0!important;
      }
      #view-home.bento-home .bento-categories .bento-category-pill{
        min-height:0!important;padding:5px 8px!important;
      }
      #view-home.bento-home.slp-home-circular .slp-ref-content{
        display:grid!important;
        grid-template-columns:minmax(0,1fr)!important;
        grid-template-rows:184px 90px 178px 148px!important;
      }
      #view-home.bento-home.slp-home-circular .slp-ref-hero{
        min-height:0!important;max-height:none!important;height:184px!important;
        padding:0!important;gap:0!important;
      }
      #view-home.bento-home.slp-home-circular .slp-ref-ring{
        width:141px!important;height:141px!important;min-width:141px!important;
        min-height:141px!important;max-width:141px!important;
        flex:0 0 141px!important;margin:0 auto!important;
      }
      #view-home.bento-home.slp-home-circular .slp-ref-ring-center{
        inset:17px!important;
      }
      #view-home.bento-home.slp-home-circular .slp-ref-percent{font-size:32px!important}
      #view-home.bento-home.slp-home-circular .slp-ref-remaining{font-size:14px!important}
      #view-home.bento-home.slp-home-circular .slp-ref-remaining-caption{
        margin-top:5px!important;font-size:8.5px!important;
      }
      #view-home.bento-home.slp-home-circular .slp-ref-total{
        height:22px!important;min-height:22px!important;margin:4px 0 0!important;
        padding:3px 9px!important;
      }
      #view-home.bento-home.slp-home-circular .slp-ref-month{margin:3px 0 0!important}
      #view-home.bento-home.slp-home-circular .slp-ref-stats{
        align-items:flex-start!important;justify-content:space-evenly!important;
        transform:translateY(-4px)!important;
      }
      #view-home.bento-home.slp-home-circular .slp-ref-stat{
        height:85px!important;width:85px!important;min-height:85px!important;
        max-height:85px!important;flex:0 0 85px!important;
        border-radius:50%!important;padding:5px!important;
      }
      #view-home.bento-home.slp-home-circular .slp-ref-stat svg{
        width:15px!important;height:15px!important;
      }
      #view-home.bento-home.slp-home-circular .slp-ref-stat strong{
        font-size:14px!important;letter-spacing:-.3px!important;
      }
      #view-home.bento-home.slp-home-circular .bento-wallet{
        height:178px!important;min-height:0!important;
      }
      #view-home.bento-home.slp-home-circular .bento-wallet-items,
      #view-home.bento-home.slp-home-circular .sw-home-card{
        min-height:0!important;max-height:none!important;height:auto!important;
      }
      #view-home.bento-home.slp-home-circular .sw-home-card{
        height:100%!important;min-width:154px!important;
      }
      #view-home.bento-home.slp-home-circular .bento-categories{
        min-height:0!important;height:148px!important;
      }
      #view-home.bento-home.slp-home-circular .bento-categories .bento-category-pill{
        min-height:0!important;
      }
      #view-home.bento-home.slp-home-classic .slp-ref-content{
        display:grid!important;
        grid-template-columns:minmax(0,1fr)!important;
        grid-template-rows:64px 182px 27px 173px 150px!important;
      }
      #view-home.bento-home.slp-home-classic .bento-intro{
        min-height:0!important;max-height:none!important;height:64px!important;
      }
      #view-home.bento-home.slp-home-classic .bento-metrics{
        min-height:0!important;max-height:182px!important;height:182px!important;
      }
      #view-home.bento-home.slp-home-classic .bento-wallet{
        min-height:0!important;height:173px!important;
      }
      #view-home.bento-home.slp-home-classic .bento-wallet-items{
        min-height:0!important;max-height:none!important;height:auto!important;
      }
      #view-home.bento-home.slp-home-classic .sw-home-card{
        min-height:0!important;max-height:none!important;height:100%!important;
      }
      #view-home.bento-home.slp-home-classic .bento-categories{
        min-height:0!important;height:150px!important;
      }
      /* Ajustar pantallas más bajas sin cortar datos; permitir scroll SOLO si no caben. */
      @media(max-height:740px){
        #view-home.bento-home .slp-ref-header{height:55px!important;min-height:55px!important;flex-basis:55px!important}
        #view-home.bento-home .slp-ref-content{
          padding-bottom:calc(69px + env(safe-area-inset-bottom))!important;gap:4px!important;
        }
        #view-home.bento-home.slp-home-circular .slp-ref-content{
          grid-template-rows:160px 78px 151px 123px!important;
        }
        #view-home.bento-home.slp-home-circular .slp-ref-hero{height:160px!important}
        #view-home.bento-home.slp-home-circular .slp-ref-ring{
          width:123px!important;height:123px!important;min-height:123px!important;
          min-width:123px!important;max-width:123px!important;flex-basis:123px!important;
        }
        #view-home.bento-home.slp-home-circular .slp-ref-percent{font-size:28px!important}
        #view-home.bento-home.slp-home-circular .slp-ref-remaining{font-size:12px!important}
        #view-home.bento-home.slp-home-circular .slp-ref-stats{transform:translateY(-2px)!important}
        #view-home.bento-home.slp-home-circular .slp-ref-stat{
          width:73px!important;height:73px!important;min-height:73px!important;
          max-height:73px!important;flex-basis:73px!important;
        }
        #view-home.bento-home.slp-home-circular .slp-ref-stat strong{font-size:12px!important}
        #view-home.bento-home.slp-home-circular .bento-wallet{height:151px!important}
        #view-home.bento-home.slp-home-circular .bento-categories{height:123px!important}
        #view-home.bento-home.slp-home-classic .slp-ref-content{
          grid-template-rows:54px 160px 25px 152px 126px!important;
        }
        #view-home.bento-home.slp-home-classic .bento-intro{height:54px!important}
        #view-home.bento-home.slp-home-classic .bento-metrics{height:160px!important;max-height:160px!important}
        #view-home.bento-home.slp-home-classic .bento-wallet{height:152px!important}
        #view-home.bento-home.slp-home-classic .bento-categories{height:126px!important}
      }
      @media(max-height:630px){
        #view-home.bento-home .slp-ref-content{overflow-y:auto!important}
      }
      @media(prefers-reduced-motion:reduce){
        #app-root .bottom-dock *,#view-settings.slp-settings-modern *{transition:none!important;animation:none!important}
      }
    `;
    doc.head.appendChild(style);

    function syncChrome() {
      const dark = doc.body.classList.contains('dark-mode');
      const meta = doc.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', dark ? '#0d1420' : '#e7f4ed');
      doc.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    }
    syncChrome();
    if (root.MutationObserver) {
      const modeWatcher = new root.MutationObserver(syncChrome);
      modeWatcher.observe(doc.body, {attributes:true,attributeFilter:['class']});
    }
    root.addEventListener('focus', syncChrome);
  }

  function init() {
    monitorViews();
    installCompactReceiptUI();
    installHomeAndSettingsFixes();
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
