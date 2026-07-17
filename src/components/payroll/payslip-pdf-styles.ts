import { StyleSheet } from '@react-pdf/renderer';

import {
  payslipPdfColors as c,
  payslipPdfMetrics as m,
} from '@/constants/payslip-pdf';

export const payslipPdfStyles = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingBottom: m.footerReserve,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: c.textBody,
  },
  headerMeta: {
    marginHorizontal: m.pageX,
    marginTop: 12,
    paddingVertical: 9,
    paddingHorizontal: 12,
    backgroundColor: c.metaTint,
    borderLeftWidth: 2,
    borderLeftColor: c.brandGreen,
  },

  masthead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: m.pageX,
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
    marginHorizontal: m.pageX,
    marginTop: 22,
    borderBottomWidth: 1,
    borderBottomColor: c.ruleStrong,
  },

  body: { paddingHorizontal: m.pageX },

  metaGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  metaCell: { width: '50%', paddingRight: 16, marginBottom: 7 },
  metaCellLast: { marginBottom: 0 },
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

  sectionHead: { marginTop: 16, marginBottom: 7, flexDirection: 'row' },
  sectionTitle: {
    fontSize: 9,
    letterSpacing: 0.6,
    color: c.textStrong,
    fontFamily: 'Helvetica-Bold',
    paddingBottom: 5,
    borderBottomWidth: 1.5,
    borderBottomColor: c.brandGreen,
  },
  sectionRule: { borderBottomWidth: 0.75, borderBottomColor: c.hairline },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: c.hairline,
  },
  rowLabelWrap: { flex: 1, paddingRight: 16 },
  rowLabel: { fontSize: 10, color: c.textStrong },
  rowNote: { fontSize: 7.5, color: c.textMuted, marginTop: 3 },
  rowAmount: {
    width: m.amountWidth,
    textAlign: 'right',
    fontSize: 10,
    color: c.textStrong,
    fontFamily: 'Helvetica-Bold',
  },
  rowAmountMuted: {
    width: m.amountWidth,
    textAlign: 'right',
    fontSize: 10,
    color: c.textMuted,
  },

  subtotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 2,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: c.subtotalRule,
  },
  subtotalLabel: {
    fontSize: 8.5,
    color: c.textMuted,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.3,
  },
  subtotalAmount: {
    width: m.amountWidth,
    textAlign: 'right',
    fontSize: 10,
    color: c.textStrong,
    fontFamily: 'Helvetica-Bold',
  },

  netBlock: { marginTop: 14 },
  netBand: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: c.netTint,
    borderTopWidth: 2,
    borderTopColor: c.brandGreen,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  netLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    letterSpacing: 1.4,
    color: c.brandGreenDeep,
  },
  netAmount: {
    textAlign: 'right',
    fontFamily: 'Helvetica-Bold',
    fontSize: 18,
    color: c.brandGreenDeep,
  },
  netWordsWrap: {
    paddingTop: 6,
    paddingHorizontal: 14,
  },
  netWords: { fontSize: 7.5, color: c.textBody },
  netWordsStrong: { fontFamily: 'Helvetica-Bold', color: c.textStrong },

  signatureBlock: {
    alignItems: 'flex-end',
    paddingHorizontal: m.pageX,
    paddingBottom: 4,
  },
  signatureInner: { alignItems: 'flex-start' },
  signatureCaption: { fontSize: 9, color: c.textBody, marginBottom: 2 },
  signatureRole: { fontSize: 9, color: c.textBody, marginBottom: 4 },
  signatureScript: { fontFamily: 'Helvetica-Oblique', fontSize: 16 },
  signatureName: { fontSize: 9, color: c.textStrong, marginTop: 4 },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  footerRule: {
    marginHorizontal: m.pageX,
    borderBottomWidth: 0.75,
    borderBottomColor: c.textBody,
  },
  footerInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: m.pageX,
    paddingTop: 11,
    paddingBottom: 11,
  },
  footerItem: { flexDirection: 'row', alignItems: 'center', maxWidth: 185 },
  footerIcon: { marginRight: 8 },
  footerText: { fontSize: 9, color: c.textStrong, lineHeight: 1.3 },

  watermark: { position: 'absolute', top: 300, left: 250 },
});
