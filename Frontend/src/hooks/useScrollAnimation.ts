/**
 * useScrollAnimation Hook
 * Custom hook to manage GSAP ScrollTrigger animations
 */

import { useEffect, useRef, RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface ScrollAnimationOptions {
  trigger?: string;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  pin?: boolean | string;
  onEnter?: () => void;
  onLeave?: () => void;
  onUpdate?: (self: ScrollTrigger) => void;
  animation?: gsap.core.Timeline | gsap.core.Tween;
}

interface UseScrollAnimationReturn {
  ref: RefObject<HTMLElement>;
  trigger: ScrollTrigger | null;
}

export const useScrollAnimation = (
  options: ScrollAnimationOptions = {}
): UseScrollAnimationReturn => {
  const ref = useRef<HTMLElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    
    // Create ScrollTrigger
    const trigger = ScrollTrigger.create({
      trigger: element,
      start: options.start || 'top 80%',
      end: options.end || 'bottom 20%',
      scrub: options.scrub || false,
      pin: options.pin || false,
      onEnter: options.onEnter,
      onLeave: options.onLeave,
      onUpdate: options.onUpdate,
      animation: options.animation,
    });

    triggerRef.current = trigger;

    // Cleanup
    return () => {
      trigger.kill();
    };
  }, [options]);

  return {
    ref,
    trigger: triggerRef.current
  };
};

// Specific animation hooks
export const useFadeInUp = (delay: number = 0) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    
    gsap.fromTo(element, 
      { 
        opacity: 0, 
        y: 50 
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }, [delay]);

  return ref;
};

export const useFadeInLeft = (delay: number = 0) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    
    gsap.fromTo(element, 
      { 
        opacity: 0, 
        x: -50 
      },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        delay,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }, [delay]);

  return ref;
};

export const useFadeInRight = (delay: number = 0) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    
    gsap.fromTo(element, 
      { 
        opacity: 0, 
        x: 50 
      },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        delay,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }, [delay]);

  return ref;
};

export const useScaleIn = (delay: number = 0) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    
    gsap.fromTo(element, 
      { 
        opacity: 0, 
        scale: 0.8 
      },
      {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        delay,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }, [delay]);

  return ref;
};

export const useStaggerAnimation = (staggerDelay: number = 0.1) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    const children = element.children;
    
    gsap.fromTo(children, 
      { 
        opacity: 0, 
        y: 30 
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: staggerDelay,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }, [staggerDelay]);

  return ref;
};

export const useParallax = (speed: number = 0.5) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    
    gsap.to(element, {
      yPercent: -50 * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  }, [speed]);

  return ref;
};

export const useTextReveal = (delay: number = 0) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    const text = element.textContent || '';
    
    // Split text into characters
    const chars = text.split('').map(char => 
      char === ' ' ? '\u00A0' : char
    );
    
    element.innerHTML = chars.map(char => 
      `<span style="display: inline-block;">${char}</span>`
    ).join('');
    
    const spans = element.querySelectorAll('span');
    
    gsap.fromTo(spans, 
      { 
        opacity: 0, 
        y: 20 
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.05,
        stagger: 0.02,
        delay,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }, [delay]);

  return ref;
};

export const useCounterAnimation = (
  endValue: number, 
  duration: number = 2,
  delay: number = 0
) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    
    gsap.fromTo(element, 
      { 
        textContent: 0 
      },
      {
        textContent: endValue,
        duration,
        delay,
        ease: 'power2.out',
        snap: { textContent: 1 },
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }, [endValue, duration, delay]);

  return ref;
};

export const useMagneticEffect = (strength: number = 0.3) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;
      
      gsap.to(element, {
        x: deltaX,
        y: deltaY,
        duration: 0.3,
        ease: 'power2.out'
      });
    };
    
    const handleMouseLeave = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)'
      });
    };
    
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength]);

  return ref;
};

export default useScrollAnimation;
