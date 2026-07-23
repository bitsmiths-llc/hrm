const normalizeText = (text: string) => text.trim().replace(/\s+/g, ' ');

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
