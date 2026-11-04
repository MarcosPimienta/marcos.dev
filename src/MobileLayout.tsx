import React, { useEffect, useRef, useState } from 'react';
import WorksPanel from './WorksPanel';
import AboutPanel from './AboutPanel';
import ServicesPanel from './ServicesPanel';
import ContactPanel from './ContactPanel';
import { SECTIONS, SectionId } from './sections';
import { profile } from './data/profile';
import CvButton from './CvButton';

interface Props {
  activeSection: SectionId;
  onSectionChange: (id: SectionId) => void;
  onHeroVisible: (visible: boolean) => void;
}

const titles: Record<SectionId, string> = {
  works: 'Selected work',
  about: 'About',
  services: 'Services',
  contact: "Let's talk",
};

const panels: Record<SectionId, React.ReactNode> = {
  works: <WorksPanel />,
  about: <AboutPanel />,
  services: <ServicesPanel />,
  contact: <ContactPanel />,
};

// Phone layout: one scrolling page over the fixed 3D scene. The section crossing the middle of
// the screen becomes active, which changes the season behind it.
const MobileLayout: React.FC<Props> = ({ activeSection, onSectionChange, onHeroVisible }) => {
  const heroRef = useRef<HTMLElement>(null);
  const [inHero, setInHero] = useState(true);

  useEffect(() => {
    const ids: (SectionId | 'hero')[] = ['hero', ...SECTIONS.map(s => s.id)];
    let timer: number | undefined;
    const io = new IntersectionObserver(
      entries => {
        const hit = entries.find(e => e.isIntersecting);
        if (!hit) return;
        const id = hit.target.id as SectionId | 'hero';
        setInHero(id === 'hero');
        // The hero shares the Works season. Debounce so a fast scroll doesn't start a
        // season transition for every section it passes.
        window.clearTimeout(timer);
        timer = window.setTimeout(() => onSectionChange(id === 'hero' ? 'works' : id), 350);
      },
      { rootMargin: '-50% 0px -50% 0px' }
    );
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => {
      window.clearTimeout(timer);
      io.disconnect();
    };
  }, [onSectionChange]);

  // Is any of the hero (i.e. the open view of the scene) still on screen?
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => onHeroVisible(e.intersectionRatio > 0.25), {
      threshold: [0, 0.25, 0.5, 1],
    });
    io.observe(el);
    return () => io.disconnect();
  }, [onHeroVisible]);

  const goTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="m-page">
      <header className="m-header">
        <div className="m-header-row">
          <span className="m-name">{profile.name}</span>
          <CvButton className="m-cv" />
        </div>
        <nav className="m-nav" aria-label="Sections">
          {SECTIONS.map(s => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={goTo(s.id)}
              className={!inHero && activeSection === s.id ? 'on' : ''}
              aria-current={!inHero && activeSection === s.id ? 'true' : undefined}
            >
              {s.label}
            </a>
          ))}
        </nav>
      </header>

      <main>
        <section id="hero" ref={heroRef} className="m-hero">
          <span className="m-built">Live 3D · Babylon.js</span>
          {profile.openToWork && <span className="open-badge">● Open to work</span>}
          <h1>{profile.tagline}</h1>
          <p>{profile.pitch}</p>
          <div className="m-ctas">
            <a href="#works" onClick={goTo('works')} className="m-btn primary">See my work</a>
            <a href="#contact" onClick={goTo('contact')} className="m-btn ghost">Contact</a>
          </div>
          <div className="m-hint">Scroll: the garden changes season as you go ⌄</div>
        </section>

        {SECTIONS.map(s => (
          <section key={s.id} id={s.id} className="m-section">
            <h2 className="m-title">{titles[s.id]}</h2>
            {panels[s.id]}
          </section>
        ))}
        <footer className="m-footer">© {new Date().getFullYear()} {profile.name}</footer>
      </main>
    </div>
  );
};

export default MobileLayout;
