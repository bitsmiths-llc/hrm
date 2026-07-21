import { PolicyAcknowledgment } from '@/types/hrm';

/** Policy *documents* now come from Supabase (BIT-21). Only acknowledgments are
 *  still mock-backed, until the `policy_acknowledgments` table, the
 *  `acknowledgePolicy` action, and the admin compliance roster land in BIT-23.
 *  These records point at the old mock policy/employee ids, so none of them
 *  match the real repository — every policy currently reads as unacknowledged.
 */
export const mockPolicyAcknowledgments: PolicyAcknowledgment[] = [
  // emp-1 (Ayesha) — acknowledged the Leave Policy back when it was v1, so
  // she's now behind on the v2 update; never acknowledged the newer Code of
  // Conduct. Demonstrates the re-acknowledgment banner.
  {
    policyId: 'pol-1',
    employeeId: 'emp-1',
    acknowledgedVersion: 1,
    acknowledgedAt: '2026-01-05',
  },
  {
    policyId: 'pol-2',
    employeeId: 'emp-1',
    acknowledgedVersion: 1,
    acknowledgedAt: '2026-01-16',
  },
  {
    policyId: 'pol-3',
    employeeId: 'emp-1',
    acknowledgedVersion: 1,
    acknowledgedAt: '2026-03-11',
  },

  // emp-2 (Hamza) — fully caught up on every current version. Records are
  // append-only history: his v1 acknowledgment stays alongside the v2 one,
  // so past versions can show everyone who acknowledged them at the time.
  {
    policyId: 'pol-1',
    employeeId: 'emp-2',
    acknowledgedVersion: 1,
    acknowledgedAt: '2026-01-04',
  },
  {
    policyId: 'pol-1',
    employeeId: 'emp-2',
    acknowledgedVersion: 2,
    acknowledgedAt: '2026-06-02',
  },
  {
    policyId: 'pol-2',
    employeeId: 'emp-2',
    acknowledgedVersion: 1,
    acknowledgedAt: '2026-01-16',
  },
  {
    policyId: 'pol-3',
    employeeId: 'emp-2',
    acknowledgedVersion: 1,
    acknowledgedAt: '2026-03-11',
  },
  {
    policyId: 'pol-4',
    employeeId: 'emp-2',
    acknowledgedVersion: 1,
    acknowledgedAt: '2026-06-26',
  },
];
