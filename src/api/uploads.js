import { ApiError, USE_FIXTURES } from './client.js';

/**
 * Uploads an image (multipart field "image"). Uses XHR so we can report progress.
 * Resolves to { url, filename, size, mimeType }.
 */
export function uploadImage(file, { onProgress, signal } = {}) {
  if (USE_FIXTURES) {
    return Promise.resolve({ url: URL.createObjectURL(file), filename: file.name, size: file.size, mimeType: file.type });
  }
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/uploads/image');
    xhr.withCredentials = true;
    xhr.responseType = 'json';
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded / e.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.response);
      else reject(new ApiError(xhr.status, xhr.response));
    };
    xhr.onerror = () => reject(new ApiError(0, { error: { code: 'NETWORK_ERROR', message: 'Upload failed.' } }));
    xhr.onabort = () => reject(new DOMException('Aborted', 'AbortError'));
    signal?.addEventListener('abort', () => xhr.abort());
    const form = new FormData();
    form.append('image', file);
    xhr.send(form);
  });
}
