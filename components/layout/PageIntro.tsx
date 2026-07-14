import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SoftButton } from "@/components/ui/SoftButton";

export type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
  backLink?: string;
  backLabel?: string;
};

export function PageIntro({
  eyebrow,
  title,
  description,
  backLink,
  backLabel = "返回入口"
}: PageIntroProps) {
  return (
    <header className="page-intro">
      {backLink ? (
        <SoftButton asChild variant="secondary" className="mb-7 w-fit">
          <Link href={backLink}>
            <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
            {backLabel}
          </Link>
        </SoftButton>
      ) : null}
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="display-title mt-3">{title}</h1>
      <p className="page-intro-description">{description}</p>
      <div className="page-intro-rule" aria-hidden="true" />
    </header>
  );
}
