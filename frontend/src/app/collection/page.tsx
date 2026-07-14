'use client';

// Single-collection assumption, same as museum/page.tsx: shows the first
// visible Collection, or the create form if none exist yet. Update to a
// real per-collection route (e.g. /collection/[id]) once there's more than
// one. `canEdit` here only checks for Admin/Curator — a Contributor holding
// a `manage` CollectionAccess grant (Section 2.4.2) can still edit
// server-side (the backend enforces it independently), but the frontend
// doesn't yet query grants to decide whether to show the pencil for them.

import { useEffect, useState } from 'react';
import {
  CollectionForm,
  CollectionRecord,
  CollectionFormValues,
  PeriodOption,
  ArtistThumbnail,
} from '@/components/CollectionForm';
import { graphqlRequest, API_URL } from '@/lib/api';
import { useAuth, canManageOrgAndCollection } from '@/lib/auth-context';

interface CollectionApiRecord {
  id: string;
  organizationId: string;
  collectionName: string;
  type: string;
  createdByName: string;
  updatedByName?: string;
  createdAt: string;
  updatedAt?: string;
  periods?: PeriodOption[];
}

const COLLECTIONS_QUERY = `
  query Collections {
    collections {
      id
      organizationId
      collectionName
      type
      createdByName
      updatedByName
      createdAt
      updatedAt
      periods { id name startYear endYear }
    }
  }
`;

const ORGANIZATIONS_QUERY = `query { organizations { id } }`;

const ALL_PERIODS_QUERY = `query { periods { id name startYear endYear } }`;

const ARTISTS_BY_COLLECTION_QUERY = `
  query ArtistsByCollection($collectionId: ID!) {
    artistsByCollection(collectionId: $collectionId) { id name }
  }
`;

const CREATE_COLLECTION_MUTATION = `
  mutation CreateCollection($input: CollectionInputDto!) {
    createCollection(input: $input) {
      id organizationId collectionName type createdByName updatedByName createdAt updatedAt
    }
  }
`;

const UPDATE_COLLECTION_MUTATION = `
  mutation UpdateCollection($id: ID!, $input: CollectionUpdateInputDto!) {
    updateCollection(id: $id, input: $input) {
      id organizationId collectionName type createdByName updatedByName createdAt updatedAt
    }
  }
`;

const SET_COLLECTION_PERIOD_MUTATION = `
  mutation SetCollectionPeriod($collectionId: ID!, $periodId: ID) {
    setCollectionPeriod(collectionId: $collectionId, periodId: $periodId)
  }
`;

const CREATE_PERIOD_MUTATION = `
  mutation CreatePeriodForCollection($collectionId: ID!, $input: PeriodInputDto!) {
    createPeriodForCollection(collectionId: $collectionId, input: $input) {
      id name startYear endYear
    }
  }
`;

function toRecord(c: CollectionApiRecord): CollectionRecord {
  return {
    id: c.id,
    collectionName: c.collectionName,
    type: c.type === 'public' ? 'public' : 'private',
    periodId: c.periods?.[0]?.id,
    createdByName: c.createdByName,
    updatedByName: c.updatedByName,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

export default function CollectionPage() {
  const { user, token, loading: authLoading } = useAuth();
  const [collection, setCollection] = useState<CollectionRecord | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [periods, setPeriods] = useState<PeriodOption[]>([]);
  const [artists, setArtists] = useState<ArtistThumbnail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [collectionsData, periodsData, orgsData] = await Promise.all([
        graphqlRequest<{ collections: CollectionApiRecord[] }>(COLLECTIONS_QUERY, undefined, token),
        graphqlRequest<{ periods: PeriodOption[] }>(ALL_PERIODS_QUERY),
        graphqlRequest<{ organizations: { id: string }[] }>(ORGANIZATIONS_QUERY),
      ]);

      setPeriods(periodsData.periods);
      setOrganizationId(orgsData.organizations[0]?.id ?? null);

      const first = collectionsData.collections[0];
      if (first) {
        setCollection(toRecord(first));
        const artistsData = await graphqlRequest<{ artistsByCollection: { id: string; name: string }[] }>(
          ARTISTS_BY_COLLECTION_QUERY,
          { collectionId: first.id },
        );
        setArtists(
          artistsData.artistsByCollection.map((a) => ({
            id: a.id,
            name: a.name,
            portraitImageUrl: `${API_URL}/artists/${a.id}/portrait`,
          })),
        );
      }
    }

    load()
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load collection'))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSubmit(values: CollectionFormValues) {
    try {
      let saved: CollectionRecord;
      if (collection) {
        const data = await graphqlRequest<{ updateCollection: CollectionApiRecord }>(
          UPDATE_COLLECTION_MUTATION,
          { id: collection.id, input: { collectionName: values.collectionName, type: values.type } },
          token,
        );
        saved = toRecord(data.updateCollection);
      } else {
        if (!organizationId) throw new Error('Create a Museum record first — Collections belong to one.');
        const data = await graphqlRequest<{ createCollection: CollectionApiRecord }>(
          CREATE_COLLECTION_MUTATION,
          { input: { organizationId, collectionName: values.collectionName, type: values.type } },
          token,
        );
        saved = toRecord(data.createCollection);
      }

      if (values.periodId !== saved.periodId) {
        await graphqlRequest(
          SET_COLLECTION_PERIOD_MUTATION,
          { collectionId: saved.id, periodId: values.periodId || null },
          token,
        );
        saved = { ...saved, periodId: values.periodId || undefined };
      }

      setCollection(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save collection');
    }
  }

  async function handleCreatePeriod(input: { name: string; startYear: number; endYear: number }) {
    if (!collection) throw new Error('Save the Collection before adding a Period.');
    const data = await graphqlRequest<{ createPeriodForCollection: PeriodOption }>(
      CREATE_PERIOD_MUTATION,
      { collectionId: collection.id, input },
      token,
    );
    setPeriods((prev) => [...prev, data.createPeriodForCollection]);
    return data.createPeriodForCollection;
  }

  if (loading || authLoading) return <p style={{ padding: '2rem' }}>Loading…</p>;
  if (error) return <p style={{ padding: '2rem', color: '#7a2426' }}>{error}</p>;

  return (
    <CollectionForm
      collection={collection ?? undefined}
      periods={periods}
      artists={artists}
      canEdit={canManageOrgAndCollection(user)}
      onSubmit={handleSubmit}
      onCreatePeriod={handleCreatePeriod}
      onAddArtist={() => console.log('TODO: navigate to AboutArtistPage in create mode')}
    />
  );
}
