export const CONFIG = {
  whatsapp: '5491100000000',
  instagram: 'fomo.xo',
  intensity: 8,
  chains: true,
  sparkles: true,
  lookWords: 'BOOK, FOMO, NOCHE, DIVA, TOTAL',
};

const wa = (num: string, txt: string) =>
  `https://wa.me/${num}?text=${encodeURIComponent(txt)}`;

export function buildCatalog(
  whatsapp = CONFIG.whatsapp,
  instagram = CONFIG.instagram,
) {
  const num = whatsapp.replace(/\D/g, '');
  const ig = instagram.replace(/^@/, '');
  const rings = (
    [
      ['NUDO', '$12.900', 'NUEVO'],
      ['ESLABÓN', '$14.500', 'ÚLTIMOS 3'],
      ['SELLO F', '$16.900', 'DROP 07'],
      ['DOBLE VUELTA', '$11.900', 'AGOTADO'],
      ['TUERCA', '$9.900', 'ÚLTIMOS 5'],
      ['ESPIRAL', '$13.500', 'NUEVO'],
    ] as const
  ).map(([name, price, tag], i) => {
    const soldOut = tag === 'AGOTADO';
    return {
      num: String(i + 1).padStart(2, '0'),
      name,
      price,
      tag,
      soldOut,
      slot: 'ring-' + (i + 1),
      ph: 'anillo ' + name.toLowerCase(),
      cta: soldOut ? 'AVISAME CUANDO VUELVA' : 'LO QUIERO',
      wa: wa(
        num,
        soldOut
          ? `Hola FOMO! Avisame si vuelve el anillo ${name}`
          : `Hola FOMO! Quiero el anillo ${name} (${price})`,
      ),
    };
  });

  const necklaces = (
    [
      ['BARBADA', '$19.900', 'NUEVO'],
      ['CANDADO', '$22.500', 'ÚLTIMOS 4'],
      ['CORAZÓN DURO', '$17.900', 'DROP 07'],
      ['CHOKER CROMO', '$15.900', 'NUEVO'],
      ['GOTA', '$16.500', 'ÚLTIMOS 2'],
      ['TRIPLE', '$24.900', 'DROP 07'],
    ] as const
  ).map(([name, price, tag], i) => ({
    num: String(i + 1).padStart(2, '0'),
    name,
    price,
    tag,
    slot: 'neck-' + (i + 1),
    ph: 'collar ' + name.toLowerCase(),
    wa: wa(num, `Hola FOMO! Quiero el collar ${name} (${price})`),
  }));

  const igTiles = Array.from({ length: 8 }, (_, i) => ({
    slot: 'ig-' + (i + 1),
    ph: 'post IG ' + (i + 1),
  }));

  return {
    rings,
    necklaces,
    igTiles,
    igHandle: ig,
    igName: ig.includes('.') ? ig.slice(0, ig.lastIndexOf('.')) : ig,
    igExt: ig.includes('.') ? ig.slice(ig.lastIndexOf('.')) : '',
    igHref: `https://instagram.com/${ig}`,
    waGeneral: wa(num, 'Hola FOMO! Quiero hacer un pedido'),
    waFeatured: wa(num, 'Hola FOMO! Quiero el collar CANDADO XL ($21.900)'),
  };
}

export type Catalog = ReturnType<typeof buildCatalog>;
