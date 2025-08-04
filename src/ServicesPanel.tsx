import React, { useState } from 'react';

const ServicesPanel: React.FC = () => {
  const [openSection, setOpenSection] = useState<string | null>('fullstack');
  const toggleSection = (key: string) => setOpenSection(prev => (prev === key ? null : key));

  return (
    <div className="services-panel">
      <Section
        id="fullstack"
        title="01 Full-Stack Web Engineering"
        isOpen={openSection === 'fullstack'}
        onToggle={toggleSection}
      >
        <ul>
          <li>REST API design & integration</li>
          <li>Scalable application architecture with real-world deployment patterns</li>
          <li>Relational Database schema design, indexing strategy, migrations (Postgres, MySQL)</li>
          <li>Authentication/authorization, validation, security hardening</li>
          <li>Testing strategy: unit, integration, end-to-end for confidence in releases</li>
        </ul>
      </Section>

      <Section
        id="interactive"
        title="02 Interactive Web Experiences & 3D"
        isOpen={openSection === 'interactive'}
        onToggle={toggleSection}
      >
        <ul>
          <li>3D product configurators and e-commerce previews</li>
          <li>Educational simulations with seasonal/environmental transitions</li>
          <li>Custom data visualizations augmented with particle & scene effects</li>
          <li>Performance-conscious WebGL integration in web apps</li>
          <li>Interactive dashboards with dynamic feedback loops</li>
        </ul>
      </Section>

      <Section
        id="frontend"
        title="03 Frontend & UX Engineering"
        isOpen={openSection === 'frontend'}
        onToggle={toggleSection}
      >
        <ul>
          <li>Component-driven UI (React, Vue, design systems)</li>
          <li>Responsive layouts, accessibility compliance, cross-device consistency</li>
          <li>Hydration/SSR strategies, perceived performance optimization</li>
          <li>Animation & transition design to guide user attention</li>
          <li>Tool-like dashboards and control panels with clear affordances</li>
        </ul>
      </Section>

      <Section
        id="engineering"
        title="04 Software Engineering"
        isOpen={openSection === 'engineering'}
        onToggle={toggleSection}
      >
        <ul>
          <li>Design patterns & separation of concerns (SRP, modularity)</li>
          <li>Code quality practices: reviews, linters, typing, documentation</li>
          <li>Versioning & Git workflows, branching strategies</li>
          <li>Test automation and regression prevention</li>
          <li>Technical debt assessment and gradual remediation</li>
        </ul>
      </Section>

      <Section
        id="devops"
        title="05 DevOps & Infrastructure"
        isOpen={openSection === 'devops'}
        onToggle={toggleSection}
      >
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
  isOpen: boolean;
  onToggle: (key: string) => void;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ id, title, isOpen, onToggle, children }) => {
  return (
    <div className="section">
      <div className="section-toggle" onClick={() => onToggle(id)}>
        <div>{title}</div>
        <div>{isOpen ? '−' : '+'}</div>
      </div>
      {isOpen && <div className="section-content">{children}</div>}
    </div>
  );
};

export default ServicesPanel;