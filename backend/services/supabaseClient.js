const { createClient } = require('@supabase/supabase-js');

if (process.env.USE_FAKE_DB === '1') {
  // Simple in-memory fake supabase client for testing
  const { v4: uuidv4 } = require('uuid');

  const store = {
    informes: []
  };

  function makeQuery(table) {
    let filters = [];
    let selectStr = null;
    let orderOpts = null;

    return {
      select(s) { selectStr = s; return this; },
      order() { orderOpts = arguments; return this; },
      ilike(field, val) { filters.push({ type: 'ilike', field, val }); return this; },
      eq(field, val) { filters.push({ type: 'eq', field, val }); return this; },
      insert(obj) {
        const record = { id: uuidv4(), ...obj, created_at: new Date().toISOString() };
        store[table].push(record);
        return {
          select() { return { single: async () => ({ data: record, error: null }) }; },
          async single() { return { data: record, error: null }; }
        };
      },
      update(updates) {
        // apply eq filter id
        const eqId = filters.find(f => f.type === 'eq' && f.field === 'id');
        if (!eqId) return { data: null, error: new Error('no id filter') };
        const idx = store[table].findIndex(r => r.id == eqId.val);
        if (idx === -1) return { data: null, error: null };
        store[table][idx] = { ...store[table][idx], ...updates };
        const updated = store[table][idx];
        return {
          select() { return { data: updated, error: null }; },
          async single() { return { data: updated, error: null }; }
        };
      },
      delete() {
        const eqId = filters.find(f => f.type === 'eq' && f.field === 'id');
        if (!eqId) return { data: null, error: new Error('no id filter') };
        const idx = store[table].findIndex(r => r.id == eqId.val);
        if (idx === -1) return { data: null, error: null };
        const removed = store[table].splice(idx,1)[0];
        return { data: removed, error: null };
      },
      single() {
        // execute select with filters returning single record
        let results = store[table].slice();
        for (const f of filters) {
          if (f.type === 'eq') results = results.filter(r => r[f.field] == f.val);
          if (f.type === 'ilike') results = results.filter(r => (r[f.field] || '').toLowerCase().includes((f.val || '').toLowerCase().replace(/%/g, '')));
        }
        return { data: results[0] || null, error: null };
      },
      then(resolve) {
        // Allow awaiting the query directly
        const results = store[table].slice();
        return resolve({ data: results, error: null });
      }
    };
  }

  module.exports = {
    from(table) { return makeQuery(table); }
  };

} else {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  module.exports = supabase;
}
