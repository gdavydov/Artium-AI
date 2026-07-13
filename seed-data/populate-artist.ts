// seed-data/populate-artist.ts
//
// Generic artist-driven seeder: given an artist name, pulls their public-domain
// works (with images) from the Metropolitan Museum of Art's Open Access API
// (no API key required, CC0-licensed images — https://metmuseum.github.io/),
// uploads each image to object storage (S3/R2, via the same StorageProvider
// pattern as backend/src/storage/storage.provider.ts), and writes the Country / Period /
// Artist / Medium / Artifact / Attachment rows via Prisma. Safe to re-run:
// every entity is looked up before being created.
//
// Usage:
//   npx ts-node seed-data/populate-artist.ts "Albrecht Dürer" --limit 20
//
// Required environment variables:
//   DATABASE_URL      Postgres connection string (Prisma)
//   STORAGE_ACCESS_KEY, STORAGE_SECRET_KEY   S3/R2 credentials
//   STORAGE_ENDPOINT  R2 account endpoint (omit for AWS S3)
//   MEDIA_BUCKET      target bucket name

import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const prisma = new PrismaClient();
const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.STORAGE_ENDPOINT, // omit for AWS S3, set for R2
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY!,
    secretAccessKey: process.env.STORAGE_SECRET_KEY!,
  },
});
const BUCKET = process.env.MEDIA_BUCKET!;

const MET_API = 'https://collectionapi.metmuseum.org/public/collection/v1';

interface MetObject {
  objectID: number;
  title: string;
  artistDisplayName: string;
  artistDisplayBio: string;
  artistNationality: string;
  medium: string;
  objectDate: string;
  objectBeginDate: number;
  objectEndDate: number;
  creditLine: string;
  repository: string;
  primaryImage: string;
  primaryImageSmall: string;
}

function parseArgs(argv: string[]) {
  const [artistName, ...rest] = argv;
  if (!artistName) {
    console.error('Usage: ts-node populate-artist.ts "<Artist Name>" [--limit N]');
    process.exit(1);
  }
  const limitFlagIndex = rest.indexOf('--limit');
  const limit = limitFlagIndex >= 0 ? parseInt(rest[limitFlagIndex + 1], 10) : 15;
  return { artistName, limit: Number.isFinite(limit) ? limit : 15 };
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

/** Met dates can be sparse; bucket by century so Period stays a coarse,
 *  reusable reference row rather than one row per artifact. */
function centuryPeriod(beginYear: number, endYear: number): { name: string; startYear: number; endYear: number } | null {
  const year = endYear || beginYear;
  if (!year) return null;
  const century = Math.ceil(year / 100);
  return {
    name: `${ordinal(century)} century`,
    startYear: (century - 1) * 100 + 1,
    endYear: century * 100,
  };
}

async function findOrCreateCountry(name: string) {
  const existing = await prisma.country.findFirst({ where: { name } });
  if (existing) return existing;
  return prisma.country.create({ data: { name } });
}

async function findOrCreatePeriod(name: string, startYear: number, endYear: number) {
  const existing = await prisma.period.findFirst({ where: { name } });
  if (existing) return existing;
  return prisma.period.create({ data: { name, startYear, endYear } });
}

async function findOrCreateMedium(name: string) {
  const existing = await prisma.medium.findFirst({ where: { name } });
  if (existing) return existing;
  return prisma.medium.create({ data: { name, isActive: true } });
}

async function findOrCreateArtist(met: MetObject, countryId: string, periodId: string) {
  const existing = await prisma.artist.findFirst({ where: { name: met.artistDisplayName } });
  if (existing) return existing;
  return prisma.artist.create({
    data: {
      name: met.artistDisplayName,
      bio: met.artistDisplayBio || `${met.artistDisplayName} (biography not provided by source).`,
      countryId,
      periodId,
    },
  });
}

function guessContentType(url: string): string {
  const ext = url.split('.').pop()?.toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'webp') return 'image/webp';
  return 'image/jpeg';
}

/** Mirrors backend/src/storage/storage.provider.ts's buildKey convention. */
function buildKey(artifactId: string, fileName: string): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `artifacts/${artifactId}/originals/${safeName}`;
}

async function uploadImage(imageUrl: string, artifactId: string): Promise<{ key: string; contentType: string }> {
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error(`Failed to download image ${imageUrl}: ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = guessContentType(imageUrl);
  const fileName = imageUrl.split('/').pop() || 'image.jpg';
  const key = buildKey(artifactId, fileName);

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  return { key, contentType };
}

async function searchArtistObjectIDs(artistName: string): Promise<number[]> {
  const url = `${MET_API}/search?hasImages=true&q=${encodeURIComponent(artistName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Met search failed: ${res.status}`);
  const data = (await res.json()) as { objectIDs: number[] | null };
  return data.objectIDs ?? [];
}

async function fetchObject(objectID: number): Promise<MetObject> {
  const res = await fetch(`${MET_API}/objects/${objectID}`);
  if (!res.ok) throw new Error(`Met object ${objectID} fetch failed: ${res.status}`);
  return res.json() as Promise<MetObject>;
}

async function main() {
  const { artistName, limit } = parseArgs(process.argv.slice(2));

  const createdByUser = await prisma.user.findFirst();
  if (!createdByUser) {
    console.error('No users found — create at least one staff user before seeding artifacts.');
    process.exit(1);
  }

  console.log(`Searching the Met collection for "${artistName}"...`);
  const objectIDs = await searchArtistObjectIDs(artistName);
  console.log(`  ${objectIDs.length} candidate object(s) found, checking up to ${limit} matches...`);

  let created = 0;
  for (const objectID of objectIDs) {
    if (created >= limit) break;

    const met = await fetchObject(objectID);
    if (!met.artistDisplayName?.toLowerCase().includes(artistName.toLowerCase())) continue;
    if (!met.primaryImage) continue;

    const existingArtifact = await prisma.artifact.findFirst({ where: { title: met.title } });
    if (existingArtifact) {
      console.log(`  "${met.title}" already exists, skipping`);
      continue;
    }

    const period = centuryPeriod(met.objectBeginDate, met.objectEndDate);
    if (!period) {
      console.log(`  "${met.title}" has no usable date, skipping`);
      continue;
    }
    if (!met.medium) {
      console.log(`  "${met.title}" has no medium listed, skipping`);
      continue;
    }

    const countryRow = await findOrCreateCountry(met.artistNationality || 'Unknown');
    const periodRow = await findOrCreatePeriod(period.name, period.startYear, period.endYear);
    const artistRow = await findOrCreateArtist(met, countryRow.id, periodRow.id);
    const mediumRow = await findOrCreateMedium(met.medium.toLowerCase());

    const artifactRow = await prisma.artifact.create({
      data: {
        title: met.title,
        description: [met.objectDate, met.creditLine].filter(Boolean).join(' — ') || met.title,
        location: met.repository || null,
        mediumId: mediumRow.id,
        artistId: artistRow.id,
        periodId: periodRow.id,
        status: 'published',
        createdBy: createdByUser.id,
      },
    });

    try {
      const { key, contentType } = await uploadImage(met.primaryImage, artifactRow.id);
      await prisma.attachment.create({
        data: {
          artifactId: artifactRow.id,
          uploadedBy: createdByUser.id,
          fileUrl: key,
          fileType: contentType,
        },
      });
      console.log(`  Created "${met.title}" + uploaded image (${key})`);
    } catch (err) {
      console.warn(`  Created "${met.title}" but image upload failed:`, (err as Error).message);
    }

    created += 1;
  }

  console.log(`Done. Created ${created} artifact(s) for "${artistName}".`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
