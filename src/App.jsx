import React, { useState } from 'react';
import { useStudio } from './hooks/useStudio';
import ControlPanel from './components/Sidebar/ControlPanel';
import PreviewFrame from './components/Preview/PreviewFrame';
import BrandManagerModal from './components/Sidebar/BrandManagerModal';
import './App.css';

function App() {
  const { 
    state, 
    activeTpl,
    setActiveTemplate,
    setHero,
    setFg,
    setLogo,
    setGrade,
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
        '--brand-primary': `"${state.brandTheme.primaryFont}", sans-serif`,
        '--brand-secondary': `"${state.brandTheme.secondaryFont}", sans-serif`,
        '--brand-color-1': state.brandTheme.primaryColor,
        '--brand-color-2': state.brandTheme.secondaryColor,
      }}
    >
      <ControlPanel 
        state={state}
        activeTpl={activeTpl}
        setActiveTemplate={setActiveTemplate}
        setHero={setHero}
        setFg={setFg}
        setLogo={setLogo}
        setGrade={setGrade}
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
    </div>
  );
}

export default App;
