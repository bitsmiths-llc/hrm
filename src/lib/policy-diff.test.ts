// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';

import {
  POLICY_DIFF_HIGHLIGHT_CLASS,
  getPolicyDiffSummary,
  highlightChangedBlocks,
} from './policy-diff';

describe('policy diff helpers', () => {
  it('marks new and changed blocks and reports a summary count', () => {
    const oldHtml = '<h2>Overview</h2><p>Existing rule.</p><ul><li>First</li></ul>';
    const newHtml =
      '<h2>Overview</h2><p>Existing rule.</p><p>New guidance added.</p><ul><li>First</li><li>Second</li></ul>';

    const html = highlightChangedBlocks(oldHtml, newHtml);
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const markedBlocks = Array.from(
      doc.body.querySelectorAll(`.${POLICY_DIFF_HIGHLIGHT_CLASS}`),
    );

    expect(markedBlocks.some((node) => node.textContent?.includes('New guidance added'))).toBe(true);
    expect(markedBlocks.some((node) => node.textContent?.includes('Second'))).toBe(true);
    expect(getPolicyDiffSummary(oldHtml, newHtml)).toBe(2);
  });

  it('treats deletions from the previous version as a change', () => {
    const oldHtml = '<p>Alpha</p><p>Beta</p><p>Gamma</p>';
    const newHtml = '<p>Alpha</p><p>Delta</p>';

    const html = highlightChangedBlocks(oldHtml, newHtml);
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const markedBlocks = Array.from(
      doc.body.querySelectorAll(`.${POLICY_DIFF_HIGHLIGHT_CLASS}`),
    );

    expect(markedBlocks.some((node) => node.textContent?.includes('Delta'))).toBe(true);
    expect(getPolicyDiffSummary(oldHtml, newHtml)).toBe(2);
  });
});
