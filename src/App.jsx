// ==============================================================================
// Layer: Frontend UI Container Layer
// File: src/App.jsx
// Responsibility: Main container coordinating state management, note selection,
//                 CRUD lifecycle actions, search query synchronization, and toasts.
// ==============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import { fetchNotes, createNote, updateNote, deleteNote } from './api';

export default function App() {
  // State for all notes returned by backend
  const [notes, setNotes] = useState([]);
  // Currently selected note object for view/edit in the right pane
  const [selectedNote, setSelectedNote] = useState(null);
  // Whether the user is currently creating a brand new note
  const [isCreating, setIsCreating] = useState(false);
  // Current search query filter
  const [searchQuery, setSearchQuery] = useState('');
  // Loading indicators
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  // Toast notifications for user feedback
  const [toast, setToast] = useState(null);
  // Global API connection error state
  const [serverError, setServerError] = useState(null);

  /**
   * Show temporary toast notification message.
   */
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    const timer = setTimeout(() => {
      setToast(null);
    }, 3200);
    return () => clearTimeout(timer);
  }, []);

  /**
   * Load notes from the FastAPI backend.
   * If an active note is already selected, preserves selection or updates with latest data.
   */
  const loadNotes = useCallback(async (query = '') => {
    setIsLoading(true);
    setServerError(null);
    try {
      const data = await fetchNotes(query);
      setNotes(data);

      // If user had a note selected, refresh its data in view
      setSelectedNote((prevSelected) => {
        if (!prevSelected) {
          // If no note was selected and not creating, default select the first note if available
          return !isCreating && data.length > 0 ? data[0] : null;
        }
        const updatedSelected = data.find((n) => n.id === prevSelected.id);
        return updatedSelected || (data.length > 0 ? data[0] : null);
      });
    } catch (err) {
      console.error('Failed to load notes:', err);
      setServerError(
        'Unable to connect to the backend server. Please verify FastAPI is running at http://localhost:8000.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [isCreating]);

  // Initial load on component mount
  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Sync notes when search query changes (with slight debounce)
  useEffect(() => {
    const handler = setTimeout(() => {
      loadNotes(searchQuery);
    }, 250);

    return () => clearTimeout(handler);
  }, [searchQuery, loadNotes]);

  /**
   * Trigger creation of a new note.
   */
  const handleStartNewNote = () => {
    setSelectedNote(null);
    setIsCreating(true);
  };

  /**
   * Cancel new note creation and revert to selecting the first available note.
   */
  const handleCancelNewNote = () => {
    setIsCreating(false);
    if (notes.length > 0) {
      setSelectedNote(notes[0]);
    }
  };

  /**
   * Select an existing note from the list to view/edit.
   */
  const handleSelectNote = (note) => {
    setIsCreating(false);
    setSelectedNote(note);
  };

  /**
   * Quick toggle pinned status from sidebar card.
   */
  const handleTogglePin = async (note) => {
    try {
      const updated = await updateNote(note.id, {
        is_pinned: !note.is_pinned,
      });
      showToast(
        updated.is_pinned ? '📌 Note pinned to top' : 'Note unpinned',
        'info'
      );
      await loadNotes(searchQuery);
    } catch (err) {
      showToast(err.message || 'Failed to update pin status', 'error');
    }
  };

  /**
   * Save a note (handles both CREATE new and UPDATE existing).
   */
  const handleSaveNote = async (noteData) => {
    setIsSaving(true);
    try {
      if (isCreating) {
        // Create new note via POST /api/notes
        const newNote = await createNote(noteData);
        showToast('✨ Note created successfully!');
        setIsCreating(false);
        await loadNotes(searchQuery);
        setSelectedNote(newNote);
      } else if (selectedNote && selectedNote.id) {
        // Update existing note via PUT /api/notes/{id}
        const updated = await updateNote(selectedNote.id, noteData);
        showToast('💾 Note saved successfully!');
        await loadNotes(searchQuery);
        setSelectedNote(updated);
      }
    } catch (err) {
      showToast(err.message || 'Failed to save note', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Delete a note via DELETE /api/notes/{id}.
   */
  const handleDeleteNote = async (id) => {
    try {
      await deleteNote(id);
      showToast('🗑️ Note deleted successfully', 'info');
      // Remove deleted note from state immediately
      const remainingNotes = notes.filter((n) => n.id !== id);
      setNotes(remainingNotes);
      setSelectedNote(remainingNotes.length > 0 ? remainingNotes[0] : null);
      setIsCreating(false);
      // Reload to ensure full synchronization
      loadNotes(searchQuery);
    } catch (err) {
      showToast(err.message || 'Failed to delete note', 'error');
    }
  };

  return (
    <div className="app-layout">
      {/* Top Global Server Warning (if backend is offline) */}
      {serverError && (
        <div className="server-offline-banner">
          <div className="banner-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{serverError}</span>
            <button
              className="btn-retry"
              onClick={() => loadNotes(searchQuery)}
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Main Split-Pane Workspace */}
      <div className="app-workspace">
        {/* Left Side: Note List & Search */}
        <NoteList
          notes={notes}
          selectedNote={selectedNote}
          onSelectNote={handleSelectNote}
          onNewNote={handleStartNewNote}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onTogglePin={handleTogglePin}
        />

        {/* Right Side: Selected Note Viewer & Editor */}
        <NoteEditor
          note={selectedNote}
          isCreating={isCreating}
          onSave={handleSaveNote}
          onDelete={handleDeleteNote}
          onCancel={handleCancelNewNote}
          isSaving={isSaving}
        />
      </div>

      {/* Toast Notification Banner */}
      {toast && (
        <aside
          className={`toast-notification toast-${toast.type}`}
          role="status"
          aria-live="polite"
        >
          <span>{toast.message}</span>
        </aside>
      )}
    </div>
  );
}
