import React, { useRef, useState } from 'react';
import AboutPanel from './AboutPanel';
import ServicesPanel from './ServicesPanel';
import ContactPanel from './ContactPanel';
import ProjectMedia from './ProjectMedia';
import { SECTIONS, SectionId } from './sections';
import { profile } from './data/profile';
import { projects, Project } from './data/projects';
import CvButton from './CvButton';

interface Props {
  activeSection: SectionId;
  onSectionChange: (id: SectionId) => void;
  // Kept for App's interface: the scene stays in view on phones now, so this is always true.
  onHeroVisible?: (visible: boolean) => void;
}

// "Café Amantti – Coffee Platform: …" → name "Café Amantti", subtitle "Coffee Platform: …"
const splitTitle = (title: string) => {
  const [name, ...rest] = title.split(' – ');
  return { name, subtitle: rest.join(' – ') };
};

// One project in the swipeable row: preview, name, summary, and links.
const ProjectCard: React.FC<{ project: Project; onDetails: () => void }> = ({ project, onDetails }) => {
  const { name, subtitle } = splitTitle(project.title);
  return (
    <article className="m-card">
      <ProjectMedia media={project.media} title={project.title} />
      <div className="m-card-body">
        <h3>{name}</h3>
        {subtitle && <div className="m-card-sub">{subtitle}</div>}
        <p>{project.summary}</p>
        <div className="m-card-actions">
          <button type="button" className="m-chip" onClick={onDetails}>Details</button>
          {project.url && (
            <a className="m-chip ghost" href={project.url} target="_blank" rel="noopener noreferrer">
              Live ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
};

// Full description of one project, shown in the panel in place of the row.
const ProjectDetails: React.FC<{ project: Project; onBack: () => void }> = ({ project, onBack }) => {
  const { name, subtitle } = splitTitle(project.title);
  return (
    <div className="m-detail">
      <button type="button" className="m-back" onClick={onBack}>‹ All projects</button>
      <h3>{name}</h3>
      {subtitle && <div className="m-card-sub">{subtitle}</div>}
      <p className="project-description">{project.description}</p>
      {project.url && (
        <p className="project-link">
          <a className="live-link" href={project.url} target="_blank" rel="noopener noreferrer">Live ↗</a>
        </p>
      )}
      <ul className="feature-list">
        {project.features.map(f => <li key={f}>{f}</li>)}
      </ul>
      <div className="tag-container">
        {project.stack.map(t => <span key={t} className="tag">{t}</span>)}
      </div>
    </div>
  );
};

// Works on phones: a horizontal, swipeable row of project cards (featured first).
const WorksRow: React.FC = () => {
  const ordered = [...projects.filter(p => p.featured), ...projects.filter(p => !p.featured)];
  const [index, setIndex] = useState(0);
  const [details, setDetails] = useState<Project | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const scrollPos = useRef(0);

  const onScroll = () => {
    const row = rowRef.current;
    const card = row?.firstElementChild as HTMLElement | null;
    if (!row || !card) return;
    scrollPos.current = row.scrollLeft;
    setIndex(Math.round(row.scrollLeft / (card.offsetWidth + 12)));
  };

  if (details) {
    return <ProjectDetails project={details} onBack={() => {
      setDetails(null);
      // Return to the card the visitor came from.
      requestAnimationFrame(() => rowRef.current?.scrollTo({ left: scrollPos.current }));
    }} />;
  }
  return (
    <>
      <div className="m-count" aria-live="polite">
        {Math.min(index + 1, ordered.length)} / {ordered.length}
        <span aria-hidden="true"> · swipe for more</span>
      </div>
      <div className="m-carousel" ref={rowRef} onScroll={onScroll}>
        {ordered.map(p => <ProjectCard key={p.media} project={p} onDetails={() => setDetails(p)} />)}
      </div>
    </>
  );
};

// Phone layout: the garden fills the screen and keeps the top half clear for the tree; the
// content sits in a panel along the bottom. Tapping a section tab switches the content and
// the season (like the desktop tabs); scrolling never changes the season.
const MobileLayout: React.FC<Props> = ({ activeSection, onSectionChange }) => {
  const body: Record<SectionId, React.ReactNode> = {
    works: <WorksRow />,
    about: <AboutPanel />,
    services: <ServicesPanel />,
    contact: <ContactPanel />,
  };

  return (
    <div className="m-app">
      <header className="m-top">
        <div className="m-id">
          <span className="m-name">{profile.name}</span>
          <span className="m-tagline">{profile.tagline}</span>
        </div>
        <div className="m-top-actions">
          {profile.openToWork && <span className="open-badge">● Open to work</span>}
          <CvButton className="m-cv" />
        </div>
      </header>

      <div className="m-spacer" aria-hidden="true" />

      <section className="m-sheet" aria-label="Portfolio">
        <nav className="m-tabs" aria-label="Sections">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              type="button"
              className={`m-tab ${activeSection === s.id ? 'on' : ''}`}
              aria-pressed={activeSection === s.id}
              onClick={() => onSectionChange(s.id)}
            >
              {s.label}
            </button>
          ))}
        </nav>
        <div className={`m-body ${activeSection === 'works' ? 'is-works' : ''}`} key={activeSection}>
          {body[activeSection]}
        </div>
      </section>
    </div>
  );
};

export default MobileLayout;
