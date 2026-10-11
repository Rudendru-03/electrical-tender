import type { ReactNode } from "react";

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:opacity-60";

const buttonVariants = {
  primary: "bg-amber-400 text-brand-950 hover:bg-amber-300",
  dark: "bg-brand-900 text-white hover:bg-brand-800",
  outline: "border border-brand-200 bg-white text-brand-900 hover:bg-brand-50",
  ghost: "border border-white/30 text-white hover:bg-white/10",
  whatsapp: "bg-emerald-600 text-white hover:bg-emerald-700",
};

export function buttonClass(variant: keyof typeof buttonVariants = "primary", className?: string): string {
  return cn(buttonBase, buttonVariants[variant], className);
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)}>{children}</div>;
}

export function Section({
  children,
  className,
  tone = "white",
  id,
}: {
  children: ReactNode;
  className?: string;
  tone?: "white" | "muted" | "dark";
  id?: string;
}) {
  const tones = {
    white: "bg-white",
    muted: "bg-brand-50",
    dark: "bg-brand-900 text-white",
  };
  return (
    <section id={id} className={cn("py-14 sm:py-20", tones[tone], className)}>
      <Container>{children}</Container>
    </section>
  );
}

export function SectionHeading({
  title,
  text,
  action,
  dark,
}: {
  title: string;
  text?: string;
  action?: ReactNode;
  dark?: boolean;
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <h2 className={cn("text-2xl font-semibold tracking-tight sm:text-3xl", dark ? "text-white" : "text-brand-900")}>
          {title}
        </h2>
        {text ? <p className={cn("mt-3 text-base", dark ? "text-brand-200" : "text-slate-600")}>{text}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function PageHero({ title, text, children }: { title: string; text?: string; children?: ReactNode }) {
  return (
    <div className="bg-brand-900 text-white">
      <Container className="py-12 sm:py-16">
        <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        {text ? <p className="mt-4 max-w-2xl text-base text-brand-200 sm:text-lg">{text}</p> : null}
        {children ? <div className="mt-6 flex flex-wrap gap-3">{children}</div> : null}
      </Container>
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-lg border border-slate-200 bg-white p-6", className)}>{children}</div>;
}
