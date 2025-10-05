/**
 * HeroBanner Component
 * Uses Lottie + GSAP for Feature Spotlight, Illustration Entrance, and Parallax
 */

import React, { useEffect, useRef } from 'react';
import Lottie from 'lottie-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Play, Zap, Shield, Users } from 'lucide-react';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Import Lottie animations (these would be actual JSON files)
import heroIllustration from '@/assets/lottie/hero-expense-management.json';
import featureSpotlight from '@/assets/lottie/feature-spotlight.json';
import parallaxBackground from '@/assets/lottie/parallax-bg.json';

interface HeroBannerProps {
  onGetStarted?: () => void;
  onWatchDemo?: () => void;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ onGetStarted, onWatchDemo }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const illustrationRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const illustration = illustrationRef.current;
    const spotlight = spotlightRef.current;
    const parallax = parallaxRef.current;
    const content = contentRef.current;

    if (!hero || !illustration || !spotlight || !parallax || !content) return;

    // Create timeline for entrance animations
    const tl = gsap.timeline();

    // Illustration entrance animation
    tl.fromTo(illustration, 
      { 
        opacity: 0, 
        scale: 0.8, 
        rotation: -10,
        transformOrigin: 'center center'
      },
      { 
        opacity: 1, 
        scale: 1, 
        rotation: 0,
        duration: 1.2,
        ease: 'power2.out',
        delay: 0.3
      }
    );

    // Feature spotlight animation
    tl.fromTo(spotlight,
      {
        opacity: 0,
        scale: 0.5,
        y: 50
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.8,
        ease: 'back.out(1.7)',
        delay: 0.6
      },
      '-=0.4'
    );

    // Content entrance animation
    tl.fromTo(content,
      {
        opacity: 0,
        y: 30
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out'
      },
      '-=0.6'
    );

    // Parallax scroll effect
    ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        gsap.set(parallax, {
          y: progress * 100,
          opacity: 1 - progress * 0.5
        });
      }
    });

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const features = [
    {
      icon: Zap,
      title: 'Real-time Sync',
      description: 'Instant updates across all devices'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level encryption and compliance'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Seamless workflow management'
    }
  ];

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50"
    >
      {/* Parallax Background */}
      <div 
        ref={parallaxRef}
        className="absolute inset-0 opacity-30"
      >
        <Lottie
          animationData={parallaxBackground}
          loop={true}
          autoplay={true}
          className="w-full h-full"
        />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div 
            ref={contentRef}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit">
                <Zap className="w-4 h-4 mr-2" />
                New: Real-time Integration
              </Badge>
              
              <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
                Smart Expense Management
                <span className="block text-gray-900">Made Simple</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Streamline your expense workflow with AI-powered automation, 
                real-time integrations, and intelligent analytics. 
                Built for modern teams.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-white/50 backdrop-blur-sm border border-white/20"
                >
                  <feature.icon className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-sm">{feature.title}</p>
                    <p className="text-xs text-gray-600">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button 
                size="lg" 
                onClick={onGetStarted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                onClick={onWatchDemo}
                className="px-8 py-3 text-lg font-semibold border-2 hover:bg-gray-50 transition-all duration-300"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </motion.div>
          </motion.div>

          {/* Illustration */}
          <div className="relative">
            <motion.div
              ref={illustrationRef}
              initial={{ opacity: 0, scale: 0.8, rotation: -10 }}
              animate={{ opacity: 1, scale: 1, rotation: 0 }}
              transition={{ duration: 1.2, delay: 0.3 }}
              className="relative z-10"
            >
              <Lottie
                animationData={heroIllustration}
                loop={true}
                autoplay={true}
                className="w-full h-full max-w-lg mx-auto"
              />
            </motion.div>

            {/* Feature Spotlight */}
            <motion.div
              ref={spotlightRef}
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: 'back.out(1.7)' }}
              className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-8"
            >
              <Lottie
                animationData={featureSpotlight}
                loop={true}
                autoplay={true}
                className="w-32 h-32"
              />
            </motion.div>

            {/* Floating Elements */}
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute top-10 left-10 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center"
            >
              <Zap className="w-8 h-8 text-blue-600" />
            </motion.div>

            <motion.div
              animate={{ 
                y: [0, 10, 0],
                rotate: [0, -5, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1
              }}
              className="absolute bottom-10 right-10 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center"
            >
              <Shield className="w-6 h-6 text-purple-600" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-gray-400 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroBanner;
