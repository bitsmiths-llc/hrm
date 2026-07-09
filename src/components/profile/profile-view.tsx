'use client';

import { UserX } from 'lucide-react';

import { useMyProfile } from '@/hooks/queries/self-profile';

import { EmptyState } from '@/components/hrm/empty-state';
import { InfoCard } from '@/components/hrm/info-card';
import { PageHeader } from '@/components/hrm/page-header';
import { StatusBadge } from '@/components/hrm/status-badge';
import { BankInfoDialog } from '@/components/profile/bank-info-dialog';
import { ContactInfoDialog } from '@/components/profile/contact-info-dialog';
import { EmploymentReadonly } from '@/components/profile/employment-readonly';
import { SocialsInfoDialog } from '@/components/profile/socials-info-dialog';
import { Skeleton } from '@/components/ui/skeleton';

import { formatDate } from '@/utils/date-functions';

import { employmentTypeLabels } from '@/constants/hrm-labels';

/** Self-service profile: the signed-in employee views their own data and edits
 *  contact, bank, and socials. Employment stays read-only (admin-owned). */
export function ProfileView() {
  const { data: employee, isLoading } = useMyProfile();

  if (isLoading) {
    return (
      <div className='flex flex-col gap-6'>
        <Skeleton className='h-16 w-full max-w-md rounded-xl' />
        <Skeleton className='h-56 w-full rounded-xl' />
        <Skeleton className='h-56 w-full rounded-xl' />
      </div>
    );
  }

  if (!employee) {
    return (
      <EmptyState
        icon={UserX}
        title='Profile unavailable'
        description="We couldn't load your profile right now. Please refresh the page or try again shortly."
      />
    );
  }

  return (
    <>
      <PageHeader
        title='My Profile'
        description={`${employee.designation || 'No designation yet'} · ${employmentTypeLabels[employee.employmentType]}`}
      >
        <StatusBadge status={employee.status} />
      </PageHeader>

      <InfoCard
        title='Contact Information'
        action={
          <ContactInfoDialog
            defaultValues={{
              phone: employee.phone,
              emergencyContact: employee.emergencyContact,
              address: employee.address,
            }}
          />
        }
        fields={[
          { label: 'Email', value: employee.email },
          { label: 'Phone', value: employee.phone },
          { label: 'Emergency contact', value: employee.emergencyContact },
          { label: 'Address', value: employee.address },
        ]}
      />

      <InfoCard
        title='Personal Information'
        fields={[
          { label: 'Full name', value: employee.fullName },
          { label: 'Date of birth', value: formatDate(employee.dateOfBirth) },
          { label: 'CNIC', value: employee.cnic },
          { label: 'Joined', value: formatDate(employee.joinedAt) },
        ]}
      />

      <InfoCard
        title='Bank Information'
        action={
          <BankInfoDialog
            defaultValues={{
              bankName: employee.bank?.bankName ?? '',
              accountHolderName: employee.bank?.accountHolderName ?? '',
              accountNumber: employee.bank?.accountNumber ?? '',
              iban: employee.bank?.iban ?? '',
              branch: employee.bank?.branch ?? '',
            }}
          />
        }
        fields={[
          { label: 'Bank', value: employee.bank?.bankName },
          { label: 'Account holder', value: employee.bank?.accountHolderName },
          { label: 'Account number', value: employee.bank?.accountNumber },
          { label: 'IBAN', value: employee.bank?.iban },
          { label: 'Branch', value: employee.bank?.branch },
        ]}
      />

      <InfoCard
        title='Social Accounts'
        action={
          <SocialsInfoDialog
            defaultValues={{
              github: employee.social?.github ?? '',
              linkedin: employee.social?.linkedin ?? '',
              twitter: employee.social?.twitter ?? '',
            }}
          />
        }
        fields={[
          { label: 'GitHub', value: employee.social?.github },
          { label: 'LinkedIn', value: employee.social?.linkedin },
          { label: 'Twitter', value: employee.social?.twitter },
        ]}
      />

      <EmploymentReadonly employee={employee} />
    </>
  );
}
