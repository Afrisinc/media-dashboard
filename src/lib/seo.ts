// SEO Utilities - Server-side meta tag generation for social sharing

export interface ArticleSEO {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

export interface SiteSEO {
  siteName: string;
  siteUrl: string;
  defaultImage: string;
  twitterHandle: string;
}

export const SITE_SEO: SiteSEO = {
  siteName: "Afrisinc",
  siteUrl: "https://afrisinc.com",
  // 1200×630 OG banner — must be publicly accessible, min 200×200
  defaultImage: "https://afrisinc.com/og-banner.png",
  twitterHandle: "@Afrisinc",
};

// Facebook App ID — works in both Vite (client) and Node/tsc (server) builds
// Set FB_APP_ID in your server .env, or VITE_FB_APP_ID for the client build
const FB_APP_ID: string = (() => {
  try {
    // Vite client build
    if (typeof import.meta !== "undefined" && (import.meta as any).env) {
      return (import.meta as any).env.VITE_FB_APP_ID || "";
    }
  } catch {
    // not in Vite context
  }
  // Node.js server build (tsc)
  if (typeof process !== "undefined" && process.env) {
    return process.env.FB_APP_ID || process.env.VITE_FB_APP_ID || "";
  }
  return "";
})();

/**
 * Generate meta tags HTML string for article pages
 */
export function generateArticleMetaTags(article: ArticleSEO): string {
  const tags: string[] = [
    // Primary Meta Tags
    `<title>${escapeHtml(article.title)} | ${SITE_SEO.siteName}</title>`,
    `<meta name="title" content="${escapeHtml(article.title)}" />`,
    `<meta name="description" content="${escapeHtml(article.description)}" />`,

    // Open Graph / Facebook
    `<meta property="og:type" content="${article.type || "article"}" />`,
    `<meta property="og:url" content="${escapeHtml(article.url)}" />`,
    `<meta property="og:title" content="${escapeHtml(article.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(article.description)}" />`,
    `<meta property="og:image" content="${escapeHtml(article.image)}" />`,
    `<meta property="og:image:secure_url" content="${escapeHtml(article.image)}" />`,
    `<meta property="og:image:type" content="image/jpeg" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${escapeHtml(article.title)}" />`,
    `<meta property="og:site_name" content="${SITE_SEO.siteName}" />`,
    `<meta property="og:locale" content="en_US" />`,
    ...(FB_APP_ID
      ? [`<meta property="fb:app_id" content="${FB_APP_ID}" />`]
      : []),

    // Twitter
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:url" content="${escapeHtml(article.url)}" />`,
    `<meta name="twitter:title" content="${escapeHtml(article.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(article.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(article.image)}" />`,
    `<meta name="twitter:site" content="${SITE_SEO.twitterHandle}" />`,
  ];

  // Article-specific meta tags
  if (article.publishedTime) {
    tags.push(
      `<meta property="article:published_time" content="${article.publishedTime}" />`,
    );
  }
  if (article.modifiedTime) {
    tags.push(
      `<meta property="article:modified_time" content="${article.modifiedTime}" />`,
    );
  }
  if (article.author) {
    tags.push(
      `<meta property="article:author" content="${escapeHtml(article.author)}" />`,
    );
  }
  if (article.section) {
    tags.push(
      `<meta property="article:section" content="${escapeHtml(article.section)}" />`,
    );
  }
  if (article.tags?.length) {
    article.tags.forEach((tag) => {
      tags.push(`<meta property="article:tag" content="${escapeHtml(tag)}" />`);
    });
  }

  return tags.join("\n    ");
}

/**
 * Generate default site meta tags
 */
export function generateDefaultMetaTags(): string {
  const fbAppIdTag = FB_APP_ID
    ? `\n    <meta property="fb:app_id" content="${FB_APP_ID}" />`
    : "";
  return `
    <title>Afrisinc | Technology &amp; Media from Africa to the World</title>
    <meta name="description" content="Afrisinc is a multi-department parent company pioneering innovation across technology, media, digital products, and global services." />
    <meta property="og:title" content="Afrisinc | Technology &amp; Media from Africa to the World" />
    <meta property="og:description" content="Building the future of technology and media from Africa to the world." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${SITE_SEO.siteUrl}" />
    <meta property="og:image" content="${SITE_SEO.defaultImage}" />
    <meta property="og:image:secure_url" content="${SITE_SEO.defaultImage}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Afrisinc - Technology &amp; Media from Africa to the World" />
    <meta property="og:site_name" content="${SITE_SEO.siteName}" />
    <meta property="og:locale" content="en_US" />${fbAppIdTag}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="${SITE_SEO.twitterHandle}" />
    <meta name="twitter:image" content="${SITE_SEO.defaultImage}" />
  `.trim();
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Check if request is from a social media crawler
 */
export function isSocialCrawler(userAgent: string): boolean {
  const crawlers = [
    "facebookexternalhit",
    "Facebot",
    "Twitterbot",
    "LinkedInBot",
    "Pinterest",
    "Slackbot",
    "TelegramBot",
    "WhatsApp",
    "Discordbot",
    "Googlebot",
    "bingbot",
  ];

  const ua = userAgent.toLowerCase();
  return crawlers.some((crawler) => ua.includes(crawler.toLowerCase()));
}

/**
 * Strip HTML tags from a string and decode common HTML entities
 */
export function stripHtmlTags(html: string | undefined | null): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&nbsp;/g, " ") // Replace non-breaking spaces
    .replace(/&amp;/g, "&") // Replace ampersands
    .replace(/&lt;/g, "<") // Replace less than
    .replace(/&gt;/g, ">") // Replace greater than
    .replace(/&quot;/g, '"') // Replace quotes
    .replace(/&#39;/g, "'") // Replace apostrophes
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
}
