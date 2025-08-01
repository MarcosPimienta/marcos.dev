import React, { useState } from 'react';

const ServicesPanel: React.FC = () => {
  const [openSection, setOpenSection] = useState<string | null>('fullstack');

  const toggleSection = (key: string) => {
    setOpenSection(prev => (prev === key ? null : key));
  };

  return (
    <div style={{ margin: '0.5em', display: 'flex', flexDirection: 'column', gap: '1em' }}>
      <h2>Services</h2>
      <p>
        I specialize in building full-stack web applications that are interactive, visually engaging, and user-centered.
        With strong skills in both front-end and back-end technologies, I bring ideas to life—whether it’s a playful learning
        tool, a 3D shopping experience, or a custom project for a startup or community. I’m passionate about creating digital
        experiences that not only work well, but also inspire curiosity and connection.
      </p>

      {/* Full-Stack Development */}
      <Section
        id="fullstack"
        title="01 Full-Stack Development"
        teaser="Scalable web apps with modern stacks"
        isOpen={openSection === 'fullstack'}
        onToggle={toggleSection}
      >
        <p>
          From frontend interactions to backend APIs, I build complete web solutions.
          I work with modern stacks to deliver apps that are scalable, maintainable, and tailored to real-world use cases.
        </p>
        <ul>
          <li>React, Vue, Node.js, Express.js</li>
          <li>REST APIs, GCP, AWS, Docker</li>
          <li>Git, GitHub, Postman</li>
        </ul>
      </Section>

      {/* UI/UX & Frontend */}
      <Section
        id="frontend"
        title="02 UI/UX & Frontend"
        teaser="Responsive, accessible, intuitive interfaces"
        isOpen={openSection === 'frontend'}
        onToggle={toggleSection}
      >
        <p>
          Design is more than looks — it’s about clarity and connection.
          I develop responsive, accessible interfaces that enhance user experience across devices and screen sizes.
        </p>
        <ul>
          <li>Next.js, TailwindCSS, GSAP</li>
          <li>Figma, Illustrator, Photoshop</li>
          <li>HTML, CSS, JavaScript</li>
        </ul>
      </Section>

      {/* Software Engineering */}
      <Section
        id="engineering"
        title="03 Software Engineering"
        teaser="Robust architecture and clean, scalable code"
        isOpen={openSection === 'engineering'}
        onToggle={toggleSection}
      >
        <p>
          I bring a strong engineering mindset to every project I build. From component architecture to scalable deployment,
          I focus on maintainability, performance, and real-world problem solving.
        </p>
        <ul>
          <li>Scalable architectures, MVC/MVVM patterns</li>
          <li>TypeScript, Git workflows, unit & integration testing</li>
          <li>PostgreSQL, SQLite, CI/CD pipelines, Terraform, Docker</li>
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
    <div>
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
        <div style={{
          padding: '0.75em 1em',
          borderLeft: '3px solid #4cafef',
          background: '#fff',
          marginTop: '0.5em',
        }}>
          {children}
        </div>
      )}
    </div>
  );
};

export default ServicesPanel;