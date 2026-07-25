// frontend/src/lib/api.ts
//
// Minimal fetch-based GraphQL client — deliberately not Apollo/urql. The
// app only needs request/response, no client-side caching or subscriptions,
// so a small typed wrapper is simpler than wiring a full client's Provider
// tree through the App Router.

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export class GraphQLError extends Error {
  constructor(
    message: string,
    public readonly errors: unknown[],
  ) {
    super(message);
  }
}

export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
  token?: string | null,
): Promise<T> {
  const res = await fetch(`${API_URL}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();
  if (json.errors) {
    throw new GraphQLError(json.errors[0]?.message ?? 'GraphQL request failed', json.errors);
  }
  return json.data as T;
}
