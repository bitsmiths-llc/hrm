import { EmployeeContract } from '@/types/hrm';

export const mockContracts: EmployeeContract[] = [
  {
    employeeId: 'emp-1',
    versions: [
      {
        version: 1,
        fileName: 'ayesha-khan-contract-2025.pdf',
        uploadedAt: '2025-02-10',
        note: null,
      },
      {
        version: 2,
        fileName: 'ayesha-khan-contract-2026-renewal.pdf',
        uploadedAt: '2026-02-10',
        note: 'Annual renewal',
      },
    ],
  },
  {
    employeeId: 'emp-2',
    versions: [
      {
        version: 1,
        fileName: 'hamza-raza-contract-2024.pdf',
        uploadedAt: '2024-09-20',
        note: null,
      },
    ],
  },
];
