'use client';

// Single-museum assumption: this queries all Organizations and shows the
// first one (or the create form, if none exist yet). Update to a real
// per-museum route (e.g. /museum/[id]) once multiple Organizations exist.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MuseumForm, MuseumRecord, MuseumFormValues } from '@/components/MuseumForm';
import { graphqlRequest } from '@/lib/api';
import { useAuth, canManageOrgAndCollection } from '@/lib/auth-context';

const ORGANIZATIONS_QUERY = `
  query Organizations {
    organizations {
      id
      name
      description
      websiteUrl
      contactEmail
      address
      createdAt
      updatedAt
    }
  }
`;

const CREATE_ORGANIZATION_MUTATION = `
  mutation CreateOrganization($input: OrganizationInputDto!) {
    createOrganization(input: $input) {
      id
      name
      description
      websiteUrl
      contactEmail
      address
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_ORGANIZATION_MUTATION = `
  mutation UpdateOrganization($id: ID!, $input: OrganizationInputDto!) {
    updateOrganization(id: $id, input: $input) {
      id
      name
      description
      websiteUrl
      contactEmail
      address
      createdAt
      updatedAt
    }
  }
`;

export default function MuseumPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const [museum, setMuseum] = useState<MuseumRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    graphqlRequest<{ organizations: MuseumRecord[] }>(ORGANIZATIONS_QUERY)
      .then((data) => setMuseum(data.organizations[0] ?? null))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load museum'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(values: MuseumFormValues) {
    try {
      if (museum) {
        const data = await graphqlRequest<{ updateOrganization: MuseumRecord }>(
          UPDATE_ORGANIZATION_MUTATION,
          { id: museum.id, input: values },
          token,
        );
        setMuseum(data.updateOrganization);
      } else {
        const data = await graphqlRequest<{ createOrganization: MuseumRecord }>(
          CREATE_ORGANIZATION_MUTATION,
          { input: values },
          token,
        );
        setMuseum(data.createOrganization);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save museum');
    }
  }

  if (loading || authLoading) return <p style={{ padding: '2rem' }}>Loading…</p>;
  if (error) return <p style={{ padding: '2rem', color: '#7a2426' }}>{error}</p>;

  return (
    <MuseumForm
      museum={museum ?? undefined}
      canEdit={canManageOrgAndCollection(user)}
      onSubmit={handleSubmit}
      onNavigateToCollection={() => router.push('/collection')}
    />
  );
}
