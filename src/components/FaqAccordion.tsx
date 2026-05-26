import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";

interface FaqItem {
  q: string;
  a: string;
}

interface FaqCategory {
  title: string;
  faqs: FaqItem[];
}

export default function FaqAccordion({ categories }: { categories: FaqCategory[] }) {
  const [openIndexes, setOpenIndexes] = useState<{ [catIdx: number]: number | null }>({});

  const toggleFaq = (catIdx: number, faqIdx: number) => {
    setOpenIndexes((prev) => ({
      ...prev,
      [catIdx]: prev[catIdx] === faqIdx ? null : faqIdx,
    }));
  };

  return (
    <div className="flex flex-col gap-16">
      {categories.map((category, catIdx) => (
        <section key={catIdx} className="scroll-mt-32" id={`faq-cat-${catIdx}`}>
          <h2 className="text-2xl font-display mb-8 pl-4 border-l-4 border-newson-pink text-not-quite-black">
            {category.title}
          </h2>
          <div className="flex flex-col gap-4">
            {category.faqs.map((faq, faqIdx) => {
              const isOpen = openIndexes[catIdx] === faqIdx;
              return (
                <FaqItem
                  key={faqIdx}
                  faq={faq}
                  isOpen={isOpen}
                  onToggle={() => toggleFaq(catIdx, faqIdx)}
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function FaqItem({ faq, isOpen, onToggle }: { faq: FaqItem; isOpen: boolean; onToggle: () => void }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!contentRef.current || !iconRef.current) return;
    
    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    const duration = prefersReducedMotion ? 0 : 0.4;
    const ease = "power3.inOut";

    if (isOpen) {
      gsap.to(contentRef.current, {
        height: "auto",
        opacity: 1,
        duration,
        ease,
      });
      gsap.to(iconRef.current, {
        rotation: 180,
        color: "#e9516f", // newson-pink
        duration,
        ease,
      });
    } else {
      gsap.to(contentRef.current, {
        height: 0,
        opacity: 0,
        duration,
        ease,
      });
      gsap.to(iconRef.current, {
        rotation: 0,
        color: "#585858", // text-grey
        duration,
        ease,
      });
    }
  }, [isOpen]);

  return (
    <div 
      className={`premium-surface transition-colors duration-400 ease-out-expo ${isOpen ? 'bg-white border-newson-pink/30 shadow-premium-hover' : 'bg-white/90 border-black/5 hover:border-newson-pink/20'}`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 md:p-8 text-left outline-none focus-visible:ring-2 focus-visible:ring-newson-pink rounded-3xl"
        aria-expanded={isOpen}
      >
        <span className={`text-base md:text-lg font-medium transition-colors duration-300 pr-8 ${isOpen ? 'text-newson-pink' : 'text-not-quite-black hover:text-newson-pink'}`}>
          {faq.q}
        </span>
        <svg 
          ref={iconRef}
          className="shrink-0 text-text-grey" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      
      <div 
        ref={contentRef} 
        className="h-0 opacity-0 overflow-hidden"
      >
        <div className="px-6 md:px-8 pb-6 md:pb-8 pt-0 text-sm md:text-base text-text-grey leading-relaxed border-t border-black/5 mx-6 md:mx-8 mt-2 pt-6">
          {faq.a}
        </div>
      </div>
    </div>
  );
}
