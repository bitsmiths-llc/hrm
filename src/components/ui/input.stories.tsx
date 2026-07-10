import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Input } from './input';
import { Label } from './label';

const meta = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  args: {
    placeholder: 'Email address',
    disabled: false,
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true },
};

export const WithLabel: Story = {
  render: (args) => (
    <div className='w-80 space-y-2'>
      <Label htmlFor='email'>Email</Label>
      <Input id='email' type='email' {...args} />
    </div>
  ),
};

export const File: Story = {
  args: { type: 'file', placeholder: undefined },
};
