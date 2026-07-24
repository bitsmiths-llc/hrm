const normalizeText = (text: string) => text.trim().replace(/\s+/g, ' ');

/** Class stamped onto every changed line in the new content — a heading or
 *  paragraph, or an individual list item rather than the whole list — so
 *  the employee-facing view can highlight exactly what changed instead of
 *  making them re-read the whole document. */
export const POLICY_DIFF_HIGHLIGHT_CLASS = 'policy-diff-highlight';

type DiffBlock = {
  element: Element;
  text: string;
};

function getTextContent(node: Element): string {
  return normalizeText(node.textContent ?? '');
}

function collectBlocksFromDocument(doc: Document): DiffBlock[] {
  const blocks: DiffBlock[] = [];

  for (const node of Array.from(doc.body.children)) {
    if (node.tagName === 'UL' || node.tagName === 'OL') {
      for (const li of Array.from(node.children)) {
        blocks.push({
          element: li as Element,
          text: getTextContent(li as Element),
        });
      }
    } else {
      blocks.push({
        element: node as Element,
        text: getTextContent(node as Element),
      });
    }
  }

  return blocks;
}

function collectBlocks(html: string): DiffBlock[] {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return collectBlocksFromDocument(doc);
}

function markBlock(block: DiffBlock) {
  block.element.classList.add(POLICY_DIFF_HIGHLIGHT_CLASS);
}

type EditOperation =
  | { type: 'equal'; block: DiffBlock }
  | { type: 'insert'; block: DiffBlock }
  | { type: 'delete'; block: DiffBlock }
  | { type: 'replace'; oldBlock: DiffBlock; newBlock: DiffBlock };

function buildEditOperations(oldBlocks: DiffBlock[], newBlocks: DiffBlock[]) {
  const dp = Array.from({ length: oldBlocks.length + 1 }, () =>
    Array<number>(newBlocks.length + 1).fill(0),
  );

  for (let index = 1; index <= oldBlocks.length; index += 1) {
    dp[index][0] = index;
  }
  for (let index = 1; index <= newBlocks.length; index += 1) {
    dp[0][index] = index;
  }

  for (let oldIndex = 1; oldIndex <= oldBlocks.length; oldIndex += 1) {
    for (let newIndex = 1; newIndex <= newBlocks.length; newIndex += 1) {
      if (oldBlocks[oldIndex - 1].text === newBlocks[newIndex - 1].text) {
        dp[oldIndex][newIndex] = dp[oldIndex - 1][newIndex - 1];
      } else {
        dp[oldIndex][newIndex] =
          1 +
          Math.min(
            dp[oldIndex - 1][newIndex],
            dp[oldIndex][newIndex - 1],
            dp[oldIndex - 1][newIndex - 1],
          );
      }
    }
  }

  const operations: EditOperation[] = [];
  let oldIndex = oldBlocks.length;
  let newIndex = newBlocks.length;

  while (oldIndex > 0 || newIndex > 0) {
    if (oldIndex > 0 && newIndex > 0 && oldBlocks[oldIndex - 1].text === newBlocks[newIndex - 1].text) {
      operations.push({ type: 'equal', block: oldBlocks[oldIndex - 1] });
      oldIndex -= 1;
      newIndex -= 1;
      continue;
    }

    const deleteCost = oldIndex > 0 ? dp[oldIndex - 1][newIndex] + 1 : Number.POSITIVE_INFINITY;
    const insertCost = newIndex > 0 ? dp[oldIndex][newIndex - 1] + 1 : Number.POSITIVE_INFINITY;
    const replaceCost = oldIndex > 0 && newIndex > 0 ? dp[oldIndex - 1][newIndex - 1] + 1 : Number.POSITIVE_INFINITY;

    if (insertCost <= deleteCost && insertCost <= replaceCost) {
      operations.push({ type: 'insert', block: newBlocks[newIndex - 1] });
      newIndex -= 1;
    } else if (deleteCost <= insertCost && deleteCost <= replaceCost) {
      operations.push({ type: 'delete', block: oldBlocks[oldIndex - 1] });
      oldIndex -= 1;
    } else {
      operations.push({
        type: 'replace',
        oldBlock: oldBlocks[oldIndex - 1],
        newBlock: newBlocks[newIndex - 1],
      });
      oldIndex -= 1;
      newIndex -= 1;
    }
  }

  return operations.reverse();
}

export function getPolicyDiffSummary(oldHtml: string, newHtml: string): number {
  const oldBlocks = collectBlocks(oldHtml);
  const newBlocks = collectBlocks(newHtml);
  const operations = buildEditOperations(oldBlocks, newBlocks);

  return operations.filter((operation) => operation.type !== 'equal').length;
}

export function highlightChangedBlocks(
  oldHtml: string,
  newHtml: string,
): string {
  const oldBlocks = collectBlocks(oldHtml);
  const doc = new DOMParser().parseFromString(newHtml, 'text/html');
  const newBlocks = collectBlocksFromDocument(doc);
  const operations = buildEditOperations(oldBlocks, newBlocks);

  for (const operation of operations) {
    if (operation.type === 'insert') {
      markBlock(operation.block);
    } else if (operation.type === 'replace') {
      markBlock(operation.newBlock);
    }
  }

  return doc.body.innerHTML;
}
