// Client-side pre-check for photo uploads (PROJECT_SPEC §7.5). The server is the authority and enforces the
// same rules; this only gives instant feedback before uploading.

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const TYPES = {
  'image/jpeg': { exts: ['jpg', 'jpeg'], magic: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  'image/png': { exts: ['png'], magic: (b) => [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((v, i) => b[i] === v) },
  'image/gif': { exts: ['gif'], magic: (b) => String.fromCharCode(...b.slice(0, 6)).match(/^GIF8[79]a$/) !== null },
  'image/webp': {
    exts: ['webp'],
    magic: (b) => String.fromCharCode(...b.slice(0, 4)) === 'RIFF' && String.fromCharCode(...b.slice(8, 12)) === 'WEBP',
  },
};

/** Value for <input type="file" accept>. */
export const IMAGE_ACCEPT = Object.keys(TYPES).join(',');

const NOT_AN_IMAGE = 'Only photos can be uploaded: JPEG, PNG, WebP or GIF.';

async function readHead(file, n = 12) {
  const blob = file.slice(0, n);
  const buf = typeof blob.arrayBuffer === 'function' ? await blob.arrayBuffer() : await new Response(blob).arrayBuffer();
  return new Uint8Array(buf);
}

/**
 * Resolves to null when `file` is an allowed image, otherwise to a user-facing error message.
 * Checks the declared type, the extension and the file's leading "magic" bytes, so renamed
 * videos/documents are rejected too.
 */
export async function checkImageFile(file) {
  if (!file) return NOT_AN_IMAGE;
  const spec = TYPES[file.type];
  const ext = String(file.name ?? '').split('.').pop().toLowerCase();
  if (!spec || !spec.exts.includes(ext)) return NOT_AN_IMAGE;
  if (file.size > MAX_IMAGE_BYTES) return 'That photo is larger than 5 MB. Please choose a smaller one.';
  if (file.size === 0) return 'That file is empty.';
  try {
    if (!spec.magic(await readHead(file))) return `${NOT_AN_IMAGE} This file only looks like one.`;
  } catch {
    return 'That file could not be read.';
  }
  return null;
}

/** Message for an upload error returned by the server. */
export function uploadErrorMessage(err) {
  switch (err?.code) {
    case 'UNSUPPORTED_MEDIA_TYPE':
      return NOT_AN_IMAGE;
    case 'PAYLOAD_TOO_LARGE':
      return 'That photo is larger than 5 MB. Please choose a smaller one.';
    case 'UNAUTHENTICATED':
      return 'Your session expired. Please log in again.';
    case 'RATE_LIMITED':
      return 'Too many uploads. Please wait a moment and try again.';
    default:
      return err?.message || 'Upload failed. Please try again.';
  }
}
