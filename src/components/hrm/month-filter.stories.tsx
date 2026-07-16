import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import { MonthFilter } from './month-filter';

const meta = {
  title: 'HRM/MonthFilter',
  component: MonthFilter,
  tags: ['autodocs'],
  args: {
    value: 'all',
    onChange: () => {},
  },
  argTypes: {
    onChange: { control: false },
  },
} satisfies Meta<typeof MonthFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

const InteractiveFilter = (args: React.ComponentProps<typeof MonthFilter>) => {
  const [value, setValue] = useState(args.value);
  return <MonthFilter {...args} value={value} onChange={setValue} />;
};

export const AllTime: Story = {
  render: (args) => <InteractiveFilter {...args} />,
};

export const MonthSelected: Story = {
  render: (args) => <InteractiveFilter {...args} />,
  args: { value: `${new Date().getFullYear()}-01` },
};
