import { Season } from "./season";

// Each section of the site is tied to a season of the 3D garden.
// Desktop: picking a tab switches season. Mobile: scrolling into a section does.
export type SectionId = "works" | "about" | "services" | "contact";

export const SECTIONS: { id: SectionId; label: string; season: Season }[] = [
  { id: "works", label: "Works", season: Season.Spring },
  { id: "about", label: "About", season: Season.Summer },
  { id: "services", label: "Services", season: Season.Fall },
  { id: "contact", label: "Contact", season: Season.Winter },
];

export const seasonFor = (id: SectionId): Season =>
  SECTIONS.find((s) => s.id === id)!.season;
