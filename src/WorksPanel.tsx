import React, { useState } from "react";
import Section from "./Section";
import ProjectMedia from "./ProjectMedia";
import { projects, Project } from "./data/projects";

const Tags: React.FC<{ stack: string[] }> = ({ stack }) => (
  <div className="tag-container">
    {stack.map((tech) => (
      <span key={tech} className="tag">
        {tech}
      </span>
    ))}
  </div>
);

const LiveLink: React.FC<{ url?: string }> = ({ url }) =>
  url ? (
    <a className="live-link" href={url} target="_blank" rel="noopener noreferrer">
      Live ↗
    </a>
  ) : null;

// Featured project: preview, one-line summary, tags and link up front; full write-up on demand.
const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  const [open, setOpen] = useState(false);
  const [name, subtitle] = project.title.split(" – ");
  return (
    <article className="project-card">
      <ProjectMedia media={project.media} title={name} />
      <div className="project-card-body">
        <h3>{name}</h3>
        {subtitle && <div className="project-subtitle">{subtitle}</div>}
        <p className="project-summary">{project.summary}</p>
        <div className="project-meta">
          <Tags stack={project.stack.slice(0, 4)} />
          <LiveLink url={project.url} />
        </div>
        <button type="button" className="details-toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? "Hide details" : "Details"}
        </button>
        {open && (
          <div className="project-details">
            <p className="project-description">{project.description}</p>
            <ul className="feature-list">
              {project.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <Tags stack={project.stack} />
          </div>
        )}
      </div>
    </article>
  );
};

const WorksPanel: React.FC = () => {
  const [openProjects, setOpenProjects] = useState<Set<string>>(new Set());
  const toggleProject = (id: string) =>
    setOpenProjects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const featured = projects.filter((p) => p.featured);
  const more = projects.filter((p) => !p.featured);

  return (
    <div className="works-panel">
      <h2 className="panel-heading">Selected work</h2>
      {featured.map((p) => (
        <ProjectCard key={p.title} project={p} />
      ))}

      <h2 className="panel-heading">More projects</h2>
      {more.map((project) => {
        const id = `more-${project.media}`;
        return (
          <Section
            key={id}
            id={id}
            title={project.title}
            teaser={<div>{project.summary}</div>}
            isOpen={openProjects.has(id)}
            onToggle={toggleProject}
          >
            <ProjectMedia media={project.media} title={project.title} />
            <p className="project-description">{project.description}</p>
            {project.url && (
              <p className="project-link">
                <LiveLink url={project.url} />
              </p>
            )}
            <ul className="feature-list">
              {project.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <Tags stack={project.stack} />
          </Section>
        );
      })}
    </div>
  );
};

export default WorksPanel;
