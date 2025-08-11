import React, { useState } from 'react';
import Section from './Section';

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
  'Unity',
  'Unreal Engine',
  'Blender',
  '3D Studio Max',
  'Maya',
  'Adobe Creative Suite',
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
  {
    title: 'Software Engineer',
    company: 'Tangible Design',
    location: 'Medellin, Colombia',
    period: 'September 2019 – November 2019',
    bullets: [
      'Programmed and enhanced features in existing AR/VR interior design apps, implementing interactive elements and refining user workflows for more intuitive spatial visualization.',
      'Collaborated with designers and 3D artists to integrate high-quality models and textures, optimizing performance for mobile and standalone VR platforms.',
      'Maintained AR/VR applications by upgrading frameworks/SDKs, resolving integration and compatibility issues, and preserving stable performance across target devices.',
      'Produced and organized clear technical documentation, including architecture overviews, integration guides, and update/onboarding procedures for developers and stakeholder.',
    ],
  },
  {
    title: 'Project Manager & Blockchain Consultant',
    company: 'Hexocoin',
    location: 'Medellin, Colombia',
    period: 'Octuber 2017 – September 2019',
    bullets: [
      'Oversaw deployment, tuning, and maintenance of ASIC/GPU rigs, managing cooling, power, uptime, firmware updates, and physical/network security.',
      'Negotiated and managed power procurement and usage, implemented load balancing and efficiency improvements, and forecasted capacity to maximize hash rate per watt and ROI.',
      'Advised clients on blockchain architecture, protocol selection, smart contracts, tokenomics, and governance, conducting due diligence to align implementations with regulatory and business objectives.',
    ],
  },
  {
    title: 'Game Developer & 3D/2D Animator',
    company: 'Linea de Conexión',
    location: 'Medellin, Colombia',
    period: 'January 2016 – December 2017',
    bullets: [
      'Programmed and enhanced features in existing AR/VR interior design apps, implementing interactive elements and refining user workflows for more intuitive spatial visualization.',
      'Maintained AR/VR applications by upgrading frameworks/SDKs, resolving integration and compatibility issues, and preserving stable performance across target devices.',
      'Produced and organized clear technical documentation, including architecture overviews, integration guides, and update/onboarding procedures for developers and stakeholder.',
      'Developed 3D models, textures, animations, and visual effects for games and interactive media using Blender, 3D Studio Max, and Maya.',
      'Collaborated with designers and developers to integrate assets into Unity and Unreal Engine, optimizing performance and ensuring visual fidelity across platforms.',
      'Created 2D animations and motion graphics for promotional materials, UI elements, and in-game effects using Adobe After Effects and Photoshop.',
      'Participated in brainstorming sessions to conceptualize game mechanics, storylines, and user experiences, contributing to the overall creative direction of projects.',
    ],
  },
  {
    title: 'Animation Instructor',
    company: 'Academia Superior de Artes',
    location: 'Medellin, Colombia',
    period: 'July 2014 – June 2017',
    bullets: [
      'Developed and delivered curriculum for 2D/3D animation and digital media using Photoshop, Illustrator, Flash, After Effects, Premiere, and Maya, blending theory with hands-on projects.',
      'Mentored and evaluated student work, giving actionable feedback to improve technical execution, storytelling, and portfolio readiness.',
      'Maintained and configured lab environments and software installations to ensure reliable access to animation tools during instruction.',
      'Coordinated student showcases and cross-disciplinary projects to simulate real-world production workflows and support career preparation.',
    ],
  },
  {
    title: '3D Animator & Motion Designer',
    company: 'Moviola',
    location: 'Los Angeles, California',
    period: 'September 2013 – April 2014',
    bullets: [
      'Created and refined 3D character models with accurate topology optimized for animation.',
      'Rigged characters and props in NewTek LightWave for realistic and responsive movement.',
      'Cleaned and polished motion capture data in Autodesk MotionBuilder to achieve fluid, lifelike animations.',
      'Developed cinematic scenes in Luxology Modo, optimizing lighting, materials, and camera work for final renders.',
      'Composited and edited animated sequences in Adobe After Effects and Premiere, ensuring seamless integration of 3D and live-action footage.'
    ],
  }
];

const AboutPanel: React.FC = () => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    profile: true,
    skills: false,
    experience: false,
    education: false,
  });

  const toggleSection = (key: string) =>
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="about-panel">
      <div className="scroll-container scrollable-custom">
        <Section
          id="profile"
          title="Profile"
          isOpen={openSections.profile}
          onToggle={toggleSection}
          teaser={
            <div className="paragraph">
              Full-Stack Developer & 3D Web Enthusiast bringing together innovation and efficiency.
            </div>
          }
        >
          <div className="profile-container">
            <div style={{ flex: 1 }}>
              <p className="paragraph">
                Full-Stack Developer & 3D Web Enthusiast Bringing together innovation and
                efficiency to craft high-impact web applications, immersive 3D experiences, and
                scalable digital solutions.
              </p>
            </div>
          </div>
        </Section>

        <Section
          id="skills"
          title="Skills"
          isOpen={openSections.skills}
          onToggle={toggleSection}
          teaser={
            <div>
              Languages, frameworks, and core computer science concepts.
            </div>
          }
        >
          <div className="skills-grid">
            <div className="skill-column">
              <h3 className="skill-header">Languages & Tools</h3>
              <ul className="skill-list">
                {languagesAndTools.map(s => (
                  <li key={s} className="skill-item">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="skill-column">
              <h3 className="skill-header">Libraries & Frameworks</h3>
              <ul className="skill-list">
                {librariesAndFrameworks.map(s => (
                  <li key={s} className="skill-item">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="skill-column">
              <h3 className="skill-header">Core CS Concepts</h3>
              <ul className="skill-list">
                {coreCSConcepts.map(s => (
                  <li key={s} className="skill-item">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        <Section
          id="experience"
          title="Professional Experience"
          isOpen={openSections.experience}
          onToggle={toggleSection}
          teaser={<div>Work history across roles and domains.</div>}
        >
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
        </Section>

        <Section
          id="education"
          title="Education"
          isOpen={openSections.education}
          onToggle={toggleSection}
          teaser={<div>Academic background.</div>}
        >
          <div className="education-entry">
            <div>
              <strong>Media Arts & Animation BSc</strong>, The Art Institute of Fort Lauderdale
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
};

export default AboutPanel;