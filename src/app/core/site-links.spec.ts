import { formatCopyright, igHandleParts, igProfileHref, marqueeLoop, padStock, waHref } from './site-links';

describe('site-links', () => {
  it('arma wa.me sin caracteres no numéricos', () => {
    expect(waHref('+54 9 11-0000-0000', 'Hola')).toBe(
      'https://wa.me/5491100000000?text=' + encodeURIComponent('Hola'),
    );
  });

  it('arma el perfil de Instagram sin @', () => {
    expect(igProfileHref('@fomo.xo')).toBe('https://instagram.com/fomo.xo');
    expect(igHandleParts('fomo.xo')).toEqual({ name: 'fomo', ext: '.xo', full: 'fomo.xo' });
  });

  it('duplica el copy del marquee', () => {
    const loop = marqueeLoop('ENVÍOS A TODO EL PAÍS');
    expect(loop.startsWith('ENVÍOS A TODO EL PAÍS ✕ ')).toBeTrue();
    expect(loop.split('ENVÍOS A TODO EL PAÍS').length).toBeGreaterThan(2);
  });

  it('rellena el stock de vitrina', () => {
    expect(padStock(4)).toBe('04');
  });

  it('arma el copyright sin duplicar el símbolo', () => {
    expect(formatCopyright('FOMO', 2026)).toBe('© 2026 FOMO');
    expect(formatCopyright('© 2026 FOMO')).toBe('© 2026 FOMO');
    expect(formatCopyright('')).toBe('');
  });
});
