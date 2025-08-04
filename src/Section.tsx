import React from 'react';

export interface SectionProps {
  id: string;
  title: string;
  teaser?: React.ReactNode;
  isOpen: boolean;
  onToggle: (key: string) => void;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ id, title, teaser, isOpen, onToggle, children }) => {
  return (
    <div className="section">
      <div
        className="section-toggle"
        onClick={() => onToggle(id)}
        aria-expanded={isOpen}
        role="button"
        aria-controls={`${id}-content`}
      >
        <div>{title}</div>
        <div>{isOpen ? '−' : '+'}</div>
      </div>
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