import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowUpRight } from "lucide-react";

const stats = [
  { value: "4", label: "Departments" },
  { value: "10+", label: "Live Products" },
  { value: "15+", label: "Countries" },
  { value: "2020", label: "Founded" },
];

const marqueeItems = [
  "Technology",
  "Media",
  "Innovation",
  "Worldwide",
  "Digital Products",
  "Global Scale",
  "SaaS",
  "Ventures",
  "Est. 2020",
];

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background dot-grid grain">
      {/* Warm overlay over dot grid */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/80 pointer-events-none" />

      {/* Right-side decorative mandala — African geometric motif */}
      <div className="absolute right-[-80px] top-1/2 -translate-y-1/2 w-[580px] h-[580px] pointer-events-none hidden lg:block animate-fade-in animation-delay-300">
        <svg
          viewBox="0 0 500 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full animate-spin-slow"
        >
          <circle
            cx="250"
            cy="250"
            r="240"
            stroke="hsl(22 88% 52% / 0.07)"
            strokeWidth="1"
          />
          <circle
            cx="250"
            cy="250"
            r="200"
            stroke="hsl(22 88% 52% / 0.09)"
            strokeWidth="1"
          />
          <circle
            cx="250"
            cy="250"
            r="160"
            stroke="hsl(22 88% 52% / 0.11)"
            strokeWidth="1"
          />
          <circle
            cx="250"
            cy="250"
            r="120"
            stroke="hsl(22 88% 52% / 0.09)"
            strokeWidth="1"
          />
          <circle
            cx="250"
            cy="250"
            r="80"
            stroke="hsl(22 88% 52% / 0.07)"
            strokeWidth="1"
          />
          <polygon
            points="250,10 490,250 250,490 10,250"
            stroke="hsl(43 95% 52% / 0.07)"
            strokeWidth="1"
            fill="none"
          />
          <polygon
            points="250,50 450,250 250,450 50,250"
            stroke="hsl(43 95% 52% / 0.05)"
            strokeWidth="1"
            fill="none"
          />
          <line
            x1="10"
            y1="250"
            x2="490"
            y2="250"
            stroke="hsl(22 88% 52% / 0.05)"
            strokeWidth="1"
          />
          <line
            x1="250"
            y1="10"
            x2="250"
            y2="490"
            stroke="hsl(22 88% 52% / 0.05)"
            strokeWidth="1"
          />
          <line
            x1="73"
            y1="73"
            x2="427"
            y2="427"
            stroke="hsl(22 88% 52% / 0.04)"
            strokeWidth="1"
          />
          <line
            x1="427"
            y1="73"
            x2="73"
            y2="427"
            stroke="hsl(22 88% 52% / 0.04)"
            strokeWidth="1"
          />
          <circle cx="250" cy="10" r="3.5" fill="hsl(22 88% 52% / 0.28)" />
          <circle cx="490" cy="250" r="3.5" fill="hsl(22 88% 52% / 0.28)" />
          <circle cx="250" cy="490" r="3.5" fill="hsl(22 88% 52% / 0.28)" />
          <circle cx="10" cy="250" r="3.5" fill="hsl(22 88% 52% / 0.28)" />
          <circle cx="420" cy="80" r="5" fill="hsl(43 95% 52% / 0.22)" />
          <circle cx="80" cy="420" r="5" fill="hsl(43 95% 52% / 0.22)" />
          <circle cx="80" cy="80" r="5" fill="hsl(158 42% 26% / 0.18)" />
          <circle cx="420" cy="420" r="5" fill="hsl(158 42% 26% / 0.18)" />
          <circle cx="250" cy="250" r="14" fill="hsl(22 88% 52% / 0.12)" />
          <circle cx="250" cy="250" r="6" fill="hsl(22 88% 52% / 0.28)" />
        </svg>
      </div>

      {/* Vertical "Est. 2020" accent */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-3 opacity-20 select-none z-10 animate-fade-in animation-delay-500">
        <div className="w-px h-16 bg-foreground" />
        <span
          className="text-[10px] font-mono tracking-[0.35em] uppercase text-foreground"
          style={{ writingMode: "vertical-rl" }}
        >
          Est. 2020
        </span>
        <div className="w-px h-16 bg-foreground" />
      </div>

      <div className="container mx-auto px-6 pt-28 md:pt-40 pb-24 md:pb-32 relative z-10">
        <div className="max-w-5xl">
          {/* Eyebrow */}
          <p className="line-accent mb-12 animate-fade-in">
            Technology · Media · Digital Products
          </p>

          {/* Main heading */}
          <div className="animate-fade-up animation-delay-100">
            <h1 className="relative" style={{ lineHeight: 1 }}>
              <span
                className="block font-bold tracking-[-0.03em] text-foreground font-sans"
                style={{
                  fontSize: "clamp(28px, 6.5vw, 76px)",
                  lineHeight: 0.92,
                }}
              >
                Building
              </span>
              <span
                className="block font-display italic font-bold tracking-[-0.02em] text-gradient-primary"
                style={{
                  fontSize: "clamp(28px, 6.5vw, 76px)",
                  lineHeight: 1.02,
                }}
              >
                Tomorrow's
              </span>
              <span
                className="block font-bold tracking-[-0.03em] text-foreground font-sans"
                style={{
                  fontSize: "clamp(28px, 6.5vw, 76px)",
                  lineHeight: 0.92,
                }}
              >
                Platforms.
              </span>
            </h1>
          </div>

          {/* Description + CTA */}
          <div className="mt-14 grid md:grid-cols-2 gap-10 items-end animate-fade-up animation-delay-200">
            <p className="text-lg text-muted-foreground leading-[1.75] max-w-md">
              One company. Four departments. 10+ live products used by people
              across 15 countries — and we're just getting started.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="default"
                size="lg"
                className="group shadow-primary"
                asChild
              >
                <Link to="/about">
                  Our Story
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="group" asChild>
                <Link to="/products">
                  See Products
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 md:mt-24 pt-10 border-t border-border animate-fade-up animation-delay-300">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 md:gap-y-0 md:divide-x md:divide-border">
              {stats.map((stat) => (
                <div key={stat.label} className="md:px-8 md:first:pl-0">
                  <div
                    className="font-bold text-foreground tabular-nums tracking-tight font-display"
                    style={{ fontSize: "clamp(32px, 4vw, 48px)" }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mt-2">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Marquee band at bottom */}
      <div className="absolute bottom-0 left-0 right-0 py-3 border-t border-border/50 bg-background/70 backdrop-blur-sm overflow-hidden z-10 animate-fade-in animation-delay-400">
        <div className="flex overflow-hidden">
          <div className="marquee-track">
            {[...marqueeItems, ...marqueeItems, ...marqueeItems].map(
              (item, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-5 px-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/55 whitespace-nowrap"
                >
                  {item}
                  <span className="w-1 h-1 rounded-full bg-primary/35 inline-block flex-shrink-0" />
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
