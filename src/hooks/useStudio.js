// Central state hook for the Post Studio
import { useReducer, useCallback } from 'react';

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

// ─── Grade Presets ─────────────────────────────────────────────────
export const GRADE_PRESETS = {
  none:   { label: 'None',   color: 'transparent' },
  green:  { label: 'Forest', color: '#15392D' },
  amber:  { label: 'Amber',  color: '#564020' },
  noir:   { label: 'Noir',   color: '#0a0a08' },
  sage:   { label: 'Sage',   color: '#2B562A' },
  warm:   { label: 'Warm',   color: '#3a2010' },
  custom: { label: 'Custom', color: '#15392D' },
};

// ─── Default Zone Styles (per-zone type) ──────────────────────────
const zoneDefaults = {
  eyebrow:   { family: 'Cinzel', size: 18, weight: '600', italic: false, caps: true,  color: '#F3F8F1', align: 'center', tracking: 3,  shadow: 'soft', visible: true },
  ornament:  { family: 'Inter', size: 36, weight: '400', italic: false, caps: false, color: '#A28242', align: 'center', tracking: 0,  shadow: 'none', visible: true },
  brandSub:  { family: 'Poppins', size: 9,  weight: '300', italic: false, caps: true,  color: '#AF9B78', align: 'center', tracking: 4,  shadow: 'none', visible: true },
  h1:        { family: 'Minal',   size: 62, weight: '400', italic: false, caps: false, color: '#F3F8F1', align: 'right',  tracking: 1,  shadow: 'soft', visible: true },
  h2:        { family: 'Montserrat', size: 24, weight: '300', italic: false, caps: true,  color: '#F3F8F1', align: 'right',  tracking: 3,  shadow: 'soft', visible: true },
  tagline:   { family: 'Cormorant Garamond', size: 20, weight: '300', italic: true, caps: false, color: '#F3F8F1', align: 'right',  tracking: 1,  shadow: 'soft', visible: true },
  footer:    { family: 'Poppins', size: 12, weight: '400', italic: false, caps: false, color: '#F3F8F1', align: 'center', tracking: 5,  shadow: 'none', visible: true },
  handle:    { family: 'Poppins', size: 11, weight: '300', italic: false, caps: false, color: '#F3F8F1', align: 'left',   tracking: 0,  shadow: 'none', visible: true },
  gold:      { family: 'Cinzel', size: 72, weight: '700', italic: false, caps: true,  color: '#A28242', align: 'center', tracking: 4,  shadow: 'glow', visible: true },
  goldSub:   { family: 'Cormorant Garamond', size: 30, weight: '300', italic: false, caps: true, color: '#A28242', align: 'center', tracking: 12, shadow: 'none', visible: true },
  verse:     { family: 'Minal',  size: 52, weight: '400', italic: false, caps: false, color: '#F3F8F1', align: 'right',  tracking: 1,  shadow: 'soft', visible: true },
  verseSub:  { family: 'Montserrat', size: 15, weight: '500', italic: false, caps: true, color: '#F3F8F1', align: 'right', tracking: 8, shadow: 'soft', visible: true },
  artisan:   { family: 'Minal',  size: 80, weight: '400', italic: false, caps: false, color: '#F3F8F1', align: 'center', tracking: 1,  shadow: 'hard', visible: true },
  artSub:    { family: 'Cormorant Garamond', size: 30, weight: '300', italic: true, caps: false, color: '#F3F8F1', align: 'center', tracking: 1, shadow: 'hard', visible: true },
  contactInfo: { family: 'Inter', size: 14, weight: '400', italic: false, caps: false, color: '#F3F8F1', align: 'left', tracking: 1, shadow: 'soft', visible: true },
};

// ─── Template Definitions ──────────────────────────────────────────
const makeZones = (overrides = {}) =>
  Object.entries(overrides).reduce((acc, [key, vals]) => {
    acc[key] = { ...zoneDefaults[vals.type || key], ...vals };
    return acc;
  }, {});

const TEMPLATE_DEFAULTS = [
  // T1: Dish Spotlight
  {
    id: 't1', label: 'Dish Spotlight', icon: '🍽', category: 'Minimal',
    defaultGrade: { preset: 'none', intensity: 0 },
    zones: makeZones({
      ornament: { type:'ornament', text:'✦' },
      eyebrow:  { type:'eyebrow', text:'Fine Dining Experience' },
      brandSub: { type:'brandSub',  text:'Fine Dining · Halal', align:'center' },
      h1:       { type:'h1',        text:'Lamb Shank', align:'right' },
      h2:       { type:'h2',        text:'Slow Braised', align:'right', size: 24, weight: 300 },
      tagline:  { type:'tagline',   text:'A quiet indulgence, served with grace.' },
      footer:   { type:'footer',    text:'easteatery.com · @easteateryofficial' },
    }),
  },
  // T2: Royal Statement
  {
    id: 't2', label: 'Royal Statement', icon: '✦', category: 'Gold',
    defaultGrade: { preset: 'none', intensity: 0 },
    zones: makeZones({
      pre:      { type:'goldSub',   text:'A', align:'center', size:36 },
      h1:       { type:'gold',      text:'Royal', align:'center' },
      h2:       { type:'gold',      text:'Feast', align:'center' },
    }),
  },
  // T3: Ambient Mood
  {
    id: 't3', label: 'Ambient Mood', icon: '🌿', category: 'Dark',
    defaultGrade: { preset: 'green', intensity: 38, blend: 'multiply' },
    zones: makeZones({
      handle:   { type:'handle',    text:'@easteateryofficial' },
      eyebrow:  { type:'eyebrow', text:'Fine Dining Experience', size:11, align:'right' },
      h1:       { type:'h1',        text:'Expertise & Mastery', align:'center', size:28, family:'Montserrat', weight:'700', caps:true, italic:false, tracking:8 },
      tagline:  { type:'tagline',   text:'We serve this deeply.', align:'center', size:18 },
    }),
  },
  // T4: Floating Verse
  {
    id: 't4', label: 'Floating Verse', icon: '🎶', category: 'Modern',
    defaultGrade: { preset: 'green', intensity: 30, blend: 'multiply' },
    zones: makeZones({
      handle:   { type:'handle',    text:'@easteateryofficial' },
      eyebrow:  { type:'eyebrow', text:'Fine Dining Experience', size:11, align:'right' },
      h1:       { type:'verse',     text:'A Symphony of Flavours' },
      h2:       { type:'verseSub',  text:'Playing softly on your palate' },
      tagline:  { type:'tagline',   text:'The Affordable Luxury Dining', size:15, caps:true, tracking:4 },
    }),
  },
  // T5: Artisan Frame
  {
    id: 't5', label: 'Artisan Frame', icon: '🔥', category: 'Black',
    defaultGrade: { preset: 'none', intensity: 0 },
    zones: makeZones({
      eyebrow:  { type:'eyebrow', text:'Fine Dining Experience', align:'left', size:22, family:'Cormorant Garamond', weight:'300', caps:false },
      brandSub: { type:'brandSub',  text:'Fine Dining · Slough', align:'left' },
      h1:       { type:'artisan',   text:'Crafting' },
      h2:       { type:'artSub',    text:'Taste with Love', size:34 },
    }),
  },
  // T6: Royal Feast
  {
    id: 't6', label: 'Royal Feast', icon: '✨', category: 'Gold',
    defaultGrade: { preset: 'none', intensity: 0 },
    zones: makeZones({
      pre:      { type:'goldSub',   text:'A', align:'center', size:36, family: 'Cormorant Garamond' },
      h1:       { type:'gold',      text:'Royal', align:'center', family: 'Minal', size: 90, tracking: 0 },
      h2:       { type:'gold',      text:'Feast', align:'center', family: 'Cinzel', size: 60, tracking: 8 },
    }),
  },
  // T7: Breakfast Bliss
  {
    id: 't7', label: 'Breakfast Bliss', icon: '🍳', category: 'Breakfast',
    defaultGrade: { preset: 'none', intensity: 0 },
    zones: makeZones({
      eyebrow:  { type:'artSub', text:'tasty', align:'center', size: 60, color: '#fff', family: 'Playfair Display', tracking: 0, weight: '500' },
      h1:       { type:'h1', text:'MORNING', align:'center', family: 'Inter', weight: '900', caps: true, size: 90, tracking: -3, color: '#fff', shadow: 'soft' },
      h2:       { type:'artSub', text:'joy', align:'center', size: 60, color: '#fff', family: 'Playfair Display', tracking: 0, weight: '500' },
      tagline:  { type:'tagline', text:'Creamy eggs, toasted sourdough, simple perfection.', align: 'center', size: 16, color: '#fff', italic: false, family: 'Inter', weight: '300' },
      phone:    { type:'contactInfo', text:'+44 1234 567890', align: 'left' },
      location: { type:'contactInfo', text:'Slough, Greater London', align: 'left' }
    }),
  },
];

// ─── Initial State Factory ─────────────────────────────────────────
function makeInitialState() {
  return {
    activeTemplate: 0,
    selectedZoneId: null,
    clients: {
      'East Eatery': {
        primaryFont: 'Minal',
        secondaryFont: 'Montserrat',
        primaryColor: '#F3F8F1',
        secondaryColor: '#A28242',
        logoUrl: null,
        phone: '+44 1234 567890',
        location: 'Slough, Greater London'
      }
    },
    activeClient: 'East Eatery',
    brandTheme: {
      primaryFont: 'Minal',
      secondaryFont: 'Montserrat',
      primaryColor: '#F3F8F1',
      secondaryColor: '#A28242',
      logoUrl: null,
      phone: '+44 1234 567890',
      location: 'Slough, Greater London'
    },
    hero: { url: null, blur: 0, scale: 1.05, x: 50, y: 50, mirror: false },
    fg:   { url: null, blendMode: 'normal', opacity: 100, scale: 1, x: 50, y: 50 },
    logo: { url: null, scale: 0.3, x: 50, y: 15 },
    grade: { preset: 'none', custom: '#15392D', intensity: 35, blendMode: 'multiply' },
    templates: TEMPLATE_DEFAULTS.map(t => {
      // Set the generated hero image exclusively for T6 and T7
      let defaultHeroUrl = null;
      if (t.id === 't6') {
        defaultHeroUrl = 'https://firebasestorage.googleapis.com/v0/b/post-studio-1508a.firebasestorage.app/o/assets%2F1783686748408-royal_feast_hero.jpg?alt=media';
      } else if (t.id === 't7') {
        defaultHeroUrl = 'https://firebasestorage.googleapis.com/v0/b/post-studio-1508a.firebasestorage.app/o/assets%2F1783725626395-breakfast_hero.jpg?alt=media';
      }

      return {
        ...t,
        hero: { url: defaultHeroUrl, blur: 0, scale: 1.05, x: 50, y: 50, mirror: false },
        fg:   { url: null, blendMode: 'normal', opacity: 100, scale: 1, x: 50, y: 50 },
        logo: { url: null, scale: 0.3, x: 50, y: 15 },
        grade: { ...t.defaultGrade, blendMode: 'multiply', custom: '#15392D' },
        zones: JSON.parse(JSON.stringify(t.zones)),
      };
    }),
  };
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
    case 'SET_ACTIVE_TEMPLATE':
      return { ...state, activeTemplate: payload };

    case 'SET_SELECTED_ZONE':
      return { ...state, selectedZoneId: payload };

    case 'SET_BRAND_THEME': {
      const newTheme = { ...state.brandTheme, ...payload };
      let updatedTemplates = state.templates.map(t => {
        let updatedZones = { ...t.zones };
        let changed = false;
        
        if (payload.logoUrl !== undefined) {
          t = { ...t, logo: { ...t.logo, url: payload.logoUrl } };
          changed = true;
        }
        if (payload.phone !== undefined && updatedZones.phone) {
          updatedZones.phone = { ...updatedZones.phone, text: payload.phone };
          changed = true;
        }
        if (payload.location !== undefined && updatedZones.location) {
          updatedZones.location = { ...updatedZones.location, text: payload.location };
          changed = true;
        }
        
        if (changed) {
          return { ...t, zones: updatedZones };
        }
        return t;
      });
      
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
        let updatedZones = { ...t.zones };
        if (updatedZones.phone && theme.phone !== undefined) updatedZones.phone = { ...updatedZones.phone, text: theme.phone };
        if (updatedZones.location && theme.location !== undefined) updatedZones.location = { ...updatedZones.location, text: theme.location };
        
        return {
          ...t,
          logo: { ...t.logo, url: theme.logoUrl },
          zones: updatedZones
        };
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

    case 'SET_GRADE':
      return updateTemplate({ grade: { ...state.templates[tIdx].grade, ...payload } });

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

// ─── Hook ──────────────────────────────────────────────────────────
export function useStudio() {
  const [state, dispatch] = useReducer(reducer, null, makeInitialState);

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

  const setGrade = useCallback((updates) =>
    dispatch({ type: 'SET_GRADE', payload: updates }), []);

  const setZoneText = useCallback((zoneId, text) =>
    dispatch({ type: 'SET_ZONE_TEXT', payload: { zoneId, text } }), []);

  const setZoneStyle = useCallback((zoneId, style) =>
    dispatch({ type: 'SET_ZONE_STYLE', payload: { zoneId, style } }), []);

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
    setGrade,
    setZoneText,
    setZoneStyle,
    TEMPLATE_DEFAULTS,
  };
}
