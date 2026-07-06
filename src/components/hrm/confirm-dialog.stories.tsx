import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from '@/components/ui/button';

import { ConfirmDialog } from './confirm-dialog';

const meta = {
  title: 'HRM/ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
  args: {
    trigger: <Button>Lock payroll cycle</Button>,
    title: 'Lock payroll cycle 2026-07?',
    description:
      'Figures become read-only and the Payoneer export is enabled. This cannot be undone.',
    confirmLabel: 'Lock cycle',
    onConfirm: () => {},
  },
  argTypes: {
    trigger: { control: false },
    onConfirm: { control: false },
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Destructive: Story = {
  args: {
    trigger: <Button variant='destructive'>Reject request</Button>,
    title: 'Reject this leave request?',
    description:
      'The employee will be notified that their request was rejected.',
    confirmLabel: 'Reject',
    destructive: true,
  },
};

export const Loading: Story = {
  args: { isLoading: true },
};
