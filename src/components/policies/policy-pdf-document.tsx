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

import {
  payslipPdfColors as c,
  payslipPdfContact as contact,
  payslipPdfMetrics as metrics,
} from '@/constants/payslip-pdf';

import { Policy, PolicyVersion } from '@/types/hrm';

const styles = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingBottom: metrics.footerReserve,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: c.textBody,
  },

  masthead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: metrics.pageX,
    paddingTop: 26,
  },
  markWrap: { marginRight: 22 },
  lockup: { flexDirection: 'column', alignItems: 'flex-end' },
  companyName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 26,
    letterSpacing: 0.2,
    color: c.textStrong,
  },
  docTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 20,
    letterSpacing: 0.2,
    color: c.brandGreen,
    marginTop: 2,
  },
  mastheadRule: {
    marginHorizontal: metrics.pageX,
    marginTop: 22,
    borderBottomWidth: 1,
    borderBottomColor: c.ruleStrong,
  },

  headerMeta: {
    marginHorizontal: metrics.pageX,
    marginTop: 12,
    paddingVertical: 9,
    paddingHorizontal: 12,
    backgroundColor: c.metaTint,
    borderLeftWidth: 2,
    borderLeftColor: c.brandGreen,
  },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap' },
  metaCell: { width: '50%', paddingRight: 16, marginBottom: 7 },
  metaLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
    color: c.textMuted,
    marginBottom: 3,
  },
  metaValue: {
    fontSize: 10,
    color: c.textStrong,
    fontFamily: 'Helvetica-Bold',
  },

  body: { paddingHorizontal: metrics.pageX, paddingTop: 12 },
  title: {
    fontSize: 14,
    fontWeight: 700,
    color: c.textStrong,
    marginBottom: 8,
  },
  sectionRule: {
    borderBottomWidth: 0.75,
    borderBottomColor: c.hairline,
    marginBottom: 10,
  },

  h2: { fontSize: 11, fontWeight: 700, marginTop: 12, marginBottom: 6, color: c.textStrong },
  h3: { fontSize: 10, fontWeight: 700, marginTop: 10, marginBottom: 4, color: c.textStrong },
  p: { marginBottom: 7, lineHeight: 1.45, color: c.textBody },
  list: { marginBottom: 7 },
  listItem: { flexDirection: 'row', marginBottom: 3 },
  bullet: { width: 16, color: c.textMuted },
  listText: { flex: 1, lineHeight: 1.45, color: c.textBody },
  link: { color: c.brandGreenDeep, textDecoration: 'underline' },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: c.metaTint,
    paddingVertical: 14,
  },
  footerRule: {
    marginHorizontal: metrics.pageX,
    borderBottomWidth: 0.75,
    borderBottomColor: c.hairline,
  },
  footerInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: metrics.pageX,
    gap: 18,
    paddingTop: 12,
  },
  footerItem: { flex: 1, minWidth: 120 },
  footerText: { fontSize: 9, color: c.textMuted, lineHeight: 1.4 },
  footerStrong: { fontSize: 9, color: c.textStrong, fontFamily: 'Helvetica-Bold', lineHeight: 1.4 },

  pageNumber: {
    position: 'absolute',
    bottom: 34,
    right: metrics.pageX,
    fontSize: 8,
    color: c.textMuted,
  },
});

function BitsmithsMark({ size = 58 }: { size?: number }) {
  return (
    <Svg width={size} height={(size * 21) / 20} viewBox='0 0 20 21'>
      <Path
        d='M5.518 14.7314H19.246C18.808 18.9504 15.596 20.6414 14.137 20.7324C12.677 20.8224 1.047 20.7324 0.0440038 20.7324C-0.229996 20.7324 0.682004 14.7314 5.518 14.7314Z'
        fill={c.logoDark}
      />
      <Path
        d='M9.426 0H0C0.408 4.184 3.397 5.862 4.756 5.952C6.114 6.042 13.587 5.952 14.521 5.952C14.776 5.952 13.927 0 9.426 0ZM13.729 7.183H0C0.438 11.403 3.65 13.093 5.109 13.185C6.569 13.275 18.199 13.185 19.202 13.185C19.476 13.185 18.564 7.183 13.728 7.183'
        fill={c.brandGreen}
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
        <Text key={key} style={{ fontWeight: 700, color: c.textStrong }}>
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
  const metaFields = [
    { label: 'DOCUMENT', value: 'POLICY' },
    { label: 'CATEGORY', value: policy.category.toUpperCase() },
    { label: 'PUBLISHED', value: new Date(version.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
  ];

  return (
    <Document title={`${policy.title} — Policy`} author='Bitsmiths Studios LLC'>
      <Page size='A4' style={styles.page}>
        <View fixed>
          <View style={styles.masthead}>
            <View style={styles.markWrap}>
              <BitsmithsMark size={58} />
            </View>
            <View style={styles.lockup}>
              <Text style={styles.companyName}>BITSMITHS STUDIOS LLC</Text>
              <Text style={styles.docTitle}>POLICY DOCUMENT</Text>
            </View>
          </View>
          <View style={styles.mastheadRule} />

          <View style={styles.headerMeta}>
            <View style={styles.metaRow}>
              {metaFields.map((field) => (
                <View key={field.label} style={styles.metaCell}>
                  <Text style={styles.metaLabel}>{field.label}</Text>
                  <Text style={styles.metaValue}>{field.value}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{policy.title}</Text>
          <View style={styles.sectionRule} />
          {htmlToPdfBlocks(version.contentHtml)}
        </View>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
        <View style={styles.footer} fixed>
          <View style={styles.footerRule} />
          <View style={styles.footerInner}>
            <View style={styles.footerItem}>
              <Text style={styles.footerStrong}>Bitsmiths Studios LLC</Text>
              <Text style={styles.footerText}>Confidential</Text>
            </View>
            <View style={styles.footerItem}>
              <Text style={styles.footerStrong}>Website</Text>
              <Text style={styles.footerText}>{contact.site}</Text>
            </View>
            <View style={styles.footerItem}>
              <Text style={styles.footerStrong}>Contact</Text>
              <Text style={styles.footerText}>{contact.phone}</Text>
            </View>
            <View style={styles.footerItem}>
              <Text style={styles.footerStrong}>Address</Text>
              <Text style={styles.footerText}>{contact.address}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
