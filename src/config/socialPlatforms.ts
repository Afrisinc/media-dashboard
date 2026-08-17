export const SOCIAL_PLATFORMS = [
  "website",
  "facebook",
  "instagram",
  "tiktok",
  "youtube",
  "linkedin",
  "x",
] as const;

export type SocialPlatformKey = (typeof SOCIAL_PLATFORMS)[number];

export interface ScopeDef {
  id: string;
  label: string;
  desc: string;
  required: boolean;
}

const socialScopes: ScopeDef[] = [
  {
    id: "pages_manage_posts",
    label: "Publish posts & media",
    desc: "Post on your behalf — the core of autopilot.",
    required: true,
  },
  {
    id: "pages_read_engagement",
    label: "Read insights",
    desc: "Pull reach, engagement and follower data for analytics.",
    required: true,
  },
  {
    id: "pages_read_user_content",
    label: "Read profile",
    desc: "Confirm the account identity and avatar.",
    required: true,
  },
];

const webScopes: ScopeDef[] = [
  {
    id: "publish_articles",
    label: "Publish articles & pages",
    desc: "Create and update posts directly in your CMS.",
    required: true,
  },
  {
    id: "upload_media",
    label: "Upload media",
    desc: "Push generated images and video to your media library.",
    required: true,
  },
  {
    id: "read_analytics",
    label: "Read analytics",
    desc: "Pull page views and reading time back into reports.",
    required: false,
  },
];

export interface PlatformCatalogEntry {
  displayName: string;
  short: string;
  tone: string;
  scopeSummary: string;
  scopes: ScopeDef[];
}

export const PLATFORM_CATALOG: Record<SocialPlatformKey, PlatformCatalogEntry> =
  {
    website: {
      displayName: "Website (CMS)",
      short: "WEB",
      tone: "text-forest bg-forest/10",
      scopeSummary: "Publish, media",
      scopes: webScopes,
    },
    facebook: {
      displayName: "Facebook",
      short: "FB",
      tone: "text-platform-facebook bg-platform-facebook/10",
      scopeSummary: "Publish, insights",
      scopes: socialScopes,
    },
    instagram: {
      displayName: "Instagram",
      short: "IG",
      tone: "text-platform-instagram bg-platform-instagram/10",
      scopeSummary: "Publish, DMs, insights",
      scopes: socialScopes,
    },
    tiktok: {
      displayName: "TikTok",
      short: "TT",
      tone: "text-platform-tiktok bg-platform-tiktok/10",
      scopeSummary: "Publish, insights",
      scopes: socialScopes,
    },
    youtube: {
      displayName: "YouTube",
      short: "YT",
      tone: "text-platform-youtube bg-platform-youtube/10",
      scopeSummary: "Upload, insights",
      scopes: socialScopes,
    },
    linkedin: {
      displayName: "LinkedIn",
      short: "IN",
      tone: "text-platform-linkedin bg-platform-linkedin/10",
      scopeSummary: "Publish, insights",
      scopes: socialScopes,
    },
    x: {
      displayName: "X",
      short: "X",
      tone: "text-ink-f bg-ink-f/10",
      scopeSummary: "Publish, insights",
      scopes: socialScopes,
    },
  };
