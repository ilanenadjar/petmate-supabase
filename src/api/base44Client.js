/**
 * base44Client.js — Drop-in compatibility shim
 *
 * Replaces the original Base44 SDK with Supabase.
 * All existing imports of this file continue to work:
 *   import { base44 } from '@/api/base44Client';
 */

import { entities } from './entities';
import { auth } from './auth';
import { integrations } from './integrations';

export const base44 = {
  entities,
  auth,
  integrations,
};
