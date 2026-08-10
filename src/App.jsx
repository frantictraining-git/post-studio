import React, { useState, useCallback, useRef } from 'react';import { useStudio } from './hooks/useStudio';
import { useProjects } from './hooks/useProjects';
import ControlPanel from './components/Sidebar/ControlPanel';
import PreviewFrame from './components/Preview/PreviewFrame';
import BrandManagerModal from './components/Sidebar/BrandManagerModal';
import NotesWidget from './components/Notes/NotesWidget';
import ProjectsPanel from './components/Projects/ProjectsPanel';
import './App.css';

// Default heading text — don't auto-save until it's been changed
const DEFAULT_HEADING = 'YOUR HEADING';

function App() {
  const { 
    state, 
    activeTpl,
    setActiveTemplate,
    setHero, setFg, setLogo, setOverlay,
    setZoneText, setZoneStyle, setSelectedZoneId,
    addTextZone, removeTextZone,
    setBrandTheme, saveClient, deleteClient, loadClient,
    toggleSnap, loadProject, setCurrentProject, startNewProject,
    TEMPLATE_DEFAULTS,
  } = useStudio();

  const [isBrandManagerOpen, setIsBrandManagerOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // null | 'saving' | 'saved' | 'error'

  const { projects, loading: projectsLoading, saveProject, deleteProject } = useProjects(state.activeClient);

  // ── Refs so doSave always has fresh values ──
  const activeTplRef = useRef(activeTpl);
  activeTplRef.current = activeTpl;
  const stateRef = useRef(state);
  stateRef.current = state;

  // ── Core save function ──────────────────────────────────────────
  const doSave = useCallback(async () => {
    const tpl = activeTplRef.current;
    const st  = stateRef.current;

    const name = st.currentProjectName || (tpl?.zones?.heading?.text || '').trim() || 'Untitled Post';

    setSaveStatus('saving');
    try {
      const snapshot = {
        hero:     { ...tpl.hero },
        fg:       { ...tpl.fg },
        logo:     { ...tpl.logo },
        overlay:  { ...tpl.overlay },
        zones:    JSON.parse(JSON.stringify(tpl.zones)),
        category: tpl.category || null,
      };
      const newId = await saveProject(
        st.currentProjectId,
        name,
        st.activeClient || 'default',
        snapshot,
      );
      setCurrentProject(newId, name);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 2500);
    } catch (err) {
      console.error('Save failed:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 4000);
    }
  }, [saveProject, setCurrentProject]);

  // ── Load project ────────────────────────────────────────────────
  const handleLoadProject = useCallback((project) => {
    loadProject(project.id, project.name, project.templateState);
  }, [loadProject]);

  const handleDeleteProject = useCallback(async (id) => {
    await deleteProject(id);
  }, [deleteProject]);

  return (
    <div 
      className="app-container"
      style={{
        '--brand-primary': `"${state.brandTheme.primaryFont || 'Minal'}", sans-serif`,
        '--brand-secondary': `"${state.brandTheme.secondaryFont || 'Montserrat'}", sans-serif`,
        '--brand-color-1': state.brandTheme.brandColor1 || state.brandTheme.primaryColor1 || '#F3F8F1',
        '--brand-color-2': state.brandTheme.brandColor2 || state.brandTheme.primaryColor2 || '#A28242',
        '--brand-color-3': state.brandTheme.brandColor3 || state.brandTheme.primaryColor3 || '#000000',
        '--brand-color-4': state.brandTheme.brandColor4 || state.brandTheme.secondaryColor1 || '#FFFFFF',
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
        addTextZone={addTextZone}
        removeTextZone={removeTextZone}
        setBrandTheme={setBrandTheme}
        saveClient={saveClient}
        loadClient={loadClient}
        TEMPLATE_DEFAULTS={TEMPLATE_DEFAULTS}
        onOpenBrandManager={() => setIsBrandManagerOpen(true)}
        toggleSnap={toggleSnap}
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
        setZoneStyle={setZoneStyle}
        TEMPLATE_DEFAULTS={TEMPLATE_DEFAULTS}
        onSave={doSave}
        onOpenProjects={() => setIsProjectsOpen(true)}
        onNewProject={startNewProject}
        onRenameProject={(newName) => setCurrentProject(state.currentProjectId, newName)}
        saveStatus={saveStatus}
        currentProjectName={state.currentProjectName}
      />
      <BrandManagerModal 
        isOpen={isBrandManagerOpen}
        onClose={() => setIsBrandManagerOpen(false)}
        state={state}
        saveClient={saveClient}
        deleteClient={deleteClient}
        loadClient={loadClient}
      />
      <ProjectsPanel
        isOpen={isProjectsOpen}
        onClose={() => setIsProjectsOpen(false)}
        projects={projects}
        loading={projectsLoading}
        onLoad={handleLoadProject}
        onDelete={handleDeleteProject}
        currentProjectId={state.currentProjectId}
        client={state.activeClient}
      />
      <NotesWidget />
    </div>
  );
}

export default App;
