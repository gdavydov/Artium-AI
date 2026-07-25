'use client';

import { useEffect, useState } from 'react';
import { ArtifactPage, ArtifactDetail } from '@/components/ArtifactPage';
import { graphqlRequest } from '@/lib/api';

const ARTIFACT_QUERY = `
  query Artifact($id: ID!) {
    artifact(id: $id) {
      title
      description
      location
      medium
      status
      artistName
      primaryImageUrl
      attachments { id fileUrl fileType label previewUrl }
    }
  }
`;

export default function ArtifactRoutePage({ params }: { params: { id: string } }) {
  const [artifact, setArtifact] = useState<ArtifactDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    graphqlRequest<{ artifact: (ArtifactDetail & { status: string }) | null }>(ARTIFACT_QUERY, { id: params.id })
      .then((data) => {
        if (!data.artifact) {
          setError('Artifact not found');
          return;
        }
        setArtifact({ ...data.artifact, status: data.artifact.status === 'published' ? 'published' : 'draft' });
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load artifact'))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <p style={{ padding: '2rem' }}>Loading…</p>;
  if (error || !artifact) return <p style={{ padding: '2rem', color: '#7a2426' }}>{error ?? 'Not found'}</p>;

  return <ArtifactPage artifact={artifact} />;
}
