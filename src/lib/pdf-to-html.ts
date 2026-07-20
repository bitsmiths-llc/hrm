import type {
  PDFDocumentProxy,
  TextItem,
} from 'pdfjs-dist/types/src/display/api';

/** One visual line of the PDF, reassembled from positioned glyph runs. */
type PdfLine = {
  text: string;
  height: number;
  bold: boolean;
  /** Vertical gap to the previous line on the same page (0 for the first). */
  gapBefore: number;
};

const BULLET_PATTERN = /^[•·▪●◦\-–*]\s+/;
const ORDERED_PATTERN = /^\d{1,2}[.)]\s+/;
/** Bare page numbers / "Page 3 of 4" furniture — never policy content. */
const PAGE_FURNITURE_PATTERN = /^(\d{1,3}|page\s+\d+(\s+of\s+\d+)?)$/i;

const escapeHtml = (text: string) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

/** Extracts a PDF's text in the browser (pdf.js) and reconstructs simple
 *  policy HTML from layout heuristics: larger lines become headings, bullet/
 *  numbered markers become lists, wrapped lines merge into paragraphs. The
 *  result seeds CKEditor as an editable draft — it's a starting point for
 *  the admin to clean up, not a faithful conversion. Scanned (image-only)
 *  PDFs have no text layer and are rejected. */
export async function pdfToPolicyHtml(file: File): Promise<string> {
  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
  GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();

  const doc = await getDocument({ data: await file.arrayBuffer() }).promise;
  return documentToPolicyHtml(doc);
}

/** The parsing pipeline, separated from document opening so Node-based
 *  tests can drive it through pdf.js's legacy build (the main build is
 *  browser-only). */
export async function documentToPolicyHtml(
  doc: PDFDocumentProxy,
): Promise<string> {
  const lines: PdfLine[] = [];
  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
    const page = await doc.getPage(pageNumber);
    const content = await page.getTextContent();
    const items = content.items.filter(
      (item): item is TextItem => 'str' in item,
    );

    // Group runs into visual lines by their y coordinate (transform[5]),
    // reading top-to-bottom, left-to-right.
    const sorted = [...items].sort(
      (a, b) =>
        b.transform[5] - a.transform[5] || a.transform[4] - b.transform[4],
    );

    let currentY: number | null = null;
    let currentRuns: TextItem[] = [];
    let previousY: number | null = null;

    const flushLine = () => {
      if (currentRuns.length === 0) return;
      const text = currentRuns
        .map((run) => run.str)
        .join('')
        .replace(/\s+/g, ' ')
        .trim();
      const height = Math.max(
        ...currentRuns.map((run) => run.height || Math.abs(run.transform[3])),
      );
      if (text && !PAGE_FURNITURE_PATTERN.test(text)) {
        const boldWidth = currentRuns
          .filter((run) =>
            (content.styles[run.fontName]?.fontFamily ?? '')
              .toLowerCase()
              .includes('bold'),
          )
          .reduce((sum, run) => sum + run.width, 0);
        const totalWidth = currentRuns.reduce((sum, run) => sum + run.width, 0);
        lines.push({
          text,
          height,
          bold: totalWidth > 0 && boldWidth / totalWidth > 0.6,
          gapBefore:
            previousY === null ? 0 : Math.abs(previousY - currentY!) - height,
        });
        previousY = currentY;
      }
      currentRuns = [];
    };

    for (const item of sorted) {
      const y = item.transform[5];
      if (currentY === null || Math.abs(y - currentY) > 2.5) {
        flushLine();
        currentY = y;
      }
      currentRuns.push(item);
    }
    flushLine();
    // Page boundary always breaks the paragraph.
    if (lines.length > 0) lines[lines.length - 1].gapBefore += 100;
  }

  if (lines.length === 0) {
    throw new Error(
      'No selectable text found — this looks like a scanned PDF, which needs OCR.',
    );
  }

  const heights = lines.map((line) => line.height).sort((a, b) => a - b);
  const medianHeight = heights[Math.floor(heights.length / 2)] || 1;

  const blocks: string[] = [];
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length > 0) blocks.push(`<p>${paragraph.join(' ')}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (list && list.items.length > 0) {
      const tag = list.ordered ? 'ol' : 'ul';
      blocks.push(
        `<${tag}>${list.items.map((item) => `<li>${item}</li>`).join('')}</${tag}>`,
      );
    }
    list = null;
  };

  for (const line of lines) {
    const isHeading2 = line.height >= medianHeight * 1.3;
    const isHeading3 =
      !isHeading2 &&
      (line.height >= medianHeight * 1.12 ||
        (line.bold && line.text.length < 80));
    const listMarker = BULLET_PATTERN.test(line.text)
      ? 'ul'
      : ORDERED_PATTERN.test(line.text)
        ? 'ol'
        : null;

    if (isHeading2 || isHeading3) {
      flushParagraph();
      flushList();
      const tag = isHeading2 ? 'h2' : 'h3';
      blocks.push(`<${tag}>${escapeHtml(line.text)}</${tag}>`);
      continue;
    }

    if (listMarker) {
      flushParagraph();
      const ordered = listMarker === 'ol';
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { ordered, items: [] };
      }
      list.items.push(
        escapeHtml(
          line.text.replace(ordered ? ORDERED_PATTERN : BULLET_PATTERN, ''),
        ),
      );
      continue;
    }

    // Continuation of the current list item (wrapped line) vs new paragraph.
    if (list && line.gapBefore < line.height * 0.9) {
      list.items[list.items.length - 1] += ` ${escapeHtml(line.text)}`;
      continue;
    }
    flushList();

    // A large vertical gap starts a new paragraph; otherwise the line is a
    // soft wrap of the current one.
    if (line.gapBefore > line.height * 0.9) flushParagraph();
    paragraph.push(escapeHtml(line.text));
  }
  flushParagraph();
  flushList();

  return blocks.join('');
}
