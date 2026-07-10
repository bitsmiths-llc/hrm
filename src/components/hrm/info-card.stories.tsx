import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { InfoCard } from './info-card';

const meta = {
  title: 'HRM/InfoCard',
  component: InfoCard,
  tags: ['autodocs'],
  args: {
    title: 'Personal Information',
    fields: [
      { label: 'Full Name', value: 'John Doe' },
      { label: 'Date of Birth', value: '14/03/96' },
      { label: 'Email', value: 'john.doe@bitsmiths.studio' },
      { label: 'Phone', value: '03001234567' },
      { label: 'CNIC', value: '61101-1234567-1' },
      { label: 'Address', value: 'House 12, Street 4, F-8/3' },
    ],
  },
  decorators: [
    (Story) => (
      <div className='w-[560px] max-w-full'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InfoCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAction: Story = {
  args: {
    action: (
      <Button variant='outline' size='sm' iconLeft={Pencil}>
        Edit
      </Button>
    ),
  },
};

export const MissingValues: Story = {
  args: {
    title: 'Bank Information',
    fields: [
      { label: 'Bank Name', value: '' },
      { label: 'IBAN', value: '' },
    ],
  },
};
