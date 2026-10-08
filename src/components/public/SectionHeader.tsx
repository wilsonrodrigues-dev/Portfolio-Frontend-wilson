interface SectionHeaderProps {
  eyebrow: string;
  title: string;
}

export default function SectionHeader({ eyebrow, title }: SectionHeaderProps) {
  return (
    <div className="mb-10 md:mb-14">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent-secondary mb-3">
        {eyebrow}
      </p>
      <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary">{title}</h2>
    </div>
  );
}
