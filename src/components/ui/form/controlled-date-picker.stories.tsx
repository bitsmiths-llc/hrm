import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useForm } from 'react-hook-form';

import { Form } from '@/components/ui/form';

import { ControlledDatePicker } from './controlled-date-picker';

type StoryFormValues = {
  dateOfBirth: string;
};

const meta = {
  title: 'UI/Form/ControlledDatePicker',
  component: ControlledDatePicker,
  tags: ['autodocs'],
  decorators: [
    (Story, context) => {
      const form = useForm<StoryFormValues>({
        defaultValues: {
          dateOfBirth:
            (context.args as { defaultValue?: string }).defaultValue ?? '',
        },
      });
      return (
        <Form {...form}>
          <form className='w-72'>
            <Story />
          </form>
        </Form>
      );
    },
  ],
  args: {
    name: 'dateOfBirth',
    label: 'Date of birth',
    placeholder: 'Pick a date',
  },
} satisfies Meta<typeof ControlledDatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Prefilled: Story = {
  args: {
    // consumed by the decorator to seed the form value
    ...({ defaultValue: '1996-03-14' } as object),
  },
};

export const NoFutureDates: Story = {
  args: {
    label: 'Expense date',
    disabledDates: { after: new Date('2026-07-06') },
  },
};
