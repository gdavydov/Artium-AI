// prisma/seed.ts
//
// Seeds the database with Northern Renaissance reference data: Countries,
// Period, Schools, and Artists. Uses find-or-create logic (rather than
// Prisma's upsert) since name fields aren't assumed to have unique
// constraints in the schema yet.
//
// Run with: npx ts-node prisma/seed.ts
// (or wire into package.json: "prisma": { "seed": "ts-node prisma/seed.ts" })

import { PrismaClient } from '@prisma/client';
import countries from '../seed-data/countries.json';
import periods from '../seed-data/periods.json';
import schools from '../seed-data/schools.json';
import artists from '../seed-data/artists.json';

const prisma = new PrismaClient();

async function findOrCreateCountry(name: string) {
  const existing = await prisma.country.findFirst({ where: { name } });
  if (existing) return existing;
  return prisma.country.create({ data: { name } });
}

async function findOrCreatePeriod(name: string, startYear: number, endYear: number) {
  const existing = await prisma.period.findFirst({ where: { name } });
  if (existing) return existing;
  return prisma.period.create({
    data: { name, start_year: startYear, end_year: endYear },
  });
}

async function findOrCreateSchool(name: string, description: string) {
  const existing = await prisma.school.findFirst({ where: { name } });
  if (existing) return existing;
  return prisma.school.create({ data: { name, description } });
}

async function main() {
  console.log('Seeding countries...');
  const countryMap = new Map<string, string>(); // name -> id
  for (const c of countries) {
    const row = await findOrCreateCountry(c.name);
    countryMap.set(c.name, row.id);
  }

  console.log('Seeding periods...');
  const periodMap = new Map<string, string>();
  for (const p of periods) {
    const row = await findOrCreatePeriod(p.name, p.start_year, p.end_year);
    periodMap.set(p.name, row.id);
  }

  console.log('Seeding schools...');
  const schoolMap = new Map<string, string>();
  for (const s of schools) {
    const row = await findOrCreateSchool(s.name, s.description);
    schoolMap.set(s.name, row.id);
  }

  console.log('Seeding artists...');
  for (const a of artists) {
    const countryId = countryMap.get(a.country);
    const periodId = periodMap.get(a.period);
    const schoolId = schoolMap.get(a.school);

    if (!countryId || !periodId || !schoolId) {
      console.warn(`Skipping ${a.name} — missing reference (country/period/school not found)`);
      continue;
    }

    const existing = await prisma.artist.findFirst({ where: { name: a.name } });
    if (existing) {
      console.log(`  ${a.name} already exists, skipping`);
      continue;
    }

    await prisma.artist.create({
      data: {
        name: a.name,
        bio: a.bio,
        country_id: countryId,
        period_id: periodId,
        school_id: schoolId,
      },
    });
    console.log(`  Created ${a.name}`);
  }

  console.log('Done seeding Northern Renaissance reference data.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
