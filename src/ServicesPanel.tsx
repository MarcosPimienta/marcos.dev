import React, { useState } from 'react';

const ServicesPanel: React.FC = () => {
  const [openSection, setOpenSection] = useState<string | null>('fullstack');

  const toggleSection = (key: string) => {
    setOpenSection(prev => (prev === key ? null : key));
  };

  return (
    <div style={{ margin: '0.5em', display: 'flex', flexDirection: 'column', gap: '1em', minHeight: 0 }}>
      <h2>Services</h2>
      <p>
        I specialize in building high-impact digital systems by combining robust engineering,
        modern infrastructure, immersive interactive experiences, and thoughtful frontend design.
        The focus is on scalable, maintainable products that delight users and solve real problems.
      </p>

      {/* Full-Stack Web Engineering */}
      <Section
        id="fullstack"
        title="01 Full-Stack Web Engineering"
        teaser="End-to-end systems built for scale and real-world usage"
        isOpen={openSection === 'fullstack'}
        onToggle={toggleSection}
      >
        <p>
          I build complete web platforms from the ground up—bridging frontend, backend, and data so they
          work as a cohesive, resilient whole.
        </p>
        <ul>
          <li>API design & integration (REST, GraphQL, third-party connectors)</li>
          <li>Scalable application architecture with real-world deployment patterns</li>
          <li>Database schema design, indexing strategy, migrations (Postgres, MySQL, etc.)</li>
          <li>Authentication/authorization, validation, security hardening</li>
          <li>Testing strategy: unit, integration, end-to-end for confidence in releases</li>
        </ul>
      </Section>

      {/* 3D & Interactive Web Experiences */}
      <Section
        id="interactive"
        title="02 3D & Interactive Web Experiences"
        teaser="Immersive interfaces that blend data and visuals"
        isOpen={openSection === 'interactive'}
        onToggle={toggleSection}
      >
        <p>
          Using Babylon.js, Three.js, and real-time rendering techniques to turn abstract data and concepts
          into tactile, interactive experiences that users remember.
        </p>
        <ul>
          <li>3D product configurators and e-commerce previews</li>
          <li>Educational simulations with seasonal/environmental transitions</li>
          <li>Custom data visualizations augmented with particle & scene effects</li>
          <li>Performance-conscious WebGL integration in web apps</li>
          <li>Interactive dashboards with dynamic feedback loops</li>
        </ul>
      </Section>

      {/* UI/UX & Frontend Engineering */}
      <Section
        id="frontend"
        title="03 Frontend & UX Engineering"
        teaser="Responsive, accessible, and polished user interfaces"
        isOpen={openSection === 'frontend'}
        onToggle={toggleSection}
      >
        <p>
          Interfaces that feel intuitive and perform under pressure. Design decisions grounded in clarity,
          accessibility, and responsiveness.
        </p>
        <ul>
          <li>Component-driven UI (React, Vue, design systems)</li>
          <li>Responsive layouts, accessibility compliance, cross-device consistency</li>
          <li>Hydration/SSR strategies, perceived performance optimization</li>
          <li>Animation & transition design to guide user attention</li>
          <li>Tool-like dashboards and control panels with clear affordances</li>
        </ul>
      </Section>

      {/* Software Engineering */}
      <Section
        id="engineering"
        title="04 Software Engineering"
        teaser="Clean architecture, maintainability, and long-term health"
        isOpen={openSection === 'engineering'}
        onToggle={toggleSection}
      >
        <p>
          Beyond building features, I structure systems so they endure: readable, testable, evolvable codebases
          with engineering discipline baked in.
        </p>
        <ul>
          <li>Design patterns & separation of concerns (SRP, modularity)</li>
          <li>Code quality practices: reviews, linters, typing, documentation</li>
          <li>Versioning & Git workflows, branching strategies</li>
          <li>Test automation and regression prevention</li>
          <li>Technical debt assessment and gradual remediation</li>
        </ul>
      </Section>

      {/* DevOps & Infrastructure */}
      <Section
        id="devops"
        title="05 DevOps & Infrastructure"
        teaser="Reliable deployment, observability, and environment hygiene"
        isOpen={openSection === 'devops'}
        onToggle={toggleSection}
      >
        <p>
          Systems that stay up and evolve safely: from local dev fidelity to production observability and
          automated delivery.
        </p>
        <ul>
          <li>Containerization (Docker) and orchestration (Kubernetes patterns)</li>
          <li>CI/CD pipeline design for repeatable, low-friction releases</li>
          <li>Cloud deployments (GCP/AWS) with cost-aware scaling</li>
          <li>Logging, metrics, and alerting for proactive observability</li>
          <li>Environment reliability (local staging, reproducible dev setups, WSL/VSCode troubleshooting)</li>
        </ul>
      </Section>
    </div>
  );
};

interface SectionProps {
  id: string;
  title: string;
  teaser: string;
  isOpen: boolean;
  onToggle: (key: string) => void;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ id, title, teaser, isOpen, onToggle, children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div
        onClick={() => onToggle(id)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          background: '#f0f0f0',
          padding: '0.5em 1em',
          border: '1px solid #ccc',
          borderRadius: '4px',
        }}
      >
        <div style={{ fontWeight: 'bold' }}>{title}</div>
        <div style={{ fontSize: '1.2em' }}>{isOpen ? '−' : '+'}</div>
      </div>
      {!isOpen && (
        <div style={{ fontSize: '0.9em', color: '#555', margin: '0.3em 0 0.5em 0.8em' }}>
          {teaser}
        </div>
      )}
      {isOpen && (
        <div
          style={{
            padding: '0.75em 1em',
            borderLeft: '3px solid #4cafef',
            background: '#fff',
            marginTop: '0.5em',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default ServicesPanel;