const PALETTES = [
  ['#2f5bd3', '#7d9cf5'],
  ['#b7791f', '#f0c36a'],
  ['#127a5e', '#58c9a5'],
  ['#9b3fb5', '#d38be6'],
  ['#c43a2f', '#f19a8c'],
  ['#1f6f8b', '#6cc3dd'],
];

function hash(str) {
  let h = 0;
  for (const ch of String(str)) h = (h * 31 + ch.codePointAt(0)) | 0;
  return Math.abs(h);
}

function initials(name) {
  const words = String(name ?? '').trim().split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? [words[0], words[words.length - 1]] : words;
  return letters.map((w) => Array.from(w)[0].toUpperCase()).join('') || '?';
}

/** Photo if available, otherwise coloured initials derived from the name. */
export default function Avatar({ name, src, className = 'size-10 text-sm', rounded = 'rounded-full' }) {
  if (src) return <img src={src} alt="" className={`${className} ${rounded} shrink-0 object-cover`} />;
  const [from, to] = PALETTES[hash(name) % PALETTES.length];
  return (
    <span
      aria-hidden="true"
      className={`${className} ${rounded} flex shrink-0 items-center justify-center font-semibold text-white`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {initials(name)}
    </span>
  );
}
