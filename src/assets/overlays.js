export const OVERLAYS = [
  {
    id: 'none',
    name: 'No Overlay',
    tone_category: 'light',
    recommended_text_color: 'dark',
    type: 'none',
    blend_mode: 'normal',
    default_opacity: 100
  },
  {
    id: 'dark-fade-bottom',
    name: 'Dark Fade (Bottom)',
    tone_category: 'dark',
    recommended_text_color: 'white',
    type: 'gradient',
    css: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%)',
    blend_mode: 'normal',
    default_opacity: 85
  },
  {
    id: 'dark-fade-top',
    name: 'Dark Fade (Top)',
    tone_category: 'dark',
    recommended_text_color: 'white',
    type: 'gradient',
    css: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 60%)',
    blend_mode: 'normal',
    default_opacity: 85
  },
  {
    id: 'dark-solid',
    name: 'Solid Noir',
    tone_category: 'dark',
    recommended_text_color: 'white',
    type: 'solid',
    css: '#0a0a08',
    blend_mode: 'multiply',
    default_opacity: 40
  },
  {
    id: 'warm-glow-center',
    name: 'Warm Sun Glow',
    tone_category: 'warm',
    recommended_text_color: 'dark',
    type: 'gradient',
    css: 'radial-gradient(circle, rgba(255,200,100,0.8) 0%, rgba(255,200,100,0) 70%)',
    blend_mode: 'soft-light',
    default_opacity: 70
  },
  {
    id: 'warm-solid',
    name: 'Amber Tint',
    tone_category: 'warm',
    recommended_text_color: 'white',
    type: 'solid',
    css: '#564020',
    blend_mode: 'multiply',
    default_opacity: 40
  },
  {
    id: 'light-fade-bottom',
    name: 'Light Fade (Bottom)',
    tone_category: 'light',
    recommended_text_color: 'dark',
    type: 'gradient',
    css: 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 70%)',
    blend_mode: 'normal',
    default_opacity: 90
  },
  {
    id: 'light-solid',
    name: 'White Wash',
    tone_category: 'light',
    recommended_text_color: 'dark',
    type: 'solid',
    css: '#ffffff',
    blend_mode: 'overlay',
    default_opacity: 50
  },
  {
    id: 'green-tint',
    name: 'Forest Green',
    tone_category: 'green',
    recommended_text_color: 'white',
    type: 'solid',
    css: '#15392D',
    blend_mode: 'multiply',
    default_opacity: 45
  }
];

export function getOverlayById(id) {
  return OVERLAYS.find(o => o.id === id) || OVERLAYS[0];
}
