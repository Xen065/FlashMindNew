import React, { useState, useEffect } from 'react';
import { notesAPI } from '../services/api';
import './StudyNotes.css';

const COLORS = ['#FFF9C4', '#FFECB3', '#FFE0B2', '#FFCCBC', '#F8BBD0', '#E1BEE7', '#C5CAE9', '#BBDEFB', '#B2DFDB', '#C8E6C9'];

function StudyNotes({ courseId = null, compact = false }) {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    color: COLORS[0],
    tags: '',
    folder: '',
  });

  useEffect(() => {
    loadNotes();
  }, [courseId]);

  useEffect(() => {
    applyFilters();
  }, [notes, searchQuery, showArchived]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (courseId) params.courseId = courseId;
      if (!showArchived) params.isArchived = 'false';

      const response = await notesAPI.getAll(params);
      setNotes(response.data || []);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...notes];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(query) ||
        (note.content && note.content.toLowerCase().includes(query))
      );
    }

    // Sort: pinned first, then by last edited
    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.lastEditedAt || b.createdAt) - new Date(a.lastEditedAt || a.createdAt);
    });

    setFilteredNotes(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please enter both title and content');
      return;
    }

    try {
      setLoading(true);
      const noteData = {
        ...formData,
        courseId: courseId || null,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };

      if (editingNote) {
        await notesAPI.update(editingNote.id, noteData);
      } else {
        await notesAPI.create(noteData);
      }

      resetForm();
      await loadNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      color: COLORS[0],
      tags: '',
      folder: '',
    });
    setShowAddForm(false);
    setEditingNote(null);
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      color: note.color || COLORS[0],
      tags: Array.isArray(note.tags) ? note.tags.join(', ') : '',
      folder: note.folder || '',
    });
    setShowAddForm(true);
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      await notesAPI.delete(noteId);
      await loadNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const togglePin = async (note) => {
    try {
      await notesAPI.togglePin(note.id);
      await loadNotes();
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const toggleFavorite = async (note) => {
    try {
      await notesAPI.toggleFavorite(note.id);
      await loadNotes();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (compact) {
    const recentNotes = filteredNotes.filter(n => !n.isArchived).slice(0, 3);
    return (
      <div className="notes-compact">
        <div className="notes-compact-header">
          <span className="notes-compact-title">📝 Notes</span>
          <span className="notes-compact-count">{notes.filter(n => !n.isArchived).length}</span>
        </div>
        {recentNotes.map(note => (
          <div key={note.id} className="notes-compact-item" style={{ borderLeftColor: note.color }}>
            <div className="note-title">{note.title}</div>
            <div className="note-preview">{note.content.substring(0, 50)}...</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="study-notes">
      <div className="notes-header">
        <h3>📝 Study Notes</h3>
        <button className="btn-add-note" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? '✕' : '+ New Note'}
        </button>
      </div>

      {showAddForm && (
        <form className="notes-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Note title..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Write your note here..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows="6"
            required
          />
          <div className="form-row">
            <input
              type="text"
              placeholder="Tags (comma-separated)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />
            <input
              type="text"
              placeholder="Folder (optional)"
              value={formData.folder}
              onChange={(e) => setFormData({ ...formData, folder: e.target.value })}
            />
          </div>
          <div className="color-picker">
            <label>Color:</label>
            <div className="color-options">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`color-option ${formData.color === color ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-save" disabled={loading}>
              {editingNote ? 'Update Note' : 'Save Note'}
            </button>
            {editingNote && (
              <button type="button" className="btn-cancel" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <div className="notes-toolbar">
        <input
          type="text"
          placeholder="🔍 Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="notes-search"
        />
        <label className="archive-toggle">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
          />
          Show archived
        </label>
      </div>

      <div className="notes-grid">
        {loading && filteredNotes.length === 0 ? (
          <div className="notes-loading">Loading notes...</div>
        ) : filteredNotes.length === 0 ? (
          <div className="notes-empty">
            <p>No notes yet! 📝</p>
            <p className="empty-subtitle">Create your first note to get started.</p>
          </div>
        ) : (
          filteredNotes.map(note => (
            <div
              key={note.id}
              className="note-card"
              style={{ borderTopColor: note.color, backgroundColor: note.color + '40' }}
            >
              <div className="note-card-header">
                <div className="note-icons">
                  {note.isPinned && <span className="icon-pin">📌</span>}
                  {note.isFavorite && <span className="icon-favorite">⭐</span>}
                </div>
                <div className="note-actions">
                  <button onClick={() => togglePin(note)} title="Pin">📌</button>
                  <button onClick={() => toggleFavorite(note)} title="Favorite">⭐</button>
                  <button onClick={() => handleEdit(note)} title="Edit">✏️</button>
                  <button onClick={() => handleDelete(note.id)} title="Delete">🗑️</button>
                </div>
              </div>
              <div className="note-card-body">
                <h4 className="note-card-title">{note.title}</h4>
                <p className="note-card-content">{note.content}</p>
                {Array.isArray(note.tags) && note.tags.length > 0 && (
                  <div className="note-tags">
                    {note.tags.map((tag, idx) => (
                      <span key={idx} className="note-tag">#{tag}</span>
                    ))}
                  </div>
                )}
                {note.folder && (
                  <div className="note-folder">📁 {note.folder}</div>
                )}
              </div>
              <div className="note-card-footer">
                <span className="note-date">
                  {new Date(note.lastEditedAt || note.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default StudyNotes;
