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

// One project as a collapsible section: title + one-line summary when closed;
// preview video, link, features and stack when opened. Everything starts closed.
const ProjectSection: React.FC<{
  project: Project;
  isOpen: boolean;
  onToggle: (id: string) => void;
}> = ({ project, isOpen, onToggle }) => (
  <Section
    id={`project-${project.media}`}
    title={project.title}
    teaser={<div>{project.summary}</div>}
    isOpen={isOpen}
    onToggle={onToggle}
  >
    <ProjectMedia media={project.media} title={project.title} />
    <p className="project-description">{project.description}</p>
    {project.url && (
      <p className="project-link">
        <a className="live-link" href={project.url} target="_blank" rel="noopener noreferrer">
          Live ↗
        </a>
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
  const render = (p: Project) => (
    <ProjectSection
      key={p.media}
      project={p}
      isOpen={openProjects.has(`project-${p.media}`)}
      onToggle={toggleProject}
    />
  );

  return (
    <div className="works-panel">
      <h2 className="panel-heading">Selected work</h2>
      {featured.map(render)}
      <h2 className="panel-heading">More projects</h2>
      {more.map(render)}
    </div>
  );
};

export default WorksPanel;
