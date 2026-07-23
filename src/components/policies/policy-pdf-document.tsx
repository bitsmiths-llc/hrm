import {
  Document,
  Link as PdfLink,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
} from '@react-pdf/renderer';

import { Policy, PolicyVersion } from '@/types/hrm';

const BRAND_GREEN = '#04CD77';
const DEEP_GREEN = '#0A3524';
const TEXT_DARK = '#111111';
const TEXT_MUTED = '#6B7280';
const HAIRLINE = '#E5E7EB';

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingHorizontal: 48,
    paddingBottom: 64,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: TEXT_DARK,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  wordmark: {
    fontSize: 14,
    fontWeight: 700,
    marginLeft: 9,
    letterSpacing: 0.3,
  },
  docType: {
    fontSize: 8.5,
    fontWeight: 700,
    color: TEXT_MUTED,
    letterSpacing: 1.5,
  },

  title: { fontSize: 18, fontWeight: 700, marginBottom: 12 },
  rule: {
    borderBottomWidth: 1.5,
    borderBottomColor: TEXT_DARK,
    marginBottom: 18,
  },

  h2: { fontSize: 13, fontWeight: 700, marginTop: 14, marginBottom: 6 },
  h3: { fontSize: 11, fontWeight: 700, marginTop: 10, marginBottom: 4 },
  p: { marginBottom: 7, lineHeight: 1.5, color: '#374151' },
  list: { marginBottom: 7 },
  listItem: { flexDirection: 'row', marginBottom: 3 },
  bullet: { width: 16, color: TEXT_MUTED },
  listText: { flex: 1, lineHeight: 1.5, color: '#374151' },
  link: { color: '#047857', textDecoration: 'underline' },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: DEEP_GREEN,
    paddingVertical: 10,
    paddingHorizontal: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: { fontSize: 8, color: '#8FCDB0' },

  pageNumber: {
    position: 'absolute',
    bottom: 34,
    right: 48,
    fontSize: 8,
    color: TEXT_MUTED,
  },
  hairline: { borderBottomWidth: 1, borderBottomColor: HAIRLINE },
});

function BitsmithsMark({ size = 26 }: { size?: number }) {
  return (
    <Svg width={size} height={(size * 21) / 20} viewBox='0 0 20 21'>
      <Path
        d='M5.518 14.7314H19.246C18.808 18.9504 15.596 20.6414 14.137 20.7324C12.677 20.8224 1.047 20.7324 0.0440038 20.7324C-0.229996 20.7324 0.682004 14.7314 5.518 14.7314Z'
        fill='#B3B3B3'
      />
      <Path
        d='M9.426 0H0C0.408 4.184 3.397 5.862 4.756 5.952C6.114 6.042 13.587 5.952 14.521 5.952C14.776 5.952 13.927 0 9.426 0ZM13.729 7.183H0C0.438 11.403 3.65 13.093 5.109 13.185C6.569 13.275 18.199 13.185 19.202 13.185C19.476 13.185 18.564 7.183 13.728 7.183'
        fill={BRAND_GREEN}
      />
    </Svg>
  );
}

/** Policy content is CKEditor-authored HTML with a small, known tag set
 *  (headings, paragraphs, bold/italic, links, lists). This maps it onto
 *  react-pdf primitives directly — no HTML-to-PDF dependency needed.
 *  Runs client-side only (DOMParser), which is fine: PDFs are generated
 *  in the browser on click. */
function renderInline(node: ChildNode, key: number): React.ReactNode {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent;
  if (!(node instanceof HTMLElement)) return null;

  const children = Array.from(node.childNodes).map((child, index) =>
    renderInline(child, index),
  );
  switch (node.tagName) {
    case 'STRONG':
    case 'B':
      return (
        <Text key={key} style={{ fontWeight: 700, color: TEXT_DARK }}>
          {children}
        </Text>
      );
    case 'EM':
    case 'I':
      return (
        <Text key={key} style={{ fontFamily: 'Helvetica-Oblique' }}>
          {children}
        </Text>
      );
    case 'A':
      return (
        <PdfLink
          key={key}
          src={node.getAttribute('href') ?? ''}
          style={styles.link}
        >
          {children}
        </PdfLink>
      );
    default:
      return <Text key={key}>{children}</Text>;
  }
}

function renderBlock(node: ChildNode, key: number): React.ReactNode {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim();
    if (!text) return null;
    return (
      <Text key={key} style={styles.p}>
        {text}
      </Text>
    );
  }
  if (!(node instanceof HTMLElement)) return null;

  const inline = Array.from(node.childNodes).map((child, index) =>
    renderInline(child, index),
  );
  switch (node.tagName) {
    case 'H1':
    case 'H2':
      return (
        <Text key={key} style={styles.h2}>
          {inline}
        </Text>
      );
    case 'H3':
    case 'H4':
      return (
        <Text key={key} style={styles.h3}>
          {inline}
        </Text>
      );
    case 'UL':
    case 'OL': {
      const ordered = node.tagName === 'OL';
      return (
        <View key={key} style={styles.list}>
          {Array.from(node.children).map((item, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.bullet}>
                {ordered ? `${index + 1}.` : '•'}
              </Text>
              <Text style={styles.listText}>
                {Array.from(item.childNodes).map((child, childIndex) =>
                  renderInline(child, childIndex),
                )}
              </Text>
            </View>
          ))}
        </View>
      );
    }
    default:
      return (
        <Text key={key} style={styles.p}>
          {inline}
        </Text>
      );
  }
}

function htmlToPdfBlocks(html: string): React.ReactNode[] {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  return Array.from(parsed.body.childNodes).map((node, index) =>
    renderBlock(node, index),
  );
}

type PolicyPdfDocumentProps = {
  policy: Pick<Policy, 'title' | 'category'>;
  version: PolicyVersion;
};

export function PolicyPdfDocument({ policy, version }: PolicyPdfDocumentProps) {
  return (
    <Document>
      <Page size='A4' style={styles.page}>
        <View style={styles.headerRow} fixed>
          <View style={styles.brandRow}>
            <BitsmithsMark />
            <Text style={styles.wordmark}>BitSmiths</Text>
          </View>
          <Text style={styles.docType}>POLICY DOCUMENT</Text>
        </View>

        <Text style={styles.title}>{policy.title}</Text>
        <View style={styles.rule} />

        {htmlToPdfBlocks(version.contentHtml)}

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Issued by Bitsmiths Studio · Confidential
          </Text>
          <Text style={styles.footerText}>www.bitsmiths.studio</Text>
        </View>
      </Page>
    </Document>
  );
}
