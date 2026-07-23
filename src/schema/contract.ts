import { z } from 'zod';

import { hrmConfig } from '@/constants/hrm-config';

/** Enforced client-side (FileUpload + Zod) and by the `contracts` bucket
 *  itself (size + MIME) — a bypassed client can't get around the bucket. */
export const MAX_CONTRACT_FILE_BYTES =
  hrmConfig.maxContractFileSizeMb * 1024 * 1024;

const MAX_NOTE_LENGTH = 200;

/**
 * Server-authoritative fields for `uploadContract`. The PDF is already in the
 * `contracts` bucket by the time the action runs, so only its key travels here
 * — `version` and `is_active` are never supplied by the client (the
 * `upload_contract` RPC computes both).
 *
 * The path is required to sit under the target employee's folder: that is the
 * prefix the `contractdocs_own` storage policy matches on, so a row pointing
 * outside it would be a contract the owning employee could never read.
 */
export const uploadContractSchema = z
  .object({
    employeeId: z.string().uuid(),
    /** '<employee_id>/<uuid>.pdf' inside the `contracts` bucket. */
    storagePath: z.string().min(1),
    fileName: z.string().min(1),
    note: z.string().trim().max(MAX_NOTE_LENGTH).optional(),
  })
  .refine((data) => data.storagePath.startsWith(`${data.employeeId}/`), {
    path: ['storagePath'],
    message: "Storage path must sit under the employee's own folder",
  });

export type UploadContractInput = z.infer<typeof uploadContractSchema>;

/**
 * Client-side dialog schema. The `File` never reaches the server action (it is
 * uploaded straight to storage first), so it is referenced only here.
 */
export const uploadContractFormSchema = z.object({
  files: z
    .array(z.instanceof(File))
    .length(1, 'Attach the signed contract PDF')
    .refine(
      (files) => files.every((file) => file.size <= MAX_CONTRACT_FILE_BYTES),
      `The contract must be under ${hrmConfig.maxContractFileSizeMb}MB`,
    ),
  note: z
    .string()
    .trim()
    .max(MAX_NOTE_LENGTH, `Keep the note under ${MAX_NOTE_LENGTH} characters`)
    .optional(),
});

export type UploadContractFormInput = z.infer<typeof uploadContractFormSchema>;
