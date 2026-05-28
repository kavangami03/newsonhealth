/**
 * Centralised CMS helpers.
 *
 * Every page on this site pulls editable content from EmDash collections.
 * This module wraps the raw `getEmDashCollection` / `getEmDashEntry` calls
 * with typed helpers, sensible defaults, and safe fallbacks so pages stay
 * readable and never crash if the CMS is empty or unreachable.
 */
import { getEmDashCollection, getEmDashEntry } from "emdash";

/**
 * Normalise any image value (string URL, media-reference object, or JSON
 * string of one) down to a plain URL string so rendering code can stay as
 * `<img src={imageUrl(item.image)}>` regardless of how it was stored.
 */
export function imageUrl(value: any, fallback = ""): string {
	if (!value) return fallback;
	if (typeof value === "string") {
		const trimmed = value.trim();
		if (trimmed.startsWith("{")) {
			try {
				const parsed = JSON.parse(trimmed);
				return parsed?.src || parsed?.url || fallback;
			} catch {
				return trimmed;
			}
		}
		return trimmed;
	}
	if (typeof value === "object") {
		return value.src || value.url || fallback;
	}
	return fallback;
}

/** Extract alt text from a media reference (or empty string if none). */
export function imageAlt(value: any, fallback = ""): string {
	if (value && typeof value === "object") return value.alt || fallback;
	return fallback;
}

// ── Brand ──────────────────────────────────────────────────────────
export interface BrandInfo {
	phone: string;
	phone_link: string;
	email: string;
	address_line1: string;
	address_line2: string;
	town: string;
	region: string;
	postcode: string;
	country_code: string;
	hours_label: string;
	hours_open: string;
	hours_close: string;
	est_year: string;
	caption: string;
	registered_name: string;
	patient_portal_url: string;
	booking_url: string;
	edit?: any;
}

const BRAND_DEFAULTS: BrandInfo = {
	phone: "01789 595004",
	phone_link: "01789595004",
	email: "info@newsonhealth.co.uk",
	address_line1: "Winton House",
	address_line2: "Church Street",
	town: "Stratford-upon-Avon",
	region: "Warwickshire",
	postcode: "CV37 6HB",
	country_code: "GB",
	hours_label: "Monday – Friday · 9:00am – 5:00pm",
	hours_open: "09:00",
	hours_close: "17:00",
	est_year: "2018",
	caption: "Hormone & menopause care",
	registered_name: "Newson Health",
	patient_portal_url: "https://portal.newsonhealth.co.uk/patient-portal",
	booking_url: "https://portal.newsonhealth.co.uk/patient-portal/booking-request",
};

export async function getBrand(): Promise<BrandInfo> {
	try {
		const { entry } = await getEmDashEntry("brand_info" as any, "brand");
		if (!entry) return BRAND_DEFAULTS;
		const data = entry.data as any;
		return {
			...BRAND_DEFAULTS,
			...Object.fromEntries(
				Object.entries(data).filter(([_, v]) => v !== undefined && v !== null && v !== "")
			),
			edit: (entry as any).edit,
		} as BrandInfo;
	} catch {
		return BRAND_DEFAULTS;
	}
}

// ── Page intros (hero blocks for static pages) ──────────────────────
export interface PageIntro {
	title: string;
	subtitle?: string;
	description?: string;
	content?: string;
	breadcrumb_label?: string;
	button_text?: string;
	button_url?: string;
	secondary_button_text?: string;
	secondary_button_url?: string;
	image?: string;
	edit?: any;
}

export async function getPageIntro(slug: string, fallback: PageIntro): Promise<PageIntro> {
	try {
		const { entry } = await getEmDashEntry("page_intros" as any, slug);
		if (!entry) return fallback;
		const data = entry.data as any;
		return {
			...fallback,
			...Object.fromEntries(
				Object.entries(data).filter(([_, v]) => v !== undefined && v !== null && v !== "")
			),
			edit: (entry as any).edit,
		} as PageIntro;
	} catch {
		return fallback;
	}
}

/**
 * Render a page-intro title where the editor wrapped the highlighted part
 * in <span>…</span>. Returns a `before` and `highlight` chunk so pages can
 * style the highlighted portion (pink italic + underline) the way the
 * homepage hero does.
 */
export function splitTitleHighlight(title: string): { before: string; highlight: string; after: string } {
	const match = title.match(/^([\s\S]*?)<span>([\s\S]*?)<\/span>([\s\S]*)$/);
	if (!match) return { before: title, highlight: "", after: "" };
	return { before: match[1], highlight: match[2], after: match[3] };
}

// ── Generic list helpers ────────────────────────────────────────────
export async function getList<T = any>(
	collection: string,
	options: { orderBy?: Record<string, "asc" | "desc">; limit?: number; where?: Record<string, any> } = {}
): Promise<T[]> {
	try {
		const { entries } = await getEmDashCollection(collection as any, options as any);
		return entries as any as T[];
	} catch (err) {
		// Log instead of swallowing — if a collection is missing or the schema
		// cache is stale (e.g. new collection added without restarting the dev
		// server), this is the only signal we have.
		console.warn(`[cms] getList("${collection}") failed:`, (err as Error)?.message ?? err);
		return [];
	}
}

export async function getSocialLinks() {
	const entries = await getList<any>("social_links", { orderBy: { sort_order: "asc" } });
	return entries
		.map((e) => ({ platform: String(e.data.title || "").toLowerCase(), url: e.data.link as string, edit: e.edit }))
		.filter((l) => l.platform && l.url);
}

export async function getFooterLinks() {
	const entries = await getList<any>("footer_links", { orderBy: { sort_order: "asc" } });
	const columns: Record<string, { label: string; url: string; edit?: any }[]> = {
		knowledge: [],
		clinic: [],
		services: [],
	};
	entries.forEach((e) => {
		const col = String(e.data.column || "").toLowerCase();
		if (!columns[col]) columns[col] = [];
		columns[col].push({ label: e.data.title, url: e.data.link, edit: e.edit });
	});
	return columns;
}

export async function getTrustMessages() {
	const entries = await getList<any>("trust_messages", { orderBy: { sort_order: "asc" } });
	return entries.map((e) => ({
		message: e.data.title as string,
		icon: (e.data.icon as string) || "star",
		edit: e.edit,
	}));
}

export async function getServiceTags() {
	const entries = await getList<any>("service_tags", { orderBy: { sort_order: "asc" } });
	return entries.map((e) => ({ name: e.data.title as string, link: e.data.link as string, edit: e.edit }));
}

export async function getPricingTiers() {
	const entries = await getList<any>("pricing_tiers", { orderBy: { sort_order: "asc" } });
	return entries.map((e) => ({
		title: e.data.title as string,
		price: e.data.price as string,
		period: (e.data.period as string) || "",
		duration: (e.data.duration as string) || "",
		badge: (e.data.badge as string) || "",
		description: (e.data.description as string) || "",
		features: String(e.data.features || "")
			.split(/\r?\n/)
			.map((s) => s.trim())
			.filter(Boolean),
		ctaLabel: (e.data.cta_label as string) || "Book Now",
		ctaUrl: (e.data.cta_url as string) || "#",
		featured: Boolean(e.data.featured),
		edit: e.edit,
	}));
}

export async function getContactWidgets() {
	const entries = await getList<any>("contact_widgets", { orderBy: { sort_order: "asc" } });
	return entries.map((e) => ({
		title: e.data.title as string,
		body: (e.data.subtitle as string) || "",
		icon: (e.data.icon as string) || "info",
		linkLabel: (e.data.link_label as string) || "",
		linkUrl: (e.data.link_url as string) || "",
		accent: (e.data.accent as string) === "primary" ? "primary" : "default",
		edit: e.edit,
	}));
}
