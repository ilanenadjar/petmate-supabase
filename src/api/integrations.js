/**
 * integrations.js — Supabase adapter replacing base44.integrations.*
 *
 * Replaces:
 *   base44.integrations.Core.UploadFile({ file }) → integrations.Core.UploadFile({ file })
 */

import { supabase } from './supabaseClient';

export const integrations = {
  Core: {
    /**
     * Uploads a file to Supabase Storage and returns its public URL.
     * Mirrors: base44.integrations.Core.UploadFile({ file })
     *
     * @param {{ file: File }} param
     * @returns {Promise<{ file_url: string }>}
     */
    async UploadFile({ file }) {
      // Unique filename to avoid collisions
      const ext = file.name.split('.').pop();
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const path = `uploads/${filename}`;

      const { error: uploadError } = await supabase.storage
        .from('petmate-files')  // ← Create this bucket in your Supabase dashboard
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('petmate-files')
        .getPublicUrl(path);

      return { file_url: data.publicUrl };
    },
  },
};
