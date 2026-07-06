import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Inbox, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { EmptyState } from './empty-state';

const meta = {
  title: 'HRM/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  args: {
    title: 'No leave requests yet',
    description: 'Your submitted requests and their status will show up here.',
    icon: Inbox,
  },
  argTypes: {
    icon: { control: false },
  },
  decorators: [
    (Story) => (
      <div className='w-[480px] max-w-full'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCta: Story = {
  args: {
    children: <Button iconLeft={Plus}>Request leave</Button>,
  },
};

export const Minimal: Story = {
  args: { icon: undefined, description: undefined },
};
