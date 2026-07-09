type Section = { heading: string; text: string };

const INTRO_HEADING = '__intro__';

const normalizeText = (text: string) => text.trim().replace(/\s+/g, ' ');

function extractSections(html: string): Section[] {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const sections: Section[] = [];
  let current: Section | null = null;

  for (const node of Array.from(doc.body.children)) {
    if (node.tagName === 'H2' || node.tagName === 'H3') {
      current = { heading: node.textContent?.trim() ?? '', text: '' };
      sections.push(current);
      continue;
    }
    if (!current) {
      current = { heading: INTRO_HEADING, text: '' };
      sections.push(current);
    }
    current.text += `${node.textContent?.trim() ?? ''}\n`;
  }

  return sections;
}

const formatList = (headings: string[]) =>
  headings
    .map((heading) =>
      heading === INTRO_HEADING ? 'the introduction' : `"${heading}"`,
    )
    .join(', ');

/** Diffs two policy content HTML strings section-by-section (split on
 *  headings) and generates a plain-English summary of what changed —
 *  so admin doesn't have to write the changelog by hand. Still shown in
 *  an editable field before publishing, since an automatic diff can be
 *  noisy (e.g. a wording tweak reads the same as a substantive change). */
export function summarizePolicyChanges(
  oldHtml: string,
  newHtml: string,
): string {
  const oldSections = extractSections(oldHtml);
  const newSections = extractSections(newHtml);
  const oldByHeading = new Map(oldSections.map((s) => [s.heading, s.text]));
  const newByHeading = new Map(newSections.map((s) => [s.heading, s.text]));

  const added: string[] = [];
  const changed: string[] = [];
  const removed: string[] = [];

  for (const [heading, text] of newByHeading) {
    if (!oldByHeading.has(heading)) added.push(heading);
    else if (oldByHeading.get(heading) !== text) changed.push(heading);
  }
  for (const heading of oldByHeading.keys()) {
    if (!newByHeading.has(heading)) removed.push(heading);
  }

  const parts: string[] = [];
  if (changed.length) parts.push(`Updated ${formatList(changed)}`);
  if (added.length) parts.push(`Added ${formatList(added)}`);
  if (removed.length) parts.push(`Removed ${formatList(removed)}`);

  return parts.length ? `${parts.join('. ')}.` : 'Minor edits.';
}

/** Class stamped onto every changed line in the new content — a heading or
 *  paragraph, or an individual list item rather than the whole list — so
 *  the employee-facing view can highlight exactly what changed instead of
 *  making them re-read the whole document. */
export const POLICY_DIFF_HIGHLIGHT_CLASS = 'policy-diff-highlight';

function collectLineTexts(html: string): Set<string> {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const texts = new Set<string>();
  for (const node of Array.from(doc.body.children)) {
    if (node.tagName === 'UL' || node.tagName === 'OL') {
      for (const li of Array.from(node.children)) {
        texts.add(normalizeText(li.textContent ?? ''));
      }
    } else {
      texts.add(normalizeText(node.textContent ?? ''));
    }
  }
  return texts;
}

export function highlightChangedBlocks(
  oldHtml: string,
  newHtml: string,
): string {
  const oldLineTexts = collectLineTexts(oldHtml);
  const doc = new DOMParser().parseFromString(newHtml, 'text/html');

  const markIfChanged = (node: Element) => {
    const text = normalizeText(node.textContent ?? '');
    if (!text || !oldLineTexts.has(text)) {
      node.classList.add(POLICY_DIFF_HIGHLIGHT_CLASS);
    }
  };

  for (const node of Array.from(doc.body.children)) {
    if (node.tagName === 'UL' || node.tagName === 'OL') {
      Array.from(node.children).forEach(markIfChanged);
    } else {
      markIfChanged(node);
    }
  }

  return doc.body.innerHTML;
}
