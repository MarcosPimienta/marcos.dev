import React, { useState } from "react";
import Section from "./Section";
import { services } from "./data/services";

const ServicesPanel: React.FC = () => {
  const [openSection, setOpenSection] = useState<string | null>(services[0].id);
  const toggleSection = (key: string) =>
    setOpenSection((prev) => (prev === key ? null : key));

  return (
    <div className="services-panel">
      {services.map((s) => (
        <Section
          key={s.id}
          id={s.id}
          title={s.title}
          isOpen={openSection === s.id}
          onToggle={toggleSection}
        >
          <ul>
            {s.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>
      ))}
    </div>
  );
};

export default ServicesPanel;
