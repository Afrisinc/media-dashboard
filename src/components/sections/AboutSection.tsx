import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const pillars = [
  {
    number: "01",
    title: "Vision",
    description:
      "We're not just building a company. We're building infrastructure — technology and media that still matters in 20 years.",
  },
  {
    number: "02",
    title: "Mission",
    description:
      "Tell stories people actually want to hear. Build tools people actually want to use. Do both better than anyone else, anywhere.",
  },
  {
    number: "03",
    title: "Growth",
    description:
      "Media first — because trust is built through stories. Software second — because trust needs tools. Each department was built to feed the next.",
  },
];

export const AboutSection = () => {
  return (
    <section
      id="about"
      className="py-28 md:py-36 bg-muted/30 relative overflow-hidden"
    >
      {/* Decorative large watermark letter */}
      <div className="absolute top-0 right-0 select-none pointer-events-none overflow-hidden leading-none">
        <span
          className="font-display italic font-bold text-foreground/[0.022] block"
          style={{ fontSize: "clamp(260px, 28vw, 460px)", lineHeight: 1 }}
          aria-hidden="true"
        >
          A
        </span>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Top row */}
        <div className="grid lg:grid-cols-[1fr_2fr] gap-8 mb-16 pb-12 border-b border-border">
          <div>
            <p className="line-accent">About Afrisinc</p>
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.0]">
              One Company.{" "}
              <span className="font-display italic text-gradient-primary">
                Four Big Bets.
              </span>
            </h2>
          </div>
        </div>

        {/* Two-col layout */}
        <div className="grid lg:grid-cols-[5fr_7fr] gap-10 lg:gap-16 items-start">
          {/* Left — sticky pull quote */}
          <div className="lg:sticky lg:top-28">
            <div
              className="font-display italic text-primary/18 leading-none mb-3 select-none"
              style={{
                fontSize: "72px",
                lineHeight: 1,
                color: "hsl(var(--terra) / 0.18)",
              }}
              aria-hidden="true"
            >
              "
            </div>
            <p className="text-xl md:text-2xl text-foreground leading-[1.65] font-display italic font-light">
              We don't believe great technology or great storytelling has a
              hometown. We build for the world.
            </p>
            <p className="mt-6 text-muted-foreground leading-relaxed text-sm">
              We started with media because stories build trust. Then we built
              the software that makes things work. Every product we ship is
              designed to last — not just to launch.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 mt-8 text-sm font-semibold text-primary hover:gap-3 transition-all duration-200"
            >
              Read our full story
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Right — numbered pillars */}
          <div className="divide-y divide-border">
            {pillars.map((pillar) => (
              <div
                key={pillar.number}
                className="group relative flex gap-8 py-10 hover:bg-background/50 -mx-4 px-4 transition-all duration-300 rounded-xl"
              >
                {/* Left border reveal on hover */}
                <div
                  className="absolute left-0 top-3 bottom-3 w-[3px] scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center rounded-full"
                  style={{ backgroundColor: "hsl(var(--terra))" }}
                />

                {/* Large italic number */}
                <span
                  className="font-display italic font-bold flex-shrink-0 w-14 leading-none mt-1 transition-colors duration-300"
                  style={{
                    fontSize: "48px",
                    lineHeight: 1,
                    color: "hsl(var(--terra) / 0.12)",
                  }}
                >
                  {pillar.number}
                </span>

                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                    {pillar.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {pillar.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
