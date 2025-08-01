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
    <div className="about-panel">
      <h1>MARCOS PIMIENTA</h1>
      <div className="scroll-container">
        {/* Profile */}
        <section className="section">
          <h2 className="section-title">Profile</h2>
          <div className="profile-container">
            {/* <div className="avatar-placeholder">👤</div> */}
            <div style={{ flex: 1 }}>
              <p className="paragraph">
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
        <section className="section">
          <h2 className="section-title">Skills</h2>
          <div className="skills-grid">
            <div className="skill-column">
              <h3 className="skill-header">Languages & Tools</h3>
              <ul className="skill-list">
                {languagesAndTools.map(s => (
                  <li key={s} className="skill-item">{s}</li>
                ))}
              </ul>
            </div>
            <div className="skill-column">
              <h3 className="skill-header">Libraries & Frameworks</h3>
              <ul className="skill-list">
                {librariesAndFrameworks.map(s => (
                  <li key={s} className="skill-item">{s}</li>
                ))}
              </ul>
            </div>
            <div className="skill-column">
              <h3 className="skill-header">Core CS Concepts</h3>
              <ul className="skill-list">
                {coreCSConcepts.map(s => (
                  <li key={s} className="skill-item">{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Experience */}
        <section className="section">
          <h2 className="section-title">Professional Experience</h2>
          {experience.map(exp => (
            <div key={`${exp.company}-${exp.title}`} className="experience-entry">
              <div className="exp-header">
                <div>
                  <strong>{exp.title}</strong> @ {exp.company}
                </div>
                <div className="exp-meta">
                  <span>{exp.period}</span>
                  <span style={{ margin: '0 6px' }}>•</span>
                  <span>{exp.location}</span>
                </div>
              </div>
              <ul className="bullet-list">
                {exp.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Education */}
        <section className="section">
          <h2 className="section-title">Education</h2>
          <div className="education-entry">
            <div>
              <strong>Media Arts & Animation BSc</strong>, The Art Institute of Fort Lauderdale
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPanel;