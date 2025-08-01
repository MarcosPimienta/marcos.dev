import React from 'react';
import { getBasePath } from './config';

const basePath = getBasePath();

const projects = [
  {
    title: 'GomitasAngel – 3D Candy E-commerce Simulator',
    mediaType: 'gif',
    src: `${basePath}/gifs/GomitasAngel.gif`,
    description: 'An interactive app designed to enhance online shopping by merging 3D visualizations with a user-friendly shopping cart and checkout experience. The goal was to create an immersive way for users to select and customize their candy boxes, giving them a more hands-on feel of the product before making a purchase.',
    url: 'https://marcospimienta.github.io/GomitasAngel/',
    features: [
      '🎮 Interactive 3D Visuals',
      '🎨 Customizable Checkout',
      '🛒 Multi-Step Modal',
      '🏗️ Flexible Architecture'
    ],
    stack: ['Vue.js', 'Babylon.js', 'TypeScript'],
  },
  {
    title: 'Sabelotodo – Trivia Board Game',
    mediaType: 'gif',
    src: `${basePath}/gifs/3D-Sabelotodo.gif`,
    description: 'A fun and interactive game where players move around a board by answering trivia questions from various categories based on software technologies. The goal is to answer questions from all categories correctly and reach the end of the board to win the game.',
    url: 'https://marcospimienta.github.io/sabelotodo/',
    features: [
      '🎮 Multiplayer gameplay',
      '❓ Trivia questions from multiple software development categories',
      '🎡 Roulette wheel for category selection',
      '🏆 Winner determination based on correctly answered categories and board positions'
    ],
    stack: ['React', 'Three.js', 'Cannon.js', 'TypeScript'],
  },
  {
    title: 'Legal Process Lookup Tool – Civil Case Search App',
    mediaType: 'gif', // or 'gif' if you have a recording
    src: `${basePath}/gifs/LawsuitTracker.gif`,
    description: 'A web application designed to help individuals identify whether civil lawsuits have been filed against them by the organizers behind a misleading coding bootcamp. The tool aims to improve access to legal information for affected parties, especially in cases where official notifications have been poorly delivered or overlooked.',
    url: 'https://marcospimienta.github.io/lawsuit-tracker/',
    features: [
      '🔍 Quick search by legal subject name',
      '🗂 Advanced filtering by filing and last activity dates',
      '📅 Pagination to browse large sets of results',
      '📄 Clear, detailed information for each legal case'
    ],
    stack: ['React', 'TypeScript', 'Colombian Judiciary API'],
  },
  {
    title: "UPC Product Weight Fetcher – Multi-API Batch Lookup Tool",
    mediaType: "gif",
    src: `${basePath}/gifs/UPCWeightFetcher.gif`,
    description: "A command-line Python tool designed to fetch and enrich product data such as shipping weight, title, brand, and more, using various APIs including RedCircle, UPCItemDB, and Go-UPC. The app is tailored for users who need to process bulk UPC or product data from Excel files and export enriched results with clear annotations.",
    features: [
      "📁 Import Excel sheets with custom header row and sheet selection",
      "🧠 Smart column mapping and selection of fields to retain",
      "🔁 Multi-API support with throttle control to avoid rate limits",
      "📦 Extracts weight, brand, title, description, and more",
      "🖍 Highlights incomplete or fully empty records in output",
      "📂 Auto-saves output files to organized folders by API"
    ],
    stack: ["Python", "Pandas", "OpenPyXL", "Inquirer", "RedCircle API", "UPCItemDB API", "Go-UPC API"]
  },
  {
    title: 'Techstars SPA for Scheduling & Feedback',
    mediaType: 'gif', // or 'gif' if you have a recording
    src: `${basePath}/gifs/MentorSurvey.gif`,
    description: 'A complete Single Page Application built in React for the Techstars program to manage mentor-company meetings, collect structured survey feedback, and visualize performance through an interactive dashboard. The app supports CSV-based meeting generation, real-time survey tracking, and administrative scheduling tools.',
    features: [
      '🔐 Auth0-protected login for Techstars staff access',
      '📅 CSV-based drag-and-drop meeting scheduler with downloadable templates',
      '🕒 Interactive timetable for mentor-company meetings with advanced filters',
      '📝 Dynamic survey submission with POST/PUT requests, card flipping, and progress bar',
      '📊 Dashboard with real-time survey tracking, performance charts, and reminder email triggers',
      '👤 Personalized mentor/company survey interfaces with rating sliders and feedback textarea',
      '📥 Editable mentor lists with add/drop functionality for program adaptability',
    ],
    stack: [
      'React',
      'Node.js',
      'Express',
      'PostgreSQL',
      'Auth0',
      'Ant Design',
    ]
  },
  {
    title: 'Anime Foliage – Seasonal Interactive 3D Scene',
    mediaType: 'gif', // or 'gif' if you have a recording
    src: `${basePath}/gifs/AnimeFoliage.gif`,
    url: 'https://marcospimienta.github.io/anime-foliage/',
    description: 'An immersive WebGL/React application that simulates seasonal foliage transitions—spring blossoms, summer greens, fall red leaves, and winter snow—using instanced geometry, particle systems, and custom shading to create a stylized, animated environment.',
    features: [
      '🌸 Spring petal bloom powered by JSON-configured particle systems',
      '🍁 Fall red and green leaf instancing with smooth transitions',
      '❄️ Winter snow with customizable particle effects and glittery PBR material',
      '🌿 Procedural instancing of leaves, flowers, and grass based on mesh face centers and normals',
      '🎨 Custom materials: cell-shaded tree, watercolor post-process, and snow glitter/shimmer effects',
      '⛅ Dynamic skybox and lighting that tween between seasons',
    ],
    stack: [ 'React', 'Reactylon', 'TypeScript', 'Babylon.js', 'Blender', 'GLSL', 'WebGL' ],
  },
];

const WorksPanel: React.FC = () => {
  return (
    <div style={{
      margin: '0.5em',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5em',
      maxHeight: 'calc(100vh - 6em)',
      paddingRight: '0.5em',
    }}>
      <h2>Works</h2>
      {projects.map((project, index) => (
        <div key={index} style={cardStyle}>
          <h3>{project.title}</h3>

          {project.mediaType === 'video' ? (
            <video
              src={project.src}
              controls
              muted
              playsInline
              loop
              style={{ width: '100%', borderRadius: '0.5em', marginTop: '0.5em' }}
            />
          ) : (
            <img
              src={project.src}
              alt={project.title}
              style={{ width: '100%', borderRadius: '0.5em', marginTop: '0.5em' }}
            />
          )}

          <p style={{ marginTop: '0.75em' }}>{project.description}</p>
          {project.url && (
            <p style={{ marginTop: '0.5em' }}>
              <strong>Link:</strong>{' '}
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0066cc', textDecoration: 'underline' }}
              >
                View deployed version
              </a>
            </p>
          )}
          <ul style={featureListStyle}>
            {project.features.map((feature, i) => (
              <li key={i}>{feature}</li>
            ))}
          </ul>

          <div style={tagContainerStyle}>
            {project.stack.map((tech, i) => (
              <span key={i} style={tagStyle}>{tech}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  padding: '1em',
  borderRadius: '0.5em',
  border: '1px solid #ddd',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
};

const featureListStyle: React.CSSProperties = {
  marginTop: '0.75em',
  paddingLeft: '1.2em',
  listStyleType: 'none',
  color: '#333',
};

const tagContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5em',
  marginTop: '0.75em',
};

const tagStyle: React.CSSProperties = {
  backgroundColor: '#e0f2ff',
  padding: '0.3em 0.6em',
  borderRadius: '999px',
  fontSize: '0.85em',
};

export default WorksPanel;
