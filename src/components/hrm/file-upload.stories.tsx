import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import { FileUpload } from './file-upload';

const meta = {
  title: 'HRM/FileUpload',
  component: FileUpload,
  tags: ['autodocs'],
  args: {
    value: [],
    onChange: () => {},
    maxFiles: 5,
    maxSizeMb: 10,
    label: 'Upload proof',
  },
  argTypes: {
    value: { control: false },
    onChange: { control: false },
  },
  decorators: [
    (Story) => (
      <div className='w-96'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

const InteractiveUpload = (args: React.ComponentProps<typeof FileUpload>) => {
  const [files, setFiles] = useState<File[]>([]);
  return <FileUpload {...args} value={files} onChange={setFiles} />;
};

export const Empty: Story = {
  render: (args) => <InteractiveUpload {...args} />,
};

export const WithFiles: Story = {
  args: {
    value: [
      new File(['x'.repeat(2048)], 'prescription.jpg', { type: 'image/jpeg' }),
      new File(['x'.repeat(4096)], 'pharmacy-receipt.pdf', {
        type: 'application/pdf',
      }),
    ],
  },
};

export const AtLimit: Story = {
  args: {
    maxFiles: 2,
    value: [
      new File(['x'], 'cnic-front.jpg', { type: 'image/jpeg' }),
      new File(['x'], 'cnic-back.jpg', { type: 'image/jpeg' }),
    ],
  },
};
