import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const opportunities = [
  {
    index: "01",
    title: "Join Our Team",
    description:
      "We're building ambitious products and need ambitious people. Engineers, designers, writers, strategists — if you move fast and care about craft, we want to meet you.",
    cta: "View open positions",
    href: "/careers",
  },
  {
    index: "02",
    title: "Partner With Us",
    description:
      "Got something worth building? We've done this before. We partner with creators, companies, and organizations who are serious about making things happen — wherever they are.",
    cta: "Explore partnerships",
    href: "/contact",
  },
  {
    index: "03",
    title: "Invest in Growth",
    description:
      "We're building something the market hasn't seen packaged this way before. Early investors get in on a multi-department ecosystem before it becomes obvious.",
    cta: "Investment opportunities",
    href: "/contact",
  },
];

export const CareersSection = () => {
  return (
    <section
      id="careers"
      className="py-28 md:py-36 bg-foreground text-background relative overflow-hidden grain"
    >
      {/* Large background watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span
          className="font-display italic font-bold text-background/[0.028] whitespace-nowrap leading-none"
          style={{
            fontSize: "clamp(90px, 18vw, 200px)",
            letterSpacing: "-0.04em",
          }}
          aria-hidden="true"
        >
          BUILD GROW
        </span>
      </div>

      {/* Kente stripe at top */}
      <div className="absolute top-0 left-0 right-0 kente-border opacity-55" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="grid lg:grid-cols-[1fr_2fr] gap-8 mb-16 pb-12 border-b border-background/10">
          <div>
            <p className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-background/40 before:block before:w-6 before:h-px before:bg-background/40 before:flex-shrink-0">
              Work With Us
            </p>
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-background leading-[1.0]">
              Ready to Build{" "}
              <span className="font-display italic text-gradient-primary">
                Something Real?
              </span>
            </h2>
          </div>
        </div>

        {/* Opportunities */}
        <div className="divide-y divide-background/10">
          {opportunities.map((item) => (
            <Link
              key={item.index}
              to={item.href}
              className="group flex flex-col md:flex-row gap-6 md:gap-10 py-10 hover:bg-background/[0.045] -mx-4 px-4 transition-all duration-300 rounded-xl"
            >
              {/* Large italic number */}
              <span
                className="font-display italic font-bold text-background/10 leading-none flex-shrink-0 group-hover:text-primary/25 transition-colors duration-300 hidden md:block"
                style={{ fontSize: "52px", lineHeight: 1, width: "76px" }}
                aria-hidden="true"
              >
                {item.index}
              </span>
              <span className="text-xs font-mono text-background/25 md:hidden">
                {item.index}
              </span>

              <div className="flex-1">
                <h3 className="text-xl font-bold text-background mb-3 group-hover:text-primary transition-colors duration-200">
                  {item.title}
                </h3>
                <p className="text-background/48 text-sm leading-relaxed max-w-xl">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm font-semibold text-background/35 group-hover:text-primary transition-colors duration-200 flex-shrink-0 md:self-center whitespace-nowrap">
                {item.cta}
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 pt-12 border-t border-background/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <p className="text-background/35 text-sm max-w-sm leading-relaxed">
            We're a global team. Our products ship everywhere. If you're good at
            what you do, location is never the reason we say no.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-background/20 text-sm font-semibold text-background/65 hover:text-background hover:border-background/40 hover:bg-background/5 transition-all duration-200"
          >
            Start a conversation
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
