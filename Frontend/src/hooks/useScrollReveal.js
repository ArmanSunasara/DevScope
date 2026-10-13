import { useEffect, useRef, useState } from 'react';

/**
 * Hook to detect when an element enters the viewport
 * and trigger reveal animations
 * 
 * Usage:
 * const ref = useScrollReveal();
 * return <div ref={ref} className="animate-on-scroll">Content</div>
 */
export function useScrollReveal(options = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          element.classList.add('visible');
          // Once visible, stop observing (reveal once)
          if (options.once !== false) {
            observer.unobserve(element);
          }
        } else if (options.once === false) {
          setIsVisible(false);
          element.classList.remove('visible');
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px 0px -100px 0px',
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [options.threshold, options.rootMargin, options.once]);

  return ref;
}

/**
 * Hook to apply staggered reveal animations to multiple elements
 * 
 * Usage:
 * const refs = useStaggeredReveal(3); // For 3 items
 * return items.map((item, i) => (
 *   <div key={i} ref={refs[i]} className="animate-on-scroll">
 *     {item}
 *   </div>
 * ));
 */
export function useStaggeredReveal(count, options = {}) {
  const refs = useRef([]);
  
  useEffect(() => {
    const observers = refs.current.map((ref, index) => {
      if (!ref) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            // Add delay based on index
            setTimeout(() => {
              ref.classList.add('visible');
            }, index * (options.staggerDelay || 100));
            
            if (options.once !== false) {
              observer.unobserve(ref);
            }
          }
        },
        {
          threshold: options.threshold || 0.1,
          rootMargin: options.rootMargin || '0px 0px -100px 0px',
        }
      );

      observer.observe(ref);
      return observer;
    });

    return () => {
      observers.forEach((observer, index) => {
        if (observer && refs.current[index]) {
          observer.unobserve(refs.current[index]);
        }
      });
    };
  }, [count, options.staggerDelay, options.threshold, options.rootMargin, options.once]);

  // Create array of refs
  const setRef = (index) => (element) => {
    refs.current[index] = element;
  };

  return Array.from({ length: count }, (_, i) => setRef(i));
}

/**
 * Simple hook that returns whether an element is visible
 * without automatically adding classes
 */
export function useInView(options = {}) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px',
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [options.threshold, options.rootMargin]);

  return [ref, isInView];
}
