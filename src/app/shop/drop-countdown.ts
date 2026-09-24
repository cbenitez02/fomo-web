import type { PublicDrop } from '../core/api/public.types';

export function formatCountdown(endsAt: string, now = Date.now()): string | null {
  const end = new Date(endsAt).getTime();
  if (Number.isNaN(end)) return null;
  const d = Math.max(0, Math.floor((end - now) / 1000));
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(d / 3600))}:${pad(Math.floor((d % 3600) / 60))}:${pad(d % 60)}`;
}

export function shouldShowDropCountdown(drop: PublicDrop | null | undefined): boolean {
  if (!drop?.endsAt) return false;
  if (drop.status === 'ended' || drop.status === 'unscheduled') return false;
  return !Number.isNaN(new Date(drop.endsAt).getTime());
}
