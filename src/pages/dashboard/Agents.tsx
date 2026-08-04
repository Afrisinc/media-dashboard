import { useState } from "react";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusDot } from "@/components/ui/status-dot";
import { EmptyState } from "@/components/ui/empty-state";

interface WorkItem {
  kind: string;
  title: string;
  status: "Draft" | "Approved" | "Published" | "Queued" | "Rendering";
  time: string;
  words: string;
  ch: string;
  output: string;
}

interface Agent {
  name: string;
  role: string;
  initials: string;
  working: boolean;
  task: string;
  approval: string;
  turnaround: string;
  tasksPerWeek: number;
  totalOutput: number;
  history: WorkItem[];
}

const agents: Agent[] = [
  {
    name: "Marketing Strategist",
    role: "Strategy & trends",
    initials: "MS",
    working: true,
    task: "Analyzing Q3 trends to plan October campaigns",
    approval: "97%",
    turnaround: "18m",
    tasksPerWeek: 14,
    totalOutput: 38,
    history: [
      {
        kind: "Brief",
        title: "Q3 trend analysis — East & West Africa",
        status: "Approved",
        time: "Today 08:40",
        words: "1,400 words",
        ch: "Internal",
        output:
          "Short-form video demand is up 34% QoQ across Nigerian and Kenyan audiences. Recommend doubling Reels/TikTok output and shifting 20% of ad budget to LinkedIn, where CPMs dropped 18%.",
      },
      {
        kind: "Plan",
        title: "October campaign calendar (draft)",
        status: "Published",
        time: "Yesterday",
        words: "32 slots",
        ch: "Calendar",
        output:
          "32 content slots planned across 6 platforms with optimal windows precomputed. Video-first weighting on Tue/Thu; long-form articles anchored Mondays.",
      },
      {
        kind: "Brief",
        title: "Competitor scan: pricing moves",
        status: "Approved",
        time: "Mon",
        words: "900 words",
        ch: "Internal",
        output:
          "Key competitors raised entry pricing ~12%. Opportunity: lead with the $29 starter tier in ads for 4 weeks.",
      },
    ],
  },
  {
    name: "Content Writer",
    role: "Copy & articles",
    initials: "CW",
    working: true,
    task: "Drafting “Lagos fintech weekly roundup — Issue 34”",
    approval: "94%",
    turnaround: "25m",
    tasksPerWeek: 17,
    totalOutput: 49,
    history: [
      {
        kind: "Article",
        title: "Lagos fintech weekly roundup — Issue 34",
        status: "Draft",
        time: "In progress",
        words: "2,100 words",
        ch: "Blog + LinkedIn",
        output:
          "Draft at 72%: covers the CBN sandbox update, two funding rounds (Kora $12M, Zap $4.5M), and a POS market deep-dive. SEO target keyword: “Nigeria fintech news”.",
      },
      {
        kind: "Social",
        title: "5 platform variations — AI marketing article",
        status: "Published",
        time: "Today 07:12",
        words: "5 posts",
        ch: "All platforms",
        output:
          "FB: story-led hook. IG: carousel copy, 8 slides. X: 3-tweet thread. LinkedIn: data-led opener. TikTok: 15s script with captions.",
      },
      {
        kind: "Email",
        title: "Friday digest — “The machine did it again”",
        status: "Approved",
        time: "Thu",
        words: "640 words",
        ch: "Newsletter",
        output:
          "Subject A/B: “Your week, automated” vs “86 assets, 0 humans”. Variant B predicted +11% open rate.",
      },
    ],
  },
  {
    name: "Video Producer",
    role: "Scripts & rendering",
    initials: "VP",
    working: true,
    task: "Rendering 3 Reels for Thursday drop",
    approval: "91%",
    turnaround: "32m",
    tasksPerWeek: 11,
    totalOutput: 27,
    history: [
      {
        kind: "Video",
        title: "3 Reels — Thursday drop",
        status: "Rendering",
        time: "In progress",
        words: "3 × 22s",
        ch: "IG, TikTok, Shorts",
        output:
          "Reel 1: hook “Nobody posted this — literally.” Reel 2: 5-step automation walkthrough. Reel 3: customer stat montage. Voice: Amara, energetic.",
      },
      {
        kind: "Video",
        title: "How African startups win with AI marketing",
        status: "Published",
        time: "Today 06:30",
        words: "58s",
        ch: "TikTok +2",
        output:
          "Published to TikTok, Reels and Shorts. First-hour: 12.4K views, 8.2% engagement — 2.1× channel average.",
      },
      {
        kind: "Script",
        title: "Product tour v2 — automation engine",
        status: "Approved",
        time: "Tue",
        words: "90s script",
        ch: "YouTube",
        output:
          "Three-act structure: problem (tool sprawl) → reveal (one OS) → proof (live pipeline).",
      },
    ],
  },
  {
    name: "Social Media Manager",
    role: "Scheduling & engagement",
    initials: "SM",
    working: true,
    task: "Scheduling 12 posts across 6 platforms",
    approval: "98%",
    turnaround: "12m",
    tasksPerWeek: 32,
    totalOutput: 94,
    history: [
      {
        kind: "Queue",
        title: "12 posts scheduled across 6 platforms",
        status: "Published",
        time: "Today 05:00",
        words: "12 posts",
        ch: "All platforms",
        output:
          "All 12 posts placed in precomputed optimal windows. Conflicts auto-resolved: 2 posts shifted off the Wednesday cluster.",
      },
      {
        kind: "Reply",
        title: "38 comment responses drafted & sent",
        status: "Published",
        time: "Today",
        words: "38 replies",
        ch: "IG, FB, X",
        output:
          "Sentiment: 84% positive. 3 support-type comments routed to the help inbox. Average response time: 4 minutes.",
      },
      {
        kind: "Queue",
        title: "Weekend story series scheduled",
        status: "Approved",
        time: "Fri",
        words: "5 stories",
        ch: "IG, WhatsApp",
        output:
          "Five-part “Meet your AI creative team” series scheduled Sat–Sun 09:00 with poll stickers on parts 2 and 4.",
      },
    ],
  },
  {
    name: "SEO Expert",
    role: "Search optimization",
    initials: "SE",
    working: false,
    task: "Idle — last audit scored the blog 91/100",
    approval: "95%",
    turnaround: "41m",
    tasksPerWeek: 6,
    totalOutput: 22,
    history: [
      {
        kind: "Audit",
        title: "Blog SEO audit — 24 articles",
        status: "Approved",
        time: "Mon",
        words: "24 pages",
        ch: "Blog",
        output:
          "Average score lifted 78 → 91. Fixed: 14 meta descriptions, 31 internal links added, 6 orphan pages connected.",
      },
      {
        kind: "Keywords",
        title: "October keyword map",
        status: "Published",
        time: "Last week",
        words: "120 terms",
        ch: "Internal",
        output:
          "120 terms clustered into 8 topics, prioritized by difficulty × volume. 14 quick wins flagged.",
      },
    ],
  },
  {
    name: "Brand Manager",
    role: "Consistency & voice",
    initials: "BM",
    working: false,
    task: "Idle — all 86 assets this week passed brand check",
    approval: "100%",
    turnaround: "9m",
    tasksPerWeek: 9,
    totalOutput: 31,
    history: [
      {
        kind: "Review",
        title: "Weekly brand check — 86 assets",
        status: "Approved",
        time: "Today",
        words: "86 assets",
        ch: "All channels",
        output:
          "All 86 generated assets passed color, logo-clearspace and voice checks. 2 warnings auto-corrected.",
      },
      {
        kind: "Guide",
        title: "Voice & tone refresh v3.2",
        status: "Published",
        time: "Jul 28",
        words: "1,100 words",
        ch: "Brand hub",
        output:
          "Added do/don’t examples for TikTok captions and localized tone guidance for francophone markets.",
      },
    ],
  },
];

const agentLog = [
  {
    agent: "Video Producer",
    action:
      "published “How African startups win with AI marketing” to TikTok, Reels & Shorts",
    chip: "Published",
    time: "12m ago",
  },
  {
    agent: "Content Writer",
    action: "generated 5 social variations from the fintech roundup article",
    chip: "Generated",
    time: "38m ago",
  },
  {
    agent: "Social Media Manager",
    action: "rescheduled Wednesday queue to optimal window (14:00 WAT)",
    chip: "Optimized",
    time: "1h ago",
  },
  {
    agent: "SEO Expert",
    action: "lifted “AI marketing in Africa” from score 78 → 91",
    chip: "Optimized",
    time: "2h ago",
  },
  {
    agent: "Marketing Strategist",
    action: "flagged “AI Marketing” trending — queued a response video",
    chip: "Generated",
    time: "3h ago",
  },
];

function statusTone(status: WorkItem["status"]) {
  if (status === "Published") return "default" as const;
  if (status === "Approved") return "outline" as const;
  return "secondary" as const;
}

const DashboardAgents = () => {
  const [agentIdx, setAgentIdx] = useState<number | null>(null);
  const [workIdx, setWorkIdx] = useState<number | null>(null);

  if (agentIdx !== null) {
    const agent = agents[agentIdx];
    const work = workIdx !== null ? agent.history[workIdx] : null;

    return (
      <div className="space-y-5 animate-fade-up">
        <button
          type="button"
          onClick={() => {
            setAgentIdx(null);
            setWorkIdx(null);
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All agents
        </button>

        <Card className="flex flex-wrap items-center gap-4 p-6">
          <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-extrabold text-primary">
            {agent.initials}
          </span>
          <div className="min-w-[180px] flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="heading-section !text-2xl">{agent.name}</h1>
              <StatusDot
                tone={agent.working ? "primary" : "muted"}
                pulse={agent.working}
                label={agent.working ? "Working" : "Idle"}
              />
            </div>
            <p className="mt-1 text-sm text-dim-2">
              {agent.role} · Full autonomy — publishes without approval
            </p>
          </div>
          <div className="flex flex-shrink-0 gap-2">
            <Button variant="outline" size="sm">
              {agent.working ? "Pause agent" : "Resume agent"}
            </Button>
            <Button variant="outline" size="sm">
              Configure
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
          {[
            { label: "Approved", value: agent.approval },
            { label: "Tasks / wk", value: String(agent.tasksPerWeek) },
            { label: "Turnaround", value: agent.turnaround },
            { label: "Total output", value: String(agent.totalOutput) },
          ].map((kpi) => (
            <Card key={kpi.label} className="p-4">
              <p className="text-[10.5px] font-extrabold uppercase tracking-wider text-dim-5">
                {kpi.label}
              </p>
              <p className="mt-1.5 text-xl font-extrabold">{kpi.value}</p>
            </Card>
          ))}
        </div>

        {agent.working && (
          <Card className="border-primary/25 bg-primary/[0.06] p-5">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                Working on now
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold">{agent.task}</p>
          </Card>
        )}

        <div className="grid gap-4 lg:grid-cols-2 items-start">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <span className="text-sm font-bold">Work history</span>
              <span className="text-xs text-dim-5">
                {agent.history.length} items
              </span>
            </div>
            <div className="flex flex-col gap-1.5 p-3">
              {agent.history.map((item, idx) => (
                <button
                  key={item.title}
                  onClick={() => setWorkIdx(idx)}
                  className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                    workIdx === idx
                      ? "border-primary/50 bg-primary/[0.08]"
                      : "border-border bg-inset"
                  }`}
                >
                  <Badge
                    variant="outline"
                    className="flex-shrink-0 text-[9.5px] uppercase"
                  >
                    {item.kind}
                  </Badge>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-dim-6">
                      {item.time} · {item.words}
                    </span>
                  </span>
                  <Badge
                    variant={statusTone(item.status)}
                    className="flex-shrink-0"
                  >
                    {item.status}
                  </Badge>
                </button>
              ))}
            </div>
            <div className="flex gap-2 border-t border-border/60 p-3.5">
              <input
                placeholder="Assign a new task…"
                className="h-10 flex-1 rounded-lg border border-border bg-inset px-3 text-xs outline-none"
              />
              <Button size="sm">Assign</Button>
            </div>
          </Card>

          <Card className="flex min-h-[280px] flex-col overflow-hidden">
            {work ? (
              <>
                <div className="border-b border-border/60 px-5 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-[9.5px] uppercase">
                      {work.kind}
                    </Badge>
                    <Badge variant={statusTone(work.status)}>
                      {work.status}
                    </Badge>
                    <span className="text-[11px] text-dim-6">{work.time}</span>
                  </div>
                  <p className="mt-2 text-base font-bold leading-snug">
                    {work.title}
                  </p>
                </div>
                <div className="flex flex-1 flex-col gap-4 p-5">
                  <div>
                    <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-dim-6">
                      Output
                    </p>
                    <p className="whitespace-pre-line text-sm text-mut-5">
                      {work.output}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="rounded-lg border border-border bg-inset px-3 py-2.5">
                      <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-dim-6">
                        Size
                      </p>
                      <p className="mt-1 text-sm font-bold">{work.words}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-inset px-3 py-2.5">
                      <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-dim-6">
                        Channel
                      </p>
                      <p className="mt-1 text-sm font-bold">{work.ch}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-auto flex gap-2 border-t border-border/60 p-3.5">
                  {work.status !== "Published" && (
                    <Button className="flex-1 bg-emerald hover:bg-emerald/90">
                      Approve &amp; publish
                    </Button>
                  )}
                  <Button variant="outline" className="flex-1">
                    Regenerate
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center p-8">
                <EmptyState
                  icon={FileText}
                  title="Pick any item to read the output"
                  description="Every piece this agent produced is kept here with its full result and approval trail."
                />
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="line-accent">AI Agents</p>
          <h1 className="heading-section font-display italic mt-2">
            Your team that works 24/7
          </h1>
          <p className="text-secondary mt-1">
            Autonomous specialists producing, optimizing and publishing your
            media.
          </p>
        </div>
        <Button>+ Add Agent</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent, idx) => (
          <Card key={agent.name} className="p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
                {agent.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{agent.name}</p>
                <p className="truncate text-xs text-dim-4">{agent.role}</p>
              </div>
              <StatusDot
                tone={agent.working ? "primary" : "muted"}
                pulse={agent.working}
                label={agent.working ? "Working" : "Idle"}
              />
            </div>
            <div className="mt-3.5 rounded-lg bg-inset px-3 py-2.5 text-xs text-mut-2">
              <span className="text-dim-6">Now:</span> {agent.task}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-dim-4">
                Output approved <b className="text-ink-d">{agent.approval}</b>
              </span>
              <button
                onClick={() => setAgentIdx(idx)}
                className="text-xs font-semibold text-primary"
              >
                View work →
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-border/60 px-6 py-4 text-sm font-bold">
          Recent agent work
        </div>
        <div className="divide-y divide-border/40">
          {agentLog.map((log, idx) => (
            <div key={idx} className="flex items-center gap-3.5 px-6 py-3.5">
              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
              <div className="flex-1 text-xs">
                <b>{log.agent}</b>{" "}
                <span className="text-muted-foreground">{log.action}</span>
              </div>
              <Badge variant="secondary">{log.chip}</Badge>
              <span className="w-10 flex-shrink-0 text-right text-xs text-dim-6">
                {log.time}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default DashboardAgents;
