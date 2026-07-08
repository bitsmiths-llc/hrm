import { Resend } from 'resend';
import 'server-only';

import { env } from '@/env';

/**
 * Server-only Resend client. Never import this from a client component: the
 * `server-only` import above turns any client-side import into a build error,
 * keeping the API key out of the browser bundle.
 */
export const resend = new Resend(env.RESEND_API_KEY);
