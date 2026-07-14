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
const TEXT_DARK = '#111111';
const TEXT_MUTED = '#6B7280';
const BORDER = '#D1D5DB';
const HEADER_BG = '#F3F4F6';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: TEXT_DARK,
    paddingBottom: 60,
  },
  logoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: { fontSize: 20, fontWeight: 700, marginLeft: 8 },
  title: {
    fontSize: 17,
    fontWeight: 700,
    textAlign: 'center',
    marginTop: 18,
    marginBottom: 22,
  },

  section: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 3,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    backgroundColor: HEADER_BG,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  sectionHeaderText: { fontSize: 9, fontWeight: 700, letterSpacing: 0.5 },
  sectionHeaderRight: {
    marginLeft: 'auto',
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 0.5,
  },

  gridRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  gridRowLast: { flexDirection: 'row' },
  gridCellLabel: {
    flex: 0.9,
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: BORDER,
    fontWeight: 700,
  },
  gridCellValue: {
    flex: 1.35,
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  gridCellValueLast: { flex: 1.35, padding: 8 },

  lineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  lineRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  lineLabel: { color: TEXT_MUTED },
  lineValue: { fontWeight: 700 },

  netPayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 10,
    backgroundColor: HEADER_BG,
  },
  netPayLabel: { fontSize: 10, fontWeight: 700 },
  netPayValue: { fontSize: 10, fontWeight: 700 },

  amountWords: { fontSize: 9, marginBottom: 36 },
  amountWordsLabel: { fontWeight: 700 },

  signatureBlock: { alignItems: 'flex-end' },
  signatureScript: {
    fontFamily: 'Helvetica-Oblique',
    fontSize: 18,
    marginBottom: 6,
  },
  signatureName: { fontSize: 9, fontWeight: 700 },
  signatureTitle: { fontSize: 8, color: TEXT_MUTED },

  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 10,
    alignItems: 'center',
  },
  footerText: { fontSize: 8, color: TEXT_MUTED, textAlign: 'center' },
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

function BitsmithsMark({ size = 24 }: { size?: number }) {
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

type PayslipPdfDocumentProps = {
  payslip: Payslip;
};

export function PayslipPdfDocument({ payslip }: PayslipPdfDocumentProps) {
  const cycleLabel = format(`${payslip.cycleMonth}-01`, 'MMMM yyyy');

  return (
    <Document>
      <Page size='A4' style={styles.page}>
        <View style={styles.logoRow}>
          <BitsmithsMark />
          <Text style={styles.brandName}>Bitsmiths</Text>
        </View>
        <Text style={styles.title}>
          SALARY SLIP - {cycleLabel.toUpperCase()}
        </Text>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>EMPLOYEE DETAILS</Text>
          </View>
          <View style={styles.gridRow}>
            <Text style={styles.gridCellLabel}>Employee Name</Text>
            <Text style={styles.gridCellValue}>{payslip.employeeName}</Text>
            <Text style={styles.gridCellLabel}>Pay Period</Text>
            <Text style={styles.gridCellValueLast}>{cycleLabel}</Text>
          </View>
          <View style={styles.gridRowLast}>
            <Text style={styles.gridCellLabel}>Company</Text>
            <Text style={styles.gridCellValue}>Bitsmith Studio</Text>
            <Text style={styles.gridCellLabel}>Days Worked</Text>
            <Text style={styles.gridCellValueLast}>
              {payslip.daysWorked} of {payslip.daysInMonth} days
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>EARNINGS</Text>
            <Text style={styles.sectionHeaderRight}>AMOUNT (PKR)</Text>
          </View>
          <View style={styles.lineRow}>
            <Text style={styles.lineLabel}>Base Salary</Text>
            <Text style={styles.lineValue}>
              {formatCurrency(payslip.totalBase)}
            </Text>
          </View>
          <View style={styles.lineRow}>
            <Text style={styles.lineLabel}>Medical Allowance</Text>
            <Text style={styles.lineValue}>
              {formatCurrency(payslip.medical) || '—'}
            </Text>
          </View>
          <View style={styles.lineRowLast}>
            <Text style={styles.lineLabel}>
              Overtime Pay ({payslip.overtimeHours}h)
            </Text>
            <Text style={styles.lineValue}>
              {formatCurrency(payslip.overtimePay) || '—'}
            </Text>
          </View>
        </View>

        {payslip.customFields.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>ADJUSTMENTS</Text>
              <Text style={styles.sectionHeaderRight}>AMOUNT (PKR)</Text>
            </View>
            {payslip.customFields.map((field, index) => {
              const isLast = index === payslip.customFields.length - 1;
              return (
                <View
                  key={`${field.label}-${index}`}
                  style={isLast ? styles.lineRowLast : styles.lineRow}
                >
                  <Text style={styles.lineLabel}>{field.label}</Text>
                  <Text style={styles.lineValue}>
                    {formatCurrency(field.amount)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>DEDUCTIONS</Text>
            <Text style={styles.sectionHeaderRight}>AMOUNT (PKR)</Text>
          </View>
          <View style={styles.lineRow}>
            <Text style={styles.lineLabel}>Tax Deduction</Text>
            <Text style={styles.lineValue}>—</Text>
          </View>
          <View style={styles.lineRow}>
            <Text style={styles.lineLabel}>Other Deductions</Text>
            <Text style={styles.lineValue}>—</Text>
          </View>
          <View style={styles.netPayRow}>
            <Text style={styles.netPayLabel}>NET PAY</Text>
            <Text style={styles.netPayValue}>
              {formatCurrency(payslip.total)}
            </Text>
          </View>
        </View>

        <Text style={styles.amountWords}>
          <Text style={styles.amountWordsLabel}>Amount in words: </Text>
          {numberToWords(payslip.total)} Pakistani Rupees Only
        </Text>

        <View style={styles.signatureBlock}>
          <Text style={styles.signatureScript}>Ali Abbas</Text>
          <Text style={styles.signatureName}>Muhammad Ali Abbas</Text>
          <Text style={styles.signatureTitle}>CEO, Bitsmith Studio</Text>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Valid without physical stamp</Text>
          <Text style={styles.footerText}>
            Issued by Bitsmiths Studio · Confidential · For Official Use Only
          </Text>
        </View>
      </Page>
    </Document>
  );
}
