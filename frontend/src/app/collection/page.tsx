'use client';

// TODO: replace the mock data and handlers below with real GraphQL calls
// against NEXT_PUBLIC_API_URL (backend/src/collections), real navigation to
// an artist-creation flow, and derive `canEdit` from the signed-in user's
// role (Admin/Curator, or Contributor with a `manage` CollectionAccess grant).

import {
  CollectionForm,
  CollectionRecord,
  CollectionFormValues,
  PeriodOption,
  ArtistThumbnail,
} from '@/components/CollectionForm';

const mockCollection: CollectionRecord = {
  id: 'mock-collection-id',
  collectionName: 'Northern Renaissance',
  type: 'public',
  createdByName: 'Curator',
  createdAt: new Date().toISOString(),
};

const mockPeriods: PeriodOption[] = [
  { id: 'p1', name: 'Northern Renaissance', startYear: 1420, endYear: 1580 },
];

const mockArtists: ArtistThumbnail[] = [];

export default function CollectionPage() {
  function handleSubmit(values: CollectionFormValues) {
    console.log('TODO: send to backend', values);
  }

  async function handleCreatePeriod(input: { name: string; startYear: number; endYear: number }) {
    console.log('TODO: create period via backend', input);
    return { id: `mock-${Date.now()}`, ...input };
  }

  return (
    <CollectionForm
      collection={mockCollection}
      periods={mockPeriods}
      artists={mockArtists}
      canEdit
      onSubmit={handleSubmit}
      onCreatePeriod={handleCreatePeriod}
      onAddArtist={() => console.log('TODO: navigate to AboutArtistPage in create mode')}
    />
  );
}
