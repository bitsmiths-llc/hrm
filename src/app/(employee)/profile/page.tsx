import { Metadata } from 'next';

import { InfoCard } from '@/components/hrm/info-card';
import { PageHeader } from '@/components/hrm/page-header';
import { StatusBadge } from '@/components/hrm/status-badge';
import { BankInfoDialog } from '@/components/profile/bank-info-dialog';
import { ContactInfoDialog } from '@/components/profile/contact-info-dialog';

import { formatDate } from '@/utils/date-functions';
import { formatCurrency } from '@/utils/number-functions';

import { employmentTypeLabels } from '@/constants/hrm-labels';
import { mockCurrentEmployee } from '@/constants/mock/employees';

export const metadata: Metadata = { title: 'My Profile' };

export default function ProfilePage() {
  const employee = mockCurrentEmployee;

  return (
    <>
      <PageHeader
        title='My Profile'
        description={`${employee.designation} · ${employmentTypeLabels[employee.employmentType]}`}
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
        title='Employment (managed by admin)'
        fields={[
          {
            label: 'Employment type',
            value: employmentTypeLabels[employee.employmentType],
          },
          { label: 'Designation', value: employee.designation },
          { label: 'Base salary', value: formatCurrency(employee.baseSalary) },
          {
            label: 'Working hours / period',
            value: `${employee.workingHours}h`,
          },
        ]}
      />
    </>
  );
}
