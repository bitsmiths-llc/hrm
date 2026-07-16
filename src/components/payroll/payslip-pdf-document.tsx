import {
  Document,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
} from '@react-pdf/renderer';
import { format } from 'date-fns';

import { formatCurrency } from '@/utils/number-functions';

import { Payslip } from '@/types/hrm';

const BRAND_GREEN = '#04CD77';
const DEEP_GREEN = '#0A3524';
const TEXT_DARK = '#111111';
const TEXT_MUTED = '#6B7280';
const CELL_BORDER = '#E5E7EB';
const HEAD_TINT = '#BFF3DC';

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontSize: 9.5,
    fontFamily: 'Helvetica',
    color: TEXT_DARK,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 48,
    paddingTop: 34,
    marginBottom: 24,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logoWrap: { marginRight: 10 },
  wordmark: {
    fontSize: 15,
    fontWeight: 700,
    color: TEXT_DARK,
    letterSpacing: 0.3,
  },

  titleWrap: { paddingHorizontal: 48, marginBottom: 26 },
  title: {
    fontSize: 21,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 10,
  },
  titleRule: { borderBottomWidth: 2.5, borderBottomColor: TEXT_DARK },

  content: { paddingHorizontal: 48 },

  metaWrap: {
    paddingVertical: 4,
    flexDirection: 'row',
    marginBottom: 26,
  },
  metaCol: { flex: 1, flexDirection: 'column' },
  metaLine: { flexDirection: 'row', marginBottom: 6 },
  metaLineLast: { flexDirection: 'row' },
  metaLabel: { width: 96, fontWeight: 700 },
  metaColon: { width: 14, color: TEXT_MUTED },
  metaValue: { color: TEXT_MUTED },

  table: { borderWidth: 1.2, borderColor: TEXT_DARK },
  headRow: { flexDirection: 'row' },
  headCell: {
    flex: 1,
    backgroundColor: HEAD_TINT,
    paddingVertical: 9,
    alignItems: 'center',
    borderBottomWidth: 1.2,
    borderBottomColor: TEXT_DARK,
  },
  headCellLeft: { borderRightWidth: 1.2, borderRightColor: TEXT_DARK },
  headText: { fontWeight: 700, fontSize: 10.5, letterSpacing: 0.5 },

  bodyRow: { flexDirection: 'row' },
  half: { flex: 1, flexDirection: 'row' },
  halfLeft: { borderRightWidth: 1.2, borderRightColor: TEXT_DARK },
  cellLabel: {
    flex: 1.3,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: CELL_BORDER,
    color: TEXT_MUTED,
  },
  cellAmount: {
    flex: 0.9,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: CELL_BORDER,
    textAlign: 'right',
  },
  cellBold: { fontWeight: 700, color: TEXT_DARK },

  finalRow: { flexDirection: 'row' },
  finalHalf: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: HEAD_TINT,
  },
  finalLabel: {
    flex: 1.3,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontWeight: 700,
  },
  finalAmount: {
    flex: 0.9,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontWeight: 700,
    textAlign: 'right',
  },

  wordsLine: { marginTop: 12, fontSize: 8.5, color: TEXT_MUTED },
  wordsStrong: { fontWeight: 700, color: TEXT_DARK },

  signatureBlock: { alignItems: 'flex-end', marginTop: 36 },
  signatureDept: { fontSize: 8.5, color: TEXT_MUTED, marginTop: 3 },
  signatureScript: { fontFamily: 'Helvetica-Oblique', fontSize: 18 },
  signatureRule: {
    width: 150,
    borderTopWidth: 1,
    borderTopColor: TEXT_DARK,
    marginTop: 8,
    marginBottom: 5,
  },
  signatureName: { fontSize: 9, fontWeight: 700 },

  footerBand: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: DEEP_GREEN,
    paddingVertical: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 48,
  },
  footerText: { fontSize: 8, color: '#8FCDB0' },

  watermark: { position: 'absolute', top: 310, left: 170 },
});

const ONES = [
  'Zero',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];
const TENS = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
];
const GROUPS = ['', 'Thousand', 'Million', 'Billion'];

function threeDigitsToWords(value: number): string {
  const parts: string[] = [];
  let n = value;
  if (n >= 100) {
    parts.push(`${ONES[Math.floor(n / 100)]} Hundred`);
    n %= 100;
  }
  if (n >= 20) {
    const tensWord = TENS[Math.floor(n / 10)];
    const onesDigit = n % 10;
    parts.push(onesDigit ? `${tensWord}-${ONES[onesDigit]}` : tensWord);
  } else if (n > 0) {
    parts.push(ONES[n]);
  }
  return parts.join(' ');
}

function numberToWords(value: number): string {
  if (value === 0) return 'Zero';
  let n = Math.round(Math.abs(value));
  const chunks: string[] = [];
  let groupIndex = 0;
  while (n > 0) {
    const chunk = n % 1000;
    if (chunk > 0) {
      const words = threeDigitsToWords(chunk);
      chunks.unshift(
        GROUPS[groupIndex] ? `${words} ${GROUPS[groupIndex]}` : words,
      );
    }
    n = Math.floor(n / 1000);
    groupIndex += 1;
  }
  return chunks.join(' ');
}

function BitsmithsMark({
  size = 30,
  variant = 'default',
}: {
  size?: number;
  /** 'light' for on-dark use; 'watermark' renders in near-invisible pale
   *  fills (react-pdf ignores wrapper opacity on Svg paths, so the
   *  faintness lives in the colors themselves). */
  variant?: 'default' | 'light' | 'watermark';
}) {
  const grayFill =
    variant === 'light'
      ? '#DDEBE3'
      : variant === 'watermark'
        ? '#F4F5F5'
        : '#B3B3B3';
  const greenFill =
    variant === 'light'
      ? '#FFFFFF'
      : variant === 'watermark'
        ? '#EAFAF2'
        : BRAND_GREEN;
  return (
    <Svg width={size} height={(size * 21) / 20} viewBox='0 0 20 21'>
      <Path
        d='M5.518 14.7314H19.246C18.808 18.9504 15.596 20.6414 14.137 20.7324C12.677 20.8224 1.047 20.7324 0.0440038 20.7324C-0.229996 20.7324 0.682004 14.7314 5.518 14.7314Z'
        fill={grayFill}
      />
      <Path
        d='M9.426 0H0C0.408 4.184 3.397 5.862 4.756 5.952C6.114 6.042 13.587 5.952 14.521 5.952C14.776 5.952 13.927 0 9.426 0ZM13.729 7.183H0C0.438 11.403 3.65 13.093 5.109 13.185C6.569 13.275 18.199 13.185 19.202 13.185C19.476 13.185 18.564 7.183 13.728 7.183'
        fill={greenFill}
      />
    </Svg>
  );
}

type LineItem = { label: string; amount: number };

/** One half-row of the ledger: label + amount, or an intentionally blank
 *  filler cell when the other column is longer. */
type HalfCell = { label: string; amount: string; bold?: boolean } | null;

type PayslipPdfDocumentProps = {
  payslip: Payslip;
};

export function PayslipPdfDocument({ payslip }: PayslipPdfDocumentProps) {
  const cycleLabel = format(`${payslip.cycleMonth}-01`, 'MMMM yyyy');

  // Positive adjustments earn; negative ones deduct.
  const earnedAdjustments = payslip.customFields.filter((f) => f.amount >= 0);
  const deductedAdjustments = payslip.customFields.filter((f) => f.amount < 0);

  // The full monthly base goes under earnings; unpaid leave (the only reason
  // daysWorked ever deviates) surfaces as an explicit deduction instead of a
  // silently prorated base. baseSalary − totalBase IS that proration.
  const unpaidLeaveDeduction = Math.max(
    0,
    payslip.baseSalary - payslip.totalBase,
  );

  const earnings: LineItem[] = [
    { label: 'Base Salary', amount: payslip.baseSalary },
    { label: 'Medical Reimbursements', amount: payslip.medical },
    {
      label:
        payslip.overtimeHours > 0
          ? `Overtime Pay (${payslip.overtimeHours}h)`
          : 'Overtime Pay',
      amount: payslip.overtimePay,
    },
    ...earnedAdjustments,
  ];
  const unpaidDays = payslip.daysInMonth - payslip.daysWorked;
  const deductions: LineItem[] = [
    {
      label:
        unpaidDays > 0
          ? `Unpaid Leaves (${unpaidDays} ${unpaidDays === 1 ? 'day' : 'days'})`
          : 'Unpaid Leaves',
      amount: unpaidLeaveDeduction,
    },
    { label: 'Tax Deduction', amount: payslip.taxDeduction },
    ...deductedAdjustments.map((f) => ({
      label: f.label,
      amount: Math.abs(f.amount),
    })),
  ];

  const totalEarnings = earnings.reduce((sum, item) => sum + item.amount, 0);
  const totalDeductions = deductions.reduce(
    (sum, item) => sum + item.amount,
    0,
  );
  const netSalary = totalEarnings - totalDeductions;

  // Each column ends in its own bold total line; both columns pad with
  // blanks to the same row count so the halves stay aligned. The tinted
  // final row then shows Gross vs Net.
  const leftCells: HalfCell[] = [
    ...earnings.map((item) => ({
      label: item.label,
      amount: formatCurrency(item.amount) || 'Rs 0',
    })),
    {
      label: 'Total Earnings',
      amount: formatCurrency(totalEarnings) || 'Rs 0',
      bold: true,
    },
  ];
  const rightCells: HalfCell[] = [
    ...deductions.map((item) => ({
      label: item.label,
      amount: formatCurrency(item.amount) || 'Rs 0',
    })),
    {
      label: 'Total Deduction',
      amount: formatCurrency(totalDeductions) || 'Rs 0',
      bold: true,
    },
  ];
  const rowCount = Math.max(leftCells.length, rightCells.length);
  while (leftCells.length < rowCount) leftCells.push(null);
  while (rightCells.length < rowCount) rightCells.push(null);

  return (
    <Document>
      <Page size='A4' style={styles.page}>
        <View style={styles.watermark}>
          <BitsmithsMark size={260} variant='watermark' />
        </View>

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoWrap}>
              <BitsmithsMark size={30} />
            </View>
            <Text style={styles.wordmark}>BitSmiths</Text>
          </View>
        </View>

        <View style={styles.titleWrap}>
          <Text style={styles.title}>Salary Slip</Text>
          <View style={styles.titleRule} />
        </View>

        <View style={styles.content}>
          <View style={styles.metaWrap}>
            <View style={styles.metaCol}>
              <View style={styles.metaLine}>
                <Text style={styles.metaLabel}>Pay Period</Text>
                <Text style={styles.metaColon}>:</Text>
                <Text style={styles.metaValue}>{cycleLabel}</Text>
              </View>
              <View style={styles.metaLineLast}>
                <Text style={styles.metaLabel}>Employee Name</Text>
                <Text style={styles.metaColon}>:</Text>
                <Text style={styles.metaValue}>{payslip.employeeName}</Text>
              </View>
            </View>
            <View style={styles.metaCol}>
              <View style={styles.metaLine}>
                <Text style={styles.metaLabel}>Company</Text>
                <Text style={styles.metaColon}>:</Text>
                <Text style={styles.metaValue}>Bitsmith Studio</Text>
              </View>
              <View style={styles.metaLineLast}>
                <Text style={styles.metaLabel}>Designation</Text>
                <Text style={styles.metaColon}>:</Text>
                <Text style={styles.metaValue}>{payslip.designation}</Text>
              </View>
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.headRow}>
              <View style={[styles.headCell, styles.headCellLeft]}>
                <Text style={styles.headText}>EARNINGS</Text>
              </View>
              <View style={styles.headCell}>
                <Text style={styles.headText}>DEDUCTIONS</Text>
              </View>
            </View>

            {Array.from({ length: rowCount }, (_, rowIndex) => (
              <View key={rowIndex} style={styles.bodyRow}>
                <View style={[styles.half, styles.halfLeft]}>
                  <Text
                    style={
                      leftCells[rowIndex]?.bold
                        ? [styles.cellLabel, styles.cellBold]
                        : styles.cellLabel
                    }
                  >
                    {leftCells[rowIndex]?.label ?? ' '}
                  </Text>
                  <Text
                    style={
                      leftCells[rowIndex]?.bold
                        ? [styles.cellAmount, styles.cellBold]
                        : styles.cellAmount
                    }
                  >
                    {leftCells[rowIndex]?.amount ?? ' '}
                  </Text>
                </View>
                <View style={styles.half}>
                  <Text
                    style={
                      rightCells[rowIndex]?.bold
                        ? [styles.cellLabel, styles.cellBold]
                        : styles.cellLabel
                    }
                  >
                    {rightCells[rowIndex]?.label ?? ' '}
                  </Text>
                  <Text
                    style={
                      rightCells[rowIndex]?.bold
                        ? [styles.cellAmount, styles.cellBold]
                        : styles.cellAmount
                    }
                  >
                    {rightCells[rowIndex]?.amount ?? ' '}
                  </Text>
                </View>
              </View>
            ))}

            <View style={styles.finalRow}>
              <View style={[styles.finalHalf, styles.halfLeft]}>
                <Text style={styles.finalLabel}>Gross Salary</Text>
                <Text style={styles.finalAmount}>
                  {formatCurrency(totalEarnings) || 'Rs 0'}
                </Text>
              </View>
              <View style={styles.finalHalf}>
                <Text style={styles.finalLabel}>Net Salary</Text>
                <Text style={styles.finalAmount}>
                  {formatCurrency(netSalary) || 'Rs 0'}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.wordsLine}>
            <Text style={styles.wordsStrong}>Amount in words: </Text>
            {numberToWords(netSalary)} Pakistani Rupees Only
          </Text>

          <View style={styles.signatureBlock}>
            <Text style={styles.signatureScript}>Ali Abbas</Text>
            <View style={styles.signatureRule} />
            <Text style={styles.signatureName}>Muhammad Ali Abbas</Text>
            <Text style={styles.signatureDept}>CEO, Bitsmith Studio</Text>
          </View>
        </View>

        <View style={styles.footerBand} fixed>
          <Text style={styles.footerText}>
            Issued by Bitsmiths Studio · Confidential
          </Text>
          <Text style={styles.footerText}>www.bitsmiths.studio</Text>
        </View>
      </Page>
    </Document>
  );
}
