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

## Layout

- `src/components/` — the actual UI: `MuseumForm`, `CollectionForm`,
  `ArtifactPage`, `AboutArtistPage`, `AttachmentModal`
- `src/app/` — App Router routes wiring those components together:
  `/museum`, `/collection`, `/artifact/[id]`, `/artist/[id]`

Every route currently renders with mock/placeholder data — each `page.tsx`
has a `TODO` marking where to replace it with a real GraphQL call to
`../backend`. `canEdit` is hardcoded `true` in the mocks; it needs to come
from the signed-in user's role once auth exists.
