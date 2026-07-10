import React, { useState, useEffect } from 'react';
import './BrandManagerModal.css';

export default function BrandManagerModal({ isOpen, onClose, state, saveClient, deleteClient, loadClient }) {
  const [editingClient, setEditingClient] = useState('');
  const [originalClientName, setOriginalClientName] = useState('');
  const [formData, setFormData] = useState({
    primaryFont: 'Minal',
    secondaryFont: 'Montserrat',
    primaryColor: '#F3F8F1',
    secondaryColor: '#A28242',
    logoUrl: '',
    phone: '',
    location: ''
  });

  // When modal opens, default to active client
  useEffect(() => {
    if (isOpen && state.activeClient && state.clients[state.activeClient]) {
      handleSelectClient(state.activeClient);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectClient = (name) => {
    setEditingClient(name);
    setOriginalClientName(name);
    setFormData({
      ...state.clients[name]
    });
  };

  const handleSave = () => {
    if (!editingClient.trim()) return;
    
    // If they renamed it, delete the old one
    if (originalClientName && originalClientName !== editingClient && state.clients[originalClientName]) {
      deleteClient(originalClientName);
    }
    
    saveClient(editingClient, formData);
    setOriginalClientName(editingClient);
    
    // Auto-load if it's the active one or if they just created it
    if (state.activeClient === originalClientName || state.activeClient === editingClient || !originalClientName) {
      loadClient(editingClient);
    }
    
    onClose();
  };

  const handleDelete = () => {
    if (Object.keys(state.clients).length <= 1) {
      alert("You must have at least one brand.");
      return;
    }
    if (confirm(`Are you sure you want to delete ${editingClient}?`)) {
      deleteClient(originalClientName);
      setEditingClient('');
      setOriginalClientName('');
    }
  };

  return (
    <div className="bm-overlay" onClick={onClose}>
      <div className="bm-modal" onClick={e => e.stopPropagation()}>
        <div className="bm-header">
          <h2>Brand Manager</h2>
          <button className="bm-close" onClick={onClose}>&times;</button>
        </div>
        <div className="bm-body">
          <div className="bm-sidebar">
            <h3>Your Brands</h3>
            <ul className="bm-list">
              {Object.keys(state.clients || {}).map(clientName => (
                <li 
                  key={clientName} 
                  className={originalClientName === clientName ? 'active' : ''}
                  onClick={() => handleSelectClient(clientName)}
                >
                  {clientName}
                </li>
              ))}
            </ul>
            <button 
              className="bm-btn-outline" 
              onClick={() => {
                setEditingClient('New Brand');
                setOriginalClientName('');
                setFormData({
                  primaryFont: 'Minal',
                  secondaryFont: 'Montserrat',
                  primaryColor: '#F3F8F1',
                  secondaryColor: '#A28242',
                  logoUrl: '',
                  phone: '',
                  location: ''
                });
              }}
            >
              + Add New Brand
            </button>
          </div>
          
          <div className="bm-content">
            {editingClient ? (
              <>
                <div className="bm-field">
                  <label>Brand Name</label>
                  <input 
                    type="text" 
                    value={editingClient} 
                    onChange={e => setEditingClient(e.target.value)} 
                  />
                </div>
                <div className="bm-field-row">
                  <div className="bm-field">
                    <label>Phone Number</label>
                    <input 
                      type="text" 
                      value={formData.phone || ''} 
                      onChange={e => setFormData({...formData, phone: e.target.value})} 
                      placeholder="+44 1234 567890"
                    />
                  </div>
                  <div className="bm-field">
                    <label>Location</label>
                    <input 
                      type="text" 
                      value={formData.location || ''} 
                      onChange={e => setFormData({...formData, location: e.target.value})} 
                      placeholder="London, UK"
                    />
                  </div>
                </div>
                <div className="bm-field">
                  <label>Logo URL</label>
                  <input 
                    type="text" 
                    value={formData.logoUrl || ''} 
                    onChange={e => setFormData({...formData, logoUrl: e.target.value})} 
                    placeholder="https://..."
                  />
                </div>
                
                <div className="bm-actions">
                  <button className="bm-btn-danger" onClick={handleDelete} disabled={!originalClientName}>Delete</button>
                  <button className="bm-btn-primary" onClick={handleSave}>Save Brand</button>
                </div>
              </>
            ) : (
              <div className="bm-empty">
                Select a brand to edit, or create a new one.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
