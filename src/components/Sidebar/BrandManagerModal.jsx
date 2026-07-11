import React, { useState, useEffect } from 'react';
import './BrandManagerModal.css';
import { storage } from '../../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const DEFAULT_FORM_DATA = {
  primaryFont: 'Minal',
  secondaryFont: 'Montserrat',
  logoWhiteUrl: '',
  logoColoredUrl: '',
  primaryColor1: '#F3F8F1',
  primaryColor2: '#A28242',
  primaryColor3: '#000000',
  secondaryColor1: '#FFFFFF',
  secondaryColor2: '#DDDDDD',
  secondaryColor3: '#999999',
  location: '',
  insta: '',
  facebook: '',
  youtube: '',
  tiktok: '',
  tagline: '',
  webAddress: '',
  email: '',
  phone: ''
};

export default function BrandManagerModal({ isOpen, onClose, state, saveClient, deleteClient, loadClient }) {
  const [editingClient, setEditingClient] = useState('');
  const [originalClientName, setOriginalClientName] = useState('');
  const [formData, setFormData] = useState({ ...DEFAULT_FORM_DATA });
  const [uploadState, setUploadState] = useState({
    isUploadingLogoWhite: false,
    isUploadingLogoColored: false,
    uploadProgress: 0
  });

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
      primaryColor1: clientData.primaryColor1 || clientData.brandColor1 || '#F3F8F1',
      primaryColor2: clientData.primaryColor2 || clientData.brandColor2 || '#A28242',
      primaryColor3: clientData.primaryColor3 || clientData.brandColor3 || '#000000',
      secondaryColor1: clientData.secondaryColor1 || clientData.brandColor4 || '#FFFFFF',
      secondaryColor2: clientData.secondaryColor2 || '#DDDDDD',
      secondaryColor3: clientData.secondaryColor3 || '#999999',
      logoWhiteUrl: clientData.logoWhiteUrl || '',
      logoColoredUrl: clientData.logoColoredUrl || '',
      location: clientData.location || '',
      insta: clientData.insta || '',
      facebook: clientData.facebook || '',
      youtube: clientData.youtube || '',
      tiktok: clientData.tiktok || '',
      tagline: clientData.tagline || '',
      webAddress: clientData.webAddress || '',
      email: clientData.email || '',
      phone: clientData.phone || ''
    });
  };

  const handleSave = () => {
    if (!editingClient.trim()) return;
    
    // If they renamed it, delete the old one
    if (originalClientName && originalClientName !== editingClient && state.clients[originalClientName]) {
      deleteClient(originalClientName);
    }
    
    const mergedData = {
      ...formData,
      brandColor1: formData.primaryColor1,
      brandColor2: formData.primaryColor2,
      brandColor3: formData.primaryColor3,
      brandColor4: formData.secondaryColor1
    };

    saveClient(editingClient, mergedData);
    setOriginalClientName(editingClient);
    
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

  const handleLogoUpload = (e, variant) => {
    const file = e.target.files[0];
    if (!file) return;

    const variantKey = variant === 'white' ? 'isUploadingLogoWhite' : 'isUploadingLogoColored';
    const formKey = variant === 'white' ? 'logoWhiteUrl' : 'logoColoredUrl';

    setUploadState(prev => ({...prev, [variantKey]: true, uploadProgress: 0}));
    const storageRef = ref(storage, `logos/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadState(prev => ({...prev, uploadProgress: progress}));
      }, 
      (error) => {
        console.error("Upload error:", error);
        setUploadState(prev => ({...prev, [variantKey]: false}));
        alert("Error uploading logo.");
      }, 
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData({...formData, [formKey]: downloadURL});
          setUploadState(prev => ({...prev, [variantKey]: false, uploadProgress: 0}));
        });
      }
    );
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
                    <label>Location</label>
                    <input 
                      type="text" 
                      value={formData.location} 
                      onChange={e => setFormData({...formData, location: e.target.value})} 
                      placeholder="London, UK"
                    />
                  </div>
                  <div className="bm-field">
                    <label>Insta Handle</label>
                    <input 
                      type="text" 
                      value={formData.insta} 
                      onChange={e => setFormData({...formData, insta: e.target.value})} 
                      placeholder="@brandname"
                    />
                  </div>
                </div>

                <div className="bm-field-row">
                  <div className="bm-field">
                    <label>Facebook</label>
                    <input 
                      type="text" 
                      value={formData.facebook} 
                      onChange={e => setFormData({...formData, facebook: e.target.value})} 
                      placeholder="fb.com/brand"
                    />
                  </div>
                  <div className="bm-field">
                    <label>YouTube</label>
                    <input 
                      type="text" 
                      value={formData.youtube} 
                      onChange={e => setFormData({...formData, youtube: e.target.value})} 
                      placeholder="youtube.com/@brand"
                    />
                  </div>
                </div>

                <div className="bm-field-row">
                  <div className="bm-field">
                    <label>TikTok</label>
                    <input 
                      type="text" 
                      value={formData.tiktok} 
                      onChange={e => setFormData({...formData, tiktok: e.target.value})} 
                      placeholder="@brand"
                    />
                  </div>
                  <div className="bm-field">
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
                  <label>Brand Logos (Firebase Storage)</label>
                  <p style={{fontSize: 12, color: '#aaa', marginBottom: 8}}>Upload both versions of your logo.</p>
                  
                  <div style={{ display: 'flex', gap: '15px', flexDirection: 'column' }}>
                    {/* White Logo */}
                    <div style={{ flex: 1, padding: 10, background: '#222', borderRadius: 6 }}>
                      <label style={{ fontSize: '12px', display: 'block', marginBottom: 8 }}>White Variant (For dark backgrounds)</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {formData.logoWhiteUrl && (
                          <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', background: '#000' }}>
                            <img src={formData.logoWhiteUrl} alt="White Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          </div>
                        )}
                        <label style={{
                          display: 'inline-block', padding: '8px 16px', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '13px', textAlign: 'center', flex: 1
                        }}>
                          {uploadState.isUploadingLogoWhite ? `Uploading... ${Math.round(uploadState.uploadProgress)}%` : (formData.logoWhiteUrl ? 'Change White Logo' : 'Upload White Logo')}
                          <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e, 'white')} style={{ display: 'none' }} disabled={uploadState.isUploadingLogoWhite} />
                        </label>
                      </div>
                    </div>

                    {/* Colored Logo */}
                    <div style={{ flex: 1, padding: 10, background: '#f5f5f5', borderRadius: 6, color: '#000' }}>
                      <label style={{ fontSize: '12px', display: 'block', marginBottom: 8, color: '#333' }}>Colored Variant (For light backgrounds)</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {formData.logoColoredUrl && (
                          <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', background: '#fff', border: '1px solid #ddd' }}>
                            <img src={formData.logoColoredUrl} alt="Colored Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          </div>
                        )}
                        <label style={{
                          display: 'inline-block', padding: '8px 16px', background: 'rgba(0, 0, 0, 0.1)', border: '1px solid rgba(0, 0, 0, 0.2)', borderRadius: '6px', color: '#000', cursor: 'pointer', fontSize: '13px', textAlign: 'center', flex: 1
                        }}>
                          {uploadState.isUploadingLogoColored ? `Uploading... ${Math.round(uploadState.uploadProgress)}%` : (formData.logoColoredUrl ? 'Change Colored Logo' : 'Upload Colored Logo')}
                          <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e, 'colored')} style={{ display: 'none' }} disabled={uploadState.isUploadingLogoColored} />
                        </label>
                      </div>
                    </div>
                  </div>
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
