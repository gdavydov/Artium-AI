-- =============================================================================
-- Populate the remaining Northern Renaissance artists (see seed-data/artists.json)
-- + representative artifacts for each, plus Antonello da Messina (Italian, but
-- the direct conduit who brought Netherlandish oil technique into Italian
-- painting — see his bio below for why he's grouped with this set). Companion
-- to populate_durer.sql, which covers Albrecht Dürer separately.
-- Safe to re-run: every insert checks "where not exists" first, so running
-- this twice won't create duplicates.
--
-- HOW TO RUN: Supabase Dashboard → SQL Editor → New query → paste → Run
-- (Run populate_durer.sql first, or run this first — both are idempotent and
-- order-independent since each checks for its own reference data.)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Reference data: Country, Period, School
-- ---------------------------------------------------------------------------

insert into country (name)
select 'Netherlands'
where not exists (select 1 from country where name = 'Netherlands');

insert into country (name)
select 'Germany'
where not exists (select 1 from country where name = 'Germany');

insert into country (name)
select 'France'
where not exists (select 1 from country where name = 'France');

insert into country (name)
select 'Italy'
where not exists (select 1 from country where name = 'Italy');

insert into period (name, start_year, end_year)
select 'Northern Renaissance', 1420, 1580
where not exists (select 1 from period where name = 'Northern Renaissance');

insert into school (name, description)
select
  'Early Netherlandish School',
  'The founding generation of Northern Renaissance oil painting, centered in Flanders (modern Belgium/Netherlands) from roughly 1420-1500. Known for meticulous realism, symbolic detail, and pioneering the use of layered oil glazes.'
where not exists (select 1 from school where name = 'Early Netherlandish School');

insert into school (name, description)
select
  'German Renaissance School',
  'German painters and printmakers of the 15th-16th centuries who fused Northern detail with ideas absorbed from the Italian Renaissance, producing some of the era''s most technically accomplished portraiture and graphic art.'
where not exists (select 1 from school where name = 'German Renaissance School');

insert into school (name, description)
select
  'Flemish School',
  'The second generation of Netherlandish painters (early-to-mid 16th century), expanding beyond religious subjects into landscape, peasant life, and genre scenes.'
where not exists (select 1 from school where name = 'Flemish School');

insert into school (name, description)
select
  'French Renaissance School',
  'French court painters of the 15th-16th centuries, known for portraiture and manuscript illumination, working alongside but distinct from the Netherlandish and German traditions.'
where not exists (select 1 from school where name = 'French Renaissance School');

-- ---------------------------------------------------------------------------
-- 2. Medium entries (controlled vocabulary — Section 2.6). oil on panel and
-- oil on parchment may already exist from populate_durer.sql.
-- ---------------------------------------------------------------------------

insert into medium (name, is_active)
select 'oil on panel', true
where not exists (select 1 from medium where name = 'oil on panel');

insert into medium (name, is_active)
select 'oil on parchment', true
where not exists (select 1 from medium where name = 'oil on parchment');

-- ---------------------------------------------------------------------------
-- 3. Artists
-- ---------------------------------------------------------------------------

insert into artist (name, bio, country_id, period_id, school_id)
select
  'Jan van Eyck',
  'Born c. 1390, died 1441 in Bruges. Netherlandish painter active in the service of Philip the Good, Duke of Burgundy. Pioneer of the oil painting technique in Northern Europe, celebrated for the Ghent Altarpiece (completed with his brother Hubert) and the Arnolfini Portrait, both renowned for minute realism, luminous color, and mastery of light reflected in convex mirrors and jewels.',
  (select id from country where name = 'Netherlands'),
  (select id from period where name = 'Northern Renaissance'),
  (select id from school where name = 'Early Netherlandish School')
where not exists (select 1 from artist where name = 'Jan van Eyck');

insert into artist (name, bio, country_id, period_id, school_id)
select
  'Robert Campin',
  'Born c. 1375, died 1444 in Tournai. Often identified with the anonymous "Master of Flémalle," an early Netherlandish painter whose workshop is thought to have trained both Rogier van der Weyden and Jacques Daret. Known for the Mérode Altarpiece, blending intimate domestic detail with religious narrative.',
  (select id from country where name = 'Netherlands'),
  (select id from period where name = 'Northern Renaissance'),
  (select id from school where name = 'Early Netherlandish School')
where not exists (select 1 from artist where name = 'Robert Campin');

insert into artist (name, bio, country_id, period_id, school_id)
select
  'Rogier van der Weyden',
  'Born c. 1399/1400, died 1464 in Brussels. Official painter to the city of Brussels and one of the most influential Early Netherlandish masters. Renowned for emotionally intense religious compositions, most famously the Descent from the Cross, whose compressed, sculptural arrangement and expressive grief became a model for generations of Northern European painters.',
  (select id from country where name = 'Netherlands'),
  (select id from period where name = 'Northern Renaissance'),
  (select id from school where name = 'Early Netherlandish School')
where not exists (select 1 from artist where name = 'Rogier van der Weyden');

insert into artist (name, bio, country_id, period_id, school_id)
select
  'Hans Memling',
  'Born c. 1430 in Germany, died 1494 in Bruges. German-born painter who settled in Bruges, likely trained in Rogier van der Weyden''s workshop. Known for serene, devotional portraits and altarpieces, including the elaborate Shrine of St. Ursula, softening the emotional intensity of his predecessors into a calmer, more decorative style.',
  (select id from country where name = 'Netherlands'),
  (select id from period where name = 'Northern Renaissance'),
  (select id from school where name = 'Early Netherlandish School')
where not exists (select 1 from artist where name = 'Hans Memling');

insert into artist (name, bio, country_id, period_id, school_id)
select
  'Dieric Bouts',
  'Born c. 1415, died 1475 in Leuven, where he served as official city painter from 1468. Early Netherlandish painter noted for his early, rigorous use of single-point linear perspective and restrained, elongated figures, exemplified in his Last Supper altarpiece, one of the first Northern paintings to apply Italian perspective principles.',
  (select id from country where name = 'Netherlands'),
  (select id from period where name = 'Northern Renaissance'),
  (select id from school where name = 'Early Netherlandish School')
where not exists (select 1 from artist where name = 'Dieric Bouts');

insert into artist (name, bio, country_id, period_id, school_id)
select
  'Petrus Christus',
  'Born c. 1410, died 1475/76 in Bruges. Bruges-based painter likely influenced directly by Jan van Eyck''s workshop after the latter''s death. Furthered the use of linear perspective and single-point vanishing lines in Netherlandish interior scenes, as seen in A Goldsmith in his Shop.',
  (select id from country where name = 'Netherlands'),
  (select id from period where name = 'Northern Renaissance'),
  (select id from school where name = 'Early Netherlandish School')
where not exists (select 1 from artist where name = 'Petrus Christus');

insert into artist (name, bio, country_id, period_id, school_id)
select
  'Hieronymus Bosch',
  'Born c. 1450, died 1516 in ''s-Hertogenbosch. Highly original painter celebrated for fantastical, moralizing religious allegory populated with surreal hybrid creatures. His triptych The Garden of Earthly Delights remains one of the most analyzed and reproduced paintings in Western art history.',
  (select id from country where name = 'Netherlands'),
  (select id from period where name = 'Northern Renaissance'),
  (select id from school where name = 'Early Netherlandish School')
where not exists (select 1 from artist where name = 'Hieronymus Bosch');

insert into artist (name, bio, country_id, period_id, school_id)
select
  'Hugo van der Goes',
  'Born c. 1440, died 1482. Ghent-based painter and dean of the painters'' guild before retiring to a monastery near Brussels. Best known for the monumental Portinari Altarpiece, commissioned for a Florentine patron, whose emotional realism directly influenced Italian painters who saw it after its arrival in Florence.',
  (select id from country where name = 'Netherlands'),
  (select id from period where name = 'Northern Renaissance'),
  (select id from school where name = 'Early Netherlandish School')
where not exists (select 1 from artist where name = 'Hugo van der Goes');

insert into artist (name, bio, country_id, period_id, school_id)
select
  'Gerard David',
  'Born c. 1460, died 1523 in Bruges. Painter working at the close of the Early Netherlandish tradition, inheriting Hans Memling''s standing as the city''s leading painter. Known for luminous landscapes and devotional panels, as well as the unusually severe Judgment of Cambyses, a civic commission illustrating the punishment of a corrupt judge.',
  (select id from country where name = 'Netherlands'),
  (select id from period where name = 'Northern Renaissance'),
  (select id from school where name = 'Early Netherlandish School')
where not exists (select 1 from artist where name = 'Gerard David');

insert into artist (name, bio, country_id, period_id, school_id)
select
  'Lucas Cranach the Elder',
  'Born 1472, died 1553. Court painter to the Electors of Saxony in Wittenberg, closely associated with the Protestant Reformation and a personal friend of Martin Luther, whom he portrayed repeatedly. Also renowned for elegant, stylized mythological and allegorical nudes such as Adam and Eve.',
  (select id from country where name = 'Germany'),
  (select id from period where name = 'Northern Renaissance'),
  (select id from school where name = 'German Renaissance School')
where not exists (select 1 from artist where name = 'Lucas Cranach the Elder');

insert into artist (name, bio, country_id, period_id, school_id)
select
  'Hans Holbein the Younger',
  'Born 1497, died 1543. German portraitist who became court painter to Henry VIII of England. Celebrated for psychologically penetrating, meticulously detailed portraits of the Tudor court, including The Ambassadors, famous for its anamorphic skull rendered in distorted perspective.',
  (select id from country where name = 'Germany'),
  (select id from period where name = 'Northern Renaissance'),
  (select id from school where name = 'German Renaissance School')
where not exists (select 1 from artist where name = 'Hans Holbein the Younger');

insert into artist (name, bio, country_id, period_id, school_id)
select
  'Matthias Grünewald',
  'Born c. 1470, died 1528. Painter of the Isenheim Altarpiece, created for a hospital run by the Antonine order caring for plague and skin-disease sufferers. Notable for its raw emotional intensity, unconventional color, and unflinching depiction of suffering, distinct from the more classicizing tendencies of contemporaries.',
  (select id from country where name = 'Germany'),
  (select id from period where name = 'Northern Renaissance'),
  (select id from school where name = 'German Renaissance School')
where not exists (select 1 from artist where name = 'Matthias Grünewald');

insert into artist (name, bio, country_id, period_id, school_id)
select
  'Albrecht Altdorfer',
  'Born c. 1480, died 1538. Regensburg painter, printmaker, and architect, a leading figure of the so-called "Danube School." Among the earliest European artists to treat landscape as an independent subject rather than mere backdrop, and painter of the sweeping historical panorama The Battle of Alexander at Issus.',
  (select id from country where name = 'Germany'),
  (select id from period where name = 'Northern Renaissance'),
  (select id from school where name = 'German Renaissance School')
where not exists (select 1 from artist where name = 'Albrecht Altdorfer');

insert into artist (name, bio, country_id, period_id, school_id)
select
  'Pieter Bruegel the Elder',
  'Born c. 1525, died 1569 in Brussels. Flemish painter renowned for panoramic landscapes and vivid scenes of peasant life, including Hunters in the Snow and The Peasant Wedding. His Netherlandish Proverbs illustrates dozens of Flemish idioms literally enacted within a single village scene.',
  (select id from country where name = 'Netherlands'),
  (select id from period where name = 'Northern Renaissance'),
  (select id from school where name = 'Flemish School')
where not exists (select 1 from artist where name = 'Pieter Bruegel the Elder');

insert into artist (name, bio, country_id, period_id, school_id)
select
  'Quentin Matsys',
  'Born 1466, died 1530. Painter credited with founding the Antwerp school of painting after relocating there from Leuven. Blended Netherlandish tradition with emerging Italian and Renaissance humanist influence, as well as satirical genre scenes like The Ugly Duchess and The Moneylender and his Wife.',
  (select id from country where name = 'Netherlands'),
  (select id from period where name = 'Northern Renaissance'),
  (select id from school where name = 'Flemish School')
where not exists (select 1 from artist where name = 'Quentin Matsys');

insert into artist (name, bio, country_id, period_id, school_id)
select
  'Joachim Patinir',
  'Born c. 1480, died 1524. Early specialist in landscape painting, based in Antwerp and admired by Albrecht Dürer, who described him as a "good landscape painter." Typically subordinated religious figures to sweeping, fantastical panoramic landscapes, as in Landscape with the Flight into Egypt.',
  (select id from country where name = 'Netherlands'),
  (select id from period where name = 'Northern Renaissance'),
  (select id from school where name = 'Flemish School')
where not exists (select 1 from artist where name = 'Joachim Patinir');

insert into artist (name, bio, country_id, period_id, school_id)
select
  'Jean Fouquet',
  'Born c. 1420, died 1481. Leading French painter and manuscript illuminator of the 15th century, court painter to Charles VII and Louis XI, and the first French artist known to have traveled to Italy. Best known for the Melun Diptych, its two panels now divided between Berlin and Chantilly.',
  (select id from country where name = 'France'),
  (select id from period where name = 'Northern Renaissance'),
  (select id from school where name = 'French Renaissance School')
where not exists (select 1 from artist where name = 'Jean Fouquet');

insert into artist (name, bio, country_id, period_id, school_id)
select
  'Jean Clouet',
  'Born c. 1485/1490, died 1540/41. Court painter to Francis I of France, likely of Netherlandish origin. Known for portraits combining Netherlandish precision with French courtly elegance, exemplified by his portrait of Francis I himself.',
  (select id from country where name = 'France'),
  (select id from period where name = 'Northern Renaissance'),
  (select id from school where name = 'French Renaissance School')
where not exists (select 1 from artist where name = 'Jean Clouet');

-- Antonello da Messina is Italian, not part of any of the four Northern
-- European schools above — school_id is intentionally left NULL. He's
-- included here for his singular historical role as the direct conduit who
-- brought Early Netherlandish oil technique into Italian painting.
insert into artist (name, bio, country_id, period_id)
select
  'Antonello da Messina',
  'Born c. 1430, died 1479 in Messina, Sicily. Though Italian by birth and training, Antonello is included alongside the Netherlandish and German masters because he is the crucial link between the two traditions: he mastered the Flemish oil-glazing technique — likely transmitted via the Naples workshop of Colantonio, itself in contact with Netherlandish panels circulating in Southern Italy — and fused it with Italian Renaissance monumentality and clarity of form. His close-observed, almost sculptural portraits and devotional panels carried van Eyck-style realism into Venice, directly influencing Giovanni Bellini and the Venetian school.',
  (select id from country where name = 'Italy'),
  (select id from period where name = 'Northern Renaissance')
where not exists (select 1 from artist where name = 'Antonello da Messina');

-- ---------------------------------------------------------------------------
-- 4. Representative Artifacts
-- ---------------------------------------------------------------------------

-- 4.1 Jan van Eyck

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Ghent Altarpiece (The Adoration of the Mystic Lamb)',
  'A monumental polyptych completed in 1432, begun by Hubert van Eyck and finished by his brother Jan. Its twenty panels combine Old and New Testament imagery around a central vision of the Lamb of God, celebrated for unprecedented realism in landscape, textile, and light.',
  'Saint Bavo Cathedral, Ghent',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Jan van Eyck'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Ghent Altarpiece (The Adoration of the Mystic Lamb)')
  and exists (select 1 from "user" limit 1);

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Arnolfini Portrait',
  'A 1434 double portrait, likely depicting the merchant Giovanni di Nicolao Arnolfini and his wife, renowned for its intricate symbolism and the convex mirror at its center reflecting the room and two additional figures, one possibly the artist himself.',
  'National Gallery, London',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Jan van Eyck'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Arnolfini Portrait')
  and exists (select 1 from "user" limit 1);

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Man in a Red Turban',
  'A 1433 portrait, possibly a self-portrait, inscribed with van Eyck''s motto "Als ich kan" ("As best I can"). Notable for its direct, three-quarter gaze and meticulous rendering of the sitter''s red chaperon headwear.',
  'National Gallery, London',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Jan van Eyck'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Man in a Red Turban')
  and exists (select 1 from "user" limit 1);

-- 4.2 Robert Campin

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Mérode Altarpiece (Annunciation Triptych)',
  'A c. 1427-1432 triptych depicting the Annunciation set within a meticulously observed Flemish middle-class interior, flanked by donor portraits and a workshop scene of Saint Joseph. A hallmark of Early Netherlandish domestic realism.',
  'The Cloisters, Metropolitan Museum of Art, New York',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Robert Campin'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Mérode Altarpiece (Annunciation Triptych)')
  and exists (select 1 from "user" limit 1);

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Portrait of a Fat Man',
  'A small, incisively observed portrait attributed to Campin/the Master of Flémalle, notable for its unidealized, close-cropped depiction of the sitter — an early example of Netherlandish portraiture''s commitment to unflattering realism.',
  'Museo del Prado, Madrid',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Robert Campin'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Portrait of a Fat Man')
  and exists (select 1 from "user" limit 1);

-- 4.3 Rogier van der Weyden

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Descent from the Cross',
  'A c. 1435 altarpiece compressing ten life-size figures into a shallow, sculptural space, their interlocking poses amplifying the scene''s grief. Widely considered van der Weyden''s masterpiece and one of the most influential paintings of the 15th century.',
  'Museo del Prado, Madrid',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Rogier van der Weyden'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Descent from the Cross')
  and exists (select 1 from "user" limit 1);

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Portrait of a Lady',
  'A c. 1460 portrait exemplifying van der Weyden''s late portrait style: a restrained palette, sharply outlined silhouette, and downcast gaze conveying a sense of aristocratic reserve.',
  'National Gallery of Art, Washington, D.C.',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Rogier van der Weyden'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Portrait of a Lady')
  and exists (select 1 from "user" limit 1);

-- 4.4 Hans Memling

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Shrine of St. Ursula',
  'An elaborate 1489 gilded reliquary casket shaped like a miniature Gothic chapel, its panels painted with scenes from the legend of Saint Ursula, made to house relics believed to be hers.',
  'Memling Museum (Sint-Janshospitaal), Bruges',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Hans Memling'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Shrine of St. Ursula')
  and exists (select 1 from "user" limit 1);

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Diptych of Maarten van Nieuwenhove',
  'A 1487 devotional diptych pairing a portrait of the donor with the Virgin and Child, unified across both panels by a single continuous interior space reflected in a convex mirror — a device recalling Jan van Eyck.',
  'Memling Museum (Sint-Janshospitaal), Bruges',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Hans Memling'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Diptych of Maarten van Nieuwenhove')
  and exists (select 1 from "user" limit 1);

-- 4.5 Dieric Bouts

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'The Last Supper',
  'The central panel of an altarpiece completed 1464-1468, among the first Northern European paintings to apply a rigorous, single vanishing-point perspective, organizing the room and figures around Christ at the table''s center.',
  'St. Peter''s Church, Leuven',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Dieric Bouts'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'The Last Supper' and artist_id = (select id from artist where name = 'Dieric Bouts'))
  and exists (select 1 from "user" limit 1);

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Justice of Otto III',
  'A pair of panels illustrating a legend of wrongful execution and posthumous vindication, commissioned for Leuven''s town hall as an allegory of civic justice, with restrained, elongated figures typical of Bouts.',
  'Royal Museums of Fine Arts of Belgium, Brussels',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Dieric Bouts'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Justice of Otto III')
  and exists (select 1 from "user" limit 1);

-- 4.6 Petrus Christus

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'A Goldsmith in his Shop',
  'A 1449 panel depicting a goldsmith weighing rings for a betrothed couple, notable for its detailed inventory of period jewelry and tools and its early, precise use of a convex mirror reflecting the street outside.',
  'Metropolitan Museum of Art, New York',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Petrus Christus'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'A Goldsmith in his Shop')
  and exists (select 1 from "user" limit 1);

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Portrait of a Young Girl',
  'A c. 1470 portrait admired for its cool, geometric clarity and the sitter''s direct gaze, exemplifying Christus''s refinement of van Eyck''s realism into a more schematic, structured mode of portraiture.',
  'Gemäldegalerie, Berlin',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Petrus Christus'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Portrait of a Young Girl')
  and exists (select 1 from "user" limit 1);

-- 4.7 Hieronymus Bosch

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'The Garden of Earthly Delights',
  'A c. 1490-1510 triptych moving from Eden on the left panel through a crowded panorama of earthly pleasure in the center to a nightmarish hellscape on the right. Among the most analyzed and reproduced paintings in Western art.',
  'Museo del Prado, Madrid',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Hieronymus Bosch'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'The Garden of Earthly Delights')
  and exists (select 1 from "user" limit 1);

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'The Haywain Triptych',
  'A triptych using a cart of hay, fought over by a crowd indifferent to the Christ figure above, as an allegory for the fleeting, worthless nature of earthly possessions and the folly of humankind.',
  'Museo del Prado, Madrid',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Hieronymus Bosch'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'The Haywain Triptych')
  and exists (select 1 from "user" limit 1);

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Death and the Miser',
  'A moralizing panel depicting a dying man torn between an angel and demons at his deathbed while still reaching for a bag of gold, warning against avarice in one''s final moments.',
  'National Gallery of Art, Washington, D.C.',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Hieronymus Bosch'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Death and the Miser')
  and exists (select 1 from "user" limit 1);

-- 4.8 Hugo van der Goes

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Portinari Altarpiece',
  'A monumental c. 1475-1476 triptych of the Adoration of the Shepherds, commissioned by the Florentine banker Tommaso Portinari. Its unidealized, emotionally raw shepherds startled Italian painters after the work reached Florence.',
  'Uffizi Gallery, Florence',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Hugo van der Goes'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Portinari Altarpiece')
  and exists (select 1 from "user" limit 1);

-- 4.9 Gerard David

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'The Judgment of Cambyses',
  'A two-panel 1498 civic commission for Bruges'' town hall depicting the arrest and gruesome punishment of a corrupt judge, intended as a stark warning to magistrates about the price of dishonesty.',
  'Groeningemuseum, Bruges',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Gerard David'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'The Judgment of Cambyses')
  and exists (select 1 from "user" limit 1);

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'The Baptism of Christ',
  'A triptych centered on the Baptism of Christ in the River Jordan, set within a tranquil, detailed landscape characteristic of David''s late style, flanked by donor portraits.',
  'Groeningemuseum, Bruges',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Gerard David'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'The Baptism of Christ')
  and exists (select 1 from "user" limit 1);

-- 4.10 Lucas Cranach the Elder

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Adam and Eve',
  'A 1526 panel depicting the moment of temptation in Eden, rendered with Cranach''s characteristically elongated, elegantly stylized nude figures set against a dark, undefined background.',
  'Courtauld Gallery, London',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Lucas Cranach the Elder'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Adam and Eve' and artist_id = (select id from artist where name = 'Lucas Cranach the Elder'))
  and exists (select 1 from "user" limit 1);

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Portrait of Martin Luther',
  'One of numerous portrait sessions Cranach and his workshop produced of the Reformation leader, a personal friend, helping to define and disseminate Luther''s public image across Reformation-era Germany.',
  'Multiple versions held in major collections (e.g. Uffizi Gallery, Florence)',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Lucas Cranach the Elder'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Portrait of Martin Luther')
  and exists (select 1 from "user" limit 1);

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'The Judgment of Paris',
  'A mythological scene showing the Trojan prince Paris choosing the fairest of three goddesses, treated by Cranach as an opportunity for his signature elongated female nude, set in a fantastical armor-clad courtly scene.',
  'Metropolitan Museum of Art, New York',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Lucas Cranach the Elder'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'The Judgment of Paris')
  and exists (select 1 from "user" limit 1);

-- 4.11 Hans Holbein the Younger

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'The Ambassadors',
  'A 1533 double portrait of two French visitors to the English court, surrounded by symbolic instruments and objects, famous for the distorted, anamorphic skull stretched across the foreground that resolves into shape only when viewed from an extreme angle.',
  'National Gallery, London',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Hans Holbein the Younger'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'The Ambassadors')
  and exists (select 1 from "user" limit 1);

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Portrait of Henry VIII',
  'One of several authoritative images of the English king produced by Holbein as court painter, establishing the iconic, imposing frontal pose that would define Henry VIII''s visual legacy for centuries.',
  'Thyssen-Bornemisza Museum, Madrid',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Hans Holbein the Younger'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Portrait of Henry VIII')
  and exists (select 1 from "user" limit 1);

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Portrait of Anne of Cleves',
  'A 1539 marriage portrait commissioned by Henry VIII to evaluate a prospective bride, painted on parchment with Holbein''s characteristic precision — famously flattering enough that the king was reportedly disappointed upon meeting her in person.',
  'Musée du Louvre, Paris',
  (select id from medium where name = 'oil on parchment'),
  (select id from artist where name = 'Hans Holbein the Younger'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Portrait of Anne of Cleves')
  and exists (select 1 from "user" limit 1);

-- 4.12 Matthias Grünewald

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Isenheim Altarpiece',
  'A multi-paneled altarpiece created c. 1512-1516 for a hospital run by the Antonine order treating plague and skin-disease sufferers. Its harrowing Crucifixion panel, depicting Christ''s body covered in sores, offered afflicted viewers a suffering savior who shared their affliction.',
  'Unterlinden Museum, Colmar',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Matthias Grünewald'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Isenheim Altarpiece')
  and exists (select 1 from "user" limit 1);

-- 4.13 Albrecht Altdorfer

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'The Battle of Alexander at Issus',
  'A 1529 panorama depicting Alexander the Great''s victory over Darius III, compressing thousands of tiny figures into a vast landscape beneath a swirling, cosmic sky — commissioned as part of a series of historical battle scenes for the Duke of Bavaria.',
  'Alte Pinakothek, Munich',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Albrecht Altdorfer'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'The Battle of Alexander at Issus')
  and exists (select 1 from "user" limit 1);

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Danube Landscape near Regensburg with Wörth Castle',
  'One of the earliest surviving European paintings with no human subject at all — a pure landscape, considered a landmark in treating nature as a worthy subject in its own right rather than a backdrop to religious or historical narrative.',
  'Alte Pinakothek, Munich',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Albrecht Altdorfer'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Danube Landscape near Regensburg with Wörth Castle')
  and exists (select 1 from "user" limit 1);

-- 4.14 Pieter Bruegel the Elder

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Hunters in the Snow',
  'A 1565 panel from a series depicting the months of the year, showing weary hunters returning to a snow-covered village, its high vantage point and receding diagonal composition among the most celebrated landscape images in Western art.',
  'Kunsthistorisches Museum, Vienna',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Pieter Bruegel the Elder'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Hunters in the Snow')
  and exists (select 1 from "user" limit 1);

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'The Tower of Babel',
  'A 1563 depiction of the biblical tower under construction, rendered as a colossal, Colosseum-like structure dwarfing the surrounding city, its unfinished, faltering upper levels suggesting the project''s inevitable collapse.',
  'Kunsthistorisches Museum, Vienna',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Pieter Bruegel the Elder'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'The Tower of Babel')
  and exists (select 1 from "user" limit 1);

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Netherlandish Proverbs',
  'A 1559 panel crowding over one hundred Flemish proverbs and idioms into a single village scene, each literally enacted by a figure — a playful, encyclopedic catalog of folk wisdom and human folly.',
  'Gemäldegalerie, Berlin',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Pieter Bruegel the Elder'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Netherlandish Proverbs')
  and exists (select 1 from "user" limit 1);

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'The Peasant Wedding',
  'A lively depiction of a rural wedding feast, rendered without idealization or moralizing, offering one of the most vivid surviving records of 16th-century peasant life and custom.',
  'Kunsthistorisches Museum, Vienna',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Pieter Bruegel the Elder'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'The Peasant Wedding')
  and exists (select 1 from "user" limit 1);

-- 4.15 Quentin Matsys

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'The Ugly Duchess',
  'A c. 1513 satirical portrait of an aged woman in fashionable dress, exaggerating her features to grotesque effect — likely intended as a moralizing commentary on vanity rather than a depiction of a real sitter.',
  'National Gallery, London',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Quentin Matsys'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'The Ugly Duchess')
  and exists (select 1 from "user" limit 1);

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'The Moneylender and his Wife',
  'A 1514 genre scene depicting a couple at a table of coins and scales, its detailed still-life elements and moral ambiguity about commerce and piety reflecting Antwerp''s rise as a center of trade and banking.',
  'Musée du Louvre, Paris',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Quentin Matsys'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'The Moneylender and his Wife')
  and exists (select 1 from "user" limit 1);

-- 4.16 Joachim Patinir

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Landscape with the Flight into Egypt',
  'A devotional scene of the Holy Family in flight, reduced to a small foreground detail within a sweeping, fantastical panoramic landscape of cliffs, rivers, and villages — the composition, not the narrative, is the true subject.',
  'Royal Museum of Fine Arts Antwerp',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Joachim Patinir'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Landscape with the Flight into Egypt')
  and exists (select 1 from "user" limit 1);

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Charon Crossing the Styx',
  'A panoramic depiction of the mythological ferryman Charon guiding a soul between the paradise of Eden and the torments of Hell, split symmetrically across the panel — a rare Northern Renaissance treatment of classical mythology fused with Christian cosmology.',
  'Museo del Prado, Madrid',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Joachim Patinir'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Charon Crossing the Styx')
  and exists (select 1 from "user" limit 1);

-- 4.17 Jean Fouquet

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Melun Diptych — Virgin and Child',
  'The right-hand panel of Fouquet''s Melun Diptych, showing the Virgin surrounded by red and blue cherubim; the sitter for the Virgin is traditionally identified as Agnès Sorel, mistress to Charles VII.',
  'Gemäldegalerie, Berlin',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Jean Fouquet'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Melun Diptych — Virgin and Child')
  and exists (select 1 from "user" limit 1);

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Melun Diptych — Étienne Chevalier with St. Stephen',
  'The left-hand panel of the Melun Diptych, portraying the royal treasurer Étienne Chevalier, the work''s donor, presented by his name saint — the panel now hangs separately from its companion piece.',
  'Musée Condé, Chantilly',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Jean Fouquet'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Melun Diptych — Étienne Chevalier with St. Stephen')
  and exists (select 1 from "user" limit 1);

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Portrait of Charles VII',
  'A frontal state portrait of the French king, notable as one of the earliest independent portrait paintings in French art, blending Netherlandish precision with an emerging French court style.',
  'Musée du Louvre, Paris',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Jean Fouquet'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Portrait of Charles VII')
  and exists (select 1 from "user" limit 1);

-- 4.18 Jean Clouet

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Portrait of Francis I',
  'A c. 1530 state portrait of the French king in richly patterned costume, establishing the formal, richly decorative template that would define French royal portraiture for the rest of the century.',
  'Musée du Louvre, Paris',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Jean Clouet'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Portrait of Francis I')
  and exists (select 1 from "user" limit 1);

-- 4.19 Antonello da Messina

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Saint Jerome in His Study',
  'A small c. 1475 panel depicting the scholar-saint absorbed in reading within a serene, light-filled Gothic study, its meticulous rendering of objects and cabinetry showing direct study of Netherlandish interior painting fused with an Italian sense of ordered space.',
  'National Gallery, London',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Antonello da Messina'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Saint Jerome in His Study')
  and exists (select 1 from "user" limit 1);

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Portrait of a Man (Il Condottiere)',
  'A 1475 portrait of an unidentified sitter, its confident three-quarter turn, sharp modeling, and direct gaze exemplifying the psychological immediacy Antonello brought to Italian portraiture via Netherlandish oil technique.',
  'Musée du Louvre, Paris',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Antonello da Messina'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Portrait of a Man (Il Condottiere)')
  and exists (select 1 from "user" limit 1);

insert into artifact (title, description, location, medium_id, artist_id, period_id, status, created_by)
select
  'Virgin Annunciate',
  'A c. 1476 half-length depiction of the Virgin Mary at the moment of the Annunciation, her raised hand and lowered gaze conveying quiet composure. Painted in Sicily after Antonello''s return from the Italian mainland, showing his mature synthesis of Flemish detail and Italian geometric clarity.',
  'Palazzo Abatellis, Palermo',
  (select id from medium where name = 'oil on panel'),
  (select id from artist where name = 'Antonello da Messina'),
  (select id from period where name = 'Northern Renaissance'),
  'published',
  (select id from "user" limit 1)
where not exists (select 1 from artifact where title = 'Virgin Annunciate')
  and exists (select 1 from "user" limit 1);
