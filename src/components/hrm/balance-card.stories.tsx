import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { BalanceCard } from './balance-card';

const meta = {
  title: 'HRM/BalanceCard',
  component: BalanceCard,
  tags: ['autodocs'],
  args: {
    title: 'Leave Pool',
    used: 7.5,
    total: 22,
    format: (days: number) => `${days} days`,
    hint: 'Unpaid taken this year: 2 days',
  },
  argTypes: {
    format: { control: false },
  },
  decorators: [
    (Story) => (
      <div className='w-96'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BalanceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LeavePool: Story = {};

export const MedicalAllowance: Story = {
  args: {
    title: 'Medical Allowance',
    used: 22_500,
    total: 50_000,
    format: (amount: number) => `PKR ${amount.toLocaleString()}`,
    hint: 'Accrues PKR 5,000/month',
  },
};

export const NearlyExhausted: Story = {
  args: { used: 21, total: 22, hint: undefined },
};

export const Untouched: Story = {
  args: { used: 0, total: 22, hint: undefined },
};
