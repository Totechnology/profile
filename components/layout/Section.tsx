import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

export function Section({
  id,
  label,
  title,
  description,
  children,
  className
}: {
  id: string;
  label: string;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("container-space scroll-mt-28 py-16 md:py-24", className)}>
      <Reveal>
        <div className="mb-8 max-w-3xl md:mb-10">
          <p className="mono mb-4 text-xs text-primary">{label}</p>
          <h2 className="text-3xl font-semibold leading-tight text-foreground md:text-5xl">{title}</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">{description}</p>
        </div>
      </Reveal>
      {children}
    </section>
  );
}
