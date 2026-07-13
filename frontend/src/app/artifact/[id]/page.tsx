'use client';

// TODO: replace mockArtifact with a real fetch from NEXT_PUBLIC_API_URL
// (backend/src/attachments + the Artifact query), keyed on params.id.

import { ArtifactPage, ArtifactDetail } from '@/components/ArtifactPage';

const mockArtifact: ArtifactDetail = {
  title: 'Untitled',
  description: 'TODO: load from backend/src/attachments + Artifact query.',
  medium: 'unknown',
  status: 'draft',
  attachments: [],
};

export default function ArtifactRoutePage({ params }: { params: { id: string } }) {
  console.log('TODO: fetch artifact', params.id);
  return <ArtifactPage artifact={mockArtifact} />;
}
