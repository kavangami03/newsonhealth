import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface AnimatedRevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
  scale?: number;
  blur?: boolean;
  className?: string;
  as?: React.ElementType;
}

export default function AnimatedReveal({
  children,
  delay = 0,
  duration = 1.2,
  yOffset = 50,
  scale = 0.95,
  blur = true,
  className = "",
  as: Component = "div",
}: AnimatedRevealProps) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    // Use prefers-reduced-motion check to disable animation for accessibility
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      gsap.set(el, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" });
      return;
    }

    // Set initial state
    gsap.set(el, {
      opacity: 0,
      y: yOffset,
      scale: scale,
      filter: blur ? "blur(10px)" : "blur(0px)",
    });

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%", // Triggers slightly before coming into view
        onEnter: () => {
          gsap.to(el, {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: duration,
            delay: delay,
            ease: "power4.out",
            overwrite: "auto",
          });
        },
      });
    }, el);

    return () => ctx.revert();
  }, [delay, duration, yOffset, scale, blur]);

  return (
    <Component ref={elementRef} className={className}>
      {children}
    </Component>
  );
}
