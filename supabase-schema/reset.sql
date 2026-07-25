-- =============================================================================
-- Artium-Gallery — Full reset (drops every table this project creates)
--
-- Use this only when it's OK to lose all existing data in these tables — e.g.
-- your Supabase project is still in development. Run this FIRST, then run
-- schema.sql fresh in a new query to recreate everything (including the
-- newer organization, collection_access, and artifact_collection tables).
--
-- HOW TO RUN: Supabase Dashboard → SQL Editor → New query → paste this file
-- → Run. Then open another New query, paste schema.sql, and Run that too.
-- =============================================================================

drop table if exists edit_suggestion cascade;
drop table if exists attachment cascade;
drop table if exists artifact_collection cascade;
drop table if exists artifact cascade;
drop table if exists artist cascade;
drop table if exists medium cascade;
drop table if exists school cascade;
drop table if exists period cascade;
drop table if exists country cascade;
drop table if exists collection_access cascade;
drop table if exists collection cascade;
drop table if exists organization cascade;
drop table if exists "user" cascade;
drop table if exists role cascade;
