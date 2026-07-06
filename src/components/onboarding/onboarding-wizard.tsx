'use client';

import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { EmptyState } from '@/components/hrm/empty-state';
import { StepIndicator } from '@/components/hrm/step-indicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { onboardingSteps } from '@/constants/onboarding';
import { paths } from '@/constants/paths';
import {
  type BankInfoInput,
  type IdentityDocumentsInput,
  type PersonalInfoInput,
  type SocialAccountsInput,
} from '@/schema/onboarding';

import { BankInfoStep } from './bank-info-step';
import { ConsentStep } from './consent-step';
import { DocumentsStep } from './documents-step';
import { PersonalInfoStep } from './personal-info-step';
import { SocialAccountsStep } from './social-accounts-step';

type OnboardingData = {
  personal?: PersonalInfoInput;
  bank?: BankInfoInput;
  social?: SocialAccountsInput;
  documents?: IdentityDocumentsInput;
};

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({});
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title='Onboarding complete'
        description='Your account is now active — you have full access to leave, medical, overtime, and payslips.'
      >
        <Link href={paths.employee.dashboard}>
          <Button variant='outline'>Go to dashboard</Button>
        </Link>
      </EmptyState>
    );
  }

  const submit = async () => {
    // Frontend-only phase: simulate the submission.
    await new Promise((resolve) => setTimeout(resolve, 800));
    toast.success('Onboarding complete — your account is active');
    setSubmitted(true);
  };

  return (
    <div className='flex flex-col gap-6'>
      <StepIndicator steps={[...onboardingSteps]} currentStep={step} />
      <Card className='max-w-3xl'>
        <CardContent className='p-6'>
          {step === 0 && (
            <PersonalInfoStep
              defaultValues={data.personal}
              onNext={(personal) => {
                setData((d) => ({ ...d, personal }));
                setStep(1);
              }}
            />
          )}
          {step === 1 && (
            <BankInfoStep
              defaultValues={data.bank}
              onNext={(bank) => {
                setData((d) => ({ ...d, bank }));
                setStep(2);
              }}
              onBack={() => setStep(0)}
            />
          )}
          {step === 2 && (
            <SocialAccountsStep
              defaultValues={data.social}
              onNext={(social) => {
                setData((d) => ({ ...d, social }));
                setStep(3);
              }}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <DocumentsStep
              defaultValues={data.documents}
              onNext={(documents) => {
                setData((d) => ({ ...d, documents }));
                setStep(4);
              }}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && (
            <ConsentStep onSubmit={submit} onBack={() => setStep(3)} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
