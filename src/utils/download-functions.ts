/**
 * Trigger a browser download of a URL (a remote/signed URL or an object URL) as
 * `filename`, without navigating the page. For object URLs the caller is
 * responsible for `URL.revokeObjectURL` after the click.
 */
export function downloadUrl(url: string, filename: string) {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
