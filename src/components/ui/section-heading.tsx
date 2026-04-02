type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="max-w-3xl space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300/80">{eyebrow}</p>
      <h2 className="font-display text-4xl uppercase tracking-[0.08em] text-stone-50 sm:text-5xl">{title}</h2>
      <p className="max-w-2xl text-sm leading-7 text-stone-300/80 sm:text-base">{description}</p>
    </div>
  );
}
