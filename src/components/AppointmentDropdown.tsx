import { useState, useRef, useEffect } from "react";
import gsap from "gsap";

export default function AppointmentDropdown() {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const menuRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const timeline = useRef<gsap.core.Timeline | null>(null);

	// Setup GSAP animation
	useEffect(() => {
		if (!menuRef.current) return;

		// Initialize timeline
		timeline.current = gsap.timeline({ paused: true })
			.fromTo(
				menuRef.current,
				{ y: 15, opacity: 0, scale: 0.98, display: "none" },
				{ y: 0, opacity: 1, scale: 1, display: "block", duration: 0.4, ease: "power3.out" }
			)
			.fromTo(
				menuRef.current.querySelectorAll(".dropdown-item"),
				{ opacity: 0, y: 10 },
				{ opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: "power2.out" },
				"-=0.2"
			);

		return () => {
			timeline.current?.kill();
		};
	}, []);

	// Play/Reverse animation on state change
	useEffect(() => {
		if (isOpen) {
			timeline.current?.play();
		} else {
			timeline.current?.reverse();
		}
	}, [isOpen]);

	// Handle clicking outside
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				isOpen &&
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node)
			) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isOpen]);

	return (
		<div className="relative z-50" ref={dropdownRef}>
			<button
				ref={buttonRef}
				onClick={() => setIsOpen(!isOpen)}
				className={`group flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-widest transition-all duration-500 ease-out-expo border
					${isOpen ? 'bg-newson-pink text-white border-newson-pink shadow-glow' : 'bg-white/80 border-black/5 text-not-quite-black hover:border-newson-pink/30 hover:bg-buff hover:shadow-premium'}`}
				aria-expanded={isOpen}
				aria-haspopup="true"
			>
				Book Appointment
				<svg 
					width="12" 
					height="12" 
					viewBox="0 0 24 24" 
					fill="none" 
					stroke="currentColor" 
					strokeWidth="2" 
					strokeLinecap="round" 
					strokeLinejoin="round"
					className={`transition-transform duration-500 ease-out-expo ${isOpen ? 'rotate-180' : ''}`}
				>
					<polyline points="6 9 12 15 18 9"></polyline>
				</svg>
			</button>

			<div 
				ref={menuRef}
				className="absolute right-0 top-[calc(100%+12px)] w-64 bg-white/95 backdrop-blur-2xl rounded-2xl border border-black/5 shadow-premium overflow-hidden p-2"
				style={{ display: "none" }}
			>
				<div className="px-4 py-3 border-b border-black/5 mb-2">
					<span className="text-[10px] font-bold text-newson-pink uppercase tracking-widest block mb-1">Select Visit Type</span>
					<p className="text-xs text-text-grey font-medium leading-relaxed">Choose the option that best fits your current journey.</p>
				</div>
				
				<div className="flex flex-col gap-1">
					<a href="https://portal.newsonhealth.co.uk/patient-portal/booking-request" target="_blank" rel="noopener noreferrer" className="dropdown-item group flex flex-col p-3 rounded-xl hover:bg-peachy-pink/20 transition-colors duration-300">
						<span className="text-sm font-semibold text-not-quite-black group-hover:text-newson-pink transition-colors">First Appointment</span>
						<span className="text-xs text-text-grey mt-0.5">Comprehensive initial consultation</span>
					</a>
					<a href="https://portal.newsonhealth.co.uk/patient-portal/booking-request" target="_blank" rel="noopener noreferrer" className="dropdown-item group flex flex-col p-3 rounded-xl hover:bg-peachy-pink/20 transition-colors duration-300">
						<span className="text-sm font-semibold text-not-quite-black group-hover:text-newson-pink transition-colors">Follow-up Appointment</span>
						<span className="text-xs text-text-grey mt-0.5">For returning patients</span>
					</a>
					<a href="/prices" className="dropdown-item group flex flex-col p-3 rounded-xl hover:bg-peachy-pink/20 transition-colors duration-300">
						<span className="text-sm font-semibold text-not-quite-black group-hover:text-newson-pink transition-colors">View Pricing</span>
						<span className="text-xs text-text-grey mt-0.5">Transparent clinical fees</span>
					</a>
				</div>
			</div>
		</div>
	);
}
