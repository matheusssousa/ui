/** Opens an HTTP(S) URL in the browser. The server controls download disposition. */
export function openDownloadUrl(downloadUrl: string): void {
  const url = new URL(downloadUrl, window.location.origin);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('URL de download inválida.');
  const anchor = document.createElement('a');
  anchor.href = url.toString();
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  try { anchor.click(); } finally { anchor.remove(); }
}
