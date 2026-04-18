import React from 'react';
import SpotlightCard from './react-bits/SpotlightCard';

const FeatureGrid = () => {
  const features = [
    {
      id: "01",
      title: "Time-Boxed Focus",
      desc: "Structured, uninterrupted study intervals designed to maximize retention and minimize cognitive fatigue."
    },
    {
      id: "02",
      title: "Public Rooms",
      desc: "Open discovery spaces. Join active sessions across global campuses instantly."
    },
    {
      id: "03",
      title: "Private Enclaves",
      desc: "Secure, invite-only environments for dedicated group projects and exam preparation."
    },
    {
      id: "04",
      title: "Micro-Rewards",
      desc: "Earn reputation and tangible perks by successfully explaining complex concepts to peers."
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-12 border-b border-[var(--border-color)] pb-4">
        <h2 className="text-sm font-medium tracking-widest text-[var(--text-secondary)] uppercase">
          Capabilities
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--border-color)]">
        {features.map((feature, i) => (
          <SpotlightCard key={i} className="bg-[var(--bg-color)] rounded-none p-10 h-full !border-0">
            {/* Override spotlight gradient via internal style update if possible, 
                or just let SpotlightCard default. In our minimalist request, we wanted faint yellow. 
                SpotlightCard hardcodes var(--accent-color), which is now #FFCA3A.
                We will force the opacity in CSS or rely on the dark mode theme. */}
            <div className="flex flex-col h-full justify-between">
              <span className="text-xs font-mono text-[var(--text-secondary)] mb-8">
                {feature.id}
              </span>
              <div>
                <h3 className="text-2xl font-semibold tracking-tighter mb-4 text-[var(--text-primary)]">
                  {feature.title}
                </h3>
                <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
                  {feature.desc}
                </p>
              </div>
            </div>
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
};

export default FeatureGrid;
