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

insert into medium (name, is_active)
select 'woodcut', true
where not exists (select 1 from medium where name = 'woodcut');

insert into medium (name, is_active)
select 'watercolor and gouache', true
where not exists (select 1 from medium where name = 'watercolor and gouache');

insert into medium (name, is_active)
select 'silverpoint drawing', true
where not exists (select 1 from medium where name = 'silverpoint drawing');

insert into medium (name, is_active)
select 'brush drawing', true
where not exists (select 1 from medium where name = 'brush drawing');

insert into medium (name, is_active)
select 'oil on parchment', true
where not exists (select 1 from medium where name = 'oil on parchment');

-- ---------------------------------------------------------------------------
-- 3. Artist: Albrecht Dürer
-- ---------------------------------------------------------------------------

insert into artist (name, bio, country_id, period_id, school_id)
select
  'Albrecht Dürer',
  'Born May 21, 1471 in Nuremberg and died there April 6, 1528. Painter, printmaker, and theorist widely regarded as the greatest artist of the German/Northern Renaissance. Son of a goldsmith, he trained under painter Michael Wolgemut before establishing an independent workshop in Nuremberg. Travels to Italy (1494-95 and 1505-07) exposed him to Renaissance ideas of proportion and perspective, which he fused with Northern European precision and detail. Best known for his mastery of printmaking — woodcuts and copper engravings — alongside portraits, watercolors, and religious paintings. His three "Master Engravings" (1513-1514) and the Apocalypse woodcut series remain among the most studied works in Western art history.',
  (select id from country where name = 'Germany'),
  (select id from period where name = 'Northern Renaissance'),
  (select id from school where name = 'German Renaissance School')
where not exists (select 1 from artist where name = 'Albrecht Dürer');

-- ---------------------------------------------------------------------------
-- 4. Representative Artifacts
-- ---------------------------------------------------------------------------

-- 4.1 Paintings (oil on panel / parchment)

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
  'Self-Portrait at 22 (Self-Portrait with Eryngium)',
  'Painted in 1493, likely as a gift or introduction to his betrothed Agnes Frey, this early self-portrait on parchment (later mounted on canvas) shows the young Dürer holding a sprig of eryngium, a plant symbolically associated with marital fidelity.',
  'Musée du Louvre, Paris',
  (select id from medium where name = 'oil on parchment'),
  (select id from artist where name = 'Albrecht Dürer'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Self-Portrait at 22 (Self-Portrait with Eryngium)')
  and exists (select 1 from "user" limit 1);

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Adoration of the Magi',
  'A 1504 oil-on-panel altarpiece painted shortly before Dürer''s second trip to Italy, notable for its confident handling of perspective and architectural space, and for the artist''s inclusion of his own self-portrait among the attendant figures.',
  'Uffizi Gallery, Florence',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Albrecht Dürer'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Adoration of the Magi')
  and exists (select 1 from "user" limit 1);

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'The Feast of the Rosary (Rosenkranzfest)',
  'A large 1506 altarpiece painted in Venice for the German merchant community''s church, intended in part to demonstrate to Venetian critics that a Northern painter could master color as skillfully as an Italian one.',
  'National Gallery, Prague',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Albrecht Dürer'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'The Feast of the Rosary (Rosenkranzfest)')
  and exists (select 1 from "user" limit 1);

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Four Apostles',
  'A 1526 diptych depicting John, Peter, Mark, and Paul, painted late in Dürer''s life and given to the city of Nuremberg. Often read as a statement of the artist''s Lutheran sympathies, paired with inscribed warnings against false prophets.',
  'Alte Pinakothek, Munich',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Albrecht Dürer'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Four Apostles')
  and exists (select 1 from "user" limit 1);

-- 4.2 Engravings

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

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Saint Jerome in His Study',
  'A 1514 engraving portraying Saint Jerome absorbed in scholarly work in a sunlit study, completing Dürer''s trio of "Master Engravings" alongside Melencolia I and Knight, Death, and the Devil. Renowned for its masterful rendering of light and perspective.',
  'Multiple impressions held across major print collections worldwide (e.g. British Museum, Metropolitan Museum of Art)',
  (select id from medium where name = 'engraving'),
  (select id from artist where name = 'Albrecht Dürer'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Saint Jerome in His Study')
  and exists (select 1 from "user" limit 1);

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Adam and Eve',
  'A 1504 engraving depicting the first humans in the Garden of Eden, notable as Dürer''s fullest application of Italian-derived ideal proportion to the nude figure, underpinned by his systematic studies of human measurement.',
  'Multiple impressions held across major print collections worldwide (e.g. British Museum, Metropolitan Museum of Art)',
  (select id from medium where name = 'engraving'),
  (select id from artist where name = 'Albrecht Dürer'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Adam and Eve')
  and exists (select 1 from "user" limit 1);

-- 4.3 Woodcuts

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'The Four Horsemen of the Apocalypse',
  'A 1498 woodcut from Dürer''s Apocalypse series, depicting Conquest, War, Famine, and Death trampling figures below. Its dynamic composition and technical virtuosity established Dürer''s international reputation and remain a landmark of printmaking.',
  'Multiple impressions held across major print collections worldwide (e.g. British Museum, Metropolitan Museum of Art)',
  (select id from medium where name = 'woodcut'),
  (select id from artist where name = 'Albrecht Dürer'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'The Four Horsemen of the Apocalypse')
  and exists (select 1 from "user" limit 1);

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Rhinoceros',
  'A 1515 woodcut of an Indian rhinoceros that Dürer never saw in person, worked instead from a written description and sketch of an animal that had arrived in Lisbon. Despite its anatomical inaccuracies, it became the definitive European image of the rhinoceros for centuries.',
  'Multiple impressions held across major print collections worldwide (e.g. British Museum, Metropolitan Museum of Art)',
  (select id from medium where name = 'woodcut'),
  (select id from artist where name = 'Albrecht Dürer'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Rhinoceros')
  and exists (select 1 from "user" limit 1);

-- 4.4 Watercolors, drawings, and studies

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Young Hare (Feldhase)',
  'A 1502 watercolor and gouache study prized for its meticulous rendering of fur texture and the play of light across the animal''s form, exemplifying Dürer''s close observation of the natural world outside his print and panel work.',
  'Albertina, Vienna',
  (select id from medium where name = 'watercolor and gouache'),
  (select id from artist where name = 'Albrecht Dürer'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Young Hare (Feldhase)')
  and exists (select 1 from "user" limit 1);

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'The Great Piece of Turf (Das große Rasenstück)',
  'A 1503 watercolor and gouache study of an unremarkable patch of meadow grasses and weeds, notable as an early example of nature studied for its own sake rather than as a backdrop to a religious or historical scene.',
  'Albertina, Vienna',
  (select id from medium where name = 'watercolor and gouache'),
  (select id from artist where name = 'Albrecht Dürer'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'The Great Piece of Turf (Das große Rasenstück)')
  and exists (select 1 from "user" limit 1);

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Wing of a Blue Roller',
  'A 1512 watercolor and gouache study of a European roller''s wing, admired for its precise rendering of feather structure and color and often cited alongside Young Hare as evidence of Dürer''s skill as a naturalist illustrator.',
  'Albertina, Vienna',
  (select id from medium where name = 'watercolor and gouache'),
  (select id from artist where name = 'Albrecht Dürer'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Wing of a Blue Roller')
  and exists (select 1 from "user" limit 1);

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Praying Hands (Betende Hände)',
  'A 1508 brush drawing on blue prepared paper, made as a study for an apostle figure in the (now-lost) Heller Altarpiece. One of the most widely reproduced drawings in Western art, often reproduced independently of its original devotional context.',
  'Albertina, Vienna',
  (select id from medium where name = 'brush drawing'),
  (select id from artist where name = 'Albrecht Dürer'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Praying Hands (Betende Hände)')
  and exists (select 1 from "user" limit 1);

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Self-Portrait at 13',
  'A 1484 silverpoint drawing made when Dürer was thirteen years old, inscribed by the artist himself noting his age. Remarkable as one of the earliest known self-portraits by any European artist and evidence of prodigious skill at a young age.',
  'Albertina, Vienna',
  (select id from medium where name = 'silverpoint drawing'),
  (select id from artist where name = 'Albrecht Dürer'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Self-Portrait at 13')
  and exists (select 1 from "user" limit 1);
