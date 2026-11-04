import React from 'react';

export interface SectionProps {
  id: string;
  title: string;
  teaser?: React.ReactNode;
  isOpen: boolean;
  onToggle: (key: string) => void;
  children: React.ReactNode;
}

// Collapsible section. The toggle is a real <button> so it works with keyboard and screen readers.
const Section: React.FC<SectionProps> = ({ id, title, teaser, isOpen, onToggle, children }) => {
  return (
    <div className="section">
      <button
        type="button"
        className="section-toggle"
        onClick={() => onToggle(id)}
        aria-expanded={isOpen}
        aria-controls={`${id}-content`}
      >
        <span>{title}</span>
        <span aria-hidden="true">{isOpen ? '−' : '+'}</span>
      </button>
      {!isOpen && teaser && <div className="section-teaser">{teaser}</div>}
      {isOpen && (
        <div className="section-content" id={`${id}-content`}>
          {children}
        </div>
      )}
    </div>
  );
};

export default Section;
