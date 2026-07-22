/** Escapes the five HTML-significant characters so a string is safe to
 *  interpolate into markup — either element text or a double-quoted attribute
 *  value. `&` must be replaced first or the later entities get double-escaped.
 *
 *  Used for merge-token VALUES in the onboarding email (an invitee-controlled
 *  name can't inject markup; a link's query-string `&` becomes a valid `&amp;`
 *  inside the href) and by the PDF importer when rebuilding policy HTML. */
export function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
