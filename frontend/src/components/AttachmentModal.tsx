'use client';

// frontend/src/components/AttachmentModal.tsx
//
// Popup for previewing a single attachment's content, shared by ArtifactPage
// and AboutArtistPage. Renders images and PDFs inline; anything else falls
// back to a message plus an "Open in new tab" link. Built on the native
// <dialog> element so Escape-to-close, backdrop, and focus handling come
// from the browser rather than hand-rolled JS.

import { useEffect, useRef } from 'react';
import styles from './AttachmentModal.module.css';

export interface AttachmentPreview {
  id: string;
  label: string;
  fileType: string;
  previewUrl?: string; // resolved, browser-loadable URL (not the storage key)
}

export function AttachmentModal({
  attachment,
  onClose,
}: {
  attachment: AttachmentPreview | null;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (attachment && !dialog.open) {
      dialog.showModal();
    } else if (!attachment && dialog.open) {
      dialog.close();
    }
  }, [attachment]);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      {attachment && (
        <div className={styles.content}>
          <div className={styles.header}>
            <span className={styles.title}>{attachment.label}</span>
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close preview"
            >
              &times;
            </button>
          </div>
          <div className={styles.body}>
            {attachment.previewUrl && attachment.fileType.startsWith('image/') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={attachment.previewUrl}
                alt={attachment.label}
                className={styles.previewImage}
              />
            ) : attachment.previewUrl && attachment.fileType === 'application/pdf' ? (
              <iframe
                src={attachment.previewUrl}
                title={attachment.label}
                className={styles.previewFrame}
              />
            ) : (
              <div className={styles.fallback}>
                <p>Preview not available for {attachment.fileType}.</p>
                {attachment.previewUrl && (
                  <a href={attachment.previewUrl} target="_blank" rel="noreferrer">
                    Open in new tab
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}
