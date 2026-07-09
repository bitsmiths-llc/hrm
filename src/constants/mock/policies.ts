import { Policy, PolicyAcknowledgment } from '@/types/hrm';

export const mockPolicies: Policy[] = [
  {
    id: 'pol-1',
    title: 'Leave Policy',
    category: 'leave',
    versions: [
      {
        version: 1,
        contentHtml: `
          <h2>Leave Policy</h2>
          <p>All full-time and part-time employees draw from a single shared pool of <strong>20 days per year</strong>, covering Paid Leave, Sick Leave, and Half Day leave. A Half Day consumes 0.5 days from the pool.</p>
          <p>Unpaid Leave is separate from the pool — it isn't capped, but every Unpaid Leave request is individually reviewed and approved by an admin, and reduces that pay period's salary proportionally.</p>
          <h3>Requesting leave</h3>
          <ul>
            <li>Submit a request with the leave type, dates, and a reason.</li>
            <li>No leave is auto-approved — every request requires explicit admin action.</li>
            <li>The pool resets at the start of each calendar year.</li>
          </ul>
        `,
        publishedAt: '2026-01-01',
      },
      {
        version: 2,
        contentHtml: `
          <h2>Leave Policy</h2>
          <p>All full-time and part-time employees draw from a single shared pool of <strong>22 days per year</strong>, covering Paid Leave, Sick Leave, and Half Day leave. A Half Day consumes 0.5 days from the pool.</p>
          <p>Unpaid Leave is separate from the pool — it isn't capped, but every Unpaid Leave request is individually reviewed and approved by an admin, and reduces that pay period's salary proportionally.</p>
          <h3>Requesting leave</h3>
          <ul>
            <li>Submit a request with the leave type, dates, and a reason.</li>
            <li>No leave is auto-approved — every request requires explicit admin action.</li>
            <li>The pool resets at the start of each calendar year.</li>
          </ul>
        `,
        publishedAt: '2026-06-01',
      },
    ],
  },
  {
    id: 'pol-2',
    title: 'Medical Allowance Policy',
    category: 'medical',
    versions: [
      {
        version: 1,
        contentHtml: `
          <h2>Medical Allowance Policy</h2>
          <p>Every eligible employee accrues <strong>5,000 PKR/month</strong> toward a shared medical allowance balance. Unused accrual rolls over month to month, up to a maximum balance of <strong>50,000 PKR</strong>.</p>
          <p>The balance covers claims for the employee themselves, a parent, spouse, or child — it's one shared balance, not split per dependent.</p>
          <h3>Submitting a claim</h3>
          <ul>
            <li>Provide who the claim is for, the service type, amount, and date of expense.</li>
            <li>Attach proof (a prescription or receipt) — up to 5 files, 10MB each.</li>
            <li>Approved claims deduct from the accrued balance and feed into that pay period's payroll.</li>
          </ul>
          <p>Employees on probation or in their notice period aren't eligible for medical allowance.</p>
        `,
        publishedAt: '2026-01-15',
      },
    ],
  },
  {
    id: 'pol-3',
    title: 'Overtime Policy',
    category: 'overtime',
    versions: [
      {
        version: 1,
        contentHtml: `
          <h2>Overtime Policy</h2>
          <p>Overtime pay applies to approved hours logged beyond an employee's standard working hours for the pay period.</p>
          <p>Overtime Rate = Base Salary &times; Overtime Multiplier &divide; Working Hours. Overtime Pay = Overtime Rate &times; approved Overtime Hours.</p>
          <p>The Overtime Multiplier is a global default set by admin, with an optional per-employee override applied at payroll-run time — it isn't visible to employees ahead of a payroll run.</p>
          <h3>Logging overtime</h3>
          <ul>
            <li>Log the date, number of hours, project, and task.</li>
            <li>Only approved hours are paid — every log requires explicit admin approval.</li>
          </ul>
        `,
        publishedAt: '2026-03-10',
      },
    ],
  },
  {
    id: 'pol-4',
    title: 'Code of Conduct',
    category: 'general',
    versions: [
      {
        version: 1,
        contentHtml: `
          <h2>Code of Conduct</h2>
          <p>This policy sets expectations for professional behavior, confidentiality, and communication at Bitsmiths.</p>
          <h3>Confidentiality</h3>
          <p>Employees must not share client data, source code, or internal business information outside the company without authorization.</p>
          <h3>Communication</h3>
          <p>All workplace communication — in person, on internal tools, or in writing — should remain respectful and professional. Harassment or discrimination of any kind will not be tolerated.</p>
          <h3>Conflicts of interest</h3>
          <p>Employees should disclose any outside work or financial interest that could reasonably conflict with their responsibilities at Bitsmiths.</p>
        `,
        publishedAt: '2026-06-25',
      },
    ],
  },
];

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

  // emp-2 (Hamza) — fully caught up on every current version.
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
