import { fillMarquee, sparkLayer } from '../landing/engine';

export function bindShopFx(root: HTMLElement) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animations: Animation[] = [];
  let sparkTimer: ReturnType<typeof setTimeout> | undefined;
  let resizeTimer: ReturnType<typeof setTimeout> | undefined;

  const startMarquees = () => {
    root.querySelectorAll<HTMLElement>('[data-marquee]').forEach((el) => {
      fillMarquee(el);
      if (reduced) return;
      el.getAnimations().forEach((a) => a.cancel());
      const half = el.scrollWidth / 2;
      const duration = Math.max(8000, half * 16);
      animations.push(
        el.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${-half}px)` }], {
          duration,
          iterations: Infinity,
          easing: 'linear',
        }),
      );
    });
  };
  startMarquees();

  const applyShine = () => {
    if (reduced) return;
    root.querySelectorAll<HTMLElement>('[data-shine]').forEach((el) => {
      if ((el as HTMLElement & { _shined?: boolean })._shined) return;
      (el as HTMLElement & { _shined?: boolean })._shined = true;
      const card = el.dataset['shine'] === 'card';
      animations.push(
        el.animate(
          card
            ? [{ backgroundPosition: '150% 0, 0 0' }, { backgroundPosition: '-50% 0, 0 0' }]
            : [{ backgroundPosition: '150% 0' }, { backgroundPosition: '-50% 0' }],
          {
            duration: 2600,
            delay: +(el.dataset['shineDelay'] || (card ? 0 : 120)),
            iterations: Infinity,
            easing: 'cubic-bezier(.45,0,.2,1)',
          },
        ),
      );
    });
  };

  const buildSparkles = () => {
    root.querySelectorAll('[data-sparkles]').forEach((l) => l.remove());
    if (reduced) return;
    [...root.querySelectorAll<HTMLElement>('[data-sp]')].forEach((sec, i) => {
      if (getComputedStyle(sec).position === 'static') sec.style.position = 'relative';
      sec.style.isolation = 'isolate';
      sparkLayer(sec, +(sec.dataset['sp'] || i + 3), '#D40000');
    });
  };

  applyShine();
  requestAnimationFrame(() => buildSparkles());
  sparkTimer = setTimeout(() => buildSparkles(), 1500);

  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      startMarquees();
      buildSparkles();
    }, 250);
  };
  window.addEventListener('resize', onResize);

  return {
    applyShine,
    rebuildSparks: () => {
      clearTimeout(sparkTimer);
      sparkTimer = setTimeout(() => buildSparkles(), 60);
    },
    stop() {
      animations.forEach((a) => a.cancel());
      clearTimeout(sparkTimer);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      root.querySelectorAll('[data-sparkles]').forEach((l) => l.remove());
    },
  };
}

export const SOLD_MASK =
  "url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27220%27 height=%27120%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%27.9%27 numOctaves=%272%27 seed=%274%27/%3E%3CfeComponentTransfer%3E%3CfeFuncA type=%27discrete%27 tableValues=%271 1 1 1 1 1 1 0 1 1 1 1%27/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E')";
