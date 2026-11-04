import React, { useEffect, useState } from 'react';
import { getBasePath } from './config';

interface Props {
  isMobile: boolean;
  // Scene finished building: fade the poster out.
  ready: boolean;
  // 3D is downloading: show the progress pill.
  loading: boolean;
  // Set when 3D was skipped (data saver / slow connection): offers to load it anyway.
  onLoad3D?: () => void;
}

// A still render of the garden shown instantly, so visitors never stare at a blank screen while
// the 3D scene downloads. It fades out once the live scene is ready.
const LoadingOverlay: React.FC<Props> = ({ isMobile, ready, loading, onLoad3D }) => {
  const [gone, setGone] = useState(false);
  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => setGone(true), 900);
    return () => window.clearTimeout(t);
  }, [ready]);
  if (gone) return null;

  const poster = `${getBasePath()}/media/poster-${isMobile ? 'mobile' : 'desktop'}.jpg`;
  return (
    <>
      <div
        className={`loading-overlay ${ready ? 'fade' : ''}`}
        style={{ backgroundImage: `url(${poster})` }}
        aria-hidden="true"
      />
      {/* Separate top layer: the poster sits under the page, but the pill must stay tappable. */}
      {(loading || onLoad3D) && !ready && (
        <div className="loading-pill-layer">
          {loading && (
            <div className="loading-pill" role="status">
              <span>Loading 3D garden…</span>
              <span className="loading-bar"><span /></span>
            </div>
          )}
          {onLoad3D && (
            <button type="button" className="loading-pill load-3d" onClick={onLoad3D}>
              3D scene paused to save data · Load it
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default LoadingOverlay;
