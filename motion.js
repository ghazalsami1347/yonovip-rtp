/* Short, one-shot motion. Content stays visible if this file cannot run. */
(() => {
  const root = document.documentElement;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  const light = !!connection?.saveData || (navigator.deviceMemory > 0 && navigator.deviceMemory <= 4) || (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4);
  const supported = typeof Element.prototype.animate === 'function';
  const active = new Map();
  let observer;

  function mode() {
    root.dataset.motion = preference.matches || !supported ? 'off' : light ? 'light' : 'full';
  }
  mode();

  function play(element, frames, duration = 360, delay = 0) {
    if (!element || preference.matches || !supported || document.hidden) return;
    active.get(element)?.cancel();
    const animation = element.animate(frames, {
      duration: light ? Math.min(duration, 180) : duration,
      delay: light ? 0 : delay,
      easing: 'cubic-bezier(.2,.75,.25,1)',
      iterations: 1
    });
    active.set(element, animation);
    const release = () => { if (active.get(element) === animation) active.delete(element); };
    animation.onfinish = release;
    animation.oncancel = release;
  }

  function enter(element, delay = 0) {
    play(element, light
      ? [{ opacity: .65 }, { opacity: 1 }]
      : [{ opacity: .4, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], 440, delay);
  }

  function stop() {
    observer?.disconnect();
    for (const animation of active.values()) animation.cancel();
    active.clear();
  }
  preference.addEventListener?.('change', () => { stop(); mode(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  addEventListener('pagehide', stop);

  window.yonoMotion = {
    dialog() {
      play(document.querySelector('#modal'), light
        ? [{ opacity: .7 }, { opacity: 1 }]
        : [{ opacity: .3, transform: 'translateY(14px) scale(.98)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }], 240);
    },
    saved(button) {
      if (light) return;
      play(button.querySelector('.icon'), [
        { transform: 'scale(1)' }, { transform: 'scale(1.24)', offset: .45 }, { transform: 'scale(1)' }
      ], 280);
    },
    swap(element) {
      play(element, light ? [{ opacity: .65 }, { opacity: 1 }]
        : [{ opacity: .55, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], 180);
    }
  };

  if (preference.matches || !supported || document.hidden) return;
  // Never fade the main heading or delay rendering the primary action.
  enter(document.querySelector('.hero-logo'));
  if (light) return;
  enter(document.querySelector('.hero .eyebrow'), 35);
  enter(document.querySelector('.quick-nav'), 70);
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        enter(entry.target);
      }
    }, { threshold: .15 });
    document.querySelectorAll('.app-banner, .help-list, .faq').forEach(element => observer.observe(element));
  }
  document.querySelectorAll('.faq details').forEach(details => details.addEventListener('toggle', () => {
    if (details.open) play(details.querySelector('p'), [{ opacity: .35, transform: 'translateY(-3px)' }, { opacity: 1, transform: 'translateY(0)' }], 180);
  }));
})();
