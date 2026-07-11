import React, { useState } from 'react';
import { useStudio } from './hooks/useStudio';
import ControlPanel from './components/Sidebar/ControlPanel';
import PreviewFrame from './components/Preview/PreviewFrame';
import BrandManagerModal from './components/Sidebar/BrandManagerModal';
import NotesWidget from './components/Notes/NotesWidget';
import './App.css';

function App() {
  const { 
    state, 
    activeTpl,
    setActiveTemplate,
    setHero,
    setFg,
    setLogo,
    setOverlay,
    setZoneText,
    setZoneStyle,
    setSelectedZoneId,
    setBrandTheme,
    saveClient,
    deleteClient,
    loadClient,
    TEMPLATE_DEFAULTS
  } = useStudio();

  const [isBrandManagerOpen, setIsBrandManagerOpen] = useState(false);

  return (
    <div 
      className="app-container"
      style={{
        '--brand-primary': `"${state.brandTheme.primaryFont || 'Minal'}", sans-serif`,
        '--brand-secondary': `"${state.brandTheme.secondaryFont || 'Montserrat'}", sans-serif`,
        // Backwards compatibility
        '--brand-color-1': state.brandTheme.brandColor1 || state.brandTheme.primaryColor1 || '#F3F8F1',
        '--brand-color-2': state.brandTheme.brandColor2 || state.brandTheme.primaryColor2 || '#A28242',
        '--brand-color-3': state.brandTheme.brandColor3 || state.brandTheme.primaryColor3 || '#000000',
        '--brand-color-4': state.brandTheme.brandColor4 || state.brandTheme.secondaryColor1 || '#FFFFFF',
        // New 6 color system
        '--primary-color-1': state.brandTheme.primaryColor1 || state.brandTheme.brandColor1 || '#F3F8F1',
        '--primary-color-2': state.brandTheme.primaryColor2 || state.brandTheme.brandColor2 || '#A28242',
        '--primary-color-3': state.brandTheme.primaryColor3 || state.brandTheme.brandColor3 || '#000000',
        '--secondary-color-1': state.brandTheme.secondaryColor1 || state.brandTheme.brandColor4 || '#FFFFFF',
        '--secondary-color-2': state.brandTheme.secondaryColor2 || '#DDDDDD',
        '--secondary-color-3': state.brandTheme.secondaryColor3 || '#999999',
      }}
    >
      <ControlPanel 
        state={state}
        activeTpl={activeTpl}
        setActiveTemplate={setActiveTemplate}
        setHero={setHero}
        setFg={setFg}
        setLogo={setLogo}
        setOverlay={setOverlay}
        setZoneText={setZoneText}
        setZoneStyle={setZoneStyle}
        setSelectedZoneId={setSelectedZoneId}
        setBrandTheme={setBrandTheme}
        saveClient={saveClient}
        loadClient={loadClient}
        TEMPLATE_DEFAULTS={TEMPLATE_DEFAULTS}
        onOpenBrandManager={() => setIsBrandManagerOpen(true)}
      />
      <PreviewFrame 
        state={state}
        activeTpl={activeTpl}
        setHero={setHero}
        setFg={setFg}
        setLogo={setLogo}
        setActiveTemplate={setActiveTemplate}
        setSelectedZoneId={setSelectedZoneId}
        setZoneText={setZoneText}
        TEMPLATE_DEFAULTS={TEMPLATE_DEFAULTS}
      />
      <BrandManagerModal 
        isOpen={isBrandManagerOpen}
        onClose={() => setIsBrandManagerOpen(false)}
        state={state}
        saveClient={saveClient}
        deleteClient={deleteClient}
        loadClient={loadClient}
      />
      <NotesWidget />
    </div>
  );
}

export default App;
