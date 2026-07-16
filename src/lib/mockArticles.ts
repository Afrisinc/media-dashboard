// Mock articles — same shape as Article type (post-mapping from backend)
// These match exactly what mapBackendArticle() returns and what the frontend expects.
// Replace with real API data once the backend is connected.

import type { Article } from "@/types/article";

const now = Date.now();
const hoursAgo = (h: number) =>
  new Date(now - h * 60 * 60 * 1000).toISOString();

export const mockArticles: Article[] = [
  {
    id: "mock-001",
    slug: "africa-semiconductor-revolution-ghana-rwanda",
    title:
      "Africa's Semiconductor Revolution: Why Ghana and Rwanda Are Betting Big on Chip Manufacturing",
    summary:
      "As global chip demand surges, two African nations are positioning themselves at the heart of the next manufacturing wave — backed by sovereign wealth funds and international partnerships with TSMC and Samsung.",
    content:
      "<p>As global chip demand surges, two African nations are positioning themselves at the heart of the next manufacturing wave. Ghana's government-backed Silicon Accra Initiative and Rwanda's Kigali Chip Foundry partnership are attracting serious capital — and serious attention from the international tech community.</p><p>The continent's strategic mineral wealth gives it a unique upstream advantage that no other emerging region can match. Cobalt, lithium, and rare earth deposits sit in the same countries that are now building the downstream manufacturing capacity to process them into finished semiconductors.</p>",
    featured_image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80",
    category: ["technology", "infrastructure"],
    type: "news",
    tags: ["semiconductors", "ghana", "rwanda", "manufacturing", "chips"],
    author: { name: "Afrisinc Media", role: "Editorial" },
    published_at: hoursAgo(2),
    updated_at: hoursAgo(2),
    read_time: 7,
    is_featured: true,
    ai_generated: true,
    seo: {
      meta_title: "Africa's Semiconductor Revolution — Afrisinc Media",
      meta_description:
        "Ghana and Rwanda are betting big on chip manufacturing as global semiconductor demand surges.",
      og_image:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80",
    },
  },
  {
    id: "mock-002",
    slug: "flutterwave-3b-funding-round-african-fintech",
    title:
      "Flutterwave's New $3B Valuation Reset Reveals African FinTech's Resilient Appetite for Growth",
    summary:
      "After a turbulent 2023, Flutterwave's latest funding round signals that international investors have not lost confidence in Africa's payments infrastructure story — just recalibrated their expectations.",
    content:
      "<p>After a turbulent 2023 marked by regulatory scrutiny and leadership changes, Flutterwave's latest funding round signals that international investors have not lost confidence in Africa's payments infrastructure story.</p>",
    featured_image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80",
    category: ["fintech"],
    type: "news",
    tags: ["flutterwave", "fintech", "funding", "payments", "africa"],
    author: { name: "Afrisinc Media", role: "Editorial" },
    published_at: hoursAgo(4),
    updated_at: hoursAgo(4),
    read_time: 5,
    is_featured: false,
    ai_generated: true,
    seo: {
      meta_title: "Flutterwave $3B Valuation — Afrisinc Media",
      meta_description:
        "Flutterwave's new funding round and what it means for African fintech.",
      og_image:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80",
    },
  },
  {
    id: "mock-003",
    slug: "kenya-national-ai-strategy-framework-2025",
    title:
      "Kenya Launches Africa's First National AI Strategy Framework — Other Governments Are Already Copying It",
    summary:
      "Kenya's comprehensive AI policy document goes beyond ethics guidelines to include procurement rules, liability frameworks, and a sovereign compute programme. Three other African governments have already requested copies.",
    content:
      "<p>Kenya's comprehensive AI policy document goes beyond ethics guidelines to include procurement rules, liability frameworks, and a sovereign compute programme. Three other African governments have already requested copies.</p>",
    featured_image:
      "https://images.unsplash.com/photo-1677442d019cecf3e5fa5aeddab77b02ef61208fa?w=1200&q=80",
    category: ["ai", "technology"],
    type: "news",
    tags: ["ai", "kenya", "policy", "government", "africa"],
    author: { name: "Afrisinc Media", role: "Editorial" },
    published_at: hoursAgo(6),
    updated_at: hoursAgo(6),
    read_time: 6,
    is_featured: false,
    ai_generated: true,
    seo: {
      meta_title: "Kenya National AI Strategy — Afrisinc Media",
      meta_description:
        "Kenya launches Africa's first national AI strategy framework.",
      og_image:
        "https://images.unsplash.com/photo-1677442d019cecf3e5fa5aeddab77b02ef61208fa?w=1200&q=80",
    },
  },
  {
    id: "mock-004",
    slug: "mtn-open-ran-rollout-12-countries-africa",
    title:
      "MTN's Open RAN Rollout Across 12 Countries Is Quietly Reshaping Telecom Infrastructure in Africa",
    summary:
      "The telecoms giant is betting on disaggregated, vendor-neutral networks to slash infrastructure costs and accelerate rural connectivity goals by 2027 — and smaller operators are watching closely.",
    content:
      "<p>The telecoms giant is betting on disaggregated, vendor-neutral networks to slash infrastructure costs and accelerate rural connectivity goals by 2027.</p>",
    featured_image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80",
    category: ["technology"],
    type: "news",
    tags: ["mtn", "openran", "5g", "telecom", "infrastructure"],
    author: { name: "Afrisinc Media", role: "Editorial" },
    published_at: hoursAgo(9),
    updated_at: hoursAgo(9),
    read_time: 4,
    is_featured: false,
    ai_generated: true,
    seo: {
      meta_title: "MTN Open RAN Rollout — Afrisinc Media",
      meta_description: "MTN's Open RAN rollout across 12 African countries.",
      og_image:
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80",
    },
  },
  {
    id: "mock-005",
    slug: "african-green-bonds-8b-esg-capital-2025",
    title:
      "African Green Bonds Hit $8B in 2025 as ESG Capital Floods the Continent",
    summary:
      "Sovereign and corporate green bond issuances hit a record high as international fund managers look for climate-aligned yield in emerging markets — with Africa offering some of the most compelling risk-adjusted returns.",
    content:
      "<p>Sovereign and corporate green bond issuances hit a record high as international fund managers look for climate-aligned yield in emerging markets.</p>",
    featured_image:
      "https://images.unsplash.com/photo-1526304640581-d334cdbbf92e?w=1200&q=80",
    category: ["business"],
    type: "news",
    tags: ["green bonds", "ESG", "finance", "investment", "climate"],
    author: { name: "Afrisinc Media", role: "Editorial" },
    published_at: hoursAgo(12),
    updated_at: hoursAgo(12),
    read_time: 6,
    is_featured: false,
    ai_generated: true,
    seo: {
      meta_title: "African Green Bonds $8B — Afrisinc Media",
      meta_description: "African green bond issuances hit $8B record in 2025.",
      og_image:
        "https://images.unsplash.com/photo-1526304640581-d334cdbbf92e?w=1200&q=80",
    },
  },
  {
    id: "mock-006",
    slug: "mpesa-18-years-b2b-payments-pivot-kenya",
    title:
      "M-PESA at 18: How Kenya's Mobile Money Pioneer Is Pivoting to B2B Payments and Merchant Finance",
    summary:
      "After dominating consumer transfers for nearly two decades, Safaricom's flagship product is reinventing itself as enterprise infrastructure for the continent's rapidly growing SME economy.",
    content:
      "<p>After dominating consumer transfers for nearly two decades, Safaricom's flagship product is reinventing itself as enterprise infrastructure for the continent's rapidly growing SME economy.</p>",
    featured_image:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&q=80",
    category: ["fintech"],
    type: "editorial",
    tags: ["mpesa", "safaricom", "b2b", "payments", "kenya"],
    author: { name: "Afrisinc Media", role: "Editorial" },
    published_at: hoursAgo(16),
    updated_at: hoursAgo(16),
    read_time: 8,
    is_featured: false,
    ai_generated: true,
    seo: {
      meta_title: "M-PESA at 18: B2B Pivot — Afrisinc Media",
      meta_description:
        "M-PESA pivots to B2B payments and merchant finance at 18 years.",
      og_image:
        "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&q=80",
    },
  },
  {
    id: "mock-007",
    slug: "nigerian-startups-training-local-language-models-yoruba-igbo-hausa",
    title:
      "Nigerian Startups Are Training Local Language Models on Yoruba, Igbo, and Hausa — and It's Working",
    summary:
      "A coalition of Lagos-based AI labs is building the data infrastructure for models that actually understand how Africa speaks, and early benchmarks are beating multilingual giants on low-resource language tasks.",
    content:
      "<p>A coalition of Lagos-based AI labs is building the data infrastructure for models that actually understand how Africa speaks.</p>",
    featured_image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80",
    category: ["ai", "startups"],
    type: "news",
    tags: ["NLP", "language models", "nigeria", "yoruba", "igbo", "hausa"],
    author: { name: "Afrisinc Media", role: "Editorial" },
    published_at: hoursAgo(20),
    updated_at: hoursAgo(20),
    read_time: 5,
    is_featured: false,
    ai_generated: true,
    seo: {
      meta_title: "Nigerian AI Language Models — Afrisinc Media",
      meta_description:
        "Nigerian startups training AI models on Yoruba, Igbo, and Hausa.",
      og_image:
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80",
    },
  },
  {
    id: "mock-008",
    slug: "women-led-vc-funds-outperforming-africa-data-analysis",
    title:
      "Women-Led VC Funds Are Outperforming in Africa: A Data Analysis of 5-Year Returns Across 60 Portfolios",
    summary:
      "New research shows gender-diverse fund leadership correlates strongly with portfolio resilience and exit multiples in African venture markets — and the data spans five vintage years across 60 funds.",
    content:
      "<p>New research shows gender-diverse fund leadership correlates strongly with portfolio resilience and exit multiples in African venture markets.</p>",
    featured_image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80",
    category: ["business", "startups"],
    type: "editorial",
    tags: ["VC", "gender", "investment", "startups", "africa"],
    author: { name: "Afrisinc Media", role: "Editorial" },
    published_at: hoursAgo(28),
    updated_at: hoursAgo(28),
    read_time: 9,
    is_featured: false,
    ai_generated: true,
    seo: {
      meta_title: "Women-Led VC Funds in Africa — Afrisinc Media",
      meta_description:
        "Data analysis shows women-led VC funds outperforming in Africa.",
      og_image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80",
    },
  },
];

export const mockFeaturedArticle =
  mockArticles.find((a) => a.is_featured) ?? mockArticles[0];

// Derive unique categories from mock articles
export const mockCategories = Array.from(
  new Map(
    mockArticles
      .flatMap((a) => (Array.isArray(a.category) ? a.category : [a.category]))
      .map((cat) => [
        cat.toLowerCase(),
        {
          id: cat.toLowerCase(),
          name: cat.charAt(0).toUpperCase() + cat.slice(1),
          slug: cat.toLowerCase(),
          description: "",
        },
      ]),
  ).values(),
);
