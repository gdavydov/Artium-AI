// web-sketch/CollectionForm.tsx
//
// Single page for both creating and viewing/editing a Collection record —
// same view/edit-toggle pattern as MuseumForm.tsx:
//
//   - No existing record (collection undefined): opens directly editable.
//   - Existing record: opens read-only; if canEdit is true (Admin/Curator,
//     or a Curator/Contributor with `manage` CollectionAccess on this
//     specific Collection — see Design Document Section 2.4.2/3.2), a
//     pencil icon appears at the end of the title to enter edit mode.
//
// Period field: the schema models this the other way around from what a
// single "Collection.period_id" column would suggest — Period carries an
// optional collection_id (Design Document Section 2.4), not the reverse.
// This dropdown lets a curator pick which existing Period is tagged to this
// Collection (setting that Period's collection_id), or add a brand new
// Period via the "+ Add new period" option, which is persisted via
// onCreatePeriod before being selected — no schema change needed.
//
// Artists: same one-to-many pattern as Period — Artist.collection_id is
// optional (Section 2.4), so this is the list of Artists currently tagged to
// this Collection, shown as thumbnail + name in both view and edit mode.
// "Add Artist" only appears in edit mode and hands off to AboutArtistPage
// (via onAddArtist) rather than duplicating artist-creation UI here.
//
// created_at/updated_at and created_by_name/updated_by_name are never
// editable inputs, in either mode — see nest-sketch/collections-service.ts
// for where they're actually populated.

import { useState } from 'react';
import styles from './CollectionForm.module.css';

export type CollectionType = 'public' | 'private';

export interface PeriodOption {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
}

export interface ArtistThumbnail {
  id: string;
  name: string;
  portraitImageUrl?: string;
}

export interface CollectionRecord {
  id: string;
  collectionName: string;
  type: CollectionType;
  periodId?: string; // currently-tagged Period, if any
  createdByName: string;
  updatedByName?: string;
  createdAt: string; // ISO timestamp — display only
  updatedAt?: string; // ISO timestamp — display only, absent until first edit
}

export interface CollectionFormValues {
  collectionName: string;
  type: CollectionType;
  periodId: string; // '' = none selected
}

const NEW_PERIOD_SENTINEL = '__new__';

function toFormValues(collection?: CollectionRecord): CollectionFormValues {
  return {
    collectionName: collection?.collectionName ?? '',
    type: collection?.type ?? 'private',
    periodId: collection?.periodId ?? '',
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

export function CollectionForm({
  collection,
  periods,
  artists,
  canEdit,
  onSubmit,
  onCreatePeriod,
  onAddArtist,
}: {
  collection?: CollectionRecord;
  periods: PeriodOption[];
  artists: ArtistThumbnail[];
  canEdit: boolean;
  onSubmit: (values: CollectionFormValues) => void;
  onCreatePeriod: (input: { name: string; startYear: number; endYear: number }) => Promise<PeriodOption>;
  onAddArtist?: () => void;
}) {
  const isExisting = Boolean(collection);
  const [isEditing, setIsEditing] = useState(!isExisting);
  const [values, setValues] = useState<CollectionFormValues>(toFormValues(collection));
  const [periodOptions, setPeriodOptions] = useState<PeriodOption[]>(periods);
  const [addingPeriod, setAddingPeriod] = useState(false);
  const [newPeriodName, setNewPeriodName] = useState('');
  const [newPeriodStart, setNewPeriodStart] = useState('');
  const [newPeriodEnd, setNewPeriodEnd] = useState('');

  const readOnly = isExisting && !isEditing;

  function update<K extends keyof CollectionFormValues>(key: K, value: CollectionFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handlePeriodSelect(selected: string) {
    if (selected === NEW_PERIOD_SENTINEL) {
      setAddingPeriod(true);
      return;
    }
    update('periodId', selected);
  }

  async function handleAddPeriod() {
    const startYear = parseInt(newPeriodStart, 10);
    const endYear = parseInt(newPeriodEnd, 10);
    if (!newPeriodName.trim() || Number.isNaN(startYear) || Number.isNaN(endYear)) return;

    const created = await onCreatePeriod({ name: newPeriodName.trim(), startYear, endYear });
    setPeriodOptions((prev) => [...prev, created]);
    update('periodId', created.id);
    setAddingPeriod(false);
    setNewPeriodName('');
    setNewPeriodStart('');
    setNewPeriodEnd('');
  }

  const selectedPeriod = periodOptions.find((p) => p.id === values.periodId);

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
          Collection
          {isExisting && canEdit && !isEditing && (
            <button
              type="button"
              className={styles.editIcon}
              onClick={() => setIsEditing(true)}
              aria-label="Edit collection details"
            >
              <PencilIcon />
            </button>
          )}
        </h1>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>Name</span>
        {readOnly ? (
          <span className={styles.readOnlyValue}>{values.collectionName || '—'}</span>
        ) : (
          <input
            className={styles.input}
            type="text"
            required
            value={values.collectionName}
            onChange={(e) => update('collectionName', e.target.value)}
          />
        )}
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Type</span>
        {readOnly ? (
          <span className={styles.readOnlyValue}>{values.type}</span>
        ) : (
          <select
            className={styles.input}
            value={values.type}
            onChange={(e) => update('type', e.target.value as CollectionType)}
          >
            <option value="private">private</option>
            <option value="public">public</option>
          </select>
        )}
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Period</span>
        {readOnly ? (
          <span className={styles.readOnlyValue}>
            {selectedPeriod ? `${selectedPeriod.name} (${selectedPeriod.startYear}–${selectedPeriod.endYear})` : '—'}
          </span>
        ) : (
          <>
            <select
              className={styles.input}
              value={addingPeriod ? NEW_PERIOD_SENTINEL : values.periodId}
              onChange={(e) => handlePeriodSelect(e.target.value)}
            >
              <option value="">— None —</option>
              {periodOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.startYear}–{p.endYear})
                </option>
              ))}
              <option value={NEW_PERIOD_SENTINEL}>+ Add new period…</option>
            </select>

            {addingPeriod && (
              <div className={styles.newPeriod}>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Period name (e.g. Northern Renaissance)"
                  value={newPeriodName}
                  onChange={(e) => setNewPeriodName(e.target.value)}
                />
                <div className={styles.newPeriodYears}>
                  <input
                    className={styles.input}
                    type="number"
                    placeholder="Start year"
                    value={newPeriodStart}
                    onChange={(e) => setNewPeriodStart(e.target.value)}
                  />
                  <input
                    className={styles.input}
                    type="number"
                    placeholder="End year"
                    value={newPeriodEnd}
                    onChange={(e) => setNewPeriodEnd(e.target.value)}
                  />
                </div>
                <div className={styles.newPeriodActions}>
                  <button type="button" className={styles.smallButton} onClick={handleAddPeriod}>
                    Add period
                  </button>
                  <button
                    type="button"
                    className={styles.smallButtonSecondary}
                    onClick={() => setAddingPeriod(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </label>

      <div className={styles.field}>
        <span className={styles.label}>Artists ({artists.length})</span>
        <div className={styles.artistList}>
          {artists.map((artist) => (
            <div key={artist.id} className={styles.artistRow}>
              <div
                className={styles.artistThumb}
                style={
                  artist.portraitImageUrl
                    ? { backgroundImage: `url(${artist.portraitImageUrl})` }
                    : undefined
                }
              />
              <span className={styles.artistName}>{artist.name}</span>
            </div>
          ))}
          {artists.length === 0 && <p className={styles.emptyNote}>No artists tagged yet.</p>}
        </div>
      </div>

      {isExisting && isEditing && collection && (
        <div className={styles.audit}>
          <p className={styles.auditLine}>
            <span className={styles.auditLabel}>Created</span> by {collection.createdByName} on{' '}
            {formatTimestamp(collection.createdAt)}
            {' · '}
            <span className={styles.auditLabel}>Updated</span>{' '}
            {collection.updatedAt
              ? `by ${collection.updatedByName} on ${formatTimestamp(collection.updatedAt)}`
              : 'Never edited'}
          </p>
        </div>
      )}

      {!readOnly && onAddArtist && (
        <button type="button" className={styles.addArtistButton} onClick={onAddArtist}>
          Add Artist
        </button>
      )}

      {!readOnly && (
        <button type="submit" className={styles.submit}>
          {isExisting ? 'Save Changes' : 'Create Collection'}
        </button>
      )}
    </form>
  );
}
