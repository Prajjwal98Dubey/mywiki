import { describe, it, expect } from 'vitest';
import { checkImageFile, uploadErrorMessage, MAX_IMAGE_BYTES } from './imageFile.js';

const bytes = {
  jpeg: [0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1],
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d],
  gif: [...'GIF89a'].map((c) => c.charCodeAt(0)).concat([1, 0, 1, 0, 0, 0]),
  webp: [...'RIFF'].map((c) => c.charCodeAt(0)).concat([0x24, 0, 0, 0], [...'WEBP'].map((c) => c.charCodeAt(0))),
  mp4: [0, 0, 0, 0x18, ...'ftypmp42'].map((c) => (typeof c === 'string' ? c.charCodeAt(0) : c)),
  pdf: [...'%PDF-1.7\n%..'].map((c) => c.charCodeAt(0)),
};
const file = (name, type, content) => new File([new Uint8Array(content)], name, { type });

describe('checkImageFile', () => {
  it.each([
    ['photo.jpg', 'image/jpeg', bytes.jpeg],
    ['photo.JPEG', 'image/jpeg', bytes.jpeg],
    ['photo.png', 'image/png', bytes.png],
    ['photo.gif', 'image/gif', bytes.gif],
    ['photo.webp', 'image/webp', bytes.webp],
  ])('accepts %s', async (name, type, content) => {
    expect(await checkImageFile(file(name, type, content))).toBeNull();
  });

  it.each([
    ['clip.mp4', 'video/mp4', bytes.mp4],
    ['cv.pdf', 'application/pdf', bytes.pdf],
    ['logo.svg', 'image/svg+xml', [...'<svg xmlns='].map((c) => c.charCodeAt(0))],
    ['notes.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', [0x50, 0x4b, 3, 4]],
  ])('rejects non-images: %s', async (name, type, content) => {
    expect(await checkImageFile(file(name, type, content))).toMatch(/Only photos/);
  });

  it('rejects a video renamed to .jpg (content is checked, not just the name)', async () => {
    expect(await checkImageFile(file('holiday.jpg', 'image/jpeg', bytes.mp4))).toMatch(/only looks like one/);
  });

  it('rejects a mismatched extension', async () => {
    expect(await checkImageFile(file('photo.exe', 'image/png', bytes.png))).toMatch(/Only photos/);
  });

  it('rejects files over 5 MB and empty files', async () => {
    const big = new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], 'big.jpg', { type: 'image/jpeg' });
    expect(await checkImageFile(big)).toMatch(/larger than 5 MB/);
    expect(await checkImageFile(file('empty.png', 'image/png', []))).toMatch(/empty/);
  });
});

describe('uploadErrorMessage', () => {
  it('explains server rejections', () => {
    expect(uploadErrorMessage({ code: 'UNSUPPORTED_MEDIA_TYPE' })).toMatch(/Only photos/);
    expect(uploadErrorMessage({ code: 'PAYLOAD_TOO_LARGE' })).toMatch(/5 MB/);
    expect(uploadErrorMessage({ code: 'INTERNAL', message: 'S3 down' })).toBe('S3 down');
  });
});
