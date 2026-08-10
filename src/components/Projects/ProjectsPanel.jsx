import React, { useState, useMemo } from 'react';
import './ProjectsPanel.css';

function formatDate(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function ProjectsPanel({ isOpen, onClose, projects, loading, onLoad, onDelete, onRename, currentProjectId, client }) {
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return projects;
    return projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [projects, search]);

  const handleLoad = (project) => {
    onLoad(project);
    onClose();
  };

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setConfirmDelete(id);
  };

  const handleDeleteConfirm = async (e, id) => {
    e.stopPropagation();
    await onDelete(id);
    setConfirmDelete(null);
  };

  const handleRenameStart = (e, project) => {
    e.stopPropagation();
    setEditingId(project.id);
    setEditName(project.name);
  };

  const handleRenameSave = async (e, id) => {
    e.stopPropagation();
    if (editName.trim() && onRename) {
      await onRename(id, editName);
    }
    setEditingId(null);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`projects-panel-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`projects-panel ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="pp-header">
          <div>
            <div className="pp-title">📂 Saved Projects</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {client && <span className="pp-client-badge">{client}</span>}
            {projects.length > 0 && (
              <button 
                className="pp-action-btn delete" 
                onClick={async () => {
                  if (window.confirm("Are you sure you want to delete ALL saved projects? This cannot be undone.")) {
                    for (const p of projects) {
                      await onDelete(p.id);
                    }
                  }
                }}
                style={{ padding: '4px 8px' }}
              >
                Clear All
              </button>
            )}
            <button className="pp-close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Search */}
        <div className="pp-search">
          <input
            className="pp-search-input"
            type="text"
            placeholder="Search projects…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="pp-loading">Loading projects…</div>
        ) : filtered.length === 0 ? (
          <div className="pp-empty">
            <div className="pp-empty-icon">🗂️</div>
            <div className="pp-empty-text">
              {search ? 'No projects match your search.' : 'No saved projects yet.\nClick 💾 Save to create your first one.'}
            </div>
          </div>
        ) : (
          <div className="pp-list">
            {filtered.map(project => (
              <div
                key={project.id}
                className={`pp-card ${project.id === currentProjectId ? 'active' : ''}`}
                onClick={() => handleLoad(project)}
              >
                <div className="pp-card-icon">🖼️</div>
                <div className="pp-card-info">
                  {editingId === project.id ? (
                    <div className="pp-card-name" onClick={e => e.stopPropagation()}>
                      <input 
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleRenameSave(e, project.id)}
                        onBlur={e => handleRenameSave(e, project.id)}
                        autoFocus
                        style={{ background: '#222', color: '#fff', border: '1px solid #444', padding: '2px 6px', width: '100%' }}
                      />
                    </div>
                  ) : (
                    <div className="pp-card-name" title={project.name}>{project.name}</div>
                  )}
                  <div className="pp-card-meta">
                    <span>Updated {formatDate(project.updatedAt)}</span>
                    {project.id === currentProjectId && <span style={{ color: '#a28242' }}>● active</span>}
                  </div>
                </div>
                <div className="pp-card-actions">
                  <button
                    className="pp-action-btn load"
                    onClick={e => handleRenameStart(e, project)}
                    title="Rename Project"
                  >
                    ✎
                  </button>
                  <button
                    className="pp-action-btn load"
                    onClick={e => { e.stopPropagation(); handleLoad(project); }}
                  >
                    Load
                  </button>
                  {confirmDelete === project.id ? (
                    <button
                      className="pp-action-btn delete"
                      onClick={e => handleDeleteConfirm(e, project.id)}
                    >
                      Sure?
                    </button>
                  ) : (
                    <button
                      className="pp-action-btn delete"
                      onClick={e => handleDeleteClick(e, project.id)}
                    >
                      Del
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pp-footer">
          {projects.length} project{projects.length !== 1 ? 's' : ''} for {client || 'all clients'}
        </div>
      </div>
    </>
  );
}
