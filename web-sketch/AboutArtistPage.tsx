// web-sketch/AboutArtistPage.tsx
//
// Artist "about" page — three-pane layout:
//   - Upper-left: artist portrait (embedded blob), fixed, not scrollable.
//   - Lower-left: attachments list, scrollable.
//   - Right: artist identity + bio, then a Works list (thumbnail + name) of
//     this artist's artifacts, scrollable.

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

export interface ArtifactSummary {
  id: string;
  title: string;
  thumbnailUrl?: string;
}

function lifespan(artist: ArtistSummary): string {
  if (!artist.birthYear && !artist.deathYear) return 'Dates unknown';
  return `${artist.birthYear ?? '?'} – ${artist.deathYear ?? 'present'}`;
}

function isImageType(fileType: string): boolean {
  return fileType.startsWith('image/');
}

export interface AboutArtistPageProps {
  artist: ArtistSummary;
  attachments: AttachmentSummary[];
  artifacts: ArtifactSummary[];
}

export function AboutArtistPage({ artist, attachments, artifacts }: AboutArtistPageProps) {
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

        <details className={styles.attachments}>
          <summary className={styles.attachmentsSummary}>
            Attachments ({attachments.length})
          </summary>
          <div className={styles.attachmentList}>
            {attachments.map((a) => (
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
            {attachments.length === 0 && (
              <p className={styles.emptyNote}>No attachments yet.</p>
            )}
          </div>
        </details>
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
          <h2 className={styles.sectionHeading}>Works ({artifacts.length})</h2>
          <div className={styles.workList}>
            {artifacts.map((work) => (
              <div key={work.id} className={styles.workRow}>
                <div
                  className={styles.workThumb}
                  style={
                    work.thumbnailUrl
                      ? { backgroundImage: `url(${work.thumbnailUrl})` }
                      : undefined
                  }
                />
                <span className={styles.workName}>{work.title}</span>
              </div>
            ))}
            {artifacts.length === 0 && (
              <p className={styles.emptyNote}>No known works yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
