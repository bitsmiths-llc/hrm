import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ComingSoon } from './coming-soon';

const meta = {
  title: 'HRM/ComingSoon',
  component: ComingSoon,
  tags: ['autodocs'],
  args: {
    title: 'Payroll',
    description:
      'Run cycles, review calculations, lock, and export for Payoneer.',
  },
} satisfies Meta<typeof ComingSoon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
