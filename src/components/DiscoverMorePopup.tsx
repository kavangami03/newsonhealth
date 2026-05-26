import { useEffect, useState } from "react";

// sessionStorage so the popup only shows once per browser session:
// - survives in-site navigation and hard refresh on the same tab
// - cleared when the tab/browser closes, so it shows again on the user's next visit
const SESSION_SHOWN_KEY = "newsonhealth:discover_more_shown";
const OPEN_AFTER_MS = 1800;

interface DiscoverCard {
	title: string;
	url: string;
	image: string;
	accent: string;
}

const CARDS: DiscoverCard[] = [
	{
		title: "Tour",
		url: "https://www.drlouisenewson.co.uk/events",
		image:
			"https://cdn.prod.website-files.com/6751c479dec4c0b0de747da1/69e219fbaad071867c4b058b_Screenshot%202026-04-17%20at%2010.21.28.avif",
		accent: "from-emerald-50 to-emerald-100/40",
	},
	{
		title: "Books",
		url: "https://www.drlouisenewson.co.uk/books",
		image:
			"https://cdn.prod.website-files.com/6751c479dec4c0b0de747da1/69e21b5fde5fe07accc2f1e0_Screenshot%202026-04-17%20at%2010.34.00.avif",
		accent: "from-lime-50 to-emerald-100/40",
	},
	{
		title: "Podcasts",
		url: "https://www.drlouisenewson.co.uk/podcasts",
		image:
			"https://cdn.prod.website-files.com/6751c479dec4c0b0de747da1/69e21cc401863bf8ce3ed069_DLN%20Podcast%20Artwork.avif",
		accent: "from-rose-50 to-rose-100/40",
	},
	{
		title: "Balance app",
		url: "https://www.balance-app.com",
		image:
			"https://cdn.prod.website-files.com/6751c479dec4c0b0de747da1/69e21e0404776b3f3a1ba015_Bal.avif",
		accent: "from-pink-50 to-rose-100/40",
	},
];

const DOCTOR_IMAGE =
	"https://cdn.prod.website-files.com/6751c479dec4c0b0de747da1/69e216a9b75f63633ff59117_DL%202.png";

function alreadyShownThisSession(): boolean {
	if (typeof window === "undefined") return true;
	try {
		return window.sessionStorage.getItem(SESSION_SHOWN_KEY) === "1";
	} catch {
		return false;
	}
}

function markShownThisSession() {
	if (typeof window === "undefined") return;
	try {
		window.sessionStorage.setItem(SESSION_SHOWN_KEY, "1");
	} catch {
		/* sessionStorage unavailable (e.g. private mode quota) — ignore */
	}
}

export default function DiscoverMorePopup() {
	const [open, setOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const [triggerVisible, setTriggerVisible] = useState(false);

	// First-load behaviour: open the popup once per session, otherwise show the trigger.
	useEffect(() => {
		if (alreadyShownThisSession()) {
			// Already seen this session — only show the persistent trigger.
			const t = window.setTimeout(() => setTriggerVisible(true), 600);
			return () => window.clearTimeout(t);
		}
		const t = window.setTimeout(() => {
			markShownThisSession();
			setOpen(true);
			window.requestAnimationFrame(() => setMounted(true));
		}, OPEN_AFTER_MS);
		return () => window.clearTimeout(t);
	}, []);

	useEffect(() => {
		if (!open) return;
		const original = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") dismiss();
		};
		window.addEventListener("keydown", onKey);
		return () => {
			document.body.style.overflow = original;
			window.removeEventListener("keydown", onKey);
		};
	}, [open]);

	function dismiss() {
		setMounted(false);
		window.setTimeout(() => {
			setOpen(false);
			// Reveal the persistent re-open trigger after the popup closes.
			setTriggerVisible(true);
		}, 280);
	}

	function reopen() {
		setOpen(true);
		window.requestAnimationFrame(() => setMounted(true));
	}

	return (
		<>
			{open ? <DiscoverDialog onDismiss={dismiss} mounted={mounted} /> : null}
			<DiscoverTrigger visible={triggerVisible && !open} onClick={reopen} />
		</>
	);
}

/* ════════════════════════════════════════════════════════════════
   Persistent re-open trigger — bottom-right floating button
   ════════════════════════════════════════════════════════════════ */
function DiscoverTrigger({ visible, onClick }: { visible: boolean; onClick: () => void }) {
	const [hovered, setHovered] = useState(false);

	return (
		<button
			type="button"
			onClick={onClick}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			aria-label="Discover more about Dr Louise Newson"
			className={`fixed bottom-6 right-6 z-[95] group flex items-center gap-3 pl-2 pr-1 py-1 rounded-full bg-white shadow-[0_18px_40px_-10px_rgba(233,81,111,0.45),0_0_0_1px_rgba(0,0,0,0.04)] hover:shadow-[0_22px_50px_-10px_rgba(233,81,111,0.6)] transition-all duration-500 ease-out ${
				visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 pointer-events-none"
			}`}
			style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
		>
			{/* Animated pulse ring (draws attention) */}
			<span className="absolute -inset-1 rounded-full bg-[#ea526f]/20 opacity-40 pointer-events-none" aria-hidden="true" />

			{/* Doctor avatar */}
			<span className="relative shrink-0">
				<span className="block w-11 h-11 rounded-full overflow-hidden border-[2px] border-white shadow-[0_4px_12px_rgba(233,81,111,0.3)]">
					<img src={DOCTOR_IMAGE} alt="" className="w-full h-full object-cover object-top" />
				</span>
				{/* Pink dot status indicator */}
				<span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#ea526f] border-[2px] border-white shadow-sm" aria-hidden="true">
					<span className="absolute inset-0 rounded-full bg-[#ea526f] animate-ping opacity-50" />
				</span>
			</span>

			{/* Expanding label */}
			<span
				className={`relative overflow-hidden transition-all duration-500 ease-out flex items-center`}
				style={{
					width: hovered ? "190px" : "78px",
					transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
				}}
			>
				<span className="flex flex-col leading-tight pr-2 whitespace-nowrap">
					<span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#ea526f]">Discover</span>
					<span
						className={`font-display text-[13px] text-not-quite-black transition-opacity duration-300 ${
							hovered ? "opacity-100" : "opacity-100"
						}`}
					>
						{hovered ? (
							<span>
								<span className="italic font-light">More</span> from Dr&nbsp;Louise
							</span>
						) : (
							<span className="italic font-light">More</span>
						)}
					</span>
				</span>
			</span>

			{/* Pink arrow circle on the right end */}
			<span className="relative w-10 h-10 rounded-full bg-[#ea526f] text-white flex items-center justify-center shrink-0 shadow-[0_4px_10px_rgba(233,81,111,0.4)] group-hover:scale-110 transition-transform duration-300">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
					<path d="M5 12h14M12 5l7 7-7 7" />
				</svg>
			</span>
		</button>
	);
}

/* ════════════════════════════════════════════════════════════════
   Modal dialog (extracted so the trigger can render alongside it)
   ════════════════════════════════════════════════════════════════ */
function DiscoverDialog({ onDismiss, mounted }: { onDismiss: () => void; mounted: boolean }) {
	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="discover-more-title"
			className={`fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 lg:p-10 transition-opacity duration-300 ${
				mounted ? "opacity-100" : "opacity-0"
			}`}
			onClick={(e) => {
				if (e.target === e.currentTarget) onDismiss();
			}}
		>
			{/* Backdrop */}
			<div className="absolute inset-0 bg-[#1a0a10]/60 backdrop-blur-md" aria-hidden="true" />

			{/* Card */}
			<div
				className={`relative w-full max-w-[1080px] max-h-[92dvh] bg-white rounded-[1.25rem] sm:rounded-[1.75rem] md:rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden shadow-[0_50px_120px_-20px_rgba(233,81,111,0.45),0_0_0_1px_rgba(255,255,255,0.6)] grid grid-cols-1 md:grid-cols-[5fr_7fr] transition-all duration-500 ease-out ${
					mounted ? "translate-y-0 scale-100" : "translate-y-6 scale-95"
				}`}
			>
				{/* Decorative gradient */}
				<div className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-gradient-to-br from-[#ea526f]/10 to-transparent rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

				{/* ─── Stacked-layout close (top-right of card, < md) ─── */}
				<button
					type="button"
					onClick={onDismiss}
					aria-label="Close"
					className="md:hidden absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-30 w-9 h-9 rounded-full bg-white/95 hover:bg-[#ea526f] text-not-quite-black hover:text-white flex items-center justify-center transition-all duration-300 shadow-md backdrop-blur-md"
				>
					<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
						<path d="M18 6L6 18M6 6l12 12" />
					</svg>
				</button>

				{/* ═══ LEFT (md+) / TOP (mobile): Doctor portrait ═══ */}
				<div className="relative bg-gradient-to-br from-[#fdf5f1] via-white to-[#f7d3d9]/30 h-[160px] sm:h-[220px] md:h-auto md:min-h-[520px] lg:min-h-[640px] overflow-hidden flex-shrink-0">
					<img
						src={DOCTOR_IMAGE}
						alt="Dr Louise Newson"
						loading="lazy"
						className="absolute inset-0 w-full h-full object-cover object-[center_25%] md:object-[center_top] select-none"
					/>
					{/* Bottom fade on mobile (stacked layout only) */}
					<div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white via-white/60 to-transparent md:hidden pointer-events-none" />

					{/* Credential badge */}
					<div className="absolute bottom-3 left-3 md:bottom-5 md:left-5 lg:bottom-6 lg:left-6 flex items-center gap-2 md:gap-3 px-3 py-1.5 md:px-4 md:py-2.5 lg:px-5 lg:py-3 rounded-full bg-white/95 backdrop-blur-md md:backdrop-blur-xl shadow-md md:shadow-lg border border-white/60">
						<span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#ea526f] animate-pulse" />
						<span className="text-[12px] font-bold tracking-[0.15em] md:tracking-[0.2em] uppercase text-[#ea526f]">
							Clinic Founder
						</span>
					</div>
				</div>

				{/* ═══ RIGHT (md+) / BOTTOM (mobile): Content (scrolls internally if needed) ═══ */}
				<div className="relative flex flex-col overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-12">
					{/* Side-by-side close button (md+) */}
					<button
						type="button"
						onClick={onDismiss}
						aria-label="Close"
						className="hidden md:flex absolute top-5 right-5 lg:top-6 lg:right-6 w-10 h-10 rounded-full bg-black/[0.04] hover:bg-[#ea526f] text-not-quite-black hover:text-white items-center justify-center transition-all duration-300 hover:rotate-90 z-20"
					>
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
							<path d="M18 6L6 18M6 6l12 12" />
						</svg>
					</button>

					<h2
						id="discover-more-title"
						className="font-display text-[1.75rem] sm:text-[2.25rem] md:text-[2.5rem] lg:text-[3.25rem] xl:text-[3.75rem] leading-[0.95] tracking-tight mb-3 sm:mb-4 md:mb-5 lg:mb-6 pr-10 md:pr-0"
					>
						<span className="text-[#ea526f] italic font-light">Discover</span>{" "}
						<span className="text-not-quite-black">more.</span>
					</h2>

					<p className="text-[13px] sm:text-[14px] lg:text-[15px] text-[#666] leading-relaxed mb-4 sm:mb-5 md:mb-6 lg:mb-8 max-w-[460px]">
						Clinic founder —{" "}
						<strong className="text-not-quite-black font-semibold">Dr Louise Newson</strong>{" "}
						— a leading authority in hormone health is here to support your hormone journey.
					</p>

					{/* 2×2 grid of feature cards */}
					<div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-3 lg:gap-4">
						{CARDS.map((card) => (
							<a
								key={card.title}
								href={card.url}
								target="_blank"
								rel="noopener noreferrer"
								className={`group relative aspect-[5/4] rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-[1.25rem] overflow-hidden border border-black/5 bg-gradient-to-br ${card.accent} hover:shadow-[0_20px_40px_-12px_rgba(233,81,111,0.35)] hover:-translate-y-1 transition-all duration-500 ease-out`}
							>
								<img
									src={card.image}
									alt={`${card.title} preview`}
									loading="lazy"
									className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

								<div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 md:top-3 md:left-3 inline-flex items-center gap-1.5 px-2 sm:px-2.5 md:px-3 py-1 md:py-1.5 bg-[#ea526f] text-white text-[12px] font-bold tracking-wide rounded-full shadow-[0_8px_20px_rgba(233,81,111,0.4)] group-hover:gap-2.5 transition-all">
									<span>{card.title}</span>
									<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
										<path d="M9 18l6-6-6-6" />
									</svg>
								</div>
							</a>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
