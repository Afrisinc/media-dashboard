import { Play, Clock, ArrowUpRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const featured = {
  type: "Documentary",
  title: "The Rise of African Tech Startups",
  description:
    "Inside one of the fastest-growing startup ecosystems on the planet — the founders, the funding, and the failures nobody talks about.",
  duration: "12:45",
  isVideo: true,
};

const secondary = [
  {
    type: "News",
    title: "Innovation in African FinTech",
    description:
      "How mobile money quietly rewired the financial lives of millions — and why traditional banks didn't see it coming.",
    readTime: "5 min read",
    isVideo: false,
  },
  {
    type: "Podcast",
    title: "Founders Unplugged: Episode 23",
    description:
      "No scripts. No polished answers. Just founders talking honestly about what it actually takes to build something real.",
    duration: "45:00",
    isVideo: true,
  },
];

const typeColors: Record<string, { bg: string; text: string; border: string }> =
  {
    Documentary: {
      bg: "hsl(22 88% 52% / 0.1)",
      text: "hsl(22 82% 46%)",
      border: "hsl(22 88% 52% / 0.25)",
    },
    News: {
      bg: "hsl(158 42% 26% / 0.1)",
      text: "hsl(158 42% 32%)",
      border: "hsl(158 42% 26% / 0.25)",
    },
    Podcast: {
      bg: "hsl(43 95% 52% / 0.1)",
      text: "hsl(38 80% 38%)",
      border: "hsl(43 95% 52% / 0.25)",
    },
  };

export const MediaSection = () => {
  return (
    <section id="media" className="py-28 md:py-36 bg-muted/30">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="grid lg:grid-cols-[1fr_2fr] gap-8 mb-16 pb-12 border-b border-border">
          <div>
            <p className="line-accent">Media Hub</p>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.0]">
              Stories That
              <span className="block font-display italic text-gradient-primary">
                Matter
              </span>
            </h2>
            <Link
              to="/media"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all duration-200 flex-shrink-0"
            >
              View all content
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Magazine grid */}
        <div className="grid lg:grid-cols-[3fr_2fr] gap-5">
          {/* Featured */}
          <article className="group relative rounded-2xl overflow-hidden border border-border hover:border-primary/25 transition-all duration-300 cursor-pointer bg-card">
            <div className="relative" style={{ aspectRatio: "16/9" }}>
              {/* Rich gradient placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-foreground/88 via-foreground/70 to-primary/35" />

              {/* Watermark letter */}
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden select-none pointer-events-none">
                <span
                  className="font-display italic font-bold leading-none"
                  style={{ fontSize: "160px", color: "hsl(36 28% 97% / 0.04)" }}
                  aria-hidden="true"
                >
                  A
                </span>
              </div>

              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg"
                  style={{
                    background: "hsl(var(--primary))",
                    boxShadow: "0 0 0 10px hsl(var(--primary) / 0.18)",
                  }}
                >
                  <Play className="w-6 h-6 text-background ml-1" />
                </div>
              </div>

              {/* Type badge */}
              <div className="absolute top-4 left-4">
                <span
                  className="px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-sm"
                  style={{
                    background: typeColors[featured.type].bg,
                    color: typeColors[featured.type].text,
                    border: `1px solid ${typeColors[featured.type].border}`,
                  }}
                >
                  {featured.type}
                </span>
              </div>

              {/* Duration */}
              <div className="absolute bottom-4 right-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-foreground/50 text-background backdrop-blur-sm">
                  <Clock className="w-3 h-3" />
                  {featured.duration}
                </span>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
                {featured.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {featured.description}
              </p>
            </div>
          </article>

          {/* Secondary stacked */}
          <div className="flex flex-col gap-5">
            {secondary.map((item) => (
              <article
                key={item.title}
                className="group flex-1 rounded-2xl border border-border hover:border-primary/25 transition-all duration-300 cursor-pointer overflow-hidden bg-card flex flex-col"
              >
                <div className="relative" style={{ aspectRatio: "16/7" }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/30" />

                  {item.isVideo ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                        style={{
                          background: "hsl(var(--primary))",
                          boxShadow: "0 0 0 7px hsl(var(--primary) / 0.15)",
                        }}
                      >
                        <Play className="w-4 h-4 text-background ml-0.5" />
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-muted-foreground/20" />
                    </div>
                  )}

                  <div className="absolute top-3 left-3">
                    <span
                      className="px-2.5 py-0.5 text-xs font-semibold rounded-full backdrop-blur-sm"
                      style={{
                        background: typeColors[item.type].bg,
                        color: typeColors[item.type].text,
                        border: `1px solid ${typeColors[item.type].border}`,
                      }}
                    >
                      {item.type}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full bg-foreground/40 text-background backdrop-blur-sm">
                      <Clock className="w-3 h-3" />
                      {item.duration || item.readTime}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1">
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors duration-200 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed mt-1.5 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
