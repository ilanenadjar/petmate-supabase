# Petmate — Version Supabase

Migration de Base44 vers Supabase (auth + PostgreSQL + realtime + storage).

## Installation rapide

### 1. Créer un projet Supabase
Sur [supabase.com](https://supabase.com) → New project → noter Project URL + anon key

### 2. Créer les tables
SQL Editor → coller + exécuter `supabase-migration.sql`

### 3. Variables d'environnement
```bash
cp .env.example .env
# Remplir VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
```

### 4. Lancer
```bash
npm install && npm run dev
```

## Auth OAuth
Par défaut : Google. Pour changer, éditer `src/lib/AuthContext.jsx` et `src/api/auth.js` :
```js
supabase.auth.signInWithOAuth({ provider: 'github' }); // ou 'google', magic link, etc.
```
Activer le provider dans : Supabase Dashboard → Authentication → Providers.

## Donner le rôle admin
```sql
update auth.users
set raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'
where email = 'admin@example.com';
```

## Fichiers modifiés
- `src/api/base44Client.js` — shim de compatibilité (les 40+ imports restent intacts)
- `src/api/entities.js` — adapteur CRUD + realtime → Supabase
- `src/api/auth.js` — adapteur auth → Supabase Auth
- `src/api/integrations.js` — upload → Supabase Storage
- `src/lib/AuthContext.jsx` — réécrit avec Supabase
- `vite.config.js` — suppression @base44/vite-plugin
- `supabase-migration.sql` — tables, RLS, indexes, storage bucket
