// Portfolio projects shown in Works (desktop panel and mobile page).
// media: base name of public/media/<media>.mp4 (looping preview) and <media>.jpg (poster).
// featured: shown under "Selected work"; the rest go under "More projects".
export interface Project {
  title: string;
  summary: string;
  featured: boolean;
  media: string;
  description: string;
  url?: string;
  features: string[];
  stack: string[];
}

export const projects: Project[] = [
  {
    title: "Café Amantti – Coffee Platform: 3D Store, Customer Portal & Back Office",
    summary: "The full platform behind a Colombian specialty coffee brand: 3D storefront, subscriptions, e-invoicing, inventory and finance.",
    featured: true,
    media: "CafeAmantti",
    url: "https://www.cafeamantti.com/",
    description:
      "Designed and built from scratch as Café Amantti's full-stack engineer. One platform runs the online store, the customer portal and the back-office system the company uses for sales, inventory, purchasing and finance. On the storefront, each roast is a 3D bag model shoppers can rotate and inspect before choosing weight and grind.",
    features: [
      "☕ 3D product carousel: one glTF bag model per roast (Premium, Honey Process, Chiroso), drag to rotate",
      "🛒 Online store with subscriptions, ePayco payments, order tracking and WhatsApp notifications",
      "🧾 Siigo integration for DIAN e-invoicing, plus credit notes, purchases, customer receipts and sales import",
      "📦 Lot-based inventory ledger (Kardex) from parchment and green coffee through hulling, roasting and packaging; a PostgreSQL trigger derives stock from inventory movements",
      "💰 Finance: cash flow, P&L, receivables and payables, loans, fixed assets, and automated bank reconciliation from PDF, Excel and CSV statements",
      "🤝 PDF quotes and proposals, a client CRM with multi-site accounts, and tracking of espresso machines loaned to corporate clients",
      "🌎 Bilingual (Spanish/English), 94 versioned database migrations and 900+ automated tests",
    ],
    stack: ["Next.js", "React", "Three.js", "PostgreSQL", "ePayco", "Siigo API", "glTF"],
  },
  {
    title: "EmberForge3D – Interactive 3D Product Configurator",
    summary: "3D product configurator with real-time modular assembly and a simulated scope view.",
    featured: true,
    media: "EmberForge3D",
    description:
      "A web-based 3D product configurator for the firearms industry. Users assemble a build part by part in real time, inspect every component in 3D, and look through a configured optic in a simulated scope view, all backed by a typed API and relational data model.",
    url: "https://emberforge3d.com/v2",
    features: [
      "🧩 Real-time modular assembly: parts snap onto socket markers, with a state machine handling nested attachments and blocking incompatible combinations",
      "🔭 Optical simulation mode: look through the configured scope with reticles, magnification-scaled markings, and targets sized to real distance",
      "⚡ Performance: Draco-compressed assets with WebAssembly decoding, on-demand rendering, and a capped pixel ratio for mobile",
      "🎨 Visuals: PBR materials, SSAO, bloom, and selection outlines",
      "🛠️ Blender-to-glTF asset pipeline with calibrated reticles",
    ],
    stack: [
      "React",
      "React Three Fiber",
      "Three.js",
      "TypeScript",
      "Express",
      "Prisma",
      "PostgreSQL",
      "Blender",
    ],
  },
  {
    title: "Sigil & Script – Event Invitation & Guest Management Suite",
    summary: "Invitation designer, guest roster and seating planner in one workspace.",
    featured: true,
    media: "SigilAndScript",
    description:
      "An event-planning tool that replaces a handful of disconnected apps with one workspace. Hosts design an interactive invitation, manage guests and RSVPs, and plan seating, with design, guest, and seating data kept in sync.",
    url: "https://sigil-and-script-frontend.vercel.app/",
    features: [
      "✉️ Live invitation designer with a custom wax seal rendered at runtime",
      "👪 Guest roster with families and dependents, CSV import, and per-guest RSVP links",
      "🪑 Drag-and-drop seating planner with a printable seating manifest",
      "🤝 Co-host roles for shared event management",
      "🔐 Rate limiting and row-level security",
    ],
    stack: [
      "React",
      "TypeScript",
      "Node.js",
      "Prisma",
      "Supabase",
      "PostgreSQL",
    ],
  },
  {
    title: "Amantti Weather Insight – 3D Geospatial Weather Monitoring",
    summary: "3D geospatial weather monitoring for coffee-sourcing regions in Antioquia.",
    featured: true,
    media: "WeatherDisplayApp",
    description:
      "A full-stack visualization platform for real-time weather monitoring of coffee-sourcing regions in Antioquia. The system combines a robust Python microservice for data analysis with an immersive CesiumJS 3D frontend to render rainfall, humidity, and cloud cover directly on the terrain.",
    features: [
      "🌍 3D Interactive Map: CesiumJS & Vue 3 with switchable layers and town-level zoom",
      "⛈️ Real-Time Visualization: Dynamic overlays for Rain, Humidity, and Cloud Cover",
      "🚀 High-Performance Backend: FastAPI + Asyncio service for anomaly detection",
      "📊 Insight Dashboard: Glassmorphism UI panel with regional statistics and active alerts",
      "💾 Historical Tracking: SQLite storage for analyzing weather trends",
    ],
    url: "https://amantti-weather-service.vercel.app/",
    stack: [
      "Vue 3",
      "CesiumJS",
      "TypeScript",
      "Python",
      "FastAPI",
      "SQLAlchemy",
    ],
  },
  {
    title: "React Holographic Cube",
    summary: "Cyberpunk-styled 3D spinning cube component for React, published on npm.",
    featured: false,
    media: "HoloCube",
    description:
      "A high-performance, cyberpunk-styled 3D spinning cube for React. Features physics-based friction, holographic visuals, and a floating drift animation when idle. Now supports dynamic colors per item, custom physics, full style overrides, and configurable environments!",
    url: "https://www.npmjs.com/package/react-holographic-cube",
    features: [
      "🎨 Dynamic Item Colors",
      "🕹️ Physics Control",
      "🏗️ Configurable Environment",
      "🖼️ Transparent Background",
      "⚛️ React Component Integration",
    ],
    stack: ["React", "Three.js", "TypeScript", "Npm"],
  },
  {
    title: "Hexxo Bingo – Bingo Live Event Configurator",
    summary: "Electron app for running live bingo events across host, director and audience screens.",
    featured: false,
    media: "NumbersBoardDisplay",
    description:
      "An Electron-based platform designed to professionalize Bingo game hosting. It separates concerns between the Host (operator), Director (flow control), and Audience (projector/TV displays). The app manages the entire lifecycle of an event: from configuring asset packages (.hexxo files) to running the game logic, validating winning cards, and handling tie-breaks.",
    features: [
      "🎛️ Multi-Window Architecture",
      "📜 Playbook Flow Engine",
      "📦 .hexxo Package System",
      "🔍 Automated Verification",
      "🎰 Integrated Interactive Tools",
    ],
    stack: ["Electron", "React", "TypeScript", "Node.js", "Vite", "CSS"],
  },
  {
    title: "GomitasAngel – 3D Candy E-commerce Simulator",
    summary: "3D candy-box customizer with a multi-step checkout.",
    featured: false,
    media: "GomitasAngel",
    description:
      "An interactive app designed to enhance online shopping by merging 3D visualizations with a user-friendly shopping cart and checkout experience. The goal was to create an immersive way for users to select and customize their candy boxes, giving them a more hands-on feel of the product before making a purchase.",
    url: "https://marcospimienta.github.io/GomitasAngel/",
    features: [
      "🎮 Interactive 3D Visuals",
      "🎨 Customizable Checkout",
      "🛒 Multi-Step Modal",
      "🏗️ Flexible Architecture",
    ],
    stack: ["Vue.js", "Babylon.js", "TypeScript"],
  },
  {
    title: "Sabelotodo – Trivia Board Game",
    summary: "Multiplayer 3D trivia board game about software technologies.",
    featured: false,
    media: "3D-Sabelotodo",
    description:
      "A fun and interactive game where players move around a board by answering trivia questions from various categories based on software technologies. The goal is to answer questions from all categories correctly and reach the end of the board to win the game.",
    url: "https://marcospimienta.github.io/sabelotodo/",
    features: [
      "🎮 Multiplayer gameplay",
      "❓ Trivia questions from multiple software development categories",
      "🎡 Roulette wheel for category selection",
      "🏆 Winner determination based on correctly answered categories and board positions",
    ],
    stack: ["React", "Three.js", "Cannon.js", "TypeScript"],
  },
  {
    title: "Legal Process Lookup Tool – Civil Case Search App",
    summary: "Search tool for civil cases filed in Colombian courts.",
    featured: false,
    media: "LawsuitTracker",
    description:
      "A web application designed to help individuals identify whether civil lawsuits have been filed against them by the organizers behind a misleading coding bootcamp. The tool aims to improve access to legal information for affected parties, especially in cases where official notifications have been poorly delivered or overlooked.",
    url: "https://marcospimienta.github.io/lawsuit-tracker/",
    features: [
      "🔍 Quick search by legal subject name",
      "🗂 Advanced filtering by filing and last activity dates",
      "📅 Pagination to browse large sets of results",
      "📄 Clear, detailed information for each legal case",
    ],
    stack: ["React", "TypeScript", "Colombian Judiciary API"],
  },
  {
    title: "UPC Product Weight Fetcher – Multi-API Batch Lookup Tool",
    summary: "Python CLI that enriches product spreadsheets with data from several UPC APIs.",
    featured: false,
    media: "UPCWeightFetcher",
    description:
      "A command-line Python tool designed to fetch and enrich product data such as shipping weight, title, brand, and more, using various APIs including RedCircle, UPCItemDB, and Go-UPC. The app is tailored for users who need to process bulk UPC or product data from Excel files and export enriched results with clear annotations.",
    features: [
      "📁 Import Excel sheets with custom header row and sheet selection",
      "🧠 Smart column mapping and selection of fields to retain",
      "🔁 Multi-API support with throttle control to avoid rate limits",
      "📦 Extracts weight, brand, title, description, and more",
      "🖍 Highlights incomplete or fully empty records in output",
      "📂 Auto-saves output files to organized folders by API",
    ],
    stack: [
      "Python",
      "Pandas",
      "OpenPyXL",
      "Inquirer",
      "RedCircle API",
      "UPCItemDB API",
      "Go-UPC API",
    ],
  },
  {
    title: "Techstars SPA for Scheduling & Feedback",
    summary: "Scheduling and survey-feedback app for Techstars mentor meetings.",
    featured: false,
    media: "MentorSurvey",
    description:
      "A complete Single Page Application built in React for the Techstars program to manage mentor-company meetings, collect structured survey feedback, and visualize performance through an interactive dashboard. The app supports CSV-based meeting generation, real-time survey tracking, and administrative scheduling tools.",
    features: [
      "🔐 Auth0-protected login for Techstars staff access",
      "📅 CSV-based drag-and-drop meeting scheduler with downloadable templates",
      "🕒 Interactive timetable for mentor-company meetings with advanced filters",
      "📝 Dynamic survey submission with POST/PUT requests, card flipping, and progress bar",
      "📊 Dashboard with real-time survey tracking, performance charts, and reminder email triggers",
      "👤 Personalized mentor/company survey interfaces with rating sliders and feedback textarea",
      "📥 Editable mentor lists with add/drop functionality for program adaptability",
    ],
    stack: ["React", "Node.js", "Express", "PostgreSQL", "Auth0", "Ant Design"],
  },
];
