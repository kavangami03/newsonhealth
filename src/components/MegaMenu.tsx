import { createPortal } from "react-dom";
import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import gsap from "gsap";

interface MegaMenuColumn {
	title: string;
	links: { label: string; href: string }[];
}

const menuColumns: MegaMenuColumn[] = [
	{
		title: "Knowledge",
		links: [
			{ label: "Menopause and perimenopause", href: "/menopause" },
			{ label: "Womens Hormonal Health", href: "/hormones" },
			{ label: "Knowledge library", href: "/knowledge" },
			{ label: "How to guides", href: "/guides" },
			{ label: "FAQs", href: "/faq" },
		],
	},
	{
		title: "Our services",
		links: [
			{ label: "Consultations", href: "/consultations" },
			{ label: "Testosterone for women", href: "/testosterone" },
			{ label: "Prescriptions", href: "/prescriptions" },
			{ label: "PMS and PMDD", href: "/pms" },
			{ label: "Coils", href: "/coils" },
			{ label: "DEXA scans", href: "/dexa" },
			{ label: "Blood tests", href: "/blood-tests" },
			{ label: "Ultrasound scans", href: "/ultrasound" },
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
			{ label: "Sign up to our Newsletter", href: "#newsletter" },
		],
	},
];

export default function MegaMenu({ logoSrc }: { logoSrc?: string }) {
	const [isOpen, setIsOpen] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);
	
	const overlayRef = useRef<HTMLDivElement>(null);
	const menuPanelRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
	
	// GSAP References
	const tl = useRef<gsap.core.Timeline | null>(null);

	// Check screen size
	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth < 1024);
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	// Setup GSAP Timeline
	useLayoutEffect(() => {
		if (!overlayRef.current || !menuPanelRef.current) return;

		const q = gsap.utils.selector(menuPanelRef.current);

		tl.current = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } })
			// 1. Fade in the backdrop overlay
			.to(overlayRef.current, { autoAlpha: 1, duration: 0.6 })
			// 2. Slide down and fade in the main menu panel
			.fromTo(
				menuPanelRef.current,
				{ yPercent: -15, autoAlpha: 0, scale: 0.98 },
				{ yPercent: 0, autoAlpha: 1, scale: 1, duration: 0.8 },
				"<0.1" // start slightly after the overlay begins
			)
			// 3. Stagger the column headers
			.fromTo(
				q(".menu-col-header"),
				{ y: 30, autoAlpha: 0 },
				{ y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.05 },
				"-=0.5"
			)
			// 4. Stagger the links within the columns
			.fromTo(
				q(".menu-link-item"),
				{ y: 20, autoAlpha: 0 },
				{ y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.02 },
				"-=0.6"
			)
			// 5. Reveal the floating contact/support box
			.fromTo(
				q(".menu-featured-card"),
				{ y: 40, autoAlpha: 0, scale: 0.95 },
				{ y: 0, autoAlpha: 1, scale: 1, duration: 0.8 },
				"-=0.6"
			);

		return () => {
			tl.current?.kill();
		};
	}, [mounted]);

	// Play or reverse animation
	useEffect(() => {
		if (isOpen) {
			tl.current?.timeScale(1).play();
			document.body.style.overflow = "hidden";
		} else {
			tl.current?.timeScale(1.5).reverse();
			document.body.style.overflow = "";
		}
	}, [isOpen]);

	// Close handlers
	const closeMenu = useCallback(() => setIsOpen(false), []);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen) {
				closeMenu();
				buttonRef.current?.focus();
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, closeMenu]);

	const menuContent = (
		<>
			{/* Fullscreen Blurred Overlay Backdrop */}
			<div
				ref={overlayRef}
				className="fixed inset-0 z-[105] bg-[#f7d3d9]/60 backdrop-blur-md invisible opacity-0"
				onClick={closeMenu}
				aria-hidden="true"
			/>

			{/* Mega Menu Panel */}
			<div
				ref={menuPanelRef}
				className={`fixed left-0 w-full z-[110] bg-white/95 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.08)] overflow-y-auto invisible opacity-0 ${isMobile ? 'top-0 h-[100dvh] pt-24 pb-12' : 'top-0 pt-28 pb-16 rounded-b-[3rem] border-b border-black/5'}`}
				role="navigation"
				aria-label="Main navigation"
			>
				{/* Dedicated Mobile Header (Only visible inside menu on mobile) */}
				<div className="absolute top-0 left-0 w-full h-20 px-6 flex items-center justify-between lg:hidden border-b border-black/5 bg-white/50 backdrop-blur-md z-50">
					{logoSrc ? (
						<img src={logoSrc} alt="Newson Clinic" className="h-6 w-auto" />
					) : (
						<span className="font-display font-bold text-lg text-not-quite-black">Newson Clinic</span>
					)}
					<button
						onClick={closeMenu}
						className="flex items-center justify-center w-10 h-10 rounded-full bg-black/5 text-not-quite-black"
						aria-label="Close menu"
					>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
					</button>
				</div>

				{/* Background decorative blob */}
				<div className="absolute top-0 right-0 w-[500px] h-[500px] bg-peachy-pink/20 rounded-full blur-[100px] pointer-events-none -z-10"></div>
				<div className="absolute bottom-0 left-[10%] w-[400px] h-[400px] bg-newson-pink/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>

				<div className="container mx-auto px-6 max-w-[1400px] h-full flex flex-col relative pt-4">
					

					<div className={`grid gap-12 mt-4 md:mt-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-[1fr_350px] lg:grid-cols-[1fr_400px]'}`}>
						
						{/* Left side: Editorial Links Grid */}
						<div className={`grid gap-10 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
							{menuColumns.map((col, idx) => (
								<div key={idx} className="flex flex-col">
									<h3 className="menu-col-header text-[11px] font-bold text-[#ea526f] uppercase tracking-widest mb-6 border-b border-black/5 pb-4">
										{col.title}
									</h3>
									<ul className="flex flex-col gap-3">
										{col.links.map((link, linkIdx) => (
											<li key={linkIdx} className="menu-link-item">
												<a
													href={link.href}
													className="inline-block text-[1.1rem] font-medium text-not-quite-black hover:text-[#ea526f] transition-colors duration-300 py-1 relative group overflow-hidden"
													onClick={closeMenu}
												>
													{link.label}
													{/* Premium hover underline */}
													<span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#ea526f] origin-left scale-x-0 transition-transform duration-500 ease-out-expo group-hover:scale-x-100"></span>
												</a>
											</li>
										))}
									</ul>
								</div>
							))}
						</div>

						{/* Right side: Featured Action Card */}
						<div className="menu-featured-card flex flex-col justify-center">
							<div className="bg-white rounded-3xl p-8 shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-black/5 relative overflow-hidden group">
								<div className="w-12 h-12 rounded-full bg-[#fdf5f1] text-[#ea526f] flex items-center justify-center mb-6 border border-[#ea526f]/10">
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
								</div>
								
								<h4 className="text-xl font-display text-not-quite-black mb-3">Our friendly team are here to help</h4>
								<p className="text-sm text-text-grey leading-relaxed mb-6">
									If you need advice booking your consultation, our patient care team is available to guide you.
								</p>
								
								<div className="mb-6">
									<a href="tel:01789595004" className="text-xl text-[#ea526f] font-medium hover:text-peachy-pink transition-colors block mb-1">01789 595004</a>
									<span className="text-[10px] font-bold text-not-quite-black/60 uppercase tracking-widest">Mon – Fri, 9:00am to 5:00pm</span>
								</div>
								
								<a href="https://portal.newsonhealth.co.uk/patient-portal/booking-request" target="_blank" className="block w-full py-4 text-center bg-not-quite-black text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-[#ea526f] hover:shadow-glow transition-all duration-300">
									Book an appointment
								</a>
								
								{/* Klarna Badge fake wrapper */}
								<div className="mt-4 flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-black/5 bg-gray-50/50">
									<div className="w-12 h-4 bg-newson-pink/20 rounded flex items-center justify-center">
										<div className="w-8 h-2 bg-not-quite-black opacity-80"></div>
									</div>
									<p className="text-[10px] text-not-quite-black font-semibold leading-tight pr-2">Pay by Klarna<br/>available</p>
								</div>
							</div>
						</div>

					</div>
					
					{/* Mobile bottom footer (visible only on mobile) */}
					{isMobile && (
						<div className="mt-auto pt-10 pb-4 flex justify-center border-t border-black/5 mt-10">
							<a href="/contact-us" className="text-xs font-semibold text-text-grey uppercase tracking-widest hover:text-newson-pink transition-colors" onClick={closeMenu}>
								Contact Us
							</a>
						</div>
					)}
					
				</div>
			</div>
		</>
	);

	return (
		<>
			{/* Animated Hamburger Button */}
			<button
				ref={buttonRef}
				onClick={() => setIsOpen(!isOpen)}
				className="relative z-[120] flex flex-col justify-center items-center w-12 h-12 rounded-full bg-white/60 hover:bg-white backdrop-blur-md border border-black/5 shadow-sm transition-colors duration-300 group ml-auto"
				aria-expanded={isOpen}
				aria-label={isOpen ? "Close menu" : "Open menu"}
			>
				<div className="w-5 h-4 relative flex flex-col justify-between pointer-events-none">
					<span className={`w-full h-[1.5px] bg-not-quite-black rounded-full transition-all duration-500 ease-bounce origin-center ${isOpen ? 'translate-y-[7px] rotate-45' : 'group-hover:-translate-y-0.5'}`}></span>
					<span className={`w-full h-[1.5px] bg-not-quite-black rounded-full transition-all duration-300 ease-out ${isOpen ? 'opacity-0 scale-x-0' : 'opacity-100'}`}></span>
					<span className={`w-full h-[1.5px] bg-not-quite-black rounded-full transition-all duration-500 ease-bounce origin-center ${isOpen ? '-translate-y-[7px] -rotate-45' : 'group-hover:translate-y-0.5'}`}></span>
				</div>
			</button>

			{/* Portal the actual menu overlay out of the deeply nested pill header */}
			{mounted && typeof document !== 'undefined'
				? createPortal(menuContent, document.body)
				: null}
		</>
	);
}
