import { useEffect, useRef } from "react";

/**
 * Custom hook for scroll-triggered fade-in animations using IntersectionObserver.
 * Applies the "animate-fade-in" class when elements with "fade-in-element" class
 * become visible in the viewport.
 *
 * @param threshold - Percentage of element visibility required to trigger animation (0.0 to 1.0)
 * @returns React ref to attach to the container element
 *
 * @example
 * ```tsx
 * function MySection() {
 *   const sectionRef = useScrollAnimation(0.1);
 *   return (
 *     <section ref={sectionRef}>
 *       <div className="fade-in-element opacity-0">Content</div>
 *     </section>
 *   );
 * }
 * ```
 */
export function useScrollAnimation(threshold = 0.1) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
          }
        });
      },
      { threshold },
    );

    const elements = sectionRef.current?.querySelectorAll(".fade-in-element");
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [threshold]);

  return sectionRef;
}
