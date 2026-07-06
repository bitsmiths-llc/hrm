'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { FileUpload } from '@/components/hrm/file-upload';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import {
  type IdentityDocumentsInput,
  identityDocumentsSchema,
} from '@/schema/onboarding';

const documents: {
  name: keyof IdentityDocumentsInput;
  label: string;
}[] = [
  { name: 'cnicFront', label: 'Front of CNIC' },
  { name: 'cnicBack', label: 'Back of CNIC' },
  { name: 'photo', label: 'Recent photo (face clearly visible)' },
];

type DocumentsStepProps = {
  defaultValues?: IdentityDocumentsInput;
  onNext: (values: IdentityDocumentsInput) => void;
  onBack: () => void;
};

export function DocumentsStep({
  defaultValues,
  onNext,
  onBack,
}: DocumentsStepProps) {
  const form = useForm<IdentityDocumentsInput>({
    resolver: zodResolver(identityDocumentsSchema),
    defaultValues: defaultValues ?? { cnicFront: [], cnicBack: [], photo: [] },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onNext)}
        className='flex flex-col gap-6'
      >
        {documents.map(({ name, label }) => (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  <FileUpload
                    value={field.value}
                    onChange={field.onChange}
                    maxFiles={1}
                    accept='image/*,.pdf'
                    label='Upload file'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <div className='flex justify-between'>
          <Button type='button' variant='outline' onClick={onBack}>
            Back
          </Button>
          <Button type='submit'>Continue</Button>
        </div>
      </form>
    </Form>
  );
}
