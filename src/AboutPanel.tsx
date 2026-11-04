import React, { useState } from "react";
import Section from "./Section";
import {
  profileText,
  languagesAndTools,
  librariesAndFrameworks,
  coreCSConcepts,
  experience,
  education,
  RECENT_ROLES,
  ExperienceEntry,
} from "./data/about";

const Role: React.FC<{ exp: ExperienceEntry }> = ({ exp }) => (
  <div className="experience-entry">
    <div className="exp-header">
      <div>
        <strong>{exp.title}</strong> @ {exp.company}
      </div>
      <div className="exp-meta">
        <span>{exp.period}</span>
        <span style={{ margin: "0 6px" }}>•</span>
        <span>{exp.location}</span>
      </div>
    </div>
    <ul className="bullet-list">
      {exp.bullets.map((b, i) => (
        <li key={i}>{b}</li>
      ))}
    </ul>
  </div>
);

const AboutPanel: React.FC = () => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    profile: true,
    experience: true,
    skills: false,
    education: false,
  });
  const [showEarlier, setShowEarlier] = useState(false);
  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const recent = experience.slice(0, RECENT_ROLES);
  const earlier = experience.slice(RECENT_ROLES);

  return (
    <div className="about-panel">
      <Section id="profile" title="Profile" isOpen={openSections.profile} onToggle={toggleSection}>
        <p className="paragraph">{profileText}</p>
      </Section>

      <Section
        id="experience"
        title="Experience"
        isOpen={openSections.experience}
        onToggle={toggleSection}
        teaser={<div>{recent.map((e) => e.company).join(" · ")}</div>}
      >
        {recent.map((exp) => (
          <Role key={`${exp.company}-${exp.period}`} exp={exp} />
        ))}
        {earlier.length > 0 && (
          <>
            <button
              type="button"
              className="details-toggle"
              aria-expanded={showEarlier}
              onClick={() => setShowEarlier((s) => !s)}
            >
              {showEarlier
                ? "Hide earlier roles"
                : `Earlier roles: ${earlier.map((e) => e.company).join(", ")}`}
            </button>
            {showEarlier &&
              earlier.map((exp) => <Role key={`${exp.company}-${exp.period}`} exp={exp} />)}
          </>
        )}
      </Section>

      <Section
        id="skills"
        title="Skills"
        isOpen={openSections.skills}
        onToggle={toggleSection}
        teaser={<div>Languages, frameworks, and core computer science concepts.</div>}
      >
        <div className="skills-grid">
          {(
            [
              ["Languages & Tools", languagesAndTools],
              ["Libraries & Frameworks", librariesAndFrameworks],
              ["Core CS Concepts", coreCSConcepts],
            ] as [string, string[]][]
          ).map(([header, list]) => (
            <div className="skill-column" key={header}>
              <h3 className="skill-header">{header}</h3>
              <ul className="skill-list">
                {list.map((s) => (
                  <li key={s} className="skill-item">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="education"
        title="Education"
        isOpen={openSections.education}
        onToggle={toggleSection}
        teaser={<div>{education.degree}</div>}
      >
        <div className="education-entry">
          <strong>{education.degree}</strong>, {education.school}
        </div>
      </Section>
    </div>
  );
};

export default AboutPanel;
