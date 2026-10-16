const nf = new Intl.NumberFormat('en-US');

export function formatNumber(n) {
  return nf.format(n);
}

/** 4512 → "4,512 bytes" */
export function formatBytes(n) {
  return `${nf.format(n)} ${n === 1 ? 'byte' : 'bytes'}`;
}

/** 120 → "+120", -40 → "−40" (U+2212 minus), 0 → "0" */
export function formatDelta(n) {
  if (n > 0) return `+${nf.format(n)}`;
  if (n < 0) return `−${nf.format(Math.abs(n))}`;
  return '0';
}

/** 4512 → "4 KB" (search result meta line). */
export function formatKB(n) {
  if (n < 1024) return `${n} bytes`;
  return `${nf.format(Math.round(n / 1024))} KB`;
}

export function countWords(text) {
  const words = String(text ?? '').trim().split(/\s+/).filter(Boolean);
  return words.length;
}
