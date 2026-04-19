/**
 * entities.js — Supabase adapter replacing base44.entities.*
 *
 * Replaces:
 *   base44.entities.PetAd.filter(...)   → entities.PetAd.filter(...)
 *   base44.entities.PetAd.create(...)   → entities.PetAd.create(...)
 *   base44.entities.PetAd.update(...)   → entities.PetAd.update(...)
 *   base44.entities.PetAd.delete(...)   → entities.PetAd.delete(...)
 *   base44.entities.PetAd.list(...)     → entities.PetAd.list(...)
 *   base44.entities.PetAd.subscribe()   → entities.PetAd.subscribe()
 */

import { supabase } from './supabaseClient';

/**
 * Creates an entity accessor for a given Supabase table.
 * Mirrors the Base44 entity API surface.
 */
function createEntity(tableName) {
  return {
    /**
     * Filter records. Mirrors: base44.entities.X.filter(filterObj, orderBy, limit)
     * @param {Object} filters  - key/value pairs for exact match WHERE clauses
     * @param {string} orderBy  - e.g. "-created_date" (leading minus = DESC)
     * @param {number} limit    - max number of rows
     */
    async filter(filters = {}, orderBy = '', limit = 100) {
      let query = supabase.from(tableName).select('*');

      // Apply exact-match filters
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      }

      // Apply ordering: "-created_date" → order by created_date DESC
      if (orderBy) {
        const descending = orderBy.startsWith('-');
        const column = descending ? orderBy.slice(1) : orderBy;
        // Map base44 "created_date" to Supabase "created_at" if needed
        const col = column === 'created_date' ? 'created_at' : column;
        query = query.order(col, { ascending: !descending });
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },

    /**
     * List all records (no filter). Mirrors: base44.entities.X.list(orderBy, limit)
     */
    async list(orderBy = '', limit = 100) {
      return this.filter({}, orderBy, limit);
    },

    /**
     * Create a new record. Mirrors: base44.entities.X.create(data)
     */
    async create(data) {
      const { data: created, error } = await supabase
        .from(tableName)
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return created;
    },

    /**
     * Update an existing record. Mirrors: base44.entities.X.update(id, data)
     */
    async update(id, data) {
      const { data: updated, error } = await supabase
        .from(tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return updated;
    },

    /**
     * Delete a record. Mirrors: base44.entities.X.delete(id)
     */
    async delete(id) {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    },

    /**
     * Subscribe to real-time changes. Mirrors: base44.entities.X.subscribe(callback)
     * Returns an unsubscribe function.
     */
    subscribe(callback) {
      const channel = supabase
        .channel(`realtime:${tableName}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: tableName },
          (payload) => callback(payload)
        )
        .subscribe();

      // Return unsubscribe function (matching base44's pattern)
      return () => supabase.removeChannel(channel);
    },
  };
}

export const entities = {
  PetAd: createEntity('pet_ads'),
  Order: createEntity('orders'),
  WalkSession: createEntity('walk_sessions'),
  Review: createEntity('reviews'),
  FlashSitter: createEntity('flash_sitters'),
};
