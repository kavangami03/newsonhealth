import { useEffect, useState } from "react";

const BOOKING_DISMISS_KEY = "newsonhealth:booking_widget_collapsed";
const BOOKING_URL = "https://portal.newsonhealth.co.uk/patient-portal/booking-request";

export default function FloatingWidgets() {
	const [mounted, setMounted] = useState(false);
	const [bookingExpanded, setBookingExpanded] = useState(true);
	const [isShareOpen, setIsShareOpen] = useState(false);

	// Reveal widgets after a short delay
	useEffect(() => {
		const t = window.setTimeout(() => setMounted(true), 1000);

		// Respect the user's last preference (expanded vs collapsed)
		try {
			const stored = window.localStorage.getItem(BOOKING_DISMISS_KEY);
			if (stored === "1") setBookingExpanded(false);
		} catch {
			/* ignore */
		}

		return () => window.clearTimeout(t);
	}, []);

	const collapseBooking = () => {
		setBookingExpanded(false);
		try {
			window.localStorage.setItem(BOOKING_DISMISS_KEY, "1");
		} catch {
			/* ignore */
		}
	};

	const expandBooking = () => {
		setBookingExpanded(true);
		try {
			window.localStorage.setItem(BOOKING_DISMISS_KEY, "0");
		} catch {
			/* ignore */
		}
	};

	const springTransition = "cubic-bezier(0.34, 1.56, 0.64, 1)";

	return (
		<>
			{/* ─────────── Bottom-Left Booking Widget ─────────── */}
			<div
				className={`fixed bottom-6 left-6 z-[90] transition-all duration-700 ease-out ${
					mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
				}`}
				style={{ transitionTimingFunction: springTransition }}
			>
				{bookingExpanded ? (
					/* ─── Expanded card ─── */
					<div className="group relative w-[280px] rounded-[1.75rem] overflow-hidden bg-white shadow-[0_25px_60px_-15px_rgba(233,81,111,0.35),0_0_0_1px_rgba(0,0,0,0.04)] hover:shadow-[0_30px_70px_-15px_rgba(233,81,111,0.5)] transition-shadow duration-500">
						{/* Soft top gradient accent */}
						<div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#ea526f] via-[#f7798f] to-[#ea526f]" aria-hidden="true" />
						{/* Decorative pink blob */}
						<div className="absolute -top-14 -right-14 w-32 h-32 bg-[#ea526f]/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

						<div className="relative p-6 pt-7">
							{/* Collapse button */}
							<button
								type="button"
								onClick={collapseBooking}
								aria-label="Minimise booking widget"
								className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/[0.04] hover:bg-[#ea526f] text-[#888] hover:text-white flex items-center justify-center transition-all duration-300 hover:rotate-90"
							>
								<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
									<path d="M18 6L6 18M6 6l12 12" />
								</svg>
							</button>

							{/* Eyebrow */}
							<div className="flex items-center gap-2 mb-3">
								<span className="w-1.5 h-1.5 rounded-full bg-[#ea526f] animate-pulse" />
								<span className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#ea526f]">Book online</span>
							</div>

							{/* Headline */}
							<h3 className="font-display text-[1.65rem] leading-[1.05] tracking-tight text-not-quite-black mb-5">
								Appointments that
								<br />
								<span className="text-[#ea526f] italic font-light">work for you.</span>
							</h3>

							{/* CTA */}
							<a
								href={BOOKING_URL}
								target="_blank"
								rel="noopener noreferrer"
								className="group/btn inline-flex items-center gap-3 w-full px-5 py-3 bg-[#ea526f] text-white font-bold text-[12px] tracking-[0.12em] uppercase rounded-full shadow-[0_12px_24px_rgba(233,81,111,0.35)] hover:shadow-[0_16px_32px_rgba(233,81,111,0.5)] hover:-translate-y-0.5 transition-all duration-300"
							>
								<span className="flex-1">Book now</span>
								<span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover/btn:bg-white group-hover/btn:text-[#ea526f] transition-colors duration-300">
									<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
										<path d="M5 12h14M12 5l7 7-7 7" />
									</svg>
								</span>
							</a>
						</div>
					</div>
				) : (
					/* ─── Collapsed pill ─── */
					<button
						type="button"
						onClick={expandBooking}
						aria-label="Open booking widget"
						className="group flex items-center gap-3 pl-2 pr-5 py-2 rounded-full bg-white shadow-[0_15px_35px_-10px_rgba(233,81,111,0.4),0_0_0_1px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-10px_rgba(233,81,111,0.55)] transition-all duration-300"
					>
						<span className="w-10 h-10 rounded-full bg-[#ea526f] text-white flex items-center justify-center shadow-inner">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
								<rect x="3" y="4" width="18" height="18" rx="2" />
								<line x1="16" y1="2" x2="16" y2="6" />
								<line x1="8" y1="2" x2="8" y2="6" />
								<line x1="3" y1="10" x2="21" y2="10" />
							</svg>
						</span>
						<span className="text-[13px] font-bold text-not-quite-black tracking-tight group-hover:text-[#ea526f] transition-colors">
							Book appointment
						</span>
					</button>
				)}
			</div>

			{/* ─────────── Bottom-Right: Chat + Share stack ─────────── */}
			{/* <div
				className={`fixed bottom-6 right-6 z-[90] flex flex-row-reverse items-end gap-3 transition-all duration-700 ease-out ${
					mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
				}`}
				style={{ transitionDelay: "200ms", transitionTimingFunction: springTransition }}
			>
				<button
					type="button"
					aria-label="Open chat"
					className="w-[64px] h-[64px] rounded-full bg-[#ea526f] flex items-center justify-center text-white shadow-[0_20px_40px_-10px_rgba(233,81,111,0.55)] hover:bg-[#d63b58] hover:scale-105 hover:-translate-y-1 transition-all duration-300"
				>
					<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
					</svg>
				</button>
				<div className="relative flex flex-col items-center justify-end">
					<div className="absolute bottom-[70px] flex flex-col gap-3 pointer-events-none">
						<a
							href="#"
							aria-label="Share on LinkedIn"
							className={`w-[46px] h-[46px] rounded-full bg-white text-not-quite-black flex items-center justify-center shadow-lg hover:bg-[#0a66c2] hover:text-white group relative ${
								isShareOpen
									? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
									: "opacity-0 scale-50 translate-y-20"
							} transition-all duration-500`}
							style={{ transitionTimingFunction: springTransition, transitionDelay: isShareOpen ? "0.15s" : "0s" }}
						>
							<svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24" aria-hidden="true">
								<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
							</svg>
						</a>
						<a
							href="#"
							aria-label="Share on Instagram"
							className={`w-[46px] h-[46px] rounded-full bg-white text-not-quite-black flex items-center justify-center shadow-lg hover:text-white relative group overflow-hidden ${
								isShareOpen
									? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
									: "opacity-0 scale-50 translate-y-10"
							} transition-all duration-500`}
							style={{ transitionTimingFunction: springTransition, transitionDelay: isShareOpen ? "0.1s" : "0.05s" }}
						>
							<div className="absolute inset-0 bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
							<svg className="w-[18px] h-[18px] fill-current relative z-10" viewBox="0 0 24 24" aria-hidden="true">
								<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
							</svg>
						</a>
						<a
							href="#"
							aria-label="Share on Facebook"
							className={`w-[46px] h-[46px] rounded-full bg-white text-not-quite-black flex items-center justify-center shadow-lg hover:bg-[#1877F2] hover:text-white group relative ${
								isShareOpen
									? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
									: "opacity-0 scale-50 translate-y-5"
							} transition-all duration-500`}
							style={{ transitionTimingFunction: springTransition, transitionDelay: isShareOpen ? "0.05s" : "0.1s" }}
						>
							<svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24" aria-hidden="true">
								<path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
							</svg>
						</a>
					</div>
					<button
						type="button"
						onClick={() => setIsShareOpen(!isShareOpen)}
						aria-label={isShareOpen ? "Close share menu" : "Share page"}
						className={`relative w-[56px] h-[56px] rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-500 z-10 ${
							isShareOpen ? "bg-[#ea526f]" : "bg-[#2c3036] hover:bg-[#1d2024] hover:-translate-y-1 hover:scale-105"
						}`}
						style={{ transitionTimingFunction: springTransition }}
					>
						<svg
							className={`absolute w-5 h-5 transition-all duration-500 ${
								isShareOpen ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 -rotate-90"
							}`}
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="3"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<line x1="18" y1="6" x2="6" y2="18" />
							<line x1="6" y1="6" x2="18" y2="18" />
						</svg>
						<svg
							className={`absolute w-5 h-5 transition-all duration-500 ${
								!isShareOpen ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 rotate-90"
							}`}
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.5"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<circle cx="18" cy="5" r="3" />
							<circle cx="6" cy="12" r="3" />
							<circle cx="18" cy="19" r="3" />
							<line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
							<line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
						</svg>
					</button>
				</div>
			</div> */}
		</>
	);
}
