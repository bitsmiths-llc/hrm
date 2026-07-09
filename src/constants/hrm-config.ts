/** Fixed system constants (PRD 7.3) that aren't admin-configurable.
 *  Leave pool size, medical accrual/cap, and the overtime multiplier
 *  *are* admin-configurable — see `HrmSettings` / `useHrmSettings`. */
export const hrmConfig = {
  halfDayValue: 0.5,
  maxProofFiles: 5,
  maxProofFileSizeMb: 10,
} as const;
