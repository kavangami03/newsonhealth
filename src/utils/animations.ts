/**
 * Newson Clinic — Shared Animation Utilities
 * 
 * Centralized GSAP animation layer to prevent duplication.
 * All animation logic flows through here.
 * 
 * RULES:
 * - Only use transform and opacity (GPU-optimized)
 * - Respect prefers-reduced-motion
 * - Lazy-initialize heavy animations
 * - Reduce or disable animations on mobile when needed
 */

import { gsap } from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// ── Reduced Motion Detection ──

export const prefersReducedMotion = (): boolean => {
	if (typeof window === "undefined") return false;
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

// ── Default Easing ──

export const EASE = {
	smooth: "power3.out",
	smoothInOut: "power2.inOut",
	expo: "expo.out",
	quint: "quint.out",
	elastic: "elastic.out(1, 0.5)",
} as const;

// ── Default Durations ──

export const DURATION = {
	fast: 0.35,
	normal: 0.6,
	slow: 0.9,
	slower: 1.2,
} as const;

// ── Reveal Animation (scroll-triggered fade-in-up) ──

export function initRevealAnimations(
	selector: string = ".reveal",
	options?: {
		y?: number;
		duration?: number;
		stagger?: number;
		start?: string;
	}
) {
	if (prefersReducedMotion()) {
		// Immediately show all elements without animation
		gsap.set(selector, { opacity: 1, y: 0 });
		return;
	}

	const elements = document.querySelectorAll(selector);
	elements.forEach((el) => {
		gsap.fromTo(
			el,
			{
				opacity: 0,
				y: options?.y ?? 30,
			},
			{
				opacity: 1,
				y: 0,
				duration: options?.duration ?? DURATION.normal,
				ease: EASE.smooth,
				scrollTrigger: {
					trigger: el,
					start: options?.start ?? "top 85%",
					once: true,
				},
			}
		);
	});
}

// ── Stagger Reveal (for groups like card grids) ──

export function initStaggerReveal(
	containerSelector: string,
	childSelector: string,
	options?: {
		y?: number;
		duration?: number;
		stagger?: number;
	}
) {
	if (prefersReducedMotion()) {
		gsap.set(`${containerSelector} ${childSelector}`, { opacity: 1, y: 0 });
		return;
	}

	const containers = document.querySelectorAll(containerSelector);
	containers.forEach((container) => {
		const children = container.querySelectorAll(childSelector);
		gsap.fromTo(
			children,
			{ opacity: 0, y: options?.y ?? 40 },
			{
				opacity: 1,
				y: 0,
				duration: options?.duration ?? DURATION.normal,
				stagger: options?.stagger ?? 0.1,
				ease: EASE.smooth,
				scrollTrigger: {
					trigger: container,
					start: "top 80%",
					once: true,
				},
			}
		);
	});
}

// ── Fade In ──

export function fadeIn(
	element: gsap.TweenTarget,
	options?: {
		duration?: number;
		delay?: number;
		onComplete?: () => void;
	}
) {
	if (prefersReducedMotion()) {
		gsap.set(element, { opacity: 1 });
		options?.onComplete?.();
		return;
	}

	return gsap.fromTo(
		element,
		{ opacity: 0 },
		{
			opacity: 1,
			duration: options?.duration ?? DURATION.fast,
			delay: options?.delay ?? 0,
			ease: EASE.smooth,
			onComplete: options?.onComplete,
		}
	);
}

// ── Fade Out ──

export function fadeOut(
	element: gsap.TweenTarget,
	options?: {
		duration?: number;
		delay?: number;
		onComplete?: () => void;
	}
) {
	if (prefersReducedMotion()) {
		gsap.set(element, { opacity: 0 });
		options?.onComplete?.();
		return;
	}

	return gsap.to(element, {
		opacity: 0,
		duration: options?.duration ?? DURATION.fast,
		delay: options?.delay ?? 0,
		ease: EASE.smooth,
		onComplete: options?.onComplete,
	});
}

// ── Slide Toggle (for menus, accordions) ──

export function slideDown(element: HTMLElement, duration?: number) {
	if (prefersReducedMotion()) {
		element.style.height = "auto";
		element.style.overflow = "visible";
		return;
	}

	gsap.set(element, { height: "auto", overflow: "hidden" });
	const height = element.scrollHeight;
	gsap.fromTo(
		element,
		{ height: 0 },
		{
			height,
			duration: duration ?? DURATION.normal,
			ease: EASE.smooth,
			onComplete: () => {
				element.style.height = "auto";
				element.style.overflow = "visible";
			},
		}
	);
}

export function slideUp(element: HTMLElement, duration?: number) {
	if (prefersReducedMotion()) {
		element.style.height = "0";
		element.style.overflow = "hidden";
		return;
	}

	gsap.to(element, {
		height: 0,
		overflow: "hidden",
		duration: duration ?? DURATION.normal,
		ease: EASE.smooth,
	});
}

// ── Cleanup helper ──

export function killScrollTriggers() {
	ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
}

// ── Re-export for convenience ──

export { gsap, ScrollTrigger };
