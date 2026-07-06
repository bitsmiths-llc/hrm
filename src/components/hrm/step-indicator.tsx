import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

type StepIndicatorProps = {
  steps: string[];
  /** Zero-based index of the current step. */
  currentStep: number;
};

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <ol className='flex flex-wrap items-center gap-x-2 gap-y-3'>
      {steps.map((step, index) => {
        const isComplete = index < currentStep;
        const isCurrent = index === currentStep;
        return (
          <li key={step} className='flex items-center gap-2'>
            <span
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium',
                isComplete &&
                  'border-primary bg-primary text-primary-foreground',
                isCurrent && 'border-primary text-primary',
                !isComplete &&
                  !isCurrent &&
                  'border-border text-muted-foreground',
              )}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {isComplete ? (
                <Check className='size-4' aria-hidden />
              ) : (
                index + 1
              )}
            </span>
            <span
              className={cn(
                'text-sm',
                isCurrent ? 'font-medium' : 'text-muted-foreground',
                'hidden sm:inline',
              )}
            >
              {step}
            </span>
            {index < steps.length - 1 && (
              <span aria-hidden className='h-px w-6 bg-border sm:w-8' />
            )}
          </li>
        );
      })}
    </ol>
  );
}
