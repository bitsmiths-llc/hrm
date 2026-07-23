import { Document, Page, Text, View } from '@react-pdf/renderer';

import { numberToWords } from '@/utils/number-to-words';
import {
  buildPayslipDeductions,
  buildPayslipEarnings,
  buildPayslipMeta,
  money,
  signedMoney,
  sumLineItems,
} from '@/utils/payslip-pdf-functions';

import {
  payslipPdfAuthor,
  payslipPdfContact as contact,
  payslipPdfCopy as copy,
  payslipPdfMetrics as metrics,
  payslipPdfSignature as signature,
} from '@/constants/payslip-pdf';

import {
  BitsmithsMark,
  BottomBar,
  ContactIcon,
  TopBar,
} from './payslip-pdf-graphics';
import { payslipPdfStyles as styles } from './payslip-pdf-styles';

import { Payslip, PayslipLineItem } from '@/types/hrm';

type LineRowProps = {
  item: PayslipLineItem;
  signed?: boolean;
};

function LineRow({ item, signed }: LineRowProps) {
  const isZero = item.amount === 0;

  return (
    <View style={styles.row}>
      <View style={styles.rowLabelWrap}>
        <Text style={styles.rowLabel}>{item.label}</Text>
        {item.note ? <Text style={styles.rowNote}>{item.note}</Text> : null}
      </View>
      <Text style={isZero ? styles.rowAmountMuted : styles.rowAmount}>
        {signed ? signedMoney(item.amount) : money(item.amount)}
      </Text>
    </View>
  );
}

type SubtotalRowProps = {
  label: string;
  amount: number;
  signed?: boolean;
};

function SubtotalRow({ label, amount, signed }: SubtotalRowProps) {
  return (
    <View style={styles.subtotal}>
      <Text style={styles.subtotalLabel}>{label}</Text>
      <Text style={styles.subtotalAmount}>
        {signed ? signedMoney(amount) : money(amount)}
      </Text>
    </View>
  );
}

type PayslipPdfDocumentProps = {
  payslip: Payslip;
};

export function PayslipPdfDocument({ payslip }: PayslipPdfDocumentProps) {
  const meta = buildPayslipMeta(payslip);
  const earnings = buildPayslipEarnings(payslip);
  const deductions = buildPayslipDeductions(payslip);

  const totalEarnings = sumLineItems(earnings);
  const totalDeductions = sumLineItems(deductions);
  const netSalary = totalEarnings - totalDeductions;

  return (
    <Document
      title={`Payslip ${payslip.cycleMonth} — ${payslip.employeeName}`}
      author={payslipPdfAuthor}
    >
      <Page size='A4' style={styles.page}>
        <View style={styles.watermark}>
          <BitsmithsMark size={metrics.watermarkSize} variant='watermark' />
        </View>

        <View fixed>
          <TopBar />

          <View style={styles.masthead}>
            <View style={styles.markWrap}>
              <BitsmithsMark size={metrics.logoSize} />
            </View>
            <View style={styles.lockup}>
              <Text style={styles.companyName}>{copy.companyName}</Text>
              <Text style={styles.docTitle}>{copy.documentTitle}</Text>
            </View>
          </View>
          <View style={styles.mastheadRule} />

          <View style={styles.headerMeta}>
            <View style={styles.metaGrid}>
              {meta.map((field, index) => (
                <View
                  key={field.label}
                  style={
                    index >= meta.length - 2
                      ? [styles.metaCell, styles.metaCellLast]
                      : styles.metaCell
                  }
                >
                  <Text style={styles.metaLabel}>{field.label}</Text>
                  <Text style={styles.metaValue}>
                    {field.value || copy.emptyValue}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>{copy.earningsHeading}</Text>
          </View>
          <View style={styles.sectionRule} />
          {earnings.map((item, index) => (
            <LineRow key={`${item.label}-${index}`} item={item} />
          ))}
          <SubtotalRow label={copy.totalEarningsLabel} amount={totalEarnings} />

          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>{copy.deductionsHeading}</Text>
          </View>
          <View style={styles.sectionRule} />
          {deductions.map((item, index) => (
            <LineRow key={`${item.label}-${index}`} item={item} signed />
          ))}
          <SubtotalRow
            label={copy.totalDeductionsLabel}
            amount={totalDeductions}
            signed
          />

          <View style={styles.netBlock}>
            <View style={styles.netBand}>
              <Text style={styles.netLabel}>{copy.netPayLabel}</Text>
              <Text style={styles.netAmount}>{money(netSalary)}</Text>
            </View>
            <View style={styles.netWordsWrap}>
              <Text style={styles.netWords}>
                <Text style={styles.netWordsStrong}>{copy.amountInWords} </Text>
                {copy.currencyWordsPrefix} {numberToWords(netSalary)}{' '}
                {copy.currencyWordsSuffix}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureInner}>
              <Text style={styles.signatureCaption}>{signature.caption}</Text>
              <Text style={styles.signatureRole}>{signature.role}</Text>
              <Text style={styles.signatureScript}>{signature.script}</Text>
              <Text style={styles.signatureName}>{signature.name}</Text>
            </View>
          </View>
          <View style={styles.footerRule} />
          <View style={styles.footerInner}>
            <View style={styles.footerItem}>
              <ContactIcon kind='site' />
              <Text style={styles.footerText}>{contact.site}</Text>
            </View>
            <View style={styles.footerItem}>
              <ContactIcon kind='phone' />
              <Text style={styles.footerText}>{contact.phone}</Text>
            </View>
            <View style={styles.footerItem}>
              <ContactIcon kind='pin' />
              <Text style={styles.footerText}>{contact.address}</Text>
            </View>
          </View>
          <BottomBar />
        </View>
      </Page>
    </Document>
  );
}
