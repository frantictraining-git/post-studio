// Central state hook for the Post Studio
import { useReducer, useCallback, useEffect } from 'react';

// ─── Brand Defaults ───────────────────────────────────────────────
export const BRAND = {
  name: 'East Eatery',
  tagline: 'The Affordable Luxury Dining',
  handle: '@easteateryofficial',
  website: 'easteatery.com',
  location: '396 Bath Rd, Slough SL1 6JA',
};

// ─── Font Options ──────────────────────────────────────────────────
export const FONT_OPTIONS = [
  { label: 'Minal (Brand Script)', value: 'Minal' },
  { label: 'Cormorant Garamond', value: 'Cormorant Garamond' },
  { label: 'Playfair Display', value: 'Playfair Display' },
  { label: 'EB Garamond', value: 'EB Garamond' },
  { label: 'Cinzel', value: 'Cinzel' },
  { label: 'Montserrat', value: 'Montserrat' },
  { label: 'Poppins', value: 'Poppins' },
  { label: 'Inter', value: 'Inter' },
];

import { OVERLAYS, getOverlayById } from '../assets/overlays';

// ─── Default Zone Styles (per-zone type) ──────────────────────────
const zoneDefaults = {
  heading:    { family: 'Minal',      size: 32, weight: '400', italic: false, caps: false, color: '#FFFFFF', align: 'center', tracking: 1, shadow: 'soft', visible: true,  x: 50, y: 47 },
  subheading: { family: 'Montserrat', size: 12, weight: '300', italic: false, caps: true,  color: '#FFFFFF', align: 'center', tracking: 3, shadow: 'soft', visible: true,  x: 50, y: 55 },
};

// ─── Template Definitions ──────────────────────────────────────────
const makeZones = (overrides = {}) =>
  Object.entries(overrides).reduce((acc, [key, vals]) => {
    acc[key] = { ...zoneDefaults[vals.type || key], ...vals };
    return acc;
  }, {});

const TEMPLATE_DEFAULTS = [
  {
    id: 'base', label: 'Base Canvas', icon: '🎨', category: 'Base',
    defaultOverlay: 'dark-fade',
    zones: makeZones({}),
  }
];

// ─── Shared Overlay Logic ─────────────────────────────────────────
export function applyOverlayLogic(template, overlayId, theme, preserveColor = false) {
  const overlay = getOverlayById(overlayId);
  const isWhite = overlay.recommended_text_color === 'white';
  
  let logoUrl = template.logo?.url;
  if (!preserveColor || logoUrl === undefined) {
    logoUrl = isWhite ? theme.logoWhiteUrl : theme.logoColoredUrl;
    if (!logoUrl) logoUrl = theme.logoWhiteUrl || theme.logoColoredUrl || '/dummy_logo.jpg';
  }

  const newZones = { ...template.zones };
  for (const key in newZones) {
    const zone = newZones[key];
    
    let zColor = zone.color;
    if (!preserveColor || !zone.color) {
      zColor = isWhite ? '#FFFFFF' : (theme.primaryColor3 || '#000000');
    }
    
    let zFamily = zone.family;
    if (!preserveColor || !zone.family) {
      const type = zone.type || key;
      if (['h1', 'eyebrow', 'brandSub', 'gold', 'verse', 'artisan'].includes(type)) {
        zFamily = 'var(--primaryFont)';
      } else if (['h2', 'tagline', 'footer', 'handle', 'contactInfo', 'website', 'social', 'phone', 'location'].includes(type)) {
        zFamily = 'var(--secondaryFont)';
      }
    }

    newZones[key] = { ...zone, color: zColor, family: zFamily };
  }

  return {
    ...template,
    overlay: { id: overlay.id, opacity: template.overlay ? template.overlay.opacity : overlay.default_opacity },
    logo: { ...template.logo, url: logoUrl },
    zones: newZones
  };
}
export function makeInitialState() {
  const savedData = localStorage.getItem('postStudioClients');
  let clients = {
    'East Eatery': {
      primaryFont: 'Minal',
      secondaryFont: 'Montserrat',
      primaryColor1: '#F3F8F1',
      primaryColor2: '#A28242',
      primaryColor3: '#000000',
      secondaryColor1: '#FFFFFF',
      secondaryColor2: '#DDDDDD',
      secondaryColor3: '#999999',
      logoWhiteUrl: '/dummy_logo.jpg',
      logoColoredUrl: 'https://firebasestorage.googleapis.com/v0/b/post-studio-1508a.firebasestorage.app/o/assets%2F1783726767818-dummy_logo.jpg?alt=media',
      phone: '+44 1234 567890',
      email: 'hello@brand.com',
      webAddress: 'www.brand.com',
      insta: '@brand',
      facebook: '',
      youtube: '',
      tiktok: '',
      tagline: 'Your daily dose of inspiration',
      location: 'Slough, Greater London'
    }
  };
  let activeClient = 'East Eatery';

  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      if (parsed && parsed.clients) clients = parsed.clients;
      if (parsed && parsed.activeClient) activeClient = parsed.activeClient;
    } catch (e) {
      console.error("Could not parse saved clients", e);
    }
  }

  const initialTheme = clients[activeClient] || clients['East Eatery'];

  const baseState = {
    clients,
    activeClient,
    activeTemplate: 0,
    selectedZoneId: null,
    brandTheme: initialTheme,
    hero: { url: null, blur: 0, scale: 1.05, x: 50, y: 50, mirror: false, locked: false },
    fg:   { url: null, blendMode: 'normal', opacity: 100, scale: 1, x: 50, y: 50 },
    logo: { url: null, scale: 0.3, x: 50, y: 15 },
    overlay: { id: 'none', opacity: 100 },
    templates: TEMPLATE_DEFAULTS.map(t => {
      let defaultHeroUrl = null;
      const baseT = {
        ...t,
        hero: { url: defaultHeroUrl, blur: 0, scale: 1.05, x: 50, y: 50, mirror: false, locked: false },
        fg:   { url: null, blendMode: 'normal', opacity: 100, scale: 1, x: 50, y: 50 },
        logo: { url: null, scale: 0.3, x: 50, y: 15 },
        overlay: { id: t.defaultOverlay || 'none', opacity: 100 },
        zones: JSON.parse(JSON.stringify(t.zones)),
      };
      return applyOverlayLogic(baseT, baseT.overlay.id, initialTheme, true);
    }),
    snapEnabled: true,
    // Project tracking
    currentProjectId: null,
    currentProjectName: null,
  };
  return baseState;
}

// ─── Reducer ──────────────────────────────────────────────────────
function reducer(state, action) {
  const { type, payload } = action;
  const tIdx = state.activeTemplate;

  const updateTemplate = (updates) => {
    const templates = [...state.templates];
    templates[tIdx] = { ...templates[tIdx], ...updates };
    return { ...state, templates };
  };

  switch (type) {
    case 'SET_ACTIVE_TEMPLATE': {
      const idx = payload;
      const t = state.templates[idx];
      const updatedT = applyOverlayLogic(t, t.overlay.id, state.brandTheme);
      const newTemplates = [...state.templates];
      newTemplates[idx] = updatedT;
      return { ...state, activeTemplate: idx, templates: newTemplates };
    }

    case 'SET_SELECTED_ZONE':
      return { ...state, selectedZoneId: payload };

    case 'LOAD_PROJECT': {
      // Restore a saved project's full template state
      const { projectId, projectName, templateState } = payload;
      const tpl = state.templates[tIdx];
      const restored = {
        ...tpl,
        hero:    templateState.hero    || tpl.hero,
        fg:      templateState.fg      || tpl.fg,
        logo:    templateState.logo    || tpl.logo,
        overlay: templateState.overlay || tpl.overlay,
        zones:   templateState.zones   || tpl.zones,
        category: templateState.category || tpl.category,
      };
      const templates = [...state.templates];
      templates[tIdx] = restored;
      return { ...state, templates, currentProjectId: projectId, currentProjectName: projectName };
    }

    case 'SET_CURRENT_PROJECT':
      return { ...state, currentProjectId: payload.id, currentProjectName: payload.name };

    case 'START_NEW_PROJECT': {
      const idx = state.activeTemplate;
      const t = TEMPLATE_DEFAULTS[idx] || TEMPLATE_DEFAULTS[0];
      
      // We need to re-initialize it like we do in LOAD_CLIENT or makeInitialState
      // Just applying the overlay logic with the current brand theme is enough to reset it.
      let defaultHeroUrl = null;

      let updatedZones = JSON.parse(JSON.stringify(t.zones));
      const theme = state.brandTheme;
      
      // Map brand data
      if (updatedZones.phone) updatedZones.phone = { ...updatedZones.phone, text: theme.phone || '' };
      if (updatedZones.location) updatedZones.location = { ...updatedZones.location, text: theme.location || '' };
      if (updatedZones.website) updatedZones.website = { ...updatedZones.website, text: theme.webAddress || '' };
      if (updatedZones.tagline) updatedZones.tagline = { ...updatedZones.tagline, text: theme.tagline || '' };
      if (updatedZones.subtitle) updatedZones.subtitle = { ...updatedZones.subtitle, text: theme.tagline || '' };
      if (updatedZones.social) updatedZones.social = { ...updatedZones.social, text: theme.insta || '' };
      if (updatedZones.instagram) updatedZones.instagram = { ...updatedZones.instagram, text: theme.insta || '' };
      if (updatedZones.facebook) updatedZones.facebook = { ...updatedZones.facebook, text: theme.facebook || '' };
      if (updatedZones.youtube) updatedZones.youtube = { ...updatedZones.youtube, text: theme.youtube || '' };
      if (updatedZones.tiktok) updatedZones.tiktok = { ...updatedZones.tiktok, text: theme.tiktok || '' };

      const baseT = {
        ...t,
        hero: { url: defaultHeroUrl, blur: 0, scale: 1.05, x: 50, y: 50, mirror: false, locked: false },
        fg:   { url: null, blendMode: 'normal', opacity: 100, scale: 1, x: 50, y: 50 },
        logo: { url: null, scale: 0.3, x: 50, y: 15 },
        overlay: { id: t.defaultOverlay || 'none', opacity: 100 },
        zones: updatedZones
      };

      const restored = applyOverlayLogic(baseT, baseT.overlay.id, state.brandTheme, true);
      const templates = [...state.templates];
      templates[idx] = restored;

      return { 
        ...state, 
        templates, 
        currentProjectId: null, 
        currentProjectName: null 
      };
    }

    case 'TOGGLE_SNAP':
      return { ...state, snapEnabled: !state.snapEnabled };

    case 'ADD_TEXT_ZONE': {
      const id = `text_${Date.now()}`;
      const newZone = {
        type: 'text',
        text: 'NEW TEXT',
        family: state.brandTheme.secondaryFont || 'Inter',
        size: 24,
        weight: '400',
        italic: false,
        caps: false,
        color: '#FFFFFF',
        align: 'center',
        tracking: 1,
        shadow: 'none',
        visible: true,
        x: 50,
        y: 50
      };
      const tpl = state.templates[tIdx];
      const zones = { ...tpl.zones, [id]: newZone };
      return updateTemplate({ zones });
    }

    case 'REMOVE_TEXT_ZONE': {
      const id = payload;
      const tpl = state.templates[tIdx];
      const zones = { ...tpl.zones };
      delete zones[id];
      // Deselect if it was selected
      const selectedZoneId = state.selectedZoneId === id ? null : state.selectedZoneId;
      const templates = [...state.templates];
      templates[tIdx] = { ...tpl, zones };
      return { ...state, templates, selectedZoneId };
    }

    case 'SET_BRAND_THEME': {
      const newTheme = { ...state.brandTheme, ...payload };
      let updatedTemplates = state.templates.map(t => applyOverlayLogic(t, t.overlay.id, newTheme, true));
      return { ...state, brandTheme: newTheme, templates: updatedTemplates };
    }

    case 'SAVE_CLIENT': {
      const { name, theme } = payload;
      return {
        ...state,
        clients: { ...state.clients, [name]: theme },
        activeClient: name
      };
    }

    case 'DELETE_CLIENT': {
      const name = payload;
      const newClients = { ...state.clients };
      delete newClients[name];
      const fallbackClient = Object.keys(newClients)[0] || null;
      return {
        ...state,
        clients: newClients,
        activeClient: state.activeClient === name ? fallbackClient : state.activeClient
      };
    }

    case 'LOAD_CLIENT': {
      const name = payload;
      const theme = state.clients[name];
      if (!theme) return state;
      
      // Apply the client's logo and contact info to all templates
      const updatedTemplates = state.templates.map(t => {
        let defaultHeroUrl = null;
        let updatedZones = { ...t.zones };
        
        // Map brand data
        if (updatedZones.phone) updatedZones.phone = { ...updatedZones.phone, text: theme.phone || '' };
        if (updatedZones.location) updatedZones.location = { ...updatedZones.location, text: theme.location || '' };
        if (updatedZones.website) updatedZones.website = { ...updatedZones.website, text: theme.webAddress || '' };
        if (updatedZones.tagline) updatedZones.tagline = { ...updatedZones.tagline, text: theme.tagline || '' };
        if (updatedZones.subtitle) updatedZones.subtitle = { ...updatedZones.subtitle, text: theme.tagline || '' };
        if (updatedZones.social) updatedZones.social = { ...updatedZones.social, text: theme.insta || '' };
        if (updatedZones.instagram) updatedZones.instagram = { ...updatedZones.instagram, text: theme.insta || '' };
        if (updatedZones.facebook) updatedZones.facebook = { ...updatedZones.facebook, text: theme.facebook || '' };
        if (updatedZones.youtube) updatedZones.youtube = { ...updatedZones.youtube, text: theme.youtube || '' };
        if (updatedZones.tiktok) updatedZones.tiktok = { ...updatedZones.tiktok, text: theme.tiktok || '' };

        const tempT = {
          ...t,
          hero: { ...t.hero, url: defaultHeroUrl },
          zones: updatedZones
        };
        
        return applyOverlayLogic(tempT, tempT.overlay.id, theme, true);
      });
      
      return {
        ...state,
        activeClient: name,
        brandTheme: theme,
        templates: updatedTemplates
      };
    }

    case 'SET_HERO':
      return updateTemplate({ hero: { ...state.templates[tIdx].hero, ...payload } });

    case 'SET_FG':
      return updateTemplate({ fg: { ...state.templates[tIdx].fg, ...payload } });

    case 'SET_LOGO':
      return updateTemplate({ logo: { ...state.templates[tIdx].logo, ...payload } });

    case 'SET_OVERLAY': {
      // payload could be { id: 'dark-fade' } or { opacity: 50 }
      const newOverlay = { ...state.templates[tIdx].overlay, ...payload };
      let newT = { ...state.templates[tIdx], overlay: newOverlay };
      if (payload.id) {
        newT = applyOverlayLogic(newT, payload.id, state.brandTheme, true);
        // Ensure opacity resets if a new ID is picked
        newT.overlay.opacity = getOverlayById(payload.id).default_opacity;
      }
      const templates = [...state.templates];
      templates[tIdx] = newT;
      return { ...state, templates };
    }

    case 'SET_ZONE_TEXT': {
      const { zoneId, text } = payload;
      const templates = [...state.templates];
      templates[tIdx] = {
        ...templates[tIdx],
        zones: {
          ...templates[tIdx].zones,
          [zoneId]: { ...templates[tIdx].zones[zoneId], text },
        },
      };
      return { ...state, templates };
    }

    case 'SET_ZONE_STYLE': {
      const { zoneId, style } = payload;
      const templates = [...state.templates];
      templates[tIdx] = {
        ...templates[tIdx],
        zones: {
          ...templates[tIdx].zones,
          [zoneId]: { ...templates[tIdx].zones[zoneId], ...style },
        },
      };
      return { ...state, templates };
    }

    default:
      return state;
  }
}

// ─── Main Hook ──────────────────────────────────────────────────────
export function useStudio() {
  const [state, dispatch] = useReducer(reducer, null, makeInitialState);

  // Sync clients to localStorage
  useEffect(() => {
    localStorage.setItem('postStudioClients', JSON.stringify({
      clients: state.clients,
      activeClient: state.activeClient
    }));
  }, [state.clients, state.activeClient]);

  const setActiveTemplate = useCallback((idx) =>
    dispatch({ type: 'SET_ACTIVE_TEMPLATE', payload: idx }), []);

  const setSelectedZoneId = useCallback((id) =>
    dispatch({ type: 'SET_SELECTED_ZONE', payload: id }), []);

  const setBrandTheme = useCallback((updates) =>
    dispatch({ type: 'SET_BRAND_THEME', payload: updates }), []);

  const saveClient = useCallback((name, theme) =>
    dispatch({ type: 'SAVE_CLIENT', payload: { name, theme } }), []);

  const deleteClient = useCallback((name) =>
    dispatch({ type: 'DELETE_CLIENT', payload: name }), []);

  const loadClient = useCallback((name) =>
    dispatch({ type: 'LOAD_CLIENT', payload: name }), []);

  const setHero = useCallback((updates) =>
    dispatch({ type: 'SET_HERO', payload: updates }), []);

  const setFg = useCallback((updates) =>
    dispatch({ type: 'SET_FG', payload: updates }), []);

  const setLogo = useCallback((updates) =>
    dispatch({ type: 'SET_LOGO', payload: updates }), []);

  const setOverlay = useCallback((updates) =>
    dispatch({ type: 'SET_OVERLAY', payload: updates }), []);

  const setZoneText = useCallback((zoneId, text) =>
    dispatch({ type: 'SET_ZONE_TEXT', payload: { zoneId, text } }), []);

  const setZoneStyle = useCallback((zoneId, style) =>
    dispatch({ type: 'SET_ZONE_STYLE', payload: { zoneId, style } }), []);

  const addTextZone = useCallback(() => 
    dispatch({ type: 'ADD_TEXT_ZONE' }), []);
    
  const removeTextZone = useCallback((zoneId) => 
    dispatch({ type: 'REMOVE_TEXT_ZONE', payload: zoneId }), []);

  const toggleSnap = useCallback(() =>
    dispatch({ type: 'TOGGLE_SNAP' }), []);

  const loadProject = useCallback((projectId, projectName, templateState) =>
    dispatch({ type: 'LOAD_PROJECT', payload: { projectId, projectName, templateState } }), []);

  const startNewProject = useCallback(() =>
    dispatch({ type: 'START_NEW_PROJECT' }), []);

  const setCurrentProject = useCallback((id, name) =>
    dispatch({ type: 'SET_CURRENT_PROJECT', payload: { id, name } }), []);

  const activeTpl = state.templates[state.activeTemplate];

  return {
    state,
    activeTpl,
    setActiveTemplate,
    setSelectedZoneId,
    setBrandTheme,
    saveClient,
    deleteClient,
    loadClient,
    setHero,
    setFg,
    setLogo,
    setOverlay,
    setZoneText,
    setZoneStyle,
    addTextZone,
    removeTextZone,
    toggleSnap,
    loadProject,
    startNewProject,
    setCurrentProject,
    TEMPLATE_DEFAULTS,
  };
}
