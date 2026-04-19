-- ============================================================
-- Petmate — Supabase Migration
-- Coller dans l'éditeur SQL de Supabase (SQL Editor → New query)
-- ============================================================

-- ─── 1. TABLES ───────────────────────────────────────────────

create table if not exists pet_ads (
  id            uuid        primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  created_by    text,                       -- email de l'auteur
  title         text        not null,
  description   text,
  ad_type       text        check (ad_type in ('request','offer')),
  service_type  text        check (service_type in ('walking','sitting','boarding','daycare')),
  pet_type      text        check (pet_type in ('dog','cat','bird','rabbit','other')),
  pet_name      text,
  city          text,
  neighborhood  text,
  latitude      double precision,
  longitude     double precision,
  price         double precision,
  price_unit    text        check (price_unit in ('per_hour','per_day','per_walk','negotiable')),
  date_from     date,
  date_to       date,
  contact_phone text,
  contact_name  text,
  photo_url     text,
  photos        text[],
  status        text        not null default 'active'
                            check (status in ('active','paused','completed','cancelled'))
);

create table if not exists orders (
  id              uuid        primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  created_by      text,
  plan_id         text        check (plan_id in ('pack_1','pack_10','pack_20','monthly')),
  plan_label      text,
  amount          double precision,
  credits         double precision,
  payment_method  text        check (payment_method in ('paypal','bank_transfer')),
  status          text        not null default 'pending'
                              check (status in ('pending','confirmed','cancelled')),
  user_email      text,
  user_name       text,
  notes           text,
  valid_until     date
);

create table if not exists walk_sessions (
  id                  uuid        primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  ad_id               text,
  sitter_email        text        not null,
  owner_email         text,
  pet_name            text,
  status              text        not null default 'waiting'
                                  check (status in ('waiting','active','completed','cancelled')),
  started_at          timestamptz,
  ended_at            timestamptz,
  checkin_at          timestamptz,
  checkin_distance_m  double precision,
  owner_lat           double precision,
  owner_lng           double precision,
  gps_points          jsonb       default '[]',
  total_distance_km   double precision,
  share_token         text
);

create table if not exists reviews (
  id              uuid        primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  created_by      text,
  ad_id           text,
  rating          int         check (rating between 1 and 5),
  comment         text,
  reviewer_name   text,
  reviewer_email  text
);

create table if not exists flash_sitters (
  id            uuid        primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  sitter_email  text,
  sitter_name   text,
  is_active     boolean     not null default true,
  latitude      double precision,
  longitude     double precision,
  expires_at    timestamptz
);


-- ─── 2. REALTIME ─────────────────────────────────────────────
-- Active les changements temps réel sur les tables qui en ont besoin

alter publication supabase_realtime add table flash_sitters;
alter publication supabase_realtime add table walk_sessions;


-- ─── 3. ROW LEVEL SECURITY (RLS) ─────────────────────────────
-- Active RLS sur toutes les tables, puis définit les policies.

alter table pet_ads      enable row level security;
alter table orders       enable row level security;
alter table walk_sessions enable row level security;
alter table reviews      enable row level security;
alter table flash_sitters enable row level security;

-- ── pet_ads ──
-- Lecture publique des annonces actives
create policy "Annonces actives visibles par tous"
  on pet_ads for select
  using (status = 'active');

-- Lecture de toutes ses propres annonces (même pausées)
create policy "Auteur voit ses propres annonces"
  on pet_ads for select
  using (created_by = auth.jwt() ->> 'email');

-- Création par utilisateur authentifié
create policy "Utilisateur authentifié peut créer"
  on pet_ads for insert
  with check (auth.role() = 'authenticated');

-- Mise à jour/suppression uniquement par l'auteur
create policy "Auteur peut modifier ses annonces"
  on pet_ads for update
  using (created_by = auth.jwt() ->> 'email');

create policy "Auteur peut supprimer ses annonces"
  on pet_ads for delete
  using (created_by = auth.jwt() ->> 'email');

-- ── orders ──
create policy "Utilisateur voit ses propres commandes"
  on orders for select
  using (user_email = auth.jwt() ->> 'email');

create policy "Utilisateur authentifié peut commander"
  on orders for insert
  with check (auth.role() = 'authenticated');

-- ── walk_sessions ──
create policy "Sitter ou owner peut voir la session"
  on walk_sessions for select
  using (
    sitter_email = auth.jwt() ->> 'email'
    or owner_email = auth.jwt() ->> 'email'
  );

-- Accès public via share_token (tracking live partagé)
create policy "Accès public via share_token"
  on walk_sessions for select
  using (share_token is not null);

create policy "Sitter peut créer une session"
  on walk_sessions for insert
  with check (auth.role() = 'authenticated');

create policy "Sitter peut mettre à jour la session"
  on walk_sessions for update
  using (sitter_email = auth.jwt() ->> 'email');

-- ── reviews ──
create policy "Reviews visibles par tous"
  on reviews for select
  using (true);

create policy "Utilisateur authentifié peut laisser un avis"
  on reviews for insert
  with check (auth.role() = 'authenticated');

-- ── flash_sitters ──
create policy "Flash sitters visibles par tous"
  on flash_sitters for select
  using (true);

create policy "Sitter peut gérer son statut flash"
  on flash_sitters for all
  using (sitter_email = auth.jwt() ->> 'email')
  with check (sitter_email = auth.jwt() ->> 'email');


-- ─── 4. ADMIN OVERRIDE (optionnel) ───────────────────────────
-- Si tu gères un rôle admin via user_metadata, décommente :
-- create policy "Admin accès total pet_ads"
--   on pet_ads for all
--   using (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');


-- ─── 5. INDEXES ──────────────────────────────────────────────
create index if not exists idx_pet_ads_status       on pet_ads (status);
create index if not exists idx_pet_ads_city         on pet_ads (city);
create index if not exists idx_pet_ads_created_by   on pet_ads (created_by);
create index if not exists idx_orders_user_email    on orders (user_email);
create index if not exists idx_walk_sessions_sitter on walk_sessions (sitter_email);
create index if not exists idx_walk_sessions_token  on walk_sessions (share_token);
create index if not exists idx_flash_active         on flash_sitters (is_active, expires_at);
create index if not exists idx_reviews_ad_id        on reviews (ad_id);


-- ─── 6. STORAGE BUCKET ───────────────────────────────────────
-- À faire dans le dashboard Supabase : Storage → New bucket
-- Nom : petmate-files
-- Public : oui (pour accès aux photos sans auth)
--
-- Ou via SQL :
insert into storage.buckets (id, name, public)
values ('petmate-files', 'petmate-files', true)
on conflict (id) do nothing;

create policy "Lecture publique des fichiers"
  on storage.objects for select
  using (bucket_id = 'petmate-files');

create policy "Upload authentifié"
  on storage.objects for insert
  with check (bucket_id = 'petmate-files' and auth.role() = 'authenticated');

create policy "Suppression par l'auteur"
  on storage.objects for delete
  using (bucket_id = 'petmate-files' and auth.uid()::text = owner);
