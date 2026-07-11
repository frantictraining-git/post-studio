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
    id: 't1', label: 'Dish Spotlight', icon: '🍽', category: 'Editorial',
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
    id: 't2', label: 'Royal Statement', icon: '✦', category: 'Editorial',
    defaultGrade: { preset: 'none', intensity: 0 },
    zones: makeZones({
      pre:      { type:'goldSub',   text:'A', align:'center', size:36 },
      h1:       { type:'gold',      text:'Royal', align:'center' },
      h2:       { type:'gold',      text:'Feast', align:'center' },
    }),
  },
  // T3: Ambient Mood
  {
    id: 't3', label: 'Ambient Mood', icon: '🌿', category: 'Arch',
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
    id: 't4', label: 'Floating Verse', icon: '🎶', category: 'Arch',
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
    id: 't5', label: 'Artisan Frame', icon: '🔥', category: 'Arch',
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
    id: 't6', label: 'Royal Feast', icon: '✨', category: 'Classic',
    defaultGrade: { preset: 'none', intensity: 0 },
    zones: makeZones({
      pre:      { type:'goldSub',   text:'A', align:'center', size:36, family: 'Cormorant Garamond' },
      h1:       { type:'gold',      text:'Royal', align:'center', family: 'Minal', size: 90, tracking: 0 },
      h2:       { type:'gold',      text:'Feast', align:'center', family: 'Cinzel', size: 60, tracking: 8 },
    }),
  },
  // T7: Breakfast Bliss
  {
    id: 't7', label: 'Breakfast Bliss', icon: '🍳', category: 'Editorial',
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
  // T8: Brunch Bliss
  {
    id: 't8', label: 'Brunch Bliss', icon: '🥞', category: 'Glassmorphism',
    defaultGrade: { preset: 'none', intensity: 0 },
    zones: makeZones({
      h2:       { type:'artSub', text:'golden', align:'center', size: 60, color: '#A28242', family: 'Great Vibes', tracking: 0, weight: '400' },
      h1:       { type:'h1', text:'BRUNCH', align:'center', family: 'Inter', weight: '900', caps: true, size: 100, tracking: -2, color: '#F3F8F1', shadow: 'soft' },
      h3:       { type:'artSub', text:'bliss', align:'center', size: 60, color: '#A28242', family: 'Great Vibes', tracking: 0, weight: '400' },
      tagline:  { type:'tagline', text:'Golden pancakes, drizzled with honey butter love.', align: 'left', size: 14, color: '#fff', italic: false, family: 'Inter', weight: '300' },
      phone:    { type:'contactInfo', text:'+44 1234 567890', align: 'left' },
      location: { type:'contactInfo', text:'Slough, Greater London', align: 'left' }
    }),
  },
  // T9: Morning Mood
  {
    id: 't9', label: 'Morning Mood', icon: '🍓', category: 'Classic',
    defaultGrade: { preset: 'none', intensity: 0 },
    zones: makeZones({
      h1:       { type:'h1', text:'MORNING', align:'center', family: 'Inter', weight: '900', caps: true, size: 120, tracking: -5, color: '#E53935', shadow: 'hard' },
      tagline:  { type:'h1', text:'FLIP YOUR MOOD', align:'center', family: 'Inter', weight: '300', caps: true, size: 24, tracking: 8, color: '#FFCA28', shadow: 'soft' },
      phone:    { type:'contactInfo', text:'+44 1234 567890', align: 'left' },
      location: { type:'contactInfo', text:'Slough, Greater London', align: 'left' }
    }),
  },
  // T10: Perfect Harmony
  {
    id: 't10', label: 'Perfect Harmony', icon: '🍽️', category: 'Glassmorphism',
    defaultGrade: { preset: 'none', intensity: 0 },
    zones: makeZones({
      eyebrow:  { type:'tagline', text:'YOUR PRESENTS', align:'center', family: 'Inter', weight: '300', caps: true, size: 14, tracking: 4, color: '#fff' },
      h2:       { type:'artSub', text:'Perfect', align:'center', size: 70, color: '#A28242', family: 'Great Vibes', tracking: 0, weight: '400' },
      h1:       { type:'h1', text:'HARMONY', align:'center', family: 'Minal', weight: '400', caps: true, size: 80, tracking: 2, color: '#F3F8F1', shadow: 'soft' },
      tagline:  { type:'tagline', text:'From the first bite to the final note, our cuisine balances texture, aroma, and taste.', align: 'center', size: 12, color: '#fff', italic: false, family: 'Inter', weight: '300' },
      website:  { type:'tagline', text:'WWW.EXAMPLE.COM', align: 'center', size: 12, color: '#fff', family: 'Inter', weight: '600', tracking: 4 },
      phone:    { type:'contactInfo', text:'+44 1234 567890', align: 'center' },
      location: { type:'contactInfo', text:'Slough, Greater London', align: 'center' }
    }),
  },
  // T11: Tasty Morning Joy
  {
    id: 't11', label: 'Tasty Morning', icon: '🍳', category: 'Classic',
    defaultGrade: { preset: 'none', intensity: 0 },
    zones: makeZones({
      h2:       { type:'artSub', text:'tasty', align:'center', size: 60, color: '#FFFFFF', family: 'Great Vibes', tracking: 0, weight: '400' },
      h1:       { type:'h1', text:'MORNING', align:'center', family: 'Inter', weight: '900', caps: true, size: 100, tracking: -2, color: '#F3F8F1', shadow: 'soft' },
      h3:       { type:'artSub', text:'joy', align:'left', size: 60, color: '#FFFFFF', family: 'Great Vibes', tracking: 0, weight: '400' },
      tagline:  { type:'tagline', text:'Creamy eggs,\ntoasted sourdough,\nsimple perfection.', align: 'left', size: 14, color: '#fff', italic: false, family: 'Inter', weight: '400', tracking: 1 },
      phone:    { type:'contactInfo', text:'+44 1234 567890', align: 'left' },
      location: { type:'contactInfo', text:'Slough, Greater London', align: 'left' }
    }),
  },
  // T12: Golden Brunch Bliss
  {
    id: 't12', label: 'Golden Brunch', icon: '🥞', category: 'Glassmorphism',
    defaultGrade: { preset: 'none', intensity: 0 },
    zones: makeZones({
      h2:       { type:'artSub', text:'golden', align:'center', size: 60, color: '#FFFFFF', family: 'Great Vibes', tracking: 0, weight: '400' },
      h1:       { type:'h1', text:'BRUNCH', align:'center', family: 'Inter', weight: '900', caps: true, size: 100, tracking: -2, color: '#F3F8F1', shadow: 'soft' },
      h3:       { type:'artSub', text:'bliss', align:'left', size: 60, color: '#FFFFFF', family: 'Great Vibes', tracking: 0, weight: '400' },
      tagline:  { type:'tagline', text:'Golden pancakes,\ndrizzled with honey\nbutter love.', align: 'left', size: 14, color: '#fff', italic: false, family: 'Inter', weight: '400', tracking: 1 },
      phone:    { type:'contactInfo', text:'+44 1234 567890', align: 'left' },
      location: { type:'contactInfo', text:'Slough, Greater London', align: 'left' }
    }),
  },
  // T13: Morning Mood
  {
    id: 't13', label: 'Morning Mood', icon: '🍓', category: 'Editorial',
    defaultGrade: { preset: 'none', intensity: 0 },
    zones: makeZones({
      h1:       { type:'h1', text:'MORNING', align:'center', family: 'Inter', weight: '900', caps: true, size: 130, tracking: -5, color: '#A01515', shadow: 'none' },
      tagline:  { type:'h1', text:'FLIP YOUR MOOD', align:'right', family: 'Inter', weight: '200', caps: true, size: 24, tracking: 4, color: '#D4C4A8', shadow: 'soft' },
      phone:    { type:'contactInfo', text:'+44 1234 567890', align: 'right' },
      location: { type:'contactInfo', text:'Slough, Greater London', align: 'right' }
    }),
  },
  // T14: Fuel Your Morning
  {
    id: 't14', label: 'Fuel Your Morning', icon: '🥪', category: 'Arch',
    defaultGrade: { preset: 'none', intensity: 0 },
    zones: makeZones({
      h1:       { type:'h1', text:'Fuel your\nmorning', align:'left', family: 'Cormorant Garamond', weight: '600', caps: false, size: 60, tracking: 0, color: '#FFFFFF', shadow: 'soft' },
      h2:       { type:'h1', text:'right.', align:'left', family: 'Cormorant Garamond', weight: '600', caps: false, size: 60, tracking: 0, color: '#FFCA28', shadow: 'soft' },
      h3:       { type:'tagline', text:'BALANCED. DELICIOUS.\nMADE FOR YOU.', align:'left', family: 'Inter', weight: '400', caps: true, size: 12, tracking: 3, color: '#FFCA28', shadow: 'soft' },
      h4:       { type:'artSub', text:'Simple ingredients.\nreal goodness', align:'left', size: 30, color: '#FFFFFF', family: 'Great Vibes', tracking: 0, weight: '400' },
      tagline:  { type:'tagline', text:'FIT PROTEIN\nSMOOTHIE', align:'left', family: 'Inter', weight: '400', caps: true, size: 12, tracking: 2, color: '#FFFFFF', shadow: 'soft' },
      phone:    { type:'contactInfo', text:'+44 1234 567890', align: 'left' },
      location: { type:'contactInfo', text:'Slough, Greater London', align: 'left' }
    }),
  },
];

// ─── Initial State Factory ─────────────────────────────────────────
function makeInitialState() {
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
      logoWhiteUrl: 'https://firebasestorage.googleapis.com/v0/b/post-studio-1508a.firebasestorage.app/o/assets%2F1783726767818-dummy_logo.jpg?alt=media',
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

  return {
    activeTemplate: 0,
    selectedZoneId: null,
    clients,
    activeClient,
    brandTheme: {
      primaryFont: 'Minal',
      secondaryFont: 'Montserrat',
      primaryColor1: '#F3F8F1',
      primaryColor2: '#A28242',
      primaryColor3: '#000000',
      secondaryColor1: '#FFFFFF',
      secondaryColor2: '#DDDDDD',
      secondaryColor3: '#999999',
      logoWhiteUrl: 'https://firebasestorage.googleapis.com/v0/b/post-studio-1508a.firebasestorage.app/o/assets%2F1783726767818-dummy_logo.jpg?alt=media',
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
    },
    hero: { url: null, blur: 0, scale: 1.05, x: 50, y: 50, mirror: false },
    fg:   { url: null, blendMode: 'normal', opacity: 100, scale: 1, x: 50, y: 50 },
    logo: { url: null, scale: 0.3, x: 50, y: 15 },
    overlay: { id: 'none', opacity: 100 },
    templates: TEMPLATE_DEFAULTS.map(t => {
      // Set the generated hero image exclusively for T6 and T7
      let defaultHeroUrl = null;
      if (t.id === 't6') {
        defaultHeroUrl = 'https://firebasestorage.googleapis.com/v0/b/post-studio-1508a.firebasestorage.app/o/assets%2F1783686748408-royal_feast_hero.jpg?alt=media';
      } else if (t.id === 't7') {
        defaultHeroUrl = 'https://firebasestorage.googleapis.com/v0/b/post-studio-1508a.firebasestorage.app/o/assets%2F1783725626395-breakfast_hero.jpg?alt=media';
      } else if (t.id === 't8') {
        defaultHeroUrl = 'https://firebasestorage.googleapis.com/v0/b/post-studio-1508a.firebasestorage.app/o/assets%2F1783726769651-t8_hero.jpg?alt=media';
      } else if (t.id === 't9') {
        defaultHeroUrl = 'https://firebasestorage.googleapis.com/v0/b/post-studio-1508a.firebasestorage.app/o/assets%2F1783726771663-t9_hero.jpg?alt=media';
      } else if (t.id === 't10') {
        defaultHeroUrl = 'https://firebasestorage.googleapis.com/v0/b/post-studio-1508a.firebasestorage.app/o/assets%2F1783726774242-t10_hero.jpg?alt=media';
      } else if (t.id === 't11') {
        defaultHeroUrl = 'https://firebasestorage.googleapis.com/v0/b/post-studio-1508a.firebasestorage.app/o/assets%2F1783727625330-t11_hero.jpg?alt=media';
      } else if (t.id === 't12') {
        defaultHeroUrl = 'https://firebasestorage.googleapis.com/v0/b/post-studio-1508a.firebasestorage.app/o/assets%2F1783727628101-t12_hero.jpg?alt=media';
      } else if (t.id === 't13') {
        defaultHeroUrl = 'https://firebasestorage.googleapis.com/v0/b/post-studio-1508a.firebasestorage.app/o/assets%2F1783727629778-t13_hero.jpg?alt=media';
      } else if (t.id === 't14') {
        defaultHeroUrl = 'https://firebasestorage.googleapis.com/v0/b/post-studio-1508a.firebasestorage.app/o/assets%2F1783727631759-t14_hero.jpg?alt=media';
      }

      return {
        ...t,
        hero: { url: defaultHeroUrl, blur: 0, scale: 1.05, x: 50, y: 50, mirror: false },
        fg:   { url: null, blendMode: 'normal', opacity: 100, scale: 1, x: 50, y: 50 },
        logo: { url: null, scale: 0.3, x: 50, y: 15 },
        overlay: { id: t.defaultOverlay || 'none', opacity: 100 },
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

  const applyOverlayLogic = (template, overlayId, theme) => {
    const overlay = getOverlayById(overlayId);
    const isWhite = overlay.recommended_text_color === 'white';
    const textColor = isWhite ? '#FFFFFF' : (theme.primaryColor3 || '#000000');
    // Fallback logic: if only one logo is uploaded, use it.
    let logoUrl = isWhite ? theme.logoWhiteUrl : theme.logoColoredUrl;
    if (!logoUrl) logoUrl = theme.logoWhiteUrl || theme.logoColoredUrl || 'https://firebasestorage.googleapis.com/v0/b/post-studio-1508a.firebasestorage.app/o/assets%2F1783726767818-dummy_logo.jpg?alt=media';

    const newZones = { ...template.zones };
    for (const key in newZones) {
      const zone = newZones[key];
      // Auto-color logic based on overlay legibility
      const zColor = isWhite ? '#FFFFFF' : (theme.primaryColor3 || '#000000');
      
      // Font inheritance logic
      let zFamily = zone.family;
      const type = zone.type || key;
      if (['h1', 'eyebrow', 'brandSub', 'gold', 'verse', 'artisan'].includes(type)) {
        zFamily = 'var(--primaryFont)';
      } else if (['h2', 'tagline', 'footer', 'handle', 'contactInfo', 'website', 'social', 'phone', 'location'].includes(type)) {
        zFamily = 'var(--secondaryFont)';
      }
      // 'artSub' and other script/accent types keep their inherent template fonts

      newZones[key] = { ...zone, color: zColor, family: zFamily };
    }

    return {
      ...template,
      overlay: { id: overlay.id, opacity: template.overlay ? template.overlay.opacity : overlay.default_opacity },
      logo: { ...template.logo, url: logoUrl },
      zones: newZones
    };
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

    case 'SET_BRAND_THEME': {
      const newTheme = { ...state.brandTheme, ...payload };
      let updatedTemplates = state.templates.map(t => applyOverlayLogic(t, t.overlay.id, newTheme));
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
        if (t.id === 't6') {
          defaultHeroUrl = 'https://firebasestorage.googleapis.com/v0/b/post-studio-1508a.firebasestorage.app/o/assets%2F1783686748408-royal_feast_hero.jpg?alt=media';
        } else if (t.id === 't7') {
          defaultHeroUrl = 'https://firebasestorage.googleapis.com/v0/b/post-studio-1508a.firebasestorage.app/o/assets%2F1783725626395-breakfast_hero.jpg?alt=media';
        } else if (t.id === 't8') {
          defaultHeroUrl = 'https://firebasestorage.googleapis.com/v0/b/post-studio-1508a.firebasestorage.app/o/assets%2F1783726769651-t8_hero.jpg?alt=media';
        } else if (t.id === 't9') {
          defaultHeroUrl = 'https://firebasestorage.googleapis.com/v0/b/post-studio-1508a.firebasestorage.app/o/assets%2F1783726771663-t9_hero.jpg?alt=media';
        } else if (t.id === 't10') {
          defaultHeroUrl = 'https://firebasestorage.googleapis.com/v0/b/post-studio-1508a.firebasestorage.app/o/assets%2F1783726774242-t10_hero.jpg?alt=media';
        } else if (t.id === 't11') {
          defaultHeroUrl = 'https://firebasestorage.googleapis.com/v0/b/post-studio-1508a.firebasestorage.app/o/assets%2F1783727625330-t11_hero.jpg?alt=media';
        } else if (t.id === 't12') {
          defaultHeroUrl = 'https://firebasestorage.googleapis.com/v0/b/post-studio-1508a.firebasestorage.app/o/assets%2F1783727628101-t12_hero.jpg?alt=media';
        } else if (t.id === 't13') {
          defaultHeroUrl = 'https://firebasestorage.googleapis.com/v0/b/post-studio-1508a.firebasestorage.app/o/assets%2F1783727629778-t13_hero.jpg?alt=media';
        } else if (t.id === 't14') {
          defaultHeroUrl = 'https://firebasestorage.googleapis.com/v0/b/post-studio-1508a.firebasestorage.app/o/assets%2F1783727631759-t14_hero.jpg?alt=media';
        }
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
        
        return applyOverlayLogic(tempT, tempT.overlay.id, theme);
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
        newT = applyOverlayLogic(newT, payload.id, state.brandTheme);
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
    TEMPLATE_DEFAULTS,
  };
}
