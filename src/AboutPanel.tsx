import React from 'react';

const languagesAndTools = [
  'C/C++',
  'C#',
  'Python',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'HTML',
  'CSS',
  'Git',
  'Linux',
  '.NET',
  'Docker',
  'Kubernetes',
  'GCP',
];

const librariesAndFrameworks = [
  'Express.js',
  'Flask',
  'React',
  'Vue',
  'Babylon.js',
  'Three.js',
  'Bootstrap',
  'WebGL',
  'MySQL',
  'PostgreSQL',
];

const coreCSConcepts = [
  'Algorithms & Data Structures',
  'System Design & Scalability',
  'RESTful APIs',
  'Database Design & Indexing',
  'Object-Oriented Design',
  'Functional Programming',
  'Memory Management',
  'Computer Graphics',
];

interface ExperienceEntry {
  title: string;
  company: string;
  location: string;
  period: string;
  bullets: string[];
}

const experience: ExperienceEntry[] = [
  {
    title: 'Senior Software Engineer',
    company: 'AgroInnova',
    location: 'Miami, Florida',
    period: 'July 2023 – Present',
    bullets: [
      'Architected & developed a scalable web application for managing agricultural projects and investments.',
      'Integrated real-time weather data from WeatherAPI (temperature, humidity, etc.) to optimize farm productivity.',
      'Implemented financial analytics dashboards to track investments, expenses, and revenue across projects.',
      'Developed interactive 3D mapping features, allowing users to define and manage farm plots.',
    ],
  },
  {
    title: 'Software Engineer',
    company: '4Geeks Academy',
    location: 'Miami, Florida',
    period: 'February 2024 – August 2024',
    bullets: [
      'Led classroom sessions, ensuring timely completion of curricula and achievement of learning objectives.',
      'Enforced academic deadlines, enhancing student performance and adherence to schedules.',
      'Crafted and delivered detailed lesson plans, boosting comprehension and application of JavaScript, React, Python, Flask, Bootstrap.',
    ],
  },
  {
    title: 'Software Engineer',
    company: 'Nike',
    location: 'Beaverton, Oregon',
    period: 'June 2022 – July 2023',
    bullets: [
      'Developed in-house Python plugins for Adobe Substance Painter, streamlining asset pipelines.',
      'Generated CAD and BOM document templates integrating materials, colors, and footwear parts, improving resource tracking.',
      'Developed UI widgets using Qt/PyQt, enhancing front-end interactions with integrated tooling.',
    ],
  },
  {
    title: 'Software Engineer',
    company: 'Beastcode',
    location: 'Fort Walton Beach, Florida',
    period: 'July 2021 – June 2022',
    bullets: [
      'Developed and maintained a full-stack web application for AIFRL, simulating flight missions in a microservice environment using C++ and WebGL.',
      'Utilized Vue.js for user interfaces and C# to bridge proprietary 3D graphics engine features with backend systems.',
      'Designed APIs to receive and process heterogeneous data including raw text, video, and audio (WebRTC).',
    ],
  },
  {
    title: 'Front-end Engineer',
    company: 'Techstars',
    location: 'Boulder, Colorado',
    period: 'February 2021 – April 2021',
    bullets: [
      'Designed and implemented responsive, user-centric interfaces using HTML5, CSS3, and modern JavaScript (ES6+), ensuring cross-browser compatibility and accessibility.',
      'Engineered robust data integration between front-end apps and RESTful/GraphQL backends for real-time synchronization.',
      'Leveraged React.js and Vue.js to build interactive, maintainable web applications.',
    ],
  },
];

const AboutPanel: React.FC = () => {
  return (
    <div style={container}>
      <h1 style={header}>About</h1>

      <div style={scrollContainer}>
        {/* Profile */}
        <section style={section}>
          <h2 style={sectionTitle}>Profile</h2>
          <div style={profileContainer}>
            <div style={avatarPlaceholder}>👤</div>
            <div style={{ flex: 1 }}>
              <p style={paragraph}>
                Software Engineer with a proven track record of creating scalable, efficient solutions
                across web and cross-platform applications. Deeply experienced in full-stack development,
                real-time 3D rendering, and building performance-sensitive systems. Comfortable bridging
                design and engineering—holding a BSc in Media Arts & Animation—bringing both technical rigor
                and a refined aesthetic sensibility to product-focused software. Skilled at architecting
                systems for reliability, observability, and smooth user experiences, from cloud deployments
                to interactive graphics.
              </p>
            </div>
          </div>
        </section>

        {/* Skills */}
        <section style={section}>
          <h2 style={sectionTitle}>Skills</h2>
          <div style={skillsGrid}>
            <div style={skillColumn}>
              <h3 style={skillHeader}>Languages & Tools</h3>
              <ul style={skillList}>
                {languagesAndTools.map(s => (
                  <li key={s} style={skillItem}>{s}</li>
                ))}
              </ul>
            </div>
            <div style={skillColumn}>
              <h3 style={skillHeader}>Libraries & Frameworks</h3>
              <ul style={skillList}>
                {librariesAndFrameworks.map(s => (
                  <li key={s} style={skillItem}>{s}</li>
                ))}
              </ul>
            </div>
            <div style={skillColumn}>
              <h3 style={skillHeader}>Core CS Concepts</h3>
              <ul style={skillList}>
                {coreCSConcepts.map(s => (
                  <li key={s} style={skillItem}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Professional Experience */}
        <section style={section}>
          <h2 style={sectionTitle}>Professional Experience</h2>
          {experience.map(exp => (
            <div key={`${exp.company}-${exp.title}`} style={experienceEntry}>
              <div style={expHeader}>
                <div>
                  <strong>{exp.title}</strong> @ {exp.company}
                </div>
                <div style={expMeta}>
                  <span>{exp.period}</span>
                  <span style={{ margin: '0 6px' }}>•</span>
                  <span>{exp.location}</span>
                </div>
              </div>
              <ul style={bulletList}>
                {exp.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Education */}
        <section style={section}>
          <h2 style={sectionTitle}>Education</h2>
          <div style={educationEntry}>
            <div>
              <strong>Media Arts & Animation BSc</strong>, The Art Institute of Fort Lauderdale
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

// Styles
const container: React.CSSProperties = {
  padding: '1rem 1.25rem',
  maxWidth: '900px',
  height: '100vh',
  margin: '0 auto',
  fontFamily: 'system-ui,-apple-system,BlinkMacSystemFont,sans-serif',
  color: '#1f2937',
  lineHeight: 1.5,
  display: 'flex',
  flexDirection: 'column',
};

const header: React.CSSProperties = {
  fontSize: '2rem',
  marginBottom: '1rem',
  flexShrink: 0,
};

const scrollContainer: React.CSSProperties = {
  flexGrow: 1,
  paddingRight: '0.5rem',
};

const section: React.CSSProperties = {
  marginBottom: '2rem',
};

const sectionTitle: React.CSSProperties = {
  fontSize: '1.5rem',
  marginBottom: '0.75rem',
  borderBottom: '2px solid #e2e8f0',
  paddingBottom: '4px',
};

const profileContainer: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
  alignItems: 'flex-start',
};

const avatarPlaceholder: React.CSSProperties = {
  minWidth: '72px',
  minHeight: '72px',
  borderRadius: '50%',
  backgroundColor: '#f0f4f8',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.5rem',
};

const paragraph: React.CSSProperties = {
  margin: 0,
};

const skillsGrid: React.CSSProperties = {
  display: 'flex',
  gap: '2rem',
  flexWrap: 'wrap',
};

const skillColumn: React.CSSProperties = {
  flex: '1 1 220px',
  minWidth: '180px',
};

const skillHeader: React.CSSProperties = {
  marginBottom: '0.5rem',
  fontSize: '1.1rem',
};

const skillList: React.CSSProperties = {
  paddingLeft: '1rem',
  margin: 0,
};

const skillItem: React.CSSProperties = {
  marginBottom: '4px',
};

const experienceEntry: React.CSSProperties = {
  marginBottom: '1.5rem',
};

const expHeader: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '4px',
  fontSize: '1rem',
};

const expMeta: React.CSSProperties = {
  fontSize: '0.85rem',
  color: '#6b7280',
  display: 'flex',
  gap: '4px',
  alignItems: 'center',
  marginTop: '2px',
};

const bulletList: React.CSSProperties = {
  marginTop: '6px',
  paddingLeft: '1.2em',
};

const educationEntry: React.CSSProperties = {
  fontSize: '1rem',
};

export default AboutPanel;