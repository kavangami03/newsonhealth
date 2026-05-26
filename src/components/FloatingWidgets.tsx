import { useState, useEffect } from "react";
import gsap from "gsap";

export default function FloatingWidgets() {
	const [showBookingWidget, setShowBookingWidget] = useState(true);
	const [isVisible, setIsVisible] = useState(false);
	const [isClosing, setIsClosing] = useState(false);
	const [isShareOpen, setIsShareOpen] = useState(false);

	// Delay the appearance of widgets slightly for a premium feel
	useEffect(() => {
		const timer = setTimeout(() => {
			setIsVisible(true);
		}, 1000);
		return () => clearTimeout(timer);
	}, []);

	// Animate out when closed
	const handleCloseBooking = () => {
		setIsClosing(true);
		setTimeout(() => setShowBookingWidget(false), 500);
	};

	if (!isVisible) return null;

	const springTransition = "cubic-bezier(0.34, 1.56, 0.64, 1)";

	return (
		<>
			{/* 1. Middle Right Sticky Booking Widget */}
			{showBookingWidget && (
				<div 
					id="floating-booking-widget"
					className={`fixed top-1/2 right-4 -translate-y-1/2 z-[90] w-[200px] bg-[#fdf5f1] rounded-[2rem] p-6 shadow-premium border border-black/5 transition-all duration-500 ease-in-out ${isClosing ? 'opacity-0 translate-x-12 scale-90 pointer-events-none' : 'opacity-100 translate-x-0 scale-100'}`}
					style={{ animation: isClosing ? 'none' : 'fadeInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
				>
					<button 
						onClick={handleCloseBooking}
						className="absolute top-4 right-4 w-6 h-6 rounded-full bg-black/10 flex items-center justify-center text-white hover:bg-black/20 transition-colors"
						aria-label="Close booking widget"
					>
						<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
					</button>
					
					<h3 className="text-2xl font-display text-newson-pink leading-[1.1] tracking-tight mb-5 mt-2">
						Book an appointment that works for you.
					</h3>
					
					<a 
						href="https://portal.newsonhealth.co.uk/patient-portal/booking-request"
						target="_blank"
						className="inline-block px-6 py-2.5 bg-[#ffa1c5] text-white font-medium rounded-full shadow-sm hover:shadow-glow hover:bg-newson-pink hover:-translate-y-0.5 transition-all duration-300"
					>
						Book now
					</a>
				</div>
			)}

			{/* 2. Bottom Right Sticky Action Buttons (Share & Chat) */}
			<div 
				className="fixed bottom-6 right-6 z-[90] flex flex-row-reverse items-end gap-3 animate-fade-in-up"
				style={{ animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards', opacity: 0 }}
			>
				{/* Chat Button */}
				<button 
					className="w-[70px] h-[70px] rounded-full bg-newson-pink flex items-center justify-center text-[#1a1a1a] shadow-premium hover:bg-complimentary-pink hover:shadow-glow hover:scale-105 hover:-translate-y-1 transition-all duration-300"
					aria-label="Open chat"
				>
					<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="mt-1">
						<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"></path>
					</svg>
				</button>
				
				{/* Share Button Group */}
				<div className="relative flex flex-col items-center justify-end">
					
					{/* Floating Social Icons (Bloom upwards) */}
					<div 
						className={`absolute bottom-[70px] flex flex-col gap-3 transition-all duration-500 origin-bottom pointer-events-none`}
						style={{ transitionTimingFunction: springTransition }}
					>
						{/* LinkedIn */}
						<a 
							href="#" 
							className={`w-[50px] h-[50px] rounded-full bg-white text-not-quite-black flex items-center justify-center shadow-lg hover:bg-[#0a66c2] hover:text-white group relative ${isShareOpen ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-50 translate-y-20"} transition-all duration-500`}
							style={{ transitionTimingFunction: springTransition, transitionDelay: isShareOpen ? '0.15s' : '0s' }}
							aria-label="Share on LinkedIn"
						>
							<svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
						</a>
						
						{/* Instagram */}
						<a 
							href="#" 
							className={`w-[50px] h-[50px] rounded-full bg-white text-not-quite-black flex items-center justify-center shadow-lg hover:text-white relative group overflow-hidden ${isShareOpen ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-50 translate-y-10"} transition-all duration-500`}
							style={{ transitionTimingFunction: springTransition, transitionDelay: isShareOpen ? '0.1s' : '0.05s' }}
							aria-label="Share on Instagram"
						>
							<div className="absolute inset-0 bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
							<svg className="w-5 h-5 fill-current relative z-10" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
						</a>
						
						{/* Facebook */}
						<a 
							href="#" 
							className={`w-[50px] h-[50px] rounded-full bg-white text-not-quite-black flex items-center justify-center shadow-lg hover:bg-[#1877F2] hover:text-white group relative ${isShareOpen ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-50 translate-y-5"} transition-all duration-500`}
							style={{ transitionTimingFunction: springTransition, transitionDelay: isShareOpen ? '0.05s' : '0.1s' }}
							aria-label="Share on Facebook"
						>
							<svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
						</a>
					</div>
					
					{/* Main Share Button (Toggles Stack) */}
					<button 
						onClick={() => setIsShareOpen(!isShareOpen)}
						className={`relative w-[60px] h-[60px] rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-500 z-10 ${
							isShareOpen ? "bg-newson-pink" : "bg-[#3a3f47] hover:bg-[#2c3036] hover:-translate-y-1 hover:scale-105"
						}`}
						style={{ transitionTimingFunction: springTransition }}
						aria-label={isShareOpen ? "Close share menu" : "Share page"}
					>
						{/* Cross Icon */}
						<svg className={`absolute w-6 h-6 transition-all duration-500 ${isShareOpen ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 -rotate-90"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
						
						{/* Share Icon */}
						<svg className={`absolute w-6 h-6 transition-all duration-500 ${!isShareOpen ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 rotate-90"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
					</button>
				</div>
			</div>

			<style>{`
				@keyframes fadeInRight {
					from { opacity: 0; transform: translate(40px, -50%); }
					to { opacity: 1; transform: translate(0, -50%); }
				}
				@keyframes fadeInUp {
					from { opacity: 0; transform: translateY(40px); }
					to { opacity: 1; transform: translateY(0); }
				}
			`}</style>
		</>
	);
}

