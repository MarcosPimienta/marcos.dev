import React, { useEffect, useRef } from "react";
import { getBasePath } from "./config";

// Looping, muted project preview. Shows the poster immediately and only downloads/plays the
// video while it is on screen, so a long project list doesn't pull every video at once.
const ProjectMedia: React.FC<{ media: string; title: string }> = ({ media, title }) => {
  const ref = useRef<HTMLVideoElement>(null);
  const base = `${getBasePath()}/media/${media}`;

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className="project-media"
      src={`${base}.mp4`}
      poster={`${base}.jpg`}
      muted
      loop
      playsInline
      preload="none"
      aria-label={`${title} preview`}
    />
  );
};

export default ProjectMedia;
