-- =============================================================================
-- Populate Albrecht Dürer + representative artifacts
-- Safe to re-run: every insert checks "where not exists" first, so running
-- this twice won't create duplicates.
--
-- HOW TO RUN: Supabase Dashboard → SQL Editor → New query → paste → Run
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Reference data: Country, Period, School
-- ---------------------------------------------------------------------------

insert into country (name)
select 'Germany'
where not exists (select 1 from country where name = 'Germany');

insert into period (name, start_year, end_year)
select 'Northern Renaissance', 1420, 1580
where not exists (select 1 from period where name = 'Northern Renaissance');

insert into school (name, description)
select
  'German Renaissance School',
  'German painters and printmakers of the 15th-16th centuries who fused Northern detail with ideas absorbed from the Italian Renaissance, producing some of the era''s most technically accomplished portraiture and graphic art.'
where not exists (select 1 from school where name = 'German Renaissance School');

-- ---------------------------------------------------------------------------
-- 2. Medium entries used by Dürer's work (controlled vocabulary — Section 2.6)
-- ---------------------------------------------------------------------------

insert into medium (name, is_active)
select 'oil on panel', true
where not exists (select 1 from medium where name = 'oil on panel');

insert into medium (name, is_active)
select 'engraving', true
where not exists (select 1 from medium where name = 'engraving');

-- ---------------------------------------------------------------------------
-- 3. Artist: Albrecht Dürer
-- ---------------------------------------------------------------------------

insert into artist (name, bio, country_id, period_id, school_id)
select
  'Albrecht Dürer',
  'Born May 21, 1471 in Nuremberg and died there April 6, 1528. Painter, printmaker, and theorist widely regarded as the greatest artist of the German/Northern Renaissance. Son of a goldsmith, he trained under painter Michael Wolgemut before establishing an independent workshop in Nuremberg. Travels to Italy (1494-95 and 1505-07) exposed him to Renaissance ideas of proportion and perspective, which he fused with Northern European precision and detail. Best known for his mastery of printmaking — woodcuts and copper engravings — alongside portraits and religious paintings. His three "Master Engravings" (1513-1514) and the Apocalypse woodcut series remain among the most studied works in Western art history.',
  (select id from country where name = 'Germany'),
  (select id from period where name = 'Northern Renaissance'),
  (select id from school where name = 'German Renaissance School')
where not exists (select 1 from artist where name = 'Albrecht Dürer');

-- ---------------------------------------------------------------------------
-- 4. Representative Artifacts
-- ---------------------------------------------------------------------------

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Self-Portrait at 28 (Self-Portrait in a Fur-Collared Robe)',
  'Painted in 1500, this self-portrait presents Dürer in a frontal, Christ-like pose rare for a self-portrait of its era, reflecting Renaissance ideas about the elevated status of the artist. Widely considered one of the most iconic self-portraits in Western art.',
  'Alte Pinakothek, Munich',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Albrecht Dürer'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Self-Portrait at 28 (Self-Portrait in a Fur-Collared Robe)')
  and exists (select 1 from "user" limit 1);

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Melencolia I',
  'A 1514 engraving depicting a winged figure in contemplation, surrounded by symbolic tools and objects. One of Dürer''s three "Master Engravings" and among the most analyzed prints in art history, often read as an allegory of the melancholic, intellectual temperament.',
  'Multiple impressions held across major print collections worldwide (e.g. British Museum, Metropolitan Museum of Art)',
  (select id from medium where name = 'engraving'),
  (select id from artist where name = 'Albrecht Dürer'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Melencolia I')
  and exists (select 1 from "user" limit 1);

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Knight, Death, and the Devil',
  'A 1513 engraving showing an armored knight riding steadily through a menacing landscape accompanied by figures of Death and the Devil, widely interpreted as an allegory of steadfast Christian faith in the face of worldly temptation and mortality.',
  'Multiple impressions held across major print collections worldwide (e.g. British Museum, Metropolitan Museum of Art)',
  (select id from medium where name = 'engraving'),
  (select id from artist where name = 'Albrecht Dürer'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Knight, Death, and the Devil')
  and exists (select 1 from "user" limit 1);
