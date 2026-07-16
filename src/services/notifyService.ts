// Notify Service — wraps POST /apps/:appId/contacts
// Supports both contact form (source=contact_form → auto-reply) and newsletter subscription

const NOTIFY_URL = import.meta.env.VITE_NOTIFY_URL;
const NOTIFY_APP_ID = import.meta.env.VITE_NOTIFY_APP_ID;

// ── Types matching CreateContactSchema ────────────────────────────────────────

type ContactSource =
  | "contact_form"
  | "import"
  | "api"
  | "webhook"
  | "widget"
  | "newsletter";
type ContactStatus = "active" | "inactive" | "unsubscribed";

interface ContactPayload {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  subject?: string;
  message?: string;
  status?: ContactStatus;
  subscribed?: boolean;
  tags?: string[];
  attributes?: Record<string, unknown>;
  source: ContactSource;
}

// ── Internal helper ───────────────────────────────────────────────────────────

async function postContact(payload: ContactPayload): Promise<void> {
  if (!NOTIFY_URL || !NOTIFY_APP_ID) {
    throw new Error(
      "Notify service not configured. Set VITE_NOTIFY_URL and VITE_NOTIFY_APP_ID.",
    );
  }

  const res = await fetch(`${NOTIFY_URL}/api/apps/${NOTIFY_APP_ID}/contacts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Notify API error ${res.status}: ${body}`);
  }
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

// ── Contact Form ──────────────────────────────────────────────────────────────
// source=contact_form → notification-service auto-sends a reply email

export async function submitContactForm(data: {
  name: string;
  email: string;
  company?: string;
  subject?: string;
  message?: string;
}): Promise<void> {
  const { firstName, lastName } = splitName(data.name);

  await postContact({
    email: data.email,
    firstName,
    ...(lastName && { lastName }),
    ...(data.company && { company: data.company }),
    ...(data.subject && { subject: data.subject }),
    ...(data.message && { message: data.message }),
    status: "active",
    subscribed: false, // contact form ≠ newsletter opt-in
    source: "contact_form", // triggers auto-reply in notification-service
    tags: ["contact", "afrisinc-web"],
    attributes: {
      form_source: "contact_page",
      submitted_at: new Date().toISOString(),
    },
  });
}

// ── Newsletter Subscription ───────────────────────────────────────────────────
// Tags drive n8n campaign audience targeting:
//   "newsletter"         → all newsletter subscribers
//   "media-subscriber"   → Afrisinc Media specific
//   "interest:<category>" → per-category interest (e.g. "interest:technology")

export interface SubscribeOptions {
  firstName?: string;
  lastName?: string;
  /** Category interests selected by the user (e.g. ["technology", "fintech"]) */
  categories?: string[];
  /** Page/section where the subscribe form lives */
  formPage?: string;
}

export async function subscribeNewsletter(
  email: string,
  options: SubscribeOptions = {},
): Promise<void> {
  const {
    firstName,
    lastName,
    categories = [],
    formPage = "unknown",
  } = options;

  // Base tags every media subscriber gets
  const tags: string[] = ["newsletter", "media-subscriber"];

  // Per-category interest tags — used by n8n WF4 to target specific audiences
  categories.forEach((cat) => {
    if (cat) tags.push(`interest:${cat.toLowerCase()}`);
  });

  await postContact({
    email,
    ...(firstName && { firstName }),
    ...(lastName && { lastName }),
    status: "active",
    subscribed: true,
    source: "newsletter",
    tags,
    attributes: {
      subscribe_source: "afrisinc-media",
      form_page: formPage,
      subscribed_at: new Date().toISOString(),
      ...(categories.length > 0 && { category_interests: categories }),
    },
  });
}
