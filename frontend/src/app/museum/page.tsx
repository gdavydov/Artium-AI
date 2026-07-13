'use client';

// TODO: replace the mock `museum` value and onSubmit/onNavigateToCollection
// handlers below with real GraphQL calls against NEXT_PUBLIC_API_URL
// (backend/src/organizations) and real router navigation, and derive
// `canEdit` from the signed-in user's role (Admin/Curator only).

import { useRouter } from 'next/navigation';
import { MuseumForm, MuseumRecord, MuseumFormValues } from '@/components/MuseumForm';

const mockMuseum: MuseumRecord = {
  id: 'mock-museum-id',
  name: 'Artium Gallery',
  description: 'A museum catalog of Northern Renaissance art.',
  createdAt: new Date().toISOString(),
};

export default function MuseumPage() {
  const router = useRouter();

  function handleSubmit(values: MuseumFormValues) {
    console.log('TODO: send to backend', values);
  }

  return (
    <MuseumForm
      museum={mockMuseum}
      canEdit
      onSubmit={handleSubmit}
      onNavigateToCollection={() => router.push('/collection')}
    />
  );
}
