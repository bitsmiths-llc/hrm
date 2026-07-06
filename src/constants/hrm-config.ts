/** System-wide HRM policy defaults (PRD 7.3). Admin-configurable later;
 *  frontend phase reads them from here. Amounts in PKR. */
export const hrmConfig = {
  leavePoolDays: 22,
  halfDayValue: 0.5,
  medicalMonthlyAccrual: 5_000,
  medicalBalanceCap: 50_000,
  overtimeMultiplier: 1.5,
  maxProofFiles: 5,
  maxProofFileSizeMb: 10,
} as const;
