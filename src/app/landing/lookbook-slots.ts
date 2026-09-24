/** Collage de landing: look-1 … look-6. El admin puede guardar más; la web no los pinta. */
export const LOOKBOOK_VISIBLE_SLOTS = [
  { n: 1, speed: '0.12' },
  { n: 2, speed: '-0.2' },
  { n: 3, speed: '0.28' },
  { n: 4, speed: '-0.1' },
  { n: 5, speed: '0.2' },
  { n: 6, speed: '-0.24' },
] as const;

export const LOOKBOOK_SLOT_COUNT = LOOKBOOK_VISIBLE_SLOTS.length;

export function assignLookbookSlots<T>(items: T[]) {
  return LOOKBOOK_VISIBLE_SLOTS.map((slot) => ({
    ...slot,
    item: items[slot.n - 1] ?? null,
  }));
}
