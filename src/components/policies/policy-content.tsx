type PolicyContentProps = {
  html: string;
};

/** Renders admin-authored policy HTML read-only. This is trusted content
 *  (written by admins via CKEditor, not user-submitted), so it's rendered
 *  directly rather than sanitized — a real backend should still sanitize
 *  on write once this is wired to Supabase.
 *
 *  Blocks carrying `POLICY_DIFF_HIGHLIGHT_CLASS` (see policy-diff.ts) get a
 *  highlight so employees can spot exactly what changed instead of
 *  re-reading the whole document. */
export function PolicyContent({ html }: PolicyContentProps) {
  return (
    <div
      className='[&_.policy-diff-highlight]:-mx-2 [&_.policy-diff-highlight]:rounded [&_.policy-diff-highlight]:bg-amber-500/15 [&_.policy-diff-highlight]:px-2 [&_.policy-diff-highlight]:py-0.5 [&_.policy-diff-highlight]:text-foreground [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-1 [&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-semibold [&_li]:mb-1 [&_li]:text-sm [&_li]:text-muted-foreground [&_p]:mb-3 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-muted-foreground [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5'
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
