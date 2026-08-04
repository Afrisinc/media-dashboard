const messages = [
  "Content Writer drafted “Lagos fintech weekly roundup”",
  "Video Producer rendered 3 Reels for Thursday",
  "SEO Expert optimized “AI marketing in Africa” — score 91",
  "Social Manager scheduled 12 posts across 6 platforms",
  "Campaign Manager shifted budget to LinkedIn (+18% ROAS)",
];

export function AgentsTickerBar() {
  const track = [...messages, ...messages];

  return (
    <div className="flex h-[34px] min-w-0 w-full flex-shrink-0 items-center overflow-hidden border-b border-border/70 bg-bar">
      <div className="flex flex-shrink-0 items-center gap-2 border-r border-border px-4 text-[10px] font-extrabold uppercase tracking-widest text-gold">
        <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
        Agents live
      </div>
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="marquee-track pl-6 text-xs text-muted-foreground">
          {track.map((message, idx) => (
            <span key={idx} className="mr-12 whitespace-nowrap">
              {message}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
