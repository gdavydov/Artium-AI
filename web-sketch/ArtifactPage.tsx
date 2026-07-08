// web-sketch/ArtifactPage.tsx
//
// Artifact detail page — three-pane layout:
//   - Upper-left: primary artifact image, fixed (not scrollable), ~65% width.
//   - Lower-left: attachments list (collapsible), scrollable, same ~65% column.
//   - Right: artifact metadata, scrollable, ~35% width. Artist identity/bio
//     lives on AboutArtistPage instead — this page is artifact-only.
//
// Data shape mirrors supabase-schema/schema.prisma (Artifact, Attachment).
// Framework-agnostic React; drop into a Next.js route (e.g. app/artifacts/[id]/page.tsx)
// once the app is scaffolded — this file only assumes props are already resolved.

import styles from './ArtifactPage.module.css';

export interface AttachmentSummary {
  id: string;
  fileUrl: string; // object storage key
  fileType: string; // MIME type
  label: string; // display name, e.g. derived from fileUrl
  role?: string; // e.g. "Primary", "Detail", "Verso", "Report"
}

export interface ArtifactDetail {
  title: string;
  description: string;
  location?: string;
  medium: string;
  status: 'draft' | 'published';
  primaryImageUrl?: string;
  attachments: AttachmentSummary[];
}

function isImageType(fileType: string): boolean {
  return fileType.startsWith('image/');
}

export function ArtifactPage({ artifact }: { artifact: ArtifactDetail }) {
  return (
    <div className={styles.shell}>
      <div className={styles.left}>
        <div className={styles.hero}>
          {artifact.primaryImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={artifact.primaryImageUrl}
              alt={artifact.title}
              className={styles.heroImage}
            />
          ) : (
            <div className={styles.heroPlaceholder}>
              <span className={styles.monoLabel}>Primary image</span>
              <span className={styles.heroNote}>
                Image pending upload &mdash; no object storage key attached yet
              </span>
            </div>
          )}
        </div>

        <details className={styles.attachments} open>
          <summary className={styles.attachmentsSummary}>
            Attachments ({artifact.attachments.length})
          </summary>
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
        </details>
      </div>

      <div className={styles.right}>
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
