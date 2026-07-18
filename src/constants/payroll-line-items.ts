/** The two payslip line-item columns. Both write the same `custom_fields`
 *  array and differ only by stored sign — an earning keeps it, a deduction is
 *  stored negative — so the column a user picks is really just a sign, and this
 *  is the copy that explains which is which. */
export const PAYSLIP_LINE_ITEM_KINDS = ['earning', 'deduction'] as const;

export type PayslipLineItemKind = (typeof PAYSLIP_LINE_ITEM_KINDS)[number];

type PayslipLineItemCopy = {
  /** Dialog title — matches the grid column the dialog opens from. */
  title: string;
  /** What items in this column do to the payslip. */
  description: string;
  /** How the bulk dialog offers this column, where there's no column header to
   *  lean on and the earning/deduction split has to be spelled out. */
  optionLabel: string;
  /** Example label for the input. */
  labelPlaceholder: string;
  /** Shown when an employee has no items in this column yet. */
  emptyTitle: string;
  /** Noun for a single item — used in headings and toasts. */
  noun: string;
};

export const payslipLineItemCopy: Record<
  PayslipLineItemKind,
  PayslipLineItemCopy
> = {
  earning: {
    title: 'Adjustments',
    description: 'Extra amounts paid on top of base salary and overtime.',
    optionLabel: 'Adjustment — adds to earnings',
    labelPlaceholder: 'Bonus',
    emptyTitle: 'No adjustments yet',
    noun: 'Adjustment',
  },
  deduction: {
    title: 'Others',
    description:
      'Amounts taken off this payslip, alongside tax and unpaid leave.',
    optionLabel: 'Other — deducts from net salary',
    labelPlaceholder: 'Loan',
    emptyTitle: 'No deductions yet',
    noun: 'Deduction',
  },
};
