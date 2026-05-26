import { useEffect, useState } from "react";

const STORAGE_KEY = "newsonhealth:discover_more_dismissed_at";
const SUPPRESS_FOR_DAYS = 7;
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

function shouldShow(): boolean {
	if (typeof window === "undefined") return false;
	const raw = window.localStorage.getItem(STORAGE_KEY);
	if (!raw) return true;
	const dismissedAt = Number.parseInt(raw, 10);
	if (Number.isNaN(dismissedAt)) return true;
	const ageDays = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
	return ageDays > SUPPRESS_FOR_DAYS;
}

export default function DiscoverMorePopup() {
	const [open, setOpen] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		if (!shouldShow()) return;
		const t = window.setTimeout(() => {
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
			try {
				window.localStorage.setItem(STORAGE_KEY, Date.now().toString());
			} catch {
				/* storage unavailable — ignore */
			}
		}, 280);
	}

	if (!open) return null;

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="discover-more-title"
			className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 lg:p-10 transition-opacity duration-300 ${
				mounted ? "opacity-100" : "opacity-0"
			}`}
			onClick={(e) => {
				if (e.target === e.currentTarget) dismiss();
			}}
		>
			{/* Backdrop */}
			<div className="absolute inset-0 bg-[#1a0a10]/60 backdrop-blur-md" aria-hidden="true" />

			{/* Card */}
			<div
				className={`relative w-full max-w-[1080px] bg-white rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-[0_50px_120px_-20px_rgba(233,81,111,0.45),0_0_0_1px_rgba(255,255,255,0.6)] grid grid-cols-1 lg:grid-cols-[5fr_7fr] transition-all duration-500 ease-out ${
					mounted ? "translate-y-0 scale-100" : "translate-y-6 scale-95"
				}`}
			>
				{/* Decorative gradient */}
				<div className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-gradient-to-br from-[#ea526f]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

				{/* LEFT — Doctor portrait */}
				<div className="relative bg-gradient-to-br from-[#fdf5f1] via-white to-[#f7d3d9]/30 min-h-[260px] lg:min-h-[640px] overflow-hidden">
					<img
						src={DOCTOR_IMAGE}
						alt="Dr Louise Newson"
						loading="lazy"
						className="absolute inset-0 w-full h-full object-cover object-top scale-110 select-none"
					/>
					<div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white/90 via-white/30 to-transparent lg:hidden" />

					{/* Floating credential badge */}
					<div className="absolute bottom-6 left-6 hidden lg:flex items-center gap-3 px-5 py-3 rounded-full bg-white/95 backdrop-blur-xl shadow-lg border border-white/60">
						<span className="w-2 h-2 rounded-full bg-[#ea526f] animate-pulse" />
						<span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#ea526f]">
							Clinic Founder
						</span>
					</div>
				</div>

				{/* RIGHT — Content */}
				<div className="relative p-7 sm:p-10 lg:p-12 flex flex-col">
					{/* Close button */}
					<button
						type="button"
						onClick={dismiss}
						aria-label="Close"
						className="absolute top-5 right-5 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-black/[0.04] hover:bg-[#ea526f] text-not-quite-black hover:text-white flex items-center justify-center transition-all duration-300 hover:rotate-90 z-20"
					>
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
							<path d="M18 6L6 18M6 6l12 12" />
						</svg>
					</button>

					<h2
						id="discover-more-title"
						className="font-display text-[2.5rem] sm:text-[3.25rem] lg:text-[3.75rem] leading-[0.95] tracking-tight mb-6"
					>
						<span className="text-[#ea526f] italic font-light">Discover</span>{" "}
						<span className="text-not-quite-black">more.</span>
					</h2>

					<p className="text-[15px] sm:text-base text-[#666] leading-relaxed mb-8 max-w-[460px]">
						Clinic founder —{" "}
						<strong className="text-not-quite-black font-semibold">Dr Louise Newson</strong>{" "}
						— a leading authority in hormone health is here to support your hormone journey.
					</p>

					{/* 2×2 grid of feature cards */}
					<div className="grid grid-cols-2 gap-3 sm:gap-4">
						{CARDS.map((card) => (
							<a
								key={card.title}
								href={card.url}
								target="_blank"
								rel="noopener noreferrer"
								className={`group relative aspect-[5/4] rounded-2xl sm:rounded-[1.25rem] overflow-hidden border border-black/5 bg-gradient-to-br ${card.accent} hover:shadow-[0_20px_40px_-12px_rgba(233,81,111,0.35)] hover:-translate-y-1 transition-all duration-500 ease-out`}
							>
								<img
									src={card.image}
									alt={`${card.title} preview`}
									loading="lazy"
									className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

								<div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ea526f] text-white text-[11px] sm:text-[12px] font-bold tracking-wide rounded-full shadow-[0_8px_20px_rgba(233,81,111,0.4)] group-hover:gap-2.5 transition-all">
									<span>{card.title}</span>
									<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
										<path d="M9 18l6-6-6-6" />
									</svg>
								</div>
							</a>
						))}
					</div>

					{/* Tiny print */}
					<p className="mt-7 text-[11px] text-[#888] tracking-wide">
						Press{" "}
						<kbd className="px-1.5 py-0.5 rounded bg-black/5 font-mono text-[10px] text-[#444]">Esc</kbd>{" "}
						or click outside to dismiss. We won't show this again for {SUPPRESS_FOR_DAYS} days.
					</p>
				</div>
			</div>
		</div>
	);
}
