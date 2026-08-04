const fs = require('fs');
let code = fs.readFileSync('src/hooks/useStudio.js', 'utf8');

// Replace TEMPLATE_DEFAULTS
const templateStart = code.indexOf('const TEMPLATE_DEFAULTS = [');
const templateEnd = code.indexOf('// ─── Initial State Factory ─────────────────────────────────────────');
if (templateStart !== -1 && templateEnd !== -1) {
  const newTemplates = `const TEMPLATE_DEFAULTS = [
  {
    id: 'base', label: 'Base Canvas', icon: '🎨', category: 'Base',
    defaultOverlay: 'dark-fade',
    zones: makeZones({
      heading: { type: 'heading', text: 'YOUR HEADING' },
      subheading: { type: 'subheading', text: 'Your sub heading text goes here' },
    }),
  }
];

`;
  code = code.substring(0, templateStart) + newTemplates + code.substring(templateEnd);
}

// Replace the mapping logic in makeInitialState
const mapStart = code.indexOf('    templates: TEMPLATE_DEFAULTS.map(t => {');
const mapEnd = code.indexOf('      return {', mapStart);
if (mapStart !== -1 && mapEnd !== -1) {
  const newMap = `    templates: TEMPLATE_DEFAULTS.map(t => {
      let defaultHeroUrl = null;
`;
  code = code.substring(0, mapStart) + newMap + code.substring(mapEnd);
}

fs.writeFileSync('src/hooks/useStudio.js', code);
console.log('Success');
