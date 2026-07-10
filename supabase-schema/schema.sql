-- =============================================================================
-- Artium-Gallery — Initial Schema for Supabase (PostgreSQL)
-- Matches the data model in Appendix A of the Design Document.
--
-- HOW TO RUN:
--   1. Open your Supabase project dashboard
--   2. Go to the SQL Editor (left sidebar)
--   3. Click "New query", paste this entire file, click "Run"
-- =============================================================================

-- UUID generation is built into modern Postgres via gen_random_uuid() (pgcrypto).
create extension if not exists pgcrypto;

-- =============================================================================
-- Role & User (staff accounts only — no public/anonymous accounts)
-- =============================================================================

create table role (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique check (name in ('admin', 'curator', 'contributor'))
);

create table "user" (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  password_hash text not null,              -- bcrypt/argon2 hash — never plaintext
  role_id       uuid not null references role(id),
  created_at    timestamptz not null default now()
);

-- =============================================================================
-- Organization (museum/institution — owns one or more Collections)
-- =============================================================================

create table organization (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  description    text,
  website_url    text,
  contact_email  text,
  address        text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz
);

-- =============================================================================
-- Collection (owned by an Organization — audit fields store names, not User
-- FKs, per the design decision to keep a readable record even if accounts
-- change)
-- =============================================================================

create table collection (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organization(id),
  collection_name  text not null,
  type             text not null default 'private' check (type in ('public', 'private')),
  created_by_name  text not null,
  updated_by_name  text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz
);

-- =============================================================================
-- CollectionAccess (join table — grants a User "view" or "manage" access to a
-- private Collection; see Section 2.4.2 of the Design Document. Admins bypass
-- this table entirely in application logic and can always see everything.)
-- =============================================================================

create table collection_access (
  id             uuid primary key default gen_random_uuid(),
  collection_id  uuid not null references collection(id) on delete cascade,
  user_id        uuid not null references "user"(id) on delete cascade,
  access_level   text not null check (access_level in ('view', 'manage')),
  granted_by     uuid references "user"(id),
  granted_at     timestamptz not null default now(),
  unique (collection_id, user_id)
);

-- =============================================================================
-- Reference entities: Country, Period, School, Medium
-- =============================================================================

create table country (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  collection_id uuid references collection(id)
);

create table period (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  start_year    int not null,
  end_year      int not null,
  collection_id uuid references collection(id)
);

create table school (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text not null,
  collection_id uuid references collection(id)
);

create table medium (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,               -- e.g. "oil on canvas", "marble"
  is_active  boolean not null default true,
  added_by   uuid references "user"(id),  -- any staff role may add an entry
  created_at timestamptz not null default now()
);

-- =============================================================================
-- Artist
-- =============================================================================

create table artist (
  id                     uuid primary key default gen_random_uuid(),
  name                   text not null,
  bio                    text not null,
  portrait_image         bytea,           -- embedded portrait (nullable)
  portrait_content_type  text,            -- e.g. "image/jpeg"
  country_id             uuid not null references country(id),
  period_id              uuid not null references period(id),
  school_id              uuid references school(id),       -- optional
  collection_id          uuid references collection(id)     -- optional
);

-- =============================================================================
-- Artifact
-- =============================================================================

create table artifact (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  description    text not null,
  location       text,                    -- nullable free text
  medium_id      uuid not null references medium(id),
  artist_id      uuid references artist(id),        -- nullable (unattributed works)
  period_id      uuid not null references period(id),
  school_id      uuid references school(id),         -- nullable, independent of artist
  created_by     uuid not null references "user"(id),
  status         text not null default 'draft' check (status in ('draft', 'published'))
);

-- =============================================================================
-- ArtifactCollection (join table — an Artifact can belong to any number of
-- Collections at once; see Section 2.4.3 of the Design Document. Unlike
-- Artist/School/Period/Country's single nullable collection_id, this is a
-- true many-to-many relationship.)
-- =============================================================================

create table artifact_collection (
  id             uuid primary key default gen_random_uuid(),
  artifact_id    uuid not null references artifact(id) on delete cascade,
  collection_id  uuid not null references collection(id) on delete cascade,
  added_at       timestamptz not null default now(),
  unique (artifact_id, collection_id)
);

-- =============================================================================
-- Attachment (metadata only — actual files live in object storage, e.g. R2)
-- =============================================================================

create table attachment (
  id           uuid primary key default gen_random_uuid(),
  artifact_id  uuid not null references artifact(id) on delete cascade,
  uploaded_by  uuid not null references "user"(id),
  file_url     text not null,   -- object storage key, not raw bytes
  file_type    text not null    -- MIME type
);

-- =============================================================================
-- EditSuggestion (public wiki-style moderation queue)
-- =============================================================================

create table edit_suggestion (
  id               uuid primary key default gen_random_uuid(),
  entity_type      text not null,   -- e.g. 'artifact', 'artist', 'school'
  entity_id        uuid not null,   -- generic reference, validated in application code
  field_name       text not null,   -- e.g. 'description'
  original_text    text not null,
  proposed_text    text not null,
  submitter_name   text,            -- optional — anonymous submission allowed
  submitter_email  text,            -- optional
  status           text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by      uuid references "user"(id),
  created_at       timestamptz not null default now(),
  reviewed_at      timestamptz
);

-- =============================================================================
-- Indexes on foreign keys (Postgres doesn't auto-index FK columns)
-- =============================================================================

create index idx_user_role_id            on "user"(role_id);
create index idx_collection_type         on collection(type);
create index idx_collection_organization_id on collection(organization_id);
create index idx_collection_access_collection_id on collection_access(collection_id);
create index idx_collection_access_user_id  on collection_access(user_id);
create index idx_collection_access_granted_by on collection_access(granted_by);
create index idx_country_collection_id   on country(collection_id);
create index idx_period_collection_id    on period(collection_id);
create index idx_school_collection_id    on school(collection_id);
create index idx_medium_added_by         on medium(added_by);
create index idx_artist_country_id       on artist(country_id);
create index idx_artist_period_id        on artist(period_id);
create index idx_artist_school_id        on artist(school_id);
create index idx_artist_collection_id    on artist(collection_id);
create index idx_artifact_medium_id      on artifact(medium_id);
create index idx_artifact_artist_id      on artifact(artist_id);
create index idx_artifact_period_id      on artifact(period_id);
create index idx_artifact_school_id      on artifact(school_id);
create index idx_artifact_created_by     on artifact(created_by);
create index idx_artifact_status         on artifact(status);
create index idx_artifact_collection_artifact_id   on artifact_collection(artifact_id);
create index idx_artifact_collection_collection_id on artifact_collection(collection_id);
create index idx_attachment_artifact_id  on attachment(artifact_id);
create index idx_attachment_uploaded_by  on attachment(uploaded_by);
create index idx_edit_suggestion_entity  on edit_suggestion(entity_type, entity_id);
create index idx_edit_suggestion_status  on edit_suggestion(status);
create index idx_edit_suggestion_reviewed_by on edit_suggestion(reviewed_by);

-- =============================================================================
-- Seed the three fixed roles
-- =============================================================================

insert into role (name) values ('admin'), ('curator'), ('contributor');
