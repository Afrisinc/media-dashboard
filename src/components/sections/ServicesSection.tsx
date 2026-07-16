import {
  Newspaper,
  Code2,
  Package,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    index: "01",
    icon: Newspaper,
    title: "Afrisinc Media",
    description:
      "News, YouTube channels, podcasts, blogs, and documentaries that tell the stories worth telling.",
    tags: ["Digital News", "Video", "Podcasts", "Blogs"],
    href: "/media",
    accent: "terra",
  },
  {
    index: "02",
    icon: Code2,
    title: "Technology",
    description:
      "Software that doesn't break when you grow. SaaS platforms, enterprise systems, and APIs built to do exactly what they promise.",
    tags: ["SaaS", "Enterprise", "Custom Dev", "APIs"],
    href: "/technology",
    accent: "forest",
  },
  {
    index: "03",
    icon: Package,
    title: "Digital Products",
    description:
      "Real problems deserve real tools. Our digital products are built for businesses that are tired of workarounds.",
    tags: ["Tools", "Templates", "Automation", "Analytics"],
    href: "/products",
    accent: "gold",
  },
  {
    index: "04",
    icon: Sparkles,
    title: "Future Ventures",
    description:
      "We're betting early on what's next. AI, blockchain, and deep tech — researched seriously, not just dropped in a pitch deck.",
    tags: ["AI", "Blockchain", "Innovation", "R&D"],
    href: "/technology",
    accent: "indigo",
  },
];

const accentColors = {
  terra: {
    bg: "hsl(22 88% 52% / 0.08)",
    text: "hsl(22 82% 46%)",
    border: "hsl(22 88% 52% / 0.2)",
    glow: "hsl(22 88% 52% / 0.12)",
  },
  forest: {
    bg: "hsl(158 42% 26% / 0.08)",
    text: "hsl(158 42% 32%)",
    border: "hsl(158 42% 26% / 0.2)",
    glow: "hsl(158 42% 26% / 0.1)",
  },
  gold: {
    bg: "hsl(43 95% 52% / 0.1)",
    text: "hsl(38 80% 38%)",
    border: "hsl(43 95% 52% / 0.25)",
    glow: "hsl(43 95% 52% / 0.12)",
  },
  indigo: {
    bg: "hsl(240 40% 30% / 0.08)",
    text: "hsl(240 40% 52%)",
    border: "hsl(240 40% 30% / 0.2)",
    glow: "hsl(240 40% 30% / 0.1)",
  },
};

export const ServicesSection = () => {
  return (
    <section id="services" className="py-28 md:py-36 bg-background">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="grid lg:grid-cols-[1fr_2fr] gap-8 mb-16 pb-12 border-b border-border">
          <div>
            <p className="line-accent">Our Departments</p>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.0]">
              Four Departments.
              <span className="block font-display italic text-gradient-primary">
                One Direction.
              </span>
            </h2>
            <p className="text-muted-foreground max-w-xs text-sm leading-relaxed flex-shrink-0 md:text-right">
              Each department runs independently. Each one feeds the next.
              Together, they're something bigger than any one of them.
            </p>
          </div>
        </div>

        {/* 2×2 Card Grid */}
        <div className="grid md:grid-cols-2 gap-5">
          {services.map((service) => {
            const colors =
              accentColors[service.accent as keyof typeof accentColors];
            return (
              <Link
                key={service.index}
                to={service.href}
                className="group relative rounded-2xl border border-border bg-card p-8 hover:border-primary/25 transition-all duration-300 overflow-hidden flex flex-col min-h-[280px]"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                {/* Radial glow on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at 85% 0%, ${colors.glow} 0%, transparent 65%)`,
                  }}
                />

                {/* Ghost index number */}
                <span
                  className="absolute top-4 right-6 font-display italic font-bold leading-none select-none transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-0.5"
                  style={{
                    fontSize: "64px",
                    lineHeight: 1,
                    color: colors.border,
                  }}
                  aria-hidden="true"
                >
                  {service.index}
                </span>

                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 relative z-10 transition-transform duration-300 group-hover:scale-105"
                  style={{
                    background: colors.bg,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <service.icon
                    className="w-5 h-5"
                    style={{ color: colors.text }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 relative z-10">
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Footer row */}
                <div className="flex items-center justify-between mt-6 relative z-10">
                  <div className="flex flex-wrap gap-1.5">
                    {service.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 text-xs font-medium rounded-full"
                        style={{
                          background: colors.bg,
                          color: colors.text,
                          border: `1px solid ${colors.border}`,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground/35 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 flex-shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
