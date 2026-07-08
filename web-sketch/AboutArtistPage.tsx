// web-sketch/AboutArtistPage.tsx
//
// Copied from ArtifactPage.tsx as a starting point. Upper-left pane now shows
// the artist's embedded portrait image instead of an artifact photo; the
// rest of the layout (attachments, artifact detail fields) is still
// artifact-shaped and hasn't been adapted for an artist "about" page yet.

import styles from './AboutArtistPage.module.css';

export interface AttachmentSummary {
  id: string;
  fileUrl: string; // object storage key
  fileType: string; // MIME type
  label: string; // display name, e.g. derived from fileUrl
  role?: string; // e.g. "Primary", "Detail", "Verso", "Report"
}

export interface ArtistSummary {
  name: string;
  birthYear?: number;
  deathYear?: number;
  bio: string;
  school?: string;
  periodName: string;
  periodStartYear: number;
  periodEndYear: number;
  // Portrait is stored as an embedded blob (artist.portrait_image / bytea in
  // schema.sql), not an object storage key — portraitImageUrl is whatever the
  // API resolves that blob to (e.g. a data: URI or a streaming endpoint).
  portraitImageUrl?: string;
}

export interface ArtifactDetail {
  title: string;
  description: string;
  location?: string;
  medium: string;
  status: 'draft' | 'published';
  primaryImageUrl?: string;
  artist: ArtistSummary;
  attachments: AttachmentSummary[];
}

function lifespan(artist: ArtistSummary): string {
  if (!artist.birthYear && !artist.deathYear) return 'Dates unknown';
  return `${artist.birthYear ?? '?'} – ${artist.deathYear ?? 'present'}`;
}

function isImageType(fileType: string): boolean {
  return fileType.startsWith('image/');
}

export function AboutArtistPage({ artifact }: { artifact: ArtifactDetail }) {
  const { artist } = artifact;

  return (
    <div className={styles.shell}>
      <div className={styles.left}>
        <div className={styles.hero}>
          {artist.portraitImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={artist.portraitImageUrl}
              alt={`Portrait of ${artist.name}`}
              className={styles.heroImage}
            />
          ) : (
            <div className={styles.heroPlaceholder}>
              <span className={styles.monoLabel}>Artist portrait</span>
              <span className={styles.heroNote}>
                No portrait image embedded for this artist yet
              </span>
            </div>
          )}
        </div>

        <div className={styles.attachments}>
          <h2 className={styles.sectionHeading}>
            Attachments ({artifact.attachments.length})
          </h2>
          <div className={styles.attachmentList}>
            {artifact.attachments.map((a) => (
              <div key={a.id} className={styles.attachmentRow}>
                <div
                  className={
                    isImageType(a.fileType)
                      ? styles.thumb
                      : `${styles.thumb} ${styles.thumbDoc}`
                  }
                />
                <div className={styles.attachmentMeta}>
                  <div className={styles.attachmentName}>{a.label}</div>
                  <div className={styles.attachmentSub}>{a.fileType}</div>
                </div>
                {a.role && <span className={styles.tag}>{a.role}</span>}
              </div>
            ))}
            {artifact.attachments.length === 0 && (
              <p className={styles.emptyNote}>No attachments yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div>
          <div className={`${styles.monoLabel} ${styles.kicker}`}>Artist</div>
          <h1 className={styles.artistName}>{artist.name}</h1>

          <div className={styles.fieldRow}>
            <span className={styles.monoLabel}>Dates</span>
            <span className={styles.fieldValue}>{lifespan(artist)}</span>
          </div>
          {artist.school && (
            <div className={styles.fieldRow}>
              <span className={styles.monoLabel}>School</span>
              <span className={styles.fieldValue}>{artist.school}</span>
            </div>
          )}
          <div className={styles.fieldRow}>
            <span className={styles.monoLabel}>Period</span>
            <span className={`${styles.fieldValue} ${styles.accent}`}>
              {artist.periodName} &middot; {artist.periodStartYear}
              &ndash;{artist.periodEndYear}
            </span>
          </div>
        </div>

        <div className={styles.divider} />

        <div>
          <h2 className={styles.sectionHeading}>Biography</h2>
          <p className={styles.bioText}>{artist.bio}</p>
        </div>

        <div className={styles.details}>
          <h2 className={styles.sectionHeading}>Artifact details</h2>
          <div className={styles.detailGrid}>
            <div className={styles.detailRow}>
              <span className={styles.monoLabel}>Title</span>
              <span className={styles.detailValue}>{artifact.title}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.monoLabel}>Medium</span>
              <span className={styles.detailValue}>{artifact.medium}</span>
            </div>
            {artifact.location && (
              <div className={styles.detailRow}>
                <span className={styles.monoLabel}>Location</span>
                <span className={styles.detailValue}>{artifact.location}</span>
              </div>
            )}
            <div className={styles.detailRow}>
              <span className={styles.monoLabel}>Description</span>
              <span className={styles.detailValue}>{artifact.description}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
