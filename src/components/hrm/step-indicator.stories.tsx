import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { StepIndicator } from './step-indicator';

const onboardingSteps = [
  'Personal Info',
  'Bank Info',
  'Social Accounts',
  'Identity Documents',
  'Consent',
];

const meta = {
  title: 'HRM/StepIndicator',
  component: StepIndicator,
  tags: ['autodocs'],
  args: {
    steps: onboardingSteps,
    currentStep: 2,
  },
} satisfies Meta<typeof StepIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MidWay: Story = {};

export const FirstStep: Story = {
  args: { currentStep: 0 },
};

export const LastStep: Story = {
  args: { currentStep: 4 },
};
