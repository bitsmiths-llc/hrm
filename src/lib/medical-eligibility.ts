import { Employee } from '@/types/hrm';

/** Medical Allowance Policy §1: full-time, confirmed employees only.
 *  Probation and notice-period employees aren't eligible even if
 *  full-time; part-time isn't eligible unless their contract states
 *  otherwise (not modeled here — treated as ineligible by default). */
export function getMedicalIneligibilityReason(
  employee: Employee,
): string | null {
  if (employee.employmentType !== 'full_time') {
    return 'Medical allowance applies to full-time employees only.';
  }
  if (employee.employmentStage === 'probation') {
    return "You're not eligible for medical allowance while on probation.";
  }
  if (employee.employmentStage === 'notice_period') {
    return 'Medical allowance is not available during your notice period.';
  }
  return null;
}

export function isMedicalEligible(employee: Employee): boolean {
  return getMedicalIneligibilityReason(employee) === null;
}
