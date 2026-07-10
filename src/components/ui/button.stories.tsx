import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ArrowRight, Mail, Trash2 } from 'lucide-react';

import { Button } from './button';

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    children: 'Button',
    variant: 'default',
    size: 'default',
    isLoading: false,
    disabled: false,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
      ],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
    icon: { control: false },
    iconLeft: { control: false },
    asChild: { control: false },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Delete' },
};

export const Outline: Story = {
  args: { variant: 'outline' },
};

export const Secondary: Story = {
  args: { variant: 'secondary' },
};

export const Ghost: Story = {
  args: { variant: 'ghost' },
};

export const Link: Story = {
  args: { variant: 'link' },
};

export const Small: Story = {
  args: { size: 'sm' },
};

export const Large: Story = {
  args: { size: 'lg' },
};

export const Loading: Story = {
  args: { isLoading: true, children: 'Saving' },
};

export const WithIconRight: Story = {
  args: { icon: ArrowRight, children: 'Continue' },
};

export const WithIconLeft: Story = {
  args: { iconLeft: Mail, children: 'Email us' },
};

export const IconOnly: Story = {
  args: { size: 'icon', variant: 'outline', children: <Trash2 /> },
};

export const Disabled: Story = {
  args: { disabled: true },
};
