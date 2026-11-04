import React from 'react';
import { profile } from './data/profile';
import { getBasePath } from './config';

const icons = {
  email: (
    <svg className="contact-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18v12H3z" />
      <polyline points="3 6 12 13 21 6" />
    </svg>
  ),
  github: (
    <svg className="contact-icon" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.35-1.77-1.35-1.77-1.1-.75.08-.74.08-.74 1.22.09 1.86 1.25 1.86 1.25 1.08 1.84 2.83 1.31 3.52 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.4 1.25-3.25-.13-.31-.54-1.56.12-3.25 0 0 1.02-.33 3.34 1.25a11.64 11.64 0 0 1 6.08 0c2.31-1.58 3.33-1.25 3.33-1.25.66 1.69.25 2.94.12 3.25.78.85 1.25 1.93 1.25 3.25 0 4.63-2.8 5.66-5.48 5.96.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.28 0 .32.22.69.83.58A12 12 0 0 0 12 .5z" />
    </svg>
  ),
  linkedin: (
    <svg className="contact-icon" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M4.98 3.5a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5zm.02 6.75H2v11h3v-11zm7.5 0h-2.99v11h3v-5.9c0-3.16 4.07-3.4 4.07 0v5.9h3v-6.35c0-5.8-6.23-5.58-7.08-2.73v-1.92z" />
    </svg>
  ),
  youtube: (
    <svg className="contact-icon" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M23.5 6.2a2.8 2.8 0 0 0-1.97-2c-1.75-.47-8.75-.47-8.75-.47s-7 0-8.75.47A2.8 2.8 0 0 0 .5 6.2 29.8 29.8 0 0 0 0 12a29.8 29.8 0 0 0 .5 5.8 2.8 2.8 0 0 0 1.97 2c1.75.47 8.75.47 8.75.47s7 0 8.75-.47a2.8 2.8 0 0 0 1.97-2A29.8 29.8 0 0 0 24 12a29.8 29.8 0 0 0-.5-5.8zm-14 11.3v-9l7 4.5-7 4.5z" />
    </svg>
  ),
};

const contacts = [
  { name: 'Email', display: profile.email, href: `mailto:${profile.email}`, icon: icons.email },
  { name: 'LinkedIn', display: profile.linkedin, href: `https://www.linkedin.com/in/${profile.linkedin}`, icon: icons.linkedin },
  { name: 'GitHub', display: profile.github, href: `https://github.com/${profile.github}`, icon: icons.github },
  { name: 'YouTube', display: profile.reel.label, href: profile.reel.url, icon: icons.youtube },
];

const ContactPanel: React.FC = () => (
  <div className="contact-panel">
    <p>Have a project in mind or a role to talk about? I'd love to hear from you.</p>
    <div className="contact-grid">
      {contacts.map((c) => (
        <div key={c.name} className="contact-item">
          <div className="icon-wrapper">{c.icon}</div>
          <div className="contact-info">
            <div className="contact-label">{c.name}</div>
            <a
              href={c.href}
              className="contact-link"
              {...(c.href.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
            >
              {c.display}
            </a>
          </div>
        </div>
      ))}
    </div>
    {profile.cvPath && (
      <a className="cta-button" href={`${getBasePath()}/${profile.cvPath}`} download>
        ⬇ Download CV
      </a>
    )}
  </div>
);

export default ContactPanel;
