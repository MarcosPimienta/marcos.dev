import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import ServicesPanel from './ServicesPanel';
import WorksPanel from './WorksPanel';
import AboutPanel from './AboutPanel';
import ContactPanel from './ContactPanel';
import MobileLayout from './MobileLayout';
import LoadingOverlay from './LoadingOverlay';
import CvButton from './CvButton';
import { SECTIONS, SectionId, seasonFor } from './sections';
import { profile } from './data/profile';

// The 3D scene (all of Babylon) is a separate chunk, so the page text doesn't wait for it.
const Scene3D = lazy(() => import('./Scene3D'));

const MOBILE_BREAKPOINT = 1000;

const useWindowWidth = () => {
  const [width, setWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return width;
};

// Skip the 3D scene when the visitor asked to save data or is on a very slow connection.
const prefersLightMode = () => {
  const c = (navigator as any).connection;
  return !!c && (c.saveData || ['slow-2g', '2g'].includes(c.effectiveType));
};

const panelFor = (id: SectionId) => {
  switch (id) {
    case 'works': return <WorksPanel />;
    case 'about': return <AboutPanel />;
    case 'services': return <ServicesPanel />;
    case 'contact': return <ContactPanel />;
  }
};

const App: React.FC = () => {
  const width = useWindowWidth();
  const isMobile = width <= MOBILE_BREAKPOINT;

  const [activeSection, setActiveSection] = useState<SectionId>('works');
  const [load3D, setLoad3D] = useState(() => !prefersLightMode());
  const [sceneReady, setSceneReady] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);
  const onSceneBuilt = useCallback(() => setSceneReady(true), []);

  const scene3D = load3D && (
    <div className="scene-layer">
      <Suspense fallback={null}>
        {/* Remount when switching between phone and desktop so camera framing is rebuilt. */}
        <Scene3D
          key={isMobile ? 'mobile' : 'desktop'}
          season={seasonFor(activeSection)}
          isMobile={isMobile}
          lowRes={isMobile && !heroVisible}
          onReady={onSceneBuilt}
        />
      </Suspense>
    </div>
  );

  const overlay = (
    <LoadingOverlay
      isMobile={isMobile}
      ready={sceneReady}
      loading={load3D && !sceneReady}
      onLoad3D={load3D ? undefined : () => setLoad3D(true)}
    />
  );

  if (isMobile) {
    return (
      <>
        {scene3D}
        {overlay}
        <MobileLayout
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onHeroVisible={setHeroVisible}
        />
      </>
    );
  }

  return (
    <div className="desktop-root">
      {scene3D}
      {overlay}
      <div className="panel-frame">
        <header className="panel-header">
          <div className="identity">
            <h1 className="name-title">{profile.name}</h1>
            <div className="tagline">{profile.tagline}</div>
          </div>
          <div className="header-actions">
            {profile.openToWork && <span className="open-badge">● Open to work</span>}
            <CvButton />
          </div>
        </header>
        <nav className="season-tabs" aria-label="Sections">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveSection(s.id)}
              className={`season-tab ${activeSection === s.id ? 'selected' : ''}`}
              aria-pressed={activeSection === s.id}
            >
              {s.label}
            </button>
          ))}
        </nav>
        <div className="panel-content scrollable-custom">{panelFor(activeSection)}</div>
      </div>
    </div>
  );
};

export default App;
