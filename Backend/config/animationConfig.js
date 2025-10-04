/**
 * Animation Configuration System
 * Manages Lottie assets, GSAP timing constants, and animation trigger settings
 */

const animationConfig = {
  // Hero Section Animation Settings
  heroSection: {
    lottieAssets: {
      mainIllustration: '/assets/lottie/hero-expense-management.json',
      featureSpotlight: '/assets/lottie/feature-spotlight.json',
      parallaxBackground: '/assets/lottie/parallax-bg.json'
    },
    gsapTiming: {
      illustrationEntrance: {
        duration: 1.2,
        ease: 'power2.out',
        delay: 0.3
      },
      featureSpotlight: {
        duration: 0.8,
        ease: 'back.out(1.7)',
        delay: 0.6
      },
      parallaxSpeed: 0.5
    },
    scrollThresholds: {
      triggerPoint: 0.2,
      endPoint: 0.8
    }
  },

  // Feature Demo Animation Settings
  featureDemo: {
    lottieAssets: {
      stepByStep: '/assets/lottie/step-by-step-demo.json',
      morphingIllustration: '/assets/lottie/morphing-features.json',
      corporateCard: '/assets/lottie/corporate-card-flow.json',
      accountingSystem: '/assets/lottie/accounting-integration.json',
      travelIntegration: '/assets/lottie/travel-booking.json'
    },
    framerMotion: {
      stepAnimation: {
        duration: 0.6,
        ease: [0.4, 0.0, 0.2, 1]
      },
      morphingTransition: {
        duration: 1.0,
        ease: 'easeInOut'
      }
    },
    scrollTriggers: {
      stepByStep: {
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: 1
      },
      morphing: {
        start: 'top 70%',
        end: 'bottom 30%',
        scrub: 0.5
      }
    }
  },

  // Feature Card Micro-interactions
  featureCard: {
    hoverEffects: {
      tiltIntensity: 15,
      scaleMultiplier: 1.05,
      shadowIntensity: 0.3,
      transitionDuration: 0.3
    },
    microInteractions: {
      buttonHover: {
        scale: 1.02,
        duration: 0.2
      },
      cardGlow: {
        intensity: 0.8,
        color: '#3b82f6',
        duration: 0.4
      }
    }
  },

  // Scroll-triggered Feature Section
  scrollTriggered: {
    lottieAssets: {
      integrationFlow: '/assets/lottie/integration-workflow.json',
      realTimeUpdates: '/assets/lottie/realtime-data.json',
      analyticsDashboard: '/assets/lottie/analytics-dashboard.json'
    },
    gsapScrollTrigger: {
      trigger: '.scroll-triggered-section',
      start: 'top 60%',
      end: 'bottom 40%',
      scrub: 1,
      pin: false
    },
    animationSequence: {
      staggerDelay: 0.2,
      totalDuration: 2.0,
      ease: 'power2.out'
    }
  },

  // Real-time Data Animation Settings
  realTimeAnimations: {
    dataUpdate: {
      pulseEffect: {
        duration: 0.5,
        scale: 1.1,
        ease: 'power2.out'
      },
      notificationSlide: {
        duration: 0.4,
        ease: 'back.out(1.7)'
      }
    },
    liveIndicators: {
      heartbeat: {
        duration: 1.0,
        repeat: -1,
        ease: 'power2.inOut'
      },
      dataFlow: {
        duration: 2.0,
        repeat: -1,
        ease: 'none'
      }
    }
  },

  // Performance Settings
  performance: {
    reducedMotion: {
      enabled: true,
      fallbackAnimations: true
    },
    lazyLoading: {
      enabled: true,
      threshold: 0.1
    },
    animationOptimization: {
      willChange: true,
      transform3d: true,
      gpuAcceleration: true
    }
  }
};

module.exports = animationConfig;
