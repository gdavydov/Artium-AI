// web-sketch/MuseumForm.tsx
//
// Create/Edit form for Organization (museum/institution) records.
//
// created_at and updated_at are never rendered as editable inputs — they
// aren't user data, they're audit metadata. created_at is populated once by
// the database default (see schema.sql: `default now()`) and is never sent
// by this form on either create or edit. updated_at is stamped by the
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

export function MuseumForm({
  museum,
  onSubmit,
}: {
  museum?: MuseumRecord; // absent = create mode, present = edit mode
  onSubmit: (values: MuseumFormValues) => void;
}) {
  const isEditMode = Boolean(museum);
  const [values, setValues] = useState<MuseumFormValues>(toFormValues(museum));

  function update<K extends keyof MuseumFormValues>(key: K, value: MuseumFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
    >
      <h1 className={styles.title}>{isEditMode ? 'Edit Museum' : 'Create Museum'}</h1>

      <label className={styles.field}>
        <span className={styles.label}>Name</span>
        <input
          className={styles.input}
          type="text"
          required
          value={values.name}
          onChange={(e) => update('name', e.target.value)}
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Description</span>
        <textarea
          className={styles.textarea}
          rows={4}
          value={values.description}
          onChange={(e) => update('description', e.target.value)}
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Website</span>
        <input
          className={styles.input}
          type="url"
          placeholder="https://"
          value={values.websiteUrl}
          onChange={(e) => update('websiteUrl', e.target.value)}
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Contact email</span>
        <input
          className={styles.input}
          type="email"
          value={values.contactEmail}
          onChange={(e) => update('contactEmail', e.target.value)}
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Address</span>
        <input
          className={styles.input}
          type="text"
          value={values.address}
          onChange={(e) => update('address', e.target.value)}
        />
      </label>

      {isEditMode && museum && (
        <div className={styles.audit}>
          <div className={styles.auditRow}>
            <span className={styles.auditLabel}>Created</span>
            <span className={styles.auditValue}>{formatTimestamp(museum.createdAt)}</span>
          </div>
          <div className={styles.auditRow}>
            <span className={styles.auditLabel}>Last updated</span>
            <span className={styles.auditValue}>
              {museum.updatedAt ? formatTimestamp(museum.updatedAt) : 'Never edited'}
            </span>
          </div>
        </div>
      )}

      <button type="submit" className={styles.submit}>
        {isEditMode ? 'Save Changes' : 'Create Museum'}
      </button>
    </form>
  );
}
