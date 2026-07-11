import React, { useState, useEffect, useRef } from 'react';
import './NotesWidget.css';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function NotesWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const timeoutRef = useRef(null);

  // Hardcode a document ID for the single user's notes
  const docRef = doc(db, 'notes', 'my-personal-notes');

  useEffect(() => {
    // Load existing notes on mount
    getDoc(docRef).then(docSnap => {
      if (docSnap.exists()) {
        setNoteText(docSnap.data().text || '');
      }
    }).catch(err => console.error("Failed to load notes:", err));
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setNoteText(val);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsSaving(true);
    timeoutRef.current = setTimeout(async () => {
      try {
        await setDoc(docRef, { text: val }, { merge: true });
      } catch (err) {
        console.error("Error saving note:", err);
      } finally {
        setIsSaving(false);
      }
    }, 1000); // 1 second debounce
  };

  return (
    <div className="notes-widget-container">
      <div className={`notes-panel ${isOpen ? 'open' : ''}`}>
        <div className="notes-header">
          <div className="notes-title">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            My Notes
          </div>
          <div className="notes-status">
            <div className={`status-dot ${isSaving ? 'saving' : ''}`}></div>
            {isSaving ? 'Saving...' : 'Saved'}
          </div>
        </div>
        <div className="notes-body">
          <textarea 
            className="notes-textarea" 
            placeholder="Jot down your ideas, scripts, or to-dos here..."
            value={noteText}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="notes-fab" onClick={() => setIsOpen(!isOpen)} title="Toggle Notes">
        {isOpen ? (
          <svg viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
        )}
      </div>
    </div>
  );
}
