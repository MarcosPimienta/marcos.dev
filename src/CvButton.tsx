import React from 'react';
import { profile } from './data/profile';
import { getBasePath } from './config';

// Renders nothing until profile.cvPath points at a PDF in public/.
const CvButton: React.FC<{ className?: string }> = ({ className = 'cv-button' }) =>
  profile.cvPath ? (
    <a className={className} href={`${getBasePath()}/${profile.cvPath}`} download>
      ⬇ CV
    </a>
  ) : null;

export default CvButton;
