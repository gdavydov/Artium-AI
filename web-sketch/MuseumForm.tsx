// web-sketch/MuseumForm.tsx
//
// Single page for both creating and viewing/editing an Organization (museum)
// record — no separate Create/Edit screens.
//
//   - No existing record (museum undefined): the form opens directly in
//     edit mode, since there's nothing yet to view. Submit reads "Create Museum".
//   - Existing record: opens read-only. If canEdit is true (caller decides
//     this from the current user's role — Admin/Curator only, Contributors
//     excluded, see Design Document Section 3.2), a pencil icon appears at
//     the end of the title; clicking it switches the same fields to
//     editable in place. Submit then reads "Save Changes".
//
// created_at and updated_at are never rendered as editable inputs, in
// either mode — they aren't user data, they're audit metadata. created_at
// is populated once by the database default (see schema.sql: `default
// now()`) and is never sent by this form. updated_at is stamped by the
// backend service on every edit (see nest-sketch/organizations-service.ts)
// and shown here read-only, once it exists.

import { useState } from 'react';
import styles from './MuseumForm.module.css';

export interface MuseumRecord {
  id: string;
  name: string;
  description?: string;
  websiteUrl?: string;
  contactEmail?: string;
  address?: string;
  createdAt: string; // ISO timestamp — display only
  updatedAt?: string; // ISO timestamp — display only, absent until first edit
}

export interface MuseumFormValues {
  name: string;
  description: string;
  websiteUrl: string;
  contactEmail: string;
  address: string;
}

function toFormValues(museum?: MuseumRecord): MuseumFormValues {
  return {
    name: museum?.name ?? '',
    description: museum?.description ?? '',
    websiteUrl: museum?.websiteUrl ?? '',
    contactEmail: museum?.contactEmail ?? '',
    address: museum?.address ?? '',
  };
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function PencilIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M13.5 3.5l3 3L6 17H3v-3L13.5 3.5z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MuseumForm({
  museum,
  canEdit,
  onSubmit,
  onNavigateToCollection,
}: {
  museum?: MuseumRecord; // absent = no record yet, form opens directly editable
  canEdit: boolean; // computed by the caller from the user's role (Admin/Curator only)
  onSubmit: (values: MuseumFormValues) => void;
  onNavigateToCollection?: () => void;
}) {
  const isExisting = Boolean(museum);
  const [isEditing, setIsEditing] = useState(!isExisting);
  const [values, setValues] = useState<MuseumFormValues>(toFormValues(museum));

  const readOnly = isExisting && !isEditing;

  function update<K extends keyof MuseumFormValues>(key: K, value: MuseumFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function renderField(labelText: string, key: keyof MuseumFormValues, inputType: string, placeholder?: string) {
    return (
      <label className={styles.field}>
        <span className={styles.label}>{labelText}</span>
        {readOnly ? (
          <span className={styles.readOnlyValue}>{values[key] || '—'}</span>
        ) : (
          <input
            className={styles.input}
            type={inputType}
            required={key === 'name'}
            placeholder={placeholder}
            value={values[key]}
            onChange={(e) => update(key, e.target.value)}
          />
        )}
      </label>
    );
  }

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
    >
      <div className={styles.header}>
        <h1 className={styles.title}>
          Museum
          {isExisting && canEdit && !isEditing && (
            <button
              type="button"
              className={styles.editIcon}
              onClick={() => setIsEditing(true)}
              aria-label="Edit museum details"
            >
              <PencilIcon />
            </button>
          )}
        </h1>
        {onNavigateToCollection && (
          <button type="button" className={styles.navButton} onClick={onNavigateToCollection}>
            Collection
          </button>
        )}
      </div>

      {renderField('Name', 'name', 'text')}

      <label className={styles.field}>
        <span className={styles.label}>Description</span>
        {readOnly ? (
          <span className={styles.readOnlyValue}>{values.description || '—'}</span>
        ) : (
          <textarea
            className={styles.textarea}
            rows={4}
            value={values.description}
            onChange={(e) => update('description', e.target.value)}
          />
        )}
      </label>

      {renderField('Website', 'websiteUrl', 'url', 'https://')}
      {renderField('Contact email', 'contactEmail', 'email')}
      {renderField('Address', 'address', 'text')}

      {isExisting && isEditing && museum && (
        <div className={styles.audit}>
          <p className={styles.auditLine}>
            <span className={styles.auditLabel}>Created</span> {formatTimestamp(museum.createdAt)}
            {' · '}
            <span className={styles.auditLabel}>Updated</span>{' '}
            {museum.updatedAt ? formatTimestamp(museum.updatedAt) : 'Never edited'}
          </p>
        </div>
      )}

      {!readOnly && (
        <button type="submit" className={styles.submit}>
          {isExisting ? 'Save Changes' : 'Create Museum'}
        </button>
      )}
    </form>
  );
}
