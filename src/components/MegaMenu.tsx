import { createPortal } from "react-dom";
import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import gsap from "gsap";

interface MegaMenuColumn {
	title: string;
	links: { label: string; href: string; isExternal?: boolean }[];
}

const MENU_COLUMNS: MegaMenuColumn[] = [
	{
		title: "Knowledge",
		links: [
			{ label: "Menopause and perimenopause", href: "/knowledge-menopause-perimenopause" },
			{ label: "Women's hormonal health", href: "/knowledge-womens-hormonal-health" },
			{ label: "Knowledge library", href: "/knowledge" },
			{ label: "How-to guides", href: "/how-to-guides" },
			{ label: "FAQs", href: "/faqs" },
		],
	},
	{
		title: "Our services",
		links: [
			{ label: "Consultations", href: "/consultations" },
			{ label: "Testosterone for women", href: "/testosterone-for-women" },
			{ label: "Prescriptions", href: "/prescriptions" },
			{ label: "PMS and PMDD", href: "/services-pms-and-pmdd" },
			{ label: "Coils", href: "/coils" },
			{ label: "DEXA scans", href: "/dexa-body-scans" },
			{ label: "Blood tests", href: "/blood-tests" },
			{ label: "Ultrasound scans", href: "/services/ultrasound-scans" },
		],
	},
	{
		title: "Newson Clinic",
		links: [
			{ label: "About", href: "/about-us" },
			{ label: "Contact", href: "/contact-us" },
			{ label: "Our team", href: "/meet-the-team" },
			{ label: "Prices", href: "/prices" },
			{ label: "Our clinics", href: "/clinics" },
			{ label: "Careers", href: "/careers-home" },
			{ label: "Testimonials and reviews", href: "/testimonials" },
			{ label: "Newsletter", href: "/newsletter" },
		],
	},
];

const BOOKING_URL = "https://portal.newsonhealth.co.uk/patient-portal/booking-request";
const KLARNA_LOGO = "https://cdn.prod.website-files.com/6751c479dec4c0b0de747da1/687fa6025ef255282c049690_Klarna%20logo.png";

export default function MegaMenu({ logoSrc }: { logoSrc?: string }) {
	const [isOpen, setIsOpen] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const [mounted, setMounted] = useState(false);

	const overlayRef = useRef<HTMLDivElement>(null);
	const menuPanelRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const tl = useRef<gsap.core.Timeline | null>(null);

	useEffect(() => setMounted(true), []);

	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth < 1024);
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	useLayoutEffect(() => {
		if (!overlayRef.current || !menuPanelRef.current) return;
		const q = gsap.utils.selector(menuPanelRef.current);
		tl.current = gsap
			.timeline({ paused: true, defaults: { ease: "expo.out" } })
			.to(overlayRef.current, { autoAlpha: 1, duration: 0.5 })
			.fromTo(
				menuPanelRef.current,
				{ yPercent: -10, autoAlpha: 0, scale: 0.98 },
				{ yPercent: 0, autoAlpha: 1, scale: 1, duration: 0.7 },
				"<0.1"
			)
			.fromTo(
				q(".menu-contact-card"),
				{ x: -30, autoAlpha: 0 },
				{ x: 0, autoAlpha: 1, duration: 0.6 },
				"-=0.45"
			)
			.fromTo(
				q(".menu-col"),
				{ y: 24, autoAlpha: 0 },
				{ y: 0, autoAlpha: 1, duration: 0.55, stagger: 0.06 },
				"-=0.5"
			)
			.fromTo(
				q(".menu-link-item"),
				{ y: 16, autoAlpha: 0 },
				{ y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.015 },
				"-=0.45"
			);
		return () => {
			tl.current?.kill();
		};
	}, [mounted]);

	useEffect(() => {
		if (isOpen) {
			tl.current?.timeScale(1).play();
			document.body.style.overflow = "hidden";
		} else {
			tl.current?.timeScale(1.4).reverse();
			document.body.style.overflow = "";
		}
	}, [isOpen]);

	const closeMenu = useCallback(() => setIsOpen(false), []);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen) {
				closeMenu();
				buttonRef.current?.focus();
			}
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [isOpen, closeMenu]);

	const menuContent = (
		<>
			{/* Backdrop */}
			<div
				ref={overlayRef}
				className="fixed inset-0 z-[105] bg-[#1a0a10]/40 backdrop-blur-md invisible opacity-0"
				onClick={closeMenu}
				aria-hidden="true"
			/>

			{/* Panel */}
			<div
				ref={menuPanelRef}
				className={`fixed left-0 w-full max-w-[100vw] z-[110] bg-white/98 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.1)] overflow-y-auto overflow-x-hidden invisible opacity-0 ${
					isMobile ? "top-0 h-[100dvh] pt-24 pb-12" : "top-0 pt-44 pb-20 rounded-b-[3rem] border-b border-black/5"
				}`}
				role="navigation"
				aria-label="Main navigation"
			>
				{/* Mobile in-panel header */}
				<div className="absolute top-0 left-0 w-full h-20 px-6 flex items-center justify-between lg:hidden border-b border-black/5 bg-white/70 backdrop-blur-xl z-50">
					{logoSrc ? (
						<img src={logoSrc} alt="Newson Clinic" className="h-6 w-auto" />
					) : (
						<span className="font-display font-bold text-lg text-not-quite-black">Newson Clinic</span>
					)}
					<button
						type="button"
						onClick={closeMenu}
						aria-label="Close menu"
						className="w-10 h-10 rounded-full bg-black/5 hover:bg-[#ea526f] hover:text-white text-not-quite-black flex items-center justify-center transition-colors"
					>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
							<path d="M18 6L6 18M6 6l12 12" />
						</svg>
					</button>
				</div>

				{/* Decorative blobs */}
				<div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#f7d3d9]/40 to-transparent rounded-full blur-[100px] pointer-events-none -z-10" />
				<div className="absolute bottom-0 left-[10%] w-[450px] h-[450px] bg-[#ea526f]/5 rounded-full blur-[120px] pointer-events-none -z-10" />

				<div className="container mx-auto px-6 lg:px-10 max-w-[1480px] h-full">
					{/* ── TOP UTILITY ROW: search + patient portal (key for mobile) ── */}
					<form
						action="/search"
						method="get"
						className="menu-top-utility flex flex-col sm:flex-row items-stretch gap-3 mb-8 lg:mb-10"
						onSubmit={(e) => {
							const input = e.currentTarget.querySelector('input[name="q"]') as HTMLInputElement | null;
							const q = input?.value.trim();
							if (!q) {
								e.preventDefault();
								return;
							}
							closeMenu();
						}}
					>
						<label className="relative flex-1 group">
							<span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#ea526f] pointer-events-none">
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
									<circle cx="11" cy="11" r="8" />
									<line x1="21" y1="21" x2="16.65" y2="16.65" />
								</svg>
							</span>
							<input
								type="search"
								name="q"
								placeholder="Search the clinic — services, articles, FAQs…"
								className="w-full bg-[#fdf5f1] focus:bg-white border border-transparent focus:border-[#ea526f]/30 rounded-full py-3.5 sm:py-4 pl-14 pr-5 text-[14px] sm:text-[15px] font-medium text-not-quite-black outline-none transition-colors placeholder:text-[#888]"
							/>
						</label>
						<a
							href="https://portal.newsonhealth.co.uk/patient-portal"
							target="_blank"
							rel="noopener noreferrer"
							onClick={closeMenu}
							className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 rounded-full bg-white border border-black/8 text-not-quite-black text-[12px] font-bold uppercase tracking-[0.12em] hover:bg-not-quite-black hover:text-white hover:border-not-quite-black transition-colors shrink-0"
						>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
								<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
								<circle cx="12" cy="7" r="4" />
							</svg>
							<span>Patient Portal</span>
						</a>
					</form>

					<div className={`grid gap-10 lg:gap-14 ${isMobile ? "grid-cols-1" : "grid-cols-[360px_1fr] xl:grid-cols-[400px_1fr]"}`}>
						{/* ── LEFT: Contact card ── */}
						<aside className="menu-contact-card min-w-0">
							<div className="bg-gradient-to-br from-[#fdf5f1] via-white to-[#f7d3d9]/30 rounded-[2rem] p-7 lg:p-8 border border-black/5 shadow-[0_25px_60px_-20px_rgba(233,81,111,0.3)] relative overflow-hidden">
								<div className="absolute -top-16 -right-16 w-40 h-40 bg-[#ea526f]/15 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

								{/* Eyebrow */}
								<div className="flex items-center gap-2 mb-5">
									<span className="w-1.5 h-1.5 rounded-full bg-[#ea526f] animate-pulse" />
									<span className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#ea526f]">
										We're here to help
									</span>
								</div>

								<h3 className="font-display text-[1.8rem] lg:text-[2rem] leading-[1.05] text-not-quite-black mb-5">
									Our friendly team is{" "}
									<span className="text-[#ea526f] italic font-light">here for you.</span>
								</h3>

								<p className="text-[14px] text-[#666] leading-relaxed mb-7">
									If you need advice booking your consultation, please call us:
								</p>

								<a
									href="tel:01789595004"
									className="group flex items-center gap-4 mb-3"
									onClick={closeMenu}
								>
									<span className="w-12 h-12 rounded-full bg-[#ea526f] text-white flex items-center justify-center shadow-[0_10px_20px_rgba(233,81,111,0.3)] group-hover:scale-110 transition-transform">
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
											<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
										</svg>
									</span>
									<span className="flex flex-col leading-tight">
										<span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#888]">
											Call us
										</span>
										<span className="font-display text-[1.6rem] text-not-quite-black group-hover:text-[#ea526f] transition-colors">
											01789 595004
										</span>
									</span>
								</a>

								<p className="text-[12px] text-[#888] mb-7 ml-16">Mon – Fri, 9:00am – 5:00pm</p>

								<a
									href={BOOKING_URL}
									target="_blank"
									rel="noopener noreferrer"
									onClick={closeMenu}
									className="group/btn flex items-center justify-between gap-3 w-full px-6 py-4 bg-not-quite-black text-white text-[12px] font-bold uppercase tracking-[0.12em] rounded-full shadow-[0_15px_30px_rgba(0,0,0,0.18)] hover:bg-[#ea526f] hover:shadow-[0_18px_36px_rgba(233,81,111,0.4)] hover:-translate-y-0.5 transition-all duration-300"
								>
									<span>Book an appointment</span>
									<span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center group-hover/btn:bg-white group-hover/btn:text-[#ea526f] transition-colors">
										<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
											<path d="M5 12h14M12 5l7 7-7 7" />
										</svg>
									</span>
								</a>

								{/* Klarna */}
								<div className="mt-6 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-black/5">
									<img src={KLARNA_LOGO} alt="Klarna" className="h-5 w-auto" loading="lazy" />
									<p className="text-[11px] text-not-quite-black font-semibold leading-tight">
										Pay by <span className="text-[#ea526f]">Klarna</span> available
									</p>
								</div>
							</div>
						</aside>

						{/* ── RIGHT: 3-column link grid ── */}
						<div className={`grid gap-10 lg:gap-12 ${isMobile ? "grid-cols-1" : "grid-cols-3"}`}>
							{MENU_COLUMNS.map((col, idx) => (
								<div key={idx} className="menu-col flex flex-col">
									<div className="flex items-center gap-3 mb-6 pb-4 border-b border-black/8">
										<span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#ea526f]">
											{col.title}
										</span>
										<span className="flex-1 h-[1px] bg-gradient-to-r from-[#ea526f]/20 to-transparent" />
									</div>
									<ul className="flex flex-col gap-1">
										{col.links.map((link, li) => (
											<li key={li} className="menu-link-item">
												<a
													href={link.href}
													target={link.isExternal ? "_blank" : undefined}
													rel={link.isExternal ? "noopener noreferrer" : undefined}
													onClick={closeMenu}
													className="group inline-flex items-center gap-3 py-2 text-[15px] lg:text-[1.0625rem] font-medium text-not-quite-black hover:text-[#ea526f] transition-colors duration-300 relative"
												>
													<span className="relative">
														{link.label}
														<span className="absolute left-0 -bottom-0.5 w-full h-[1px] bg-[#ea526f] origin-left scale-x-0 transition-transform duration-500 ease-out-expo group-hover:scale-x-100" />
													</span>
													<svg
														className="w-3.5 h-3.5 text-[#ea526f] opacity-0 -translate-x-1.5 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														strokeWidth="2.5"
														strokeLinecap="round"
														strokeLinejoin="round"
														aria-hidden="true"
													>
														<path d="M5 12h14M12 5l7 7-7 7" />
													</svg>
												</a>
											</li>
										))}
									</ul>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</>
	);

	return (
		<>
			<button
				ref={buttonRef}
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				aria-expanded={isOpen}
				aria-label={isOpen ? "Close menu" : "Open menu"}
				className={`group relative z-[120] flex items-center gap-2.5 h-11 md:h-12 pl-3.5 pr-4 md:pl-4 md:pr-5 rounded-full border transition-all duration-300 ${
					isOpen
						? "bg-[#ea526f] border-[#ea526f] text-white shadow-[0_10px_25px_rgba(233,81,111,0.4)]"
						: "bg-white border-black/5 text-not-quite-black hover:bg-not-quite-black hover:border-not-quite-black hover:text-white shadow-sm"
				}`}
			>
				<span className="relative w-5 h-3.5 flex flex-col justify-between pointer-events-none">
					<span
						className={`block w-full h-[2px] rounded-full transition-all duration-500 ease-out origin-center ${
							isOpen ? "translate-y-[7px] rotate-45 bg-white" : "bg-current group-hover:-translate-y-0.5"
						}`}
					/>
					<span
						className={`block w-full h-[2px] rounded-full transition-all duration-300 ease-out ${
							isOpen ? "opacity-0 scale-x-0 bg-white" : "opacity-100 bg-current"
						}`}
					/>
					<span
						className={`block w-full h-[2px] rounded-full transition-all duration-500 ease-out origin-center ${
							isOpen ? "-translate-y-[5px] -rotate-45 bg-white" : "bg-current group-hover:translate-y-0.5"
						}`}
					/>
				</span>
				<span className="hidden sm:inline text-[12px] font-bold uppercase tracking-[0.14em]">
					{isOpen ? "Close" : "Menu"}
				</span>
			</button>

			{mounted && typeof document !== "undefined" ? createPortal(menuContent, document.body) : null}
		</>
	);
}
