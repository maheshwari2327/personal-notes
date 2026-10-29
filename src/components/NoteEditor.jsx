// ==============================================================================
// Layer: Frontend UI Component Layer
// File: src/components/NoteEditor.jsx
// Responsibility: Handles note viewing, creation, editing, color tag selection,
//                 pinned status toggling, and deletion with confirmation dialog.
// ==============================================================================

import React, { useState, useEffect } from 'react';

// Preset color palette for the stretch goal (modern, soft pastel tones)
const COLOR_PALETTE = [
  { name: 'Warm Amber', value: '#fef3c7', text: '#78350f' },
  { name: 'Sage Green', value: '#dcfce7', text: '#14532d' },
  { name: 'Indigo Blue', value: '#e0e7ff', text: '#312e81' },
  { name: 'Rose Pink', value: '#fce7f3', text: '#831843' },
  { name: 'Lilac Purple', value: '#f3e8ff', text: '#581c87' },
  { name: 'Sky Cyan', value: '#e0f2fe', text: '#0369a1' },
  { name: 'Clean White', value: '#ffffff', text: '#1e293b' },
];

/**
 * NoteEditor Component
 *
 * @param {Object|null} note - Note object being edited, or null if creating new
 * @param {boolean} isCreating - True if currently composing a new note
 * @param {Function} onSave - Callback receiving note object { title, content, color, is_pinned }
 * @param {Function} onDelete - Callback receiving note id to delete
 * @param {Function} onCancel - Callback to cancel creating new note
 * @param {boolean} isSaving - Loading indicator during API request
 */
export default function NoteEditor({
  note,
  isCreating,
  onSave,
  onDelete,
  onCancel,
  isSaving,
}) {
  // Local state for the editable fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#ffffff');
  const [isPinned, setIsPinned] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Synchronize form fields whenever the selected note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setColor(note.color || '#ffffff');
      setIsPinned(Boolean(note.is_pinned));
      setErrorMessage('');
      setHasUnsavedChanges(false);
    } else if (isCreating) {
      setTitle('');
      setContent('');
      setColor('#ffffff');
      setIsPinned(false);
      setErrorMessage('');
      setHasUnsavedChanges(false);
    }
  }, [note, isCreating]);

  // Handle field modifications and mark as modified
  const handleTitleChange = (val) => {
    setTitle(val);
    setHasUnsavedChanges(true);
    if (errorMessage) setErrorMessage('');
  };

  const handleContentChange = (val) => {
    setContent(val);
    setHasUnsavedChanges(true);
  };

  const handleColorChange = (hex) => {
    setColor(hex);
    setHasUnsavedChanges(true);
  };

  const handleTogglePin = () => {
    setIsPinned((prev) => !prev);
    setHasUnsavedChanges(true);
  };

  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();

    // Frontend validation: title must not be empty or blank whitespace
    if (!title.trim()) {
      setErrorMessage('Note title is required and cannot be empty.');
      return;
    }

    onSave({
      title: title.trim(),
      content,
      color,
      is_pinned: isPinned,
    });
    setHasUnsavedChanges(false);
  };

  // Confirm delete action
  const confirmDelete = () => {
    if (note && note.id) {
      onDelete(note.id);
      setShowDeleteModal(false);
    }
  };

  // If no note is selected and not creating, show friendly empty state
  if (!note && !isCreating) {
    return (
      <main className="editor-pane editor-empty-state" aria-label="No Note Selected">
        <div className="empty-selection-card">
          <div className="empty-illustration">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </div>
          <h2>Select a Note</h2>
          <p>
            Choose a note from the left sidebar to read or edit its contents,
            or create a brand new note right away.
          </p>
        </div>
      </main>
    );
  }

  // Calculate statistics (word count, character count)
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <main className="editor-pane" aria-label="Note Editor" style={{ backgroundColor: color ? `${color}15` : 'transparent' }}>
      <form onSubmit={handleSubmit} className="editor-form">
        {/* Editor Top Toolbar */}
        <div className="editor-toolbar">
          <div className="toolbar-left">
            <span className="editor-mode-badge">
              {isCreating ? 'Creating New Note' : 'Editing Note'}
            </span>

            {/* Pinned Status Toggle */}
            <button
              type="button"
              id="editor-pin-toggle"
              className={`btn-toolbar-pin ${isPinned ? 'active' : ''}`}
              onClick={handleTogglePin}
              title={isPinned ? 'Note is pinned to top' : 'Click to pin note to top'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={isPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="17" x2="12" y2="22"></line>
                <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a1 1 0 0 0 0-2H8a1 1 0 0 0 0 2h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z"></path>
              </svg>
              <span>{isPinned ? 'Pinned' : 'Pin Note'}</span>
            </button>

            {/* Color Tag Selector Dropdown / Swatches */}
            <div className="color-palette-bar" title="Pick a color tag">
              {COLOR_PALETTE.map((pal) => (
                <button
                  key={pal.value}
                  type="button"
                  className={`color-swatch-btn ${color === pal.value ? 'selected' : ''}`}
                  style={{ backgroundColor: pal.value }}
                  onClick={() => handleColorChange(pal.value)}
                  title={pal.name}
                >
                  {color === pal.value && (
                    <span className="check-icon" style={{ color: pal.text }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="toolbar-right">
            {/* Delete Note Button (only when editing existing note) */}
            {!isCreating && note && (
              <button
                type="button"
                id="btn-delete-note"
                className="btn-danger-outline"
                onClick={() => setShowDeleteModal(true)}
                title="Delete this note"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                <span>Delete</span>
              </button>
            )}

            {/* Cancel Button (when creating) */}
            {isCreating && (
              <button
                type="button"
                className="btn-secondary"
                onClick={onCancel}
              >
                Cancel
              </button>
            )}

            {/* Save Note Button */}
            <button
              type="submit"
              id="btn-save-note"
              className="btn-primary"
              disabled={isSaving}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              <span>{isSaving ? 'Saving...' : 'Save Note'}</span>
            </button>
          </div>
        </div>

        {/* Validation Error Message Alert */}
        {errorMessage && (
          <div className="alert-error" role="alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Title Input Field */}
        <div className="editor-title-container">
          <input
            id="note-title-input"
            type="text"
            className="editor-title-input"
            placeholder="Note Title..."
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            autoFocus={isCreating}
          />
        </div>

        {/* Content Body Textarea Field */}
        <div className="editor-content-container">
          <textarea
            id="note-content-input"
            className="editor-content-textarea"
            placeholder="Write your note content here..."
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
          />
        </div>

        {/* Editor Bottom Meta Bar */}
        <div className="editor-footer">
          <div className="editor-meta">
            {note && note.updated_at && !isCreating && (
              <span>Last updated: {new Date(note.updated_at).toLocaleString()}</span>
            )}
            {hasUnsavedChanges && (
              <span className="unsaved-badge">● Unsaved changes</span>
            )}
          </div>
          <div className="editor-stats">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{charCount} characters</span>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal Dialog */}
      {showDeleteModal && (
        <div className="modal-backdrop" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon-danger">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <h3 className="modal-title">Delete Note</h3>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete <strong>"{title || 'Untitled Note'}"</strong>?
              </p>
              <p className="modal-subtext">
                This action cannot be undone. The note will be permanently removed from SQLite database.
              </p>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                id="btn-cancel-delete"
                className="btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-delete"
                className="btn-danger"
                onClick={confirmDelete}
              >
                Yes, Delete Note
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
