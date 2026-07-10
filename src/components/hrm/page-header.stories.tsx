import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { PageHeader } from './page-header';

const meta = {
  title: 'HRM/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  args: {
    title: 'Leave',
    description: 'Request leave and track your 22-day pool.',
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAction: Story = {
  args: {
    children: <Button iconLeft={Plus}>Request leave</Button>,
  },
};

export const TitleOnly: Story = {
  args: { description: undefined },
};
