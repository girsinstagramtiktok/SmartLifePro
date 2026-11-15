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

  function init() {
    monitorViews();
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
