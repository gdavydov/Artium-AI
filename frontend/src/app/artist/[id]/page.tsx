'use client';

// birthYear/deathYear are always left undefined — Artist has no such
// columns in schema.prisma, so AboutArtistPage.tsx's "Dates unknown"
// fallback is the honest state here, not a bug.

import { useEffect, useState } from 'react';
import { AboutArtistPage, ArtistSummary, AttachmentSummary, ArtifactSummary } from '@/components/AboutArtistPage';
import { graphqlRequest, API_URL } from '@/lib/api';

interface ArtistDetailResponse {
  name: string;
  bio: string;
  schoolName?: string;
  periodName: string;
  periodStartYear: number;
  periodEndYear: number;
  hasPortrait: boolean;
  artifacts: ArtifactSummary[];
  attachments: AttachmentSummary[];
}

const ARTIST_DETAIL_QUERY = `
  query ArtistDetail($id: ID!) {
    artistDetail(id: $id) {
      name
      bio
      schoolName
      periodName
      periodStartYear
      periodEndYear
      hasPortrait
      artifacts { id title thumbnailUrl }
      attachments { id fileUrl fileType label previewUrl }
    }
  }
`;

export default function ArtistRoutePage({ params }: { params: { id: string } }) {
  const [artist, setArtist] = useState<ArtistSummary | null>(null);
  const [attachments, setAttachments] = useState<AttachmentSummary[]>([]);
  const [artifacts, setArtifacts] = useState<ArtifactSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    graphqlRequest<{ artistDetail: ArtistDetailResponse | null }>(ARTIST_DETAIL_QUERY, { id: params.id })
      .then((data) => {
        if (!data.artistDetail) {
          setError('Artist not found');
          return;
        }
        const d = data.artistDetail;
        setArtist({
          name: d.name,
          bio: d.bio,
          school: d.schoolName,
          periodName: d.periodName,
          periodStartYear: d.periodStartYear,
          periodEndYear: d.periodEndYear,
          portraitImageUrl: d.hasPortrait ? `${API_URL}/artists/${params.id}/portrait` : undefined,
        });
        setAttachments(d.attachments);
        setArtifacts(d.artifacts);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load artist'))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <p style={{ padding: '2rem' }}>Loading…</p>;
  if (error || !artist) return <p style={{ padding: '2rem', color: '#7a2426' }}>{error ?? 'Not found'}</p>;

  return <AboutArtistPage artist={artist} attachments={attachments} artifacts={artifacts} />;
}
