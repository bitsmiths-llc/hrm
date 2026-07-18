export const payslipPdfColors = {
  brandGreen: '#04CD77',
  brandGreenDeep: '#02502E',
  ink: '#222222',
  textStrong: '#1A1A1A',
  textBody: '#3F3F46',
  textMuted: '#71717A',
  hairline: '#E4E4E7',
  ruleStrong: '#222222',
  subtotalRule: '#D4D4D8',
  metaTint: '#FAFAFA',
  netTint: '#F2FCF7',
  white: '#FFFFFF',
  logoDark: '#1A1A1A',
  watermarkDark: '#FBFCFB',
  watermarkGreen: '#F7FDFA',
} as const;

const barHeight = 22;
const wedgeDrop = 30;
const contactIconSize = 19;
const logoSize = 58;
const pageX = 46;

const signatureHeight = 9 + 2 + 9 + 4 + 16 + 9 + 4 + 4;

const footerPadY = 11;
const footerTextLines = 2;
const footerTextSize = 9;
const footerLineHeight = 1.3;

const footerContentHeight = Math.max(
  contactIconSize,
  footerTextSize * footerLineHeight * footerTextLines,
);

const footerHeight =
  signatureHeight +
  1 +
  footerPadY * 2 +
  footerContentHeight +
  barHeight +
  wedgeDrop;

export const payslipPdfMetrics = {
  pageX,
  pageWidth: 595.28,
  pageHeight: 841.89,
  barHeight,
  wedgeDrop,
  wedgeWidth: 190,
  wedgeSlope: 62,
  amountWidth: 92,
  footerPadY,
  footerTextSize,
  footerLineHeight,
  footerReserve: Math.ceil(footerHeight) + 10,
  logoSize,
  watermarkSize: 300,
  contactIconSize,
} as const;

export const payslipPdfCopy = {
  companyName: 'BITSMITHS STUDIOS LLC',
  documentTitle: 'PAYROLL SLIP',
  earningsHeading: 'EARNINGS',
  deductionsHeading: 'DEDUCTIONS',
  totalEarningsLabel: 'TOTAL EARNINGS',
  totalDeductionsLabel: 'TOTAL DEDUCTIONS',
  netPayLabel: 'NET SALARY',
  amountInWords: 'Amount in words:',
  currencyWordsPrefix: 'Rupees',
  currencyWordsSuffix: 'Only',
  emptyValue: '—',
  paymentMode: 'Bank Transfer',
  baseSalaryLabel: 'Base Salary',
  medicalLabel: 'Medical Reimbursements',
  overtimeLabel: 'Overtime Pay',
  unpaidLeavesLabel: 'Unpaid Leaves',
  taxLabel: 'Tax Deduction',
} as const;

export const payslipPdfMetaLabels = {
  employee: 'NAME',
  designation: 'DESIGNATION',
  payPeriod: 'PAY PERIOD',
  payDate: 'PAY DATE',
  paymentMode: 'PAYMENT MODE',
  daysWorked: 'DAYS WORKED',
} as const;

export const payslipPdfSignature = {
  caption: 'Authorized by:',
  role: 'CEO – Bitsmiths Studio LLC',
  script: 'Ali Abbas',
  name: 'Muhammad Ali Abbas',
} as const;

export const payslipPdfContact = {
  site: 'www.bitsmiths.studio',
  phone: '+92 310 1512254',
  address: '304, CEMTECH, NUST,\nH-12, Islamabad',
} as const;

export const payslipPdfAuthor = 'Bitsmiths Studios LLC';

export const bitsmithsLogoPaths = {
  bottomLeaf:
    'M5.518 14.7314H19.246C18.808 18.9504 15.596 20.6414 14.137 20.7324C12.677 20.8224 1.047 20.7324 0.0440038 20.7324C-0.229996 20.7324 0.682004 14.7314 5.518 14.7314Z',
  topLeaves:
    'M9.426 0H0C0.408 4.184 3.397 5.862 4.756 5.952C6.114 6.042 13.587 5.952 14.521 5.952C14.776 5.952 13.927 0 9.426 0ZM13.729 7.183H0C0.438 11.403 3.65 13.093 5.109 13.185C6.569 13.275 18.199 13.185 19.202 13.185C19.476 13.185 18.564 7.183 13.728 7.183',
} as const;

export const contactIconPaths = {
  globeMeridian: 'M12 2.5 C7.5 7 7.5 17 12 21.5 C16.5 17 16.5 7 12 2.5 Z',
  phone:
    'M8.6 6.2 c0.5 0 1 0.3 1.2 0.8 l0.9 2 c0.2 0.5 0.1 1-0.3 1.3 l-0.9 0.8 c0.7 1.5 1.9 2.7 3.4 3.4 l0.8-0.9 c0.3-0.4 0.8-0.5 1.3-0.3 l2 0.9 c0.5 0.2 0.8 0.7 0.8 1.2 v1.7 c0 0.8-0.7 1.4-1.5 1.3 C11.6 17.8 6.2 12.4 5.8 7.7 C5.7 6.9 6.3 6.2 7.1 6.2 Z',
  pin: 'M12 5.5 c-2.5 0-4.5 2-4.5 4.5 c0 3.4 4.5 8.5 4.5 8.5 s4.5-5.1 4.5-8.5 c0-2.5-2-4.5-4.5-4.5 Z',
} as const;
