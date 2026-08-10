/**
 * useProjects.js
 * Firestore CRUD for saved Post Studio projects.
 */
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection, addDoc, setDoc, doc, deleteDoc,
  onSnapshot, query, where, orderBy, serverTimestamp
} from 'firebase/firestore';

export function useProjects(client) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real-time listener — filtered by active client
  useEffect(() => {
    if (!client) { setLoading(false); return; }

    const q = query(
      collection(db, 'projects'),
      where('client', '==', client),
      orderBy('updatedAt', 'desc')
    );

    // Fallback: stop loading if Firestore is unreachable after 3 seconds
    const fallbackTimer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    const unsub = onSnapshot(q, (snap) => {
      clearTimeout(fallbackTimer);
      setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      clearTimeout(fallbackTimer);
      console.error('useProjects listener error:', err);
      setLoading(false);
    });

    return () => {
      clearTimeout(fallbackTimer);
      unsub();
    };
  }, [client]);

  /**
   * Save or update a project.
   * @param {string|null} id  - Existing project ID to update, or null to create new.
   * @param {string} name     - Project name.
   * @param {string} client   - Client name.
   * @param {object} templateState - Serialisable template state snapshot.
   * @returns {Promise<string>} The saved document ID.
   */
  const saveProject = async (id, name, client, templateState) => {
    const data = {
      name: name.trim(),
      client,
      updatedAt: serverTimestamp(),
      templateState,
    };

    if (id) {
      // Do not await setDoc: it resolves instantly in local cache, but network might be slow
      setDoc(doc(db, 'projects', id), data, { merge: true }).catch(err => console.warn('Save sync delayed:', err));
      return id;
    } else {
      data.createdAt = serverTimestamp();
      const ref = doc(collection(db, 'projects'));
      setDoc(ref, data).catch(err => console.warn('Save sync delayed:', err));
      return ref.id;
    }
  };

  /**
   * Permanently delete a project by Firestore ID.
   */
  const deleteProject = async (id) => {
    await deleteDoc(doc(db, 'projects', id));
  };

  /**
   * Rename a project without full update.
   */
  const renameProject = async (id, newName) => {
    if (!newName || !newName.trim()) return;
    setDoc(doc(db, 'projects', id), { name: newName.trim(), updatedAt: serverTimestamp() }, { merge: true }).catch(err => console.warn('Rename sync delayed:', err));
  };

  return { projects, loading, saveProject, deleteProject, renameProject };
}
