import { Sparkles } from 'lucide-react';
import type { Resource, Skill } from '../../types/cms';
import { LoadingState, EmptyState, ErrorState } from '../admin/AdminStates';
import SectionHeader from './SectionHeader';

interface SkillsSectionProps {
  state: Resource<Skill[]>;
  onRetry: () => void;
}

function groupByCategory(skills: Skill[]): Map<string, Skill[]> {
  const groups = new Map<string, Skill[]>();
  for (const skill of skills) {
    const existing = groups.get(skill.category);
    if (existing) {
      existing.push(skill);
    } else {
      groups.set(skill.category, [skill]);
    }
  }
  return groups;
}

export default function SkillsSection({ state, onRetry }: SkillsSectionProps) {
  const groups = state.status === 'ready' ? groupByCategory(state.data) : new Map<string, Skill[]>();

  return (
    <section id="skills" className="max-w-7xl mx-auto px-6 py-20 md:py-30 scroll-mt-24">
      <SectionHeader eyebrow="Expertise" title="Skills & Technologies" />

      {state.status === 'loading' && <LoadingState label="Loading skills..." />}
      {state.status === 'error' && <ErrorState message={state.message} onRetry={onRetry} />}
      {state.status === 'ready' && state.data.length === 0 && (
        <EmptyState
          icon={<Sparkles size={20} />}
          title="No skills listed yet"
          description="Visible skills will appear here once they are added in the CMS."
        />
      )}
      {state.status === 'ready' && state.data.length > 0 && (
        <div className="space-y-8">
          {Array.from(groups.entries()).map(([category, skills]) => (
            <div key={category}>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-secondary mb-4">
                {category}
              </p>
              <div className="flex flex-wrap gap-3">
                {skills.map((skill) => (
                  <span
                    key={skill._id}
                    title={skill.level ? `Level: ${skill.level}` : skill.name}
                    className="px-4 py-2 rounded-lg glass-panel border border-border-color text-sm text-text-secondary hover:text-text-primary hover:border-accent-primary/40 transition-colors cursor-default"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
