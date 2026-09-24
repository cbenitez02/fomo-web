import { formatCountdown, shouldShowDropCountdown } from './drop-countdown';
import type { PublicDrop } from '../core/api/public.types';

describe('drop countdown', () => {
  const current: PublicDrop = {
    code: 'DROP 07',
    startsAt: '2026-09-01T00:00:00.000Z',
    endsAt: '2026-10-01T00:00:00.000Z',
    status: 'current',
  };

  it('muestra timer si hay endsAt y el drop está vigente o próximo', () => {
    expect(shouldShowDropCountdown(current)).toBeTrue();
    expect(shouldShowDropCountdown({ ...current, status: 'upcoming' })).toBeTrue();
  });

  it('no muestra timer fake sin fecha, unscheduled o ended', () => {
    expect(shouldShowDropCountdown(null)).toBeFalse();
    expect(shouldShowDropCountdown({ ...current, endsAt: null })).toBeFalse();
    expect(shouldShowDropCountdown({ ...current, status: 'unscheduled', startsAt: null, endsAt: null })).toBeFalse();
    expect(shouldShowDropCountdown({ ...current, status: 'ended' })).toBeFalse();
  });

  it('formatea HH:MM:SS y recorta a cero si ya venció', () => {
    expect(formatCountdown('2026-01-01T00:00:00.000Z', Date.parse('2026-01-01T03:04:05.000Z'))).toBe(
      '00:00:00',
    );
    expect(formatCountdown('2026-01-01T10:00:00.000Z', Date.parse('2026-01-01T08:59:01.000Z'))).toBe(
      '01:00:59',
    );
  });
});
