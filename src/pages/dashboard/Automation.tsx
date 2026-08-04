import {
  Workflow,
  Video,
  TrendingUp,
  Mail,
  ImageIcon,
  FileBarChart,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconBox } from "@/components/ui/icon-box";

const workflows = [
  {
    name: "Article to Social",
    icon: Workflow,
    schedule: "Runs on every blog publish",
    success: "100%",
    lastRun: "2h ago",
    active: true,
  },
  {
    name: "Weekly video series",
    icon: Video,
    schedule: "Mon & Thu at 08:00",
    success: "98.5%",
    lastRun: "3h ago",
    active: true,
  },
  {
    name: "Trending topic response",
    icon: TrendingUp,
    schedule: "Monitors trends 24/7",
    success: "96%",
    lastRun: "41m ago",
    active: true,
  },
  {
    name: "Newsletter digest",
    icon: Mail,
    schedule: "Fridays at 07:00",
    success: "100%",
    lastRun: "Yesterday",
    active: true,
  },
  {
    name: "Story series generator",
    icon: ImageIcon,
    schedule: "Daily at 09:00",
    success: "97.2%",
    lastRun: "5h ago",
    active: true,
  },
  {
    name: "Performance report",
    icon: FileBarChart,
    schedule: "Sundays at 18:00",
    success: "100%",
    lastRun: "6d ago",
    active: false,
  },
];

const flowSteps = [
  {
    label: "Trigger",
    detail: "Blog post published",
    tone: "text-primary border-primary/40",
  },
  {
    label: "AI Generate",
    detail: "6 platform variations",
    tone: "text-terra border-terra/40",
  },
  {
    label: "Approval",
    detail: "Human review",
    tone: "text-gold border-gold/40",
  },
  {
    label: "Report",
    detail: "Analytics logged",
    tone: "text-forest border-forest/45",
  },
];

const recentRuns = [
  {
    trigger: "“Lagos fintech weekly roundup” published",
    outputs: "7 outputs",
    duration: "3m 48s",
    when: "2h ago",
  },
  {
    trigger: "“AI marketing in Africa” published",
    outputs: "7 outputs",
    duration: "4m 02s",
    when: "Yesterday",
  },
  {
    trigger: "“Case study: 3× engagement” published",
    outputs: "6 outputs",
    duration: "4m 31s",
    when: "Mon",
  },
  {
    trigger: "“Creator economy in Nairobi” published",
    outputs: "7 outputs",
    duration: "4m 27s",
    when: "Fri",
  },
];

const DashboardAutomation = () => (
  <div className="space-y-6 animate-fade-up">
    <div className="flex items-end justify-between gap-4 flex-wrap">
      <div>
        <p className="line-accent">Automation</p>
        <h1 className="heading-section font-display italic mt-2">
          Workflows that never sleep
        </h1>
        <p className="text-secondary mt-1">
          Every pipeline runs end-to-end — trigger, generate, publish, report.
        </p>
      </div>
      <Button>+ New Workflow</Button>
    </div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {workflows.map((workflow) => (
        <Card key={workflow.name} className="p-5">
          <div className="flex items-center justify-between">
            <IconBox
              icon={workflow.icon}
              tone={workflow.active ? "primary" : "muted"}
              size="sm"
            />
            <Badge variant={workflow.active ? "default" : "secondary"}>
              {workflow.active ? "Active" : "Paused"}
            </Badge>
          </div>
          <p className="mt-3 text-sm font-bold">{workflow.name}</p>
          <p className="mt-1 text-xs text-dim-4">{workflow.schedule}</p>
          <div className="mt-3.5 flex items-center justify-between border-t border-border/50 pt-3">
            <span className="text-xs text-muted-foreground">
              Success <b className="text-emerald">{workflow.success}</b>
            </span>
            <span className="text-xs text-dim-4">{workflow.lastRun}</span>
          </div>
        </Card>
      ))}
    </div>

    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold">Article to Social — end-to-end</p>
          <p className="mt-1 text-xs text-dim-4">
            Pauses once for human approval, then publishes everywhere.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Test Run
          </Button>
          <Button size="sm" className="bg-forest hover:bg-forest/90">
            Active
          </Button>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3 overflow-x-auto pb-1.5">
        {flowSteps.map((step, idx) => (
          <div key={step.label} className="flex items-center gap-3">
            <div
              className={`w-[150px] flex-shrink-0 rounded-xl border bg-inset p-3.5 ${step.tone}`}
            >
              <p className="text-[10px] font-extrabold uppercase tracking-wider">
                {step.label}
              </p>
              <p className="mt-1.5 text-xs font-semibold text-foreground">
                {step.detail}
              </p>
            </div>
            {idx < flowSteps.length - 1 && (
              <div className="h-px w-8 flex-shrink-0 bg-border-6" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-border/50 pt-4">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-dim-4">
            Recent runs
          </span>
          <span className="text-xs text-dim-6">Avg. 4m 07s · 100% success</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {recentRuns.map((run) => (
            <div
              key={run.trigger}
              className="flex items-center gap-3 rounded-lg border border-border bg-sunk-2 px-3.5 py-2.5"
            >
              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-emerald" />
              <span className="min-w-0 flex-1 truncate text-xs font-semibold">
                {run.trigger}
              </span>
              <span className="flex-shrink-0 text-xs text-dim-4">
                {run.outputs}
              </span>
              <span className="w-16 flex-shrink-0 text-right text-xs text-dim-6">
                {run.duration}
              </span>
              <span className="w-16 flex-shrink-0 text-right text-xs text-dim-6">
                {run.when}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  </div>
);

export default DashboardAutomation;
