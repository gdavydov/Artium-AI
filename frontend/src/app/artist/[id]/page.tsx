'use client';

// TODO: replace mockArtist with a real fetch from NEXT_PUBLIC_API_URL
// (backend/src/artists), keyed on params.id.

import { AboutArtistPage, ArtistSummary } from '@/components/AboutArtistPage';

const mockArtist: ArtistSummary = {
  name: 'Unknown Artist',
  bio: 'TODO: load from backend/src/artists.',
  periodName: 'Unknown',
  periodStartYear: 0,
  periodEndYear: 0,
};

export default function ArtistRoutePage({ params }: { params: { id: string } }) {
  console.log('TODO: fetch artist', params.id);
  return <AboutArtistPage artist={mockArtist} attachments={[]} artifacts={[]} />;
}
