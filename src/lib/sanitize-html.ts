import sanitize from 'sanitize-html';
import 'server-only';

/** Tags the policy editor can actually produce. CKEditor is configured with
 *  Essentials + Paragraph + Heading + Bold + Italic + Link + List (see
 *  `components/hrm/rich-text-editor-impl.tsx`), and the PDF importer emits the
 *  same subset (`lib/pdf-to-html.ts`). Anything outside this list — `<script>`,
 *  `<iframe>`, `<style>`, event handlers, inline `style` — is stripped. */
const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'h2',
  'h3',
  'h4',
  'ul',
  'ol',
  'li',
  'a',
  'blockquote',
];

/**
 * Allow-list sanitizer for admin-authored rich text (policy bodies, and the
 * onboarding email template in M3.4). **Server-only on purpose**: sanitizing at
 * the write boundary — in the server action, before the value reaches the
 * database — is what makes the stored HTML safe to render with
 * `dangerouslySetInnerHTML`. A client-side pass would be trivially bypassed by
 * posting straight to the action.
 *
 * Links are limited to http/https/mailto and get `rel="noopener noreferrer"`,
 * so a stored `javascript:` URL can't execute and a policy can't reach back
 * into the app's tab.
 */
export function sanitizeHtml(html: string): string {
  return sanitize(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: { a: ['href', 'target', 'rel'] },
    allowedSchemes: ['http', 'https', 'mailto'],
    // Drop the contents too, not just the tag — otherwise the body of a
    // `<script>` survives as visible text.
    nonTextTags: ['script', 'style', 'textarea', 'option', 'noscript'],
    transformTags: {
      a: sanitize.simpleTransform('a', {
        target: '_blank',
        rel: 'noopener noreferrer',
      }),
    },
  });
}
