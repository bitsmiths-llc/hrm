'use client';

import { Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

const mockDelay = (ms = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

type SendInvoiceButtonProps = {
  employeeName: string;
};

/** Mocked — no email backend yet, so this just confirms the action. */
export function SendInvoiceButton({ employeeName }: SendInvoiceButtonProps) {
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    setIsSending(true);
    await mockDelay();
    setIsSending(false);
    toast.success(`Invoice sent to ${employeeName}`);
  };

  return (
    <Button
      type='button'
      variant='outline'
      size='icon'
      isLoading={isSending}
      onClick={handleSend}
      title='Send invoice'
      aria-label='Send invoice'
    >
      <Send className='size-4' />
    </Button>
  );
}
