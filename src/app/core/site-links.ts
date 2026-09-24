export function waHref(whatsapp: string, text: string): string {
  const num = whatsapp.replace(/\D/g, '');
  if (!num) return '';
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}

export function igProfileHref(handle: string): string {
  const ig = handle.replace(/^@/, '').trim();
  if (!ig) return '';
  return `https://instagram.com/${ig}`;
}

export function igHandleParts(handle: string): { name: string; ext: string; full: string } {
  const ig = handle.replace(/^@/, '').trim();
  const dot = ig.lastIndexOf('.');
  if (dot <= 0) return { name: ig, ext: '', full: ig };
  return { name: ig.slice(0, dot), ext: ig.slice(dot), full: ig };
}

export function marqueeLoop(text: string): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (!t) return '';
  const unit = /[✕x×]$/i.test(t) ? `${t} ` : `${t} ✕ `;
  return unit + unit;
}

export function padStock(value: number): string {
  return String(Math.max(0, Math.floor(value))).padStart(2, '0');
}

export function formatCopyright(text: string, year = new Date().getFullYear()): string {
  const t = text.trim();
  if (!t) return '';
  return /©|copyright/i.test(t) ? t : `© ${year} ${t}`;
}
