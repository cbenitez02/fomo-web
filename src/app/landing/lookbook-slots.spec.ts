import { LOOKBOOK_SLOT_COUNT, assignLookbookSlots } from './lookbook-slots';

describe('lookbook slots', () => {
  it('siempre arma 6 celdas y toma solo los primeros publicados en orden', () => {
    const many = [1, 2, 3, 4, 5, 6, 7, 8];
    const slots = assignLookbookSlots(many);
    expect(slots.length).toBe(LOOKBOOK_SLOT_COUNT);
    expect(slots.map((s) => s.item)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('con 0–5 ítems deja el resto de slots vacíos sin cortar el collage', () => {
    expect(assignLookbookSlots([]).every((s) => s.item === null)).toBeTrue();
    const three = assignLookbookSlots(['a', 'b', 'c']);
    expect(three.map((s) => s.item)).toEqual(['a', 'b', 'c', null, null, null]);
  });
});
