/** Fixed system constants (PRD 7.3) that aren't admin-configurable.
 *  Leave pool size, medical accrual/cap, and the overtime multiplier
 *  *are* admin-configurable — see `HrmSettings` / `useHrmSettings`. */
export const hrmConfig = {
  halfDayValue: 0.5,
  maxProofFiles: 5,
  maxProofFileSizeMb: 10,
  /** Accepted proof MIME types — mirrors the `medical-proofs` bucket's
   *  server-side allow-list so the client rejects the same set up front. */
  proofMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'],
} as const;
