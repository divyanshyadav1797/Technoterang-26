import React from 'react';
import DecayCard from './react-bits/DecayCard';

const AISection = () => {
  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto min-h-[60vh] flex flex-col justify-center">
      
      <div className="mb-16">
        <h2 className="text-4xl font-semibold tracking-tighter text-[var(--text-primary)] mb-6">
          Silent Intelligence.
        </h2>
        <p className="text-lg text-[var(--text-secondary)] max-w-2xl leading-relaxed">
          The integrated AI tutor acts as an invisible observer. It analyzes group context, provides structural hints only when requested, and ensures sessions remain productive.
        </p>
      </div>

      <DecayCard className="rounded-sm">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-color)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent-color)]"></span>
              </div>
              <h3 className="text-sm font-medium tracking-widest text-[var(--text-primary)] uppercase">
                Focus Alerts
              </h3>
            </div>
            
            <div className="space-y-4 font-mono text-xs text-[var(--text-secondary)]">
              <p className="border-l border-[var(--border-color)] pl-4 py-1">
                <span className="text-[var(--text-primary)]">14:02</span> &mdash; System detecting cognitive drift.
              </p>
              <p className="border-l border-[var(--accent-color)] pl-4 py-1 text-[var(--accent-color)]">
                <span className="opacity-70">14:05</span> &mdash; Automated nudge initiated.
              </p>
              <p className="border-l border-[var(--border-color)] pl-4 py-1">
                <span className="text-[var(--text-primary)]">14:06</span> &mdash; Engagement levels restored to nominal.
              </p>
            </div>
          </div>

          <div className="flex-1 w-full border-t md:border-t-0 md:border-l border-[var(--border-color)] pt-8 md:pt-0 md:pl-8">
            <h3 className="text-sm font-medium tracking-widest text-[var(--text-primary)] uppercase mb-6">
              Contextual Hints
            </h3>
            <div className="p-4 border border-[var(--border-color)] bg-[var(--bg-color)]/50 rounded-sm">
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                "It appears the group is struggling with the derivative of ln(x). Consider reviewing the chain rule application."
              </p>
              <div className="flex justify-end">
                <button className="text-xs bg-[var(--text-primary)] text-[var(--bg-color)] px-3 py-1 hover:opacity-80 transition-opacity">
                  Inject Hint
                </button>
              </div>
            </div>
          </div>

        </div>
      </DecayCard>

    </section>
  );
};

export default AISection;
