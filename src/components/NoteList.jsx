// ==============================================================================
// Layer: Frontend UI Component Layer
// File: src/components/NoteList.jsx
// Responsibility: Displays the search input, "+ New Note" action, and the list
//                 of note cards with pin badges, color tags, and selection state.
// ==============================================================================

import React from 'react';

/**
 * Format ISO datetime string into human-friendly relative or short date format.
 */
function formatNoteDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * NoteList Component
 * 
 * @param {Array} notes - List of note objects to display
 * @param {Object|null} selectedNote - The currently active note being viewed/edited
 * @param {Function} onSelectNote - Callback when a note card is clicked
 * @param {Function} onNewNote - Callback to start creating a new note
 * @param {string} searchQuery - Current text in the search input
 * @param {Function} onSearchChange - Callback when search input text changes
 * @param {Function} onTogglePin - Quick callback to toggle note pinned status
 */
export default function NoteList({
  notes,
  selectedNote,
  onSelectNote,
  onNewNote,
  searchQuery,
  onSearchChange,
  onTogglePin,
}) {
  return (
    <aside className="sidebar-pane" aria-label="Notes List">
      {/* Sidebar Header with App Title and "+ New Note" Action */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div>
            <h1 className="brand-title">Personal Notes</h1>
            <span className="brand-subtitle">{notes.length} {notes.length === 1 ? 'note' : 'notes'} stored</span>
          </div>
        </div>

        {/* Create Note Button */}
        <button
          id="btn-create-note"
          className="btn-create"
          onClick={onNewNote}
          title="Create a new note"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>New Note</span>
        </button>
      </div>

      {/* Search Bar Input */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            id="search-input"
            type="text"
            className="search-input"
            placeholder="Search notes by title or text..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              title="Clear search"
              type="button"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Notes Scrollable Container */}
      <div className="notes-list-scroll">
        {notes.length === 0 ? (
          <div className="empty-list-state">
            <div className="empty-icon">📝</div>
            <h3>No notes found</h3>
            <p>
              {searchQuery
                ? `No notes match "${searchQuery}". Try a different keyword.`
                : 'Your notebook is empty. Click "+ New Note" to write your first note!'}
            </p>
          </div>
        ) : (
          <div className="notes-stack">
            {notes.map((note) => {
              const isSelected = selectedNote && selectedNote.id === note.id;
              return (
                <div
                  key={note.id}
                  id={`note-item-${note.id}`}
                  className={`note-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectNote(note)}
                  style={{
                    borderLeftColor: note.color || '#6366f1',
                  }}
                >
                  <div className="note-card-header">
                    <h3 className="note-card-title">
                      {note.title || 'Untitled Note'}
                    </h3>

                    {/* Quick Pin Toggle Button */}
                    <button
                      type="button"
                      className={`btn-pin-toggle ${note.is_pinned ? 'is-pinned' : ''}`}
                      title={note.is_pinned ? 'Unpin note' : 'Pin note to top'}
                      onClick={(e) => {
                        e.stopPropagation(); // Avoid triggering card selection
                        onTogglePin(note);
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill={note.is_pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="17" x2="12" y2="22"></line>
                        <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a1 1 0 0 0 0-2H8a1 1 0 0 0 0 2h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z"></path>
                      </svg>
                    </button>
                  </div>

                  {/* Note Content Excerpt */}
                  <p className="note-card-excerpt">
                    {note.content
                      ? note.content.replace(/\n+/g, ' ')
                      : 'No additional text'}
                  </p>

                  {/* Note Card Footer: Date & Color Pill */}
                  <div className="note-card-footer">
                    <span className="note-date">
                      {formatNoteDate(note.updated_at || note.created_at)}
                    </span>

                    <div className="note-tags">
                      {note.is_pinned && (
                        <span className="badge-pinned">
                          📌 Pinned
                        </span>
                      )}
                      <span
                        className="color-dot"
                        style={{ backgroundColor: note.color || '#e2e8f0' }}
                        title={`Color: ${note.color}`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
