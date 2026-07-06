import { Policy } from '@/types/hrm';

export const mockPolicies: Policy[] = [
  {
    id: 'pol-1',
    title: 'Leave Policy',
    version: 2,
    summary:
      '22-day annual pool shared across Paid, Sick, and Half Day leave. Unpaid leave is separate, uncapped, and reviewed individually.',
    updatedAt: '2026-06-01',
    acknowledged: true,
  },
  {
    id: 'pol-2',
    title: 'Medical Policy',
    version: 1,
    summary:
      '5,000 PKR/month accrual toward a shared medical allowance, capped at 50,000 PKR. Covers self, parents, spouse, and children.',
    updatedAt: '2026-01-15',
    acknowledged: true,
  },
  {
    id: 'pol-3',
    title: 'Overtime Policy',
    version: 1,
    summary:
      'Overtime pay applies to approved hours beyond standard working hours, at the configured multiplier.',
    updatedAt: '2026-03-10',
    acknowledged: false,
  },
  {
    id: 'pol-4',
    title: 'Code of Conduct',
    version: 3,
    summary:
      'Professional behavior, confidentiality, and communication standards at Bitsmiths.',
    updatedAt: '2026-06-25',
    acknowledged: false,
  },
];
