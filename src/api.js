// ==============================================================================
// Layer: Frontend API Service Layer
// File: src/api.js
// Responsibility: Handles all HTTP communications between the React client
//                 and the FastAPI backend server (http://localhost:8000).
// ==============================================================================

const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Helper to handle HTTP response checking and error extraction.
 */
async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        errorMessage = Array.isArray(errorData.detail)
          ? errorData.detail.map((e) => e.msg || e).join(', ')
          : errorData.detail;
      } else if (errorData.errors) {
        errorMessage = errorData.errors.join(', ');
      }
    } catch {
      // If response body is not JSON, use standard status text
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

/**
 * Fetch all notes, with optional query filtering by title or content.
 * Results come pre-sorted with pinned notes first, then latest updated.
 *
 * @param {string} search - Optional search string
 * @returns {Promise<Array>} List of note objects
 */
export async function fetchNotes(search = '') {
  const url = new URL(`${API_BASE_URL}/notes`);
  if (search && search.trim()) {
    url.searchParams.append('search', search.trim());
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return handleResponse(response);
}

/**
 * Create a new note record.
 *
 * @param {Object} noteData - { title, content, color, is_pinned }
 * @returns {Promise<Object>} Newly created note object with assigned ID
 */
export async function createNote(noteData) {
  const response = await fetch(`${API_BASE_URL}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(noteData),
  });

  return handleResponse(response);
}

/**
 * Update an existing note by ID.
 *
 * @param {number} id - Note ID to update
 * @param {Object} noteData - Partial or full note fields to update
 * @returns {Promise<Object>} Updated note object
 */
export async function updateNote(id, noteData) {
  const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(noteData),
  });

  return handleResponse(response);
}

/**
 * Delete a note by ID.
 *
 * @param {number} id - Note ID to delete
 * @returns {Promise<Object>} Confirmation message object
 */
export async function deleteNote(id) {
  const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return handleResponse(response);
}
