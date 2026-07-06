import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import { DetailSheet } from './detail-sheet';
import { StatusBadge } from './status-badge';

const meta = {
  title: 'HRM/DetailSheet',
  component: DetailSheet,
  tags: ['autodocs'],
  args: {
    open: true,
    onOpenChange: () => {},
    title: 'Leave Request',
    description: 'Submitted by Ayesha Khan on 05/07/26',
    fields: [
      { label: 'Type', value: 'Sick Leave' },
      { label: 'Dates', value: '2 days from 08/07/26' },
      {
        label: 'Reason',
        value: 'Flu and fever, doctor advised two days of rest.',
      },
      { label: 'Status', value: <StatusBadge status='pending' /> },
      { label: 'Pool balance', value: '14.5 of 22 days remaining' },
    ],
  },
  argTypes: {
    open: { control: false },
    onOpenChange: { control: false },
    fields: { control: false },
  },
} satisfies Meta<typeof DetailSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

const InteractiveSheet = (args: React.ComponentProps<typeof DetailSheet>) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open request</Button>
      <DetailSheet {...args} open={open} onOpenChange={setOpen} />
    </>
  );
};

export const Default: Story = {
  render: (args) => <InteractiveSheet {...args} />,
};

export const WithApprovalActions: Story = {
  render: (args) => <InteractiveSheet {...args} />,
  args: {
    footer: (
      <div className='flex w-full gap-2'>
        <Button variant='destructive' className='flex-1'>
          Reject
        </Button>
        <Button className='flex-1'>Approve</Button>
      </div>
    ),
  },
};
