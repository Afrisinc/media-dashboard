import { IconBox } from "@/components/ui/icon-box";
import { SectionCard } from "@/components/ui/section-card";
import { Bot, Building2, ChevronRight, History, Sliders } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface SettingsLink {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

const LINKS: SettingsLink[] = [
  {
    to: "/agents",
    icon: Bot,
    title: "AI Agents",
    description: "Switch each agent on or off and see what it is doing.",
  },
  {
    to: "/brands",
    icon: Building2,
    title: "Brands",
    description:
      "Choose which brands run on autopilot, their posting days and pages.",
  },
  {
    to: "/automation",
    icon: History,
    title: "Automation",
    description: "Every run the agents made, step by step.",
  },
];

export function SettingsLinks() {
  return (
    <SectionCard
      title="Fine-tune the agents"
      icon={Sliders}
      description="Controls that live on their own pages."
      contentClassName="pt-2"
    >
      <ul className="divide-y divide-border/60">
        {LINKS.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <IconBox icon={link.icon} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{link.title}</span>
                <span className="block text-xs text-muted-foreground">
                  {link.description}
                </span>
              </span>
              <ChevronRight
                className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
