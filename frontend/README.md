# Artium Gallery — Frontend

Next.js (App Router) catalog app — the dynamic half of the split described
in `Artium-Gallery_Design_Document.md` Section 5 (Wix handles static
marketing pages; this handles Artifact/Artist/Collection/Museum browsing).
Deploys to Vercel or Railway — see `Artium-Gallery_Deployment_Environments.docx`.

## Setup

```
cp .env.example .env   # set NEXT_PUBLIC_API_URL to the backend's URL
npm install
npm run dev
```

Sign in at `/login` with a user seeded via `../backend`'s `npm run
seed:admin` — `/museum` and `/collection` need a valid session to show the
edit (pencil) button and to save changes; both pages render read-only
without one.

## Layout

- `src/components/` — the actual UI: `MuseumForm`, `CollectionForm`,
  `ArtifactPage`, `AboutArtistPage`, `AttachmentModal`
- `src/lib/api.ts` — minimal fetch-based GraphQL client (`graphqlRequest`)
- `src/lib/auth-context.tsx` — `AuthProvider`/`useAuth()`, JWT stored in
  `localStorage`, decoded client-side for `canEdit` checks (the backend
  still verifies the token independently on every request)
- `src/app/` — App Router routes, all live (real GraphQL against
  `../backend`): `/login`, `/museum`, `/collection`, `/artifact/[id]`,
  `/artist/[id]`

Verified end-to-end against a real backend + Postgres while building this:
`/museum` and `/collection` load/save real data, `login` issues a real JWT,
guarded mutations correctly reject requests without one, and
`/artifact/[id]`/`/artist/[id]` render a real seeded Artifact/Artist
(title, medium, artist name, bio, Period, linked works).

Known gaps carried from the backend (see its README): no `birthYear`/
`deathYear` on Artist, no `label`/`role` on Attachment, and
`primaryImageUrl`/`thumbnailUrl` are a best-effort "first image attachment"
pick rather than an explicit primary-image flag.

## Deploying to Vercel or Railway

Vercel/Railway aren't reachable from this repo's dev sandbox, so run these
from your own machine.

**Vercel:**
```
npm install -g vercel
cd frontend
vercel        # first run links/creates the project
vercel env add NEXT_PUBLIC_API_URL production   # point at the deployed backend URL
vercel --prod
```

**Railway** (if consolidating both services on one platform — see the
Deployment doc's recommendation):
```
npm install -g @railway/cli
railway login
cd frontend
railway init   # or `railway link`
railway variables set NEXT_PUBLIC_API_URL=https://<your-backend>.up.railway.app
railway up
```
`railway.json` in this folder tells Railway how to build/start the app.
