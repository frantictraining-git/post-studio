import React, { useState, useEffect } from 'react';
import './BrandManagerModal.css';

const DEFAULT_FORM_DATA = {
  primaryFont: 'Minal',
  secondaryFont: 'Montserrat',
  primaryColor1: '#F3F8F1',
  primaryColor2: '#A28242',
  primaryColor3: '#000000',
  secondaryColor1: '#FFFFFF',
  secondaryColor2: '#DDDDDD',
  secondaryColor3: '#999999',
  logoUrl: '',
  location: '',
  insta: '',
  tagline: '',
  webAddress: '',
  email: ''
};

export default function BrandManagerModal({ isOpen, onClose, state, saveClient, deleteClient, loadClient }) {
  const [editingClient, setEditingClient] = useState('');
  const [originalClientName, setOriginalClientName] = useState('');
  const [formData, setFormData] = useState({ ...DEFAULT_FORM_DATA });

  // When modal opens, default to active client
  useEffect(() => {
    if (isOpen && state.activeClient && state.clients[state.activeClient]) {
      handleSelectClient(state.activeClient);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectClient = (name) => {
    const clientData = state.clients[name];
    setEditingClient(name);
    setOriginalClientName(name);
    setFormData({
      primaryFont: clientData.primaryFont || 'Minal',
      secondaryFont: clientData.secondaryFont || 'Montserrat',
      // Map old brandColor fields if they exist to the new primary/secondary structure
      primaryColor1: clientData.primaryColor1 || clientData.brandColor1 || '#F3F8F1',
      primaryColor2: clientData.primaryColor2 || clientData.brandColor2 || '#A28242',
      primaryColor3: clientData.primaryColor3 || clientData.brandColor3 || '#000000',
      secondaryColor1: clientData.secondaryColor1 || clientData.brandColor4 || '#FFFFFF',
      secondaryColor2: clientData.secondaryColor2 || '#DDDDDD',
      secondaryColor3: clientData.secondaryColor3 || '#999999',
      logoUrl: clientData.logoUrl || '',
      location: clientData.location || '',
      insta: clientData.insta || '',
      tagline: clientData.tagline || '',
      webAddress: clientData.webAddress || '',
      email: clientData.email || ''
    });
  };

  const handleSave = () => {
    if (!editingClient.trim()) return;
    
    // If they renamed it, delete the old one
    if (originalClientName && originalClientName !== editingClient && state.clients[originalClientName]) {
      deleteClient(originalClientName);
    }
    
    // Convert to backwards compatible colors just in case some templates still expect brandColorX
    const mergedData = {
      ...formData,
      brandColor1: formData.primaryColor1,
      brandColor2: formData.primaryColor2,
      brandColor3: formData.primaryColor3,
      brandColor4: formData.secondaryColor1
    };

    saveClient(editingClient, mergedData);
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
                <div className="bm-btn-outline" 
                  onClick={() => {
                    setEditingClient('New Brand');
                    setOriginalClientName('');
                    setFormData({ ...DEFAULT_FORM_DATA });
                  }}
                >
                  + Add New Brand
                </div>
          </div>
          
          <div className="bm-content">
            {editingClient ? (
              <>
                <div className="bm-field">
                  <label>Brand Name <span style={{color: '#ff4444'}}>*</span></label>
                  <input 
                    type="text" 
                    value={editingClient} 
                    onChange={e => setEditingClient(e.target.value)} 
                    placeholder="e.g. East Eatery"
                  />
                </div>
                
                <h3 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '16px', color: '#fff', borderBottom: '1px solid #333', paddingBottom: '8px' }}>Contact & Social</h3>
                
                <div className="bm-field-row">
                  <div className="bm-field">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                      placeholder="hello@brand.com"
                    />
                  </div>
                  <div className="bm-field">
                    <label>Web Address</label>
                    <input 
                      type="text" 
                      value={formData.webAddress} 
                      onChange={e => setFormData({...formData, webAddress: e.target.value})} 
                      placeholder="www.brand.com"
                    />
                  </div>
                </div>

                <div className="bm-field-row">
                  <div className="bm-field">
                    <label>Insta Handle</label>
                    <input 
                      type="text" 
                      value={formData.insta} 
                      onChange={e => setFormData({...formData, insta: e.target.value})} 
                      placeholder="@brandname"
                    />
                  </div>
                  <div className="bm-field">
                    <label>Location</label>
                    <input 
                      type="text" 
                      value={formData.location} 
                      onChange={e => setFormData({...formData, location: e.target.value})} 
                      placeholder="London, UK"
                    />
                  </div>
                </div>
                
                <h3 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '16px', color: '#fff', borderBottom: '1px solid #333', paddingBottom: '8px' }}>Brand Identity</h3>

                <div className="bm-field">
                  <label>Tagline</label>
                  <input 
                    type="text" 
                    value={formData.tagline} 
                    onChange={e => setFormData({...formData, tagline: e.target.value})} 
                    placeholder="Your daily dose of inspiration"
                  />
                </div>

                <div className="bm-field">
                  <label>Logo URL</label>
                  <input 
                    type="text" 
                    value={formData.logoUrl} 
                    onChange={e => setFormData({...formData, logoUrl: e.target.value})} 
                    placeholder="https://..."
                  />
                </div>

                <div className="bm-field-row">
                  <div className="bm-field">
                    <label>Primary Font</label>
                    <select value={formData.primaryFont} onChange={e => setFormData({...formData, primaryFont: e.target.value})}>
                      <option value="Minal">Minal</option>
                      <option value="Cinzel">Cinzel</option>
                      <option value="Playfair Display">Playfair Display</option>
                      <option value="Inter">Inter</option>
                    </select>
                  </div>
                  <div className="bm-field">
                    <label>Secondary Font</label>
                    <select value={formData.secondaryFont} onChange={e => setFormData({...formData, secondaryFont: e.target.value})}>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Cormorant Garamond">Cormorant Garamond</option>
                      <option value="Great Vibes">Great Vibes</option>
                      <option value="Inter">Inter</option>
                    </select>
                  </div>
                </div>

                <h3 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '16px', color: '#fff', borderBottom: '1px solid #333', paddingBottom: '8px' }}>Brand Colors</h3>

                <div className="bm-field">
                  <label>3 Primary Colors</label>
                  <div className="bm-colors">
                    <input type="color" value={formData.primaryColor1} onChange={e => setFormData({...formData, primaryColor1: e.target.value})} title="Primary 1" />
                    <input type="color" value={formData.primaryColor2} onChange={e => setFormData({...formData, primaryColor2: e.target.value})} title="Primary 2" />
                    <input type="color" value={formData.primaryColor3} onChange={e => setFormData({...formData, primaryColor3: e.target.value})} title="Primary 3" />
                  </div>
                </div>

                <div className="bm-field">
                  <label>3 Secondary Colors</label>
                  <div className="bm-colors">
                    <input type="color" value={formData.secondaryColor1} onChange={e => setFormData({...formData, secondaryColor1: e.target.value})} title="Secondary 1" />
                    <input type="color" value={formData.secondaryColor2} onChange={e => setFormData({...formData, secondaryColor2: e.target.value})} title="Secondary 2" />
                    <input type="color" value={formData.secondaryColor3} onChange={e => setFormData({...formData, secondaryColor3: e.target.value})} title="Secondary 3" />
                  </div>
                </div>
                
                <div className="bm-actions" style={{ marginTop: '30px' }}>
                  <button className="bm-btn-danger" onClick={handleDelete} disabled={!originalClientName}>Delete</button>
                  <button className="bm-btn-primary" onClick={handleSave} disabled={!editingClient.trim()}>Save Brand</button>
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
