import React from 'react';

const ContactPanel: React.FC = () => {
  const contacts = [
    {
      name: 'Email',
      display: 'fenix3819@gmail.com',
      href: 'mailto:fenix3819@gmail.com',
      icon: (
        <svg
          className="contact-icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <title>Email</title>
          <path d="M3 6h18v12H3z" />
          <polyline points="3 6 12 13 21 6" />
        </svg>
      ),
    },
    {
      name: 'Phone',
      display: '+1 754 200 3163',
      href: 'tel:+17542003163',
      icon: (
        <svg
          className="contact-icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <title>Phone</title>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.13 19.5 19.5 0 0 1-6-6 19.86 19.86 0 0 1-3.13-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.81.33 1.6.62 2.35a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.72-.72a2 2 0 0 1 2.11-.45c.75.29 1.54.5 2.35.62A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
    },
    {
      name: 'GitHub',
      display: 'MarcosPimienta',
      href: 'https://github.com/MarcosPimienta',
      icon: (
        <svg
          className="contact-icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
          fill="currentColor"
        >
          <title>GitHub</title>
          <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.35-1.77-1.35-1.77-1.1-.75.08-.74.08-.74 1.22.09 1.86 1.25 1.86 1.25 1.08 1.84 2.83 1.31 3.52 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.4 1.25-3.25-.13-.31-.54-1.56.12-3.25 0 0 1.02-.33 3.34 1.25a11.64 11.64 0 0 1 6.08 0c2.31-1.58 3.33-1.25 3.33-1.25.66 1.69.25 2.94.12 3.25.78.85 1.25 1.93 1.25 3.25 0 4.63-2.8 5.66-5.48 5.96.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.28 0 .32.22.69.83.58A12 12 0 0 0 12 .5z" />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      display: 'marcospimienta',
      href: 'https://www.linkedin.com/in/marcospimienta',
      icon: (
        <svg
          className="contact-icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
          fill="currentColor"
        >
          <title>LinkedIn</title>
          <path d="M4.98 3.5a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5zm.02 6.75H2v11h3v-11zm7.5 0h-2.99v11h3v-5.9c0-3.16 4.07-3.4 4.07 0v5.9h3v-6.35c0-5.8-6.23-5.58-7.08-2.73v-1.92z" />
        </svg>
      ),
    },
    {
      name: 'YouTube',
      display: 'Demo',
      href: 'https://www.youtube.com/watch?v=CKgl7koJ_i0', // replace with actual demo link
      icon: (
        <svg
          className="contact-icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
          fill="currentColor"
        >
          <title>YouTube</title>
          <path d="M23.5 6.2a2.8 2.8 0 0 0-1.97-2c-1.75-.47-8.75-.47-8.75-.47s-7 0-8.75.47A2.8 2.8 0 0 0 .5 6.2 29.8 29.8 0 0 0 0 12a29.8 29.8 0 0 0 .5 5.8 2.8 2.8 0 0 0 1.97 2c1.75.47 8.75.47 8.75.47s7 0 8.75-.47a2.8 2.8 0 0 0 1.97-2A29.8 29.8 0 0 0 24 12a29.8 29.8 0 0 0-.5-5.8zm-14 11.3v-9l7 4.5-7 4.5z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="contact-panel">
      <h2>Contact</h2>
      <p>If you have any questions or just want to connect, please do not hesitate and reach out!.</p>
      <div className="contact-grid">
        {contacts.map(c => (
          <div key={c.name} className="contact-item">
            <div className="icon-wrapper">{c.icon}</div>
            <div className="contact-info">
              <div className="contact-label">{c.name}</div>
              <a
                href={c.href}
                className="contact-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {c.display}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactPanel;