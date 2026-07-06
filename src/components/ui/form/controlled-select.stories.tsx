import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useForm } from 'react-hook-form';

import { Form } from '@/components/ui/form';

import { ControlledSelect } from './controlled-select';

type StoryFormValues = {
  department: string;
};

const meta = {
  title: 'UI/Form/ControlledSelect',
  component: ControlledSelect,
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      const form = useForm<StoryFormValues>({
        defaultValues: { department: '' },
      });
      return (
        <Form {...form}>
          <form className='w-80'>
            <Story />
          </form>
        </Form>
      );
    },
  ],
  args: {
    name: 'department',
    placeholder: 'Select a department',
  },
} satisfies Meta<typeof ControlledSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StringOptions: Story = {
  args: {
    options: ['Engineering', 'Design', 'Operations', 'People'],
  },
};

export const LabelValueOptions: Story = {
  args: {
    label: 'Department',
    options: [
      { label: 'Engineering', value: 'eng' },
      { label: 'Design', value: 'design' },
      { label: 'Operations', value: 'ops' },
    ],
  },
};
