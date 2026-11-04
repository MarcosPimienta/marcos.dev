// What you offer. Each group renders as a collapsible section.
export const services: { id: string; title: string; items: string[] }[] = [
  {
    id: "interactive",
    title: "Interactive Web Experiences & 3D",
    items: [
      "3D product configurators and e-commerce previews",
      "Interactive 3D maps with geospatial layers and data integration",
      "Educational simulations with seasonal/environmental transitions",
      "Custom data visualizations augmented with particle & scene effects",
      "Performance-conscious WebGL integration in web apps",
    ],
  },
  {
    id: "fullstack",
    title: "Full-Stack Web Engineering",
    items: [
      "REST API design & integration",
      "Scalable application architecture with real-world deployment patterns",
      "Relational database schema design, indexing strategy, migrations (Postgres, MySQL)",
      "Authentication/authorization, validation, security hardening",
      "Testing strategy: unit, integration, end-to-end for confidence in releases",
    ],
  },
  {
    id: "frontend",
    title: "Frontend & UX Engineering",
    items: [
      "Component-driven UI (React, Vue, design systems)",
      "Responsive layouts, accessibility compliance, cross-device consistency",
      "Hydration/SSR strategies, perceived performance optimization",
      "Animation & transition design to guide user attention",
      "Tool-like dashboards and control panels with clear affordances",
    ],
  },
  {
    id: "engineering",
    title: "Software Engineering",
    items: [
      "Design patterns & separation of concerns (SRP, modularity)",
      "Code quality practices: reviews, linters, typing, documentation",
      "Versioning & Git workflows, branching strategies",
      "Test automation and regression prevention",
      "Technical debt assessment and gradual remediation",
    ],
  },
];
