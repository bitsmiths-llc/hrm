import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CheckSquare, Users } from 'lucide-react';

import { StatCard } from './stat-card';

const meta = {
  title: 'HRM/StatCard',
  component: StatCard,
  tags: ['autodocs'],
  args: {
    label: 'Pending Approvals',
    value: 5,
    icon: CheckSquare,
    hint: 'Leave, medical, and overtime requests',
  },
  argTypes: {
    icon: { control: false },
  },
  decorators: [
    (Story) => (
      <div className='w-80'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutIcon: Story = {
  args: { icon: undefined, label: 'Active Employees', value: 12 },
};

export const CurrencyValue: Story = {
  args: {
    label: 'Total Payroll · 2026-06',
    value: 'PKR 712,450',
    icon: Users,
    hint: '3 employees',
  },
};
