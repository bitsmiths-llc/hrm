import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from './button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card';
import { Input } from './input';
import { Label } from './label';

const meta = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className='w-96'>
      <CardHeader>
        <CardTitle>Team settings</CardTitle>
        <CardDescription>
          Manage how your team appears across the workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='team-name'>Team name</Label>
          <Input id='team-name' placeholder='Bitsmiths' />
        </div>
      </CardContent>
      <CardFooter className='justify-end gap-2'>
        <Button variant='outline'>Cancel</Button>
        <Button>Save changes</Button>
      </CardFooter>
    </Card>
  ),
};

export const Simple: Story = {
  render: () => (
    <Card className='w-96'>
      <CardHeader>
        <CardTitle>Monthly revenue</CardTitle>
        <CardDescription>Compared to last month</CardDescription>
      </CardHeader>
      <CardContent>
        <p className='text-3xl font-bold'>$12,430</p>
        <p className='text-sm text-muted-foreground'>+8.2% from last month</p>
      </CardContent>
    </Card>
  ),
};
