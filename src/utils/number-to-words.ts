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

const belowThousandToWords = (value: number): string => {
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
};

export const numberToWords = (value: number): string => {
  const n = Math.round(Math.abs(value));
  if (n === 0) return 'Zero';

  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const rest = n % 1000;

  const parts: string[] = [];
  if (crore > 0) parts.push(`${belowThousandToWords(crore)} Crore`);
  if (lakh > 0) parts.push(`${belowThousandToWords(lakh)} Lakh`);
  if (thousand > 0) parts.push(`${belowThousandToWords(thousand)} Thousand`);
  if (rest > 0) parts.push(belowThousandToWords(rest));

  return parts.join(' ');
};
