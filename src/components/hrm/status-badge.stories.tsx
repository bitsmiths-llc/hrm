import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { StatusBadge } from './status-badge';

const meta = {
  title: 'HRM/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  args: { status: 'pending' },
  argTypes: {
    status: {
      control: 'select',
      options: [
        'pending',
        'approved',
        'rejected',
        'invited',
        'onboarding',
        'active',
        'open',
        'calculating',
        'locked',
      ],
    },
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pending: Story = {};

export const Approved: Story = { args: { status: 'approved' } };

export const Rejected: Story = { args: { status: 'rejected' } };

export const AccountStatuses: Story = {
  render: () => (
    <div className='flex flex-wrap gap-2'>
      <StatusBadge status='invited' />
      <StatusBadge status='onboarding' />
      <StatusBadge status='active' />
    </div>
  ),
};

export const PayrollStatuses: Story = {
  render: () => (
    <div className='flex flex-wrap gap-2'>
      <StatusBadge status='open' />
      <StatusBadge status='calculating' />
      <StatusBadge status='locked' />
    </div>
  ),
};
