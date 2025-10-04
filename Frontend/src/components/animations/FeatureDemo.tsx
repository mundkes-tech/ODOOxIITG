/**
 * FeatureDemo Component
 * Uses Framer Motion and Rive for Step-by-Step and Morphing Illustration
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Calculator, 
  Plane, 
  ArrowRight, 
  CheckCircle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

// Import Lottie animations
import stepByStepDemo from '@/assets/lottie/step-by-step-demo.json';
import morphingFeatures from '@/assets/lottie/morphing-features.json';
import corporateCardFlow from '@/assets/lottie/corporate-card-flow.json';
import accountingIntegration from '@/assets/lottie/accounting-integration.json';
import travelBooking from '@/assets/lottie/travel-booking.json';

interface FeatureDemoProps {
  className?: string;
}

const FeatureDemo: React.FC<FeatureDemoProps> = ({ className }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: false
  });

  const steps = [
    {
      id: 'corporate-card',
      title: 'Corporate Card Matching',
      description: 'Automatically match corporate card transactions with employee expenses',
      icon: CreditCard,
      animation: corporateCardFlow,
      features: [
        'Real-time transaction sync',
        'AI-powered matching algorithm',
        'Confidence scoring system',
        'Manual override capabilities'
      ]
    },
    {
      id: 'accounting',
      title: 'GL Mapping Setup',
      description: 'Configure General Ledger account mappings for seamless accounting integration',
      icon: Calculator,
      animation: accountingIntegration,
      features: [
        'Automated GL account mapping',
        'Rule-based categorization',
        'Multi-currency support',
        'Audit trail maintenance'
      ]
    },
    {
      id: 'travel',
      title: 'Travel Pre-population',
      description: 'Pre-populate expense forms with travel booking data',
      icon: Plane,
      animation: travelBooking,
      features: [
        'Booking data integration',
        'Expense suggestion engine',
        'Policy compliance checking',
        'Receipt auto-attachment'
      ]
    }
  ];

  const morphingAnimations = [
    stepByStepDemo,
    morphingFeatures,
    corporateCardFlow,
    accountingIntegration,
    travelBooking
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || !inView) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlaying, inView, steps.length]);

  // Morphing animation cycle
  useEffect(() => {
    const morphInterval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % morphingAnimations.length);
    }, 3000);

    return () => clearInterval(morphInterval);
  }, [morphingAnimations.length]);

  const handleStepChange = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  return (
    <section ref={ref} className={`py-20 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <Badge variant="secondary" className="mb-4">
            <Play className="w-4 h-4 mr-2" />
            Interactive Demo
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            See It In Action
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience our powerful integrations through interactive demonstrations. 
            Watch how seamless expense management becomes with our advanced features.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Step-by-Step Demo */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Step-by-Step Process</h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePlay}
                  className="flex items-center space-x-2"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetDemo}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Step Indicators */}
            <div className="flex space-x-2 mb-6">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleStepChange(index)}
                  className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? 'bg-blue-600'
                      : index < currentStep
                      ? 'bg-blue-300'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* Current Step Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <steps[currentStep].icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold">{steps[currentStep].title}</h4>
                    <p className="text-gray-600">{steps[currentStep].description}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {steps[currentStep].features.map((feature, index) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </motion.div>
                  ))}
                </div>

                <Button className="w-full">
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Morphing Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="relative w-full h-96 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl overflow-hidden">
              {/* Morphing Animation Container */}
              <motion.div
                key={currentFeature}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                transition={{ duration: 1, ease: 'easeInOut' }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {/* This would be replaced with actual Lottie/Rive animations */}
                <div className="w-64 h-64 bg-white rounded-xl shadow-lg flex items-center justify-center">
                  <steps[currentStep].icon className="w-16 h-16 text-blue-600" />
                </div>
              </motion.div>

              {/* Floating Elements */}
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                  rotate: [0, 10, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="absolute top-4 right-4 w-8 h-8 bg-blue-500 rounded-full"
              />
              
              <motion.div
                animate={{ 
                  y: [0, 15, 0],
                  rotate: [0, -10, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1
                }}
                className="absolute bottom-4 left-4 w-6 h-6 bg-purple-500 rounded-full"
              />
            </div>

            {/* Feature Labels */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white px-4 py-2 rounded-full shadow-lg border"
              >
                <span className="text-sm font-medium text-gray-700">
                  {steps[currentStep].title}
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Integration Cards */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 grid md:grid-cols-3 gap-6"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className="cursor-pointer"
              onClick={() => handleStepChange(index)}
            >
              <Card className={`h-full transition-all duration-300 ${
                currentStep === index 
                  ? 'ring-2 ring-blue-500 shadow-lg' 
                  : 'hover:shadow-md'
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-2 rounded-lg ${
                      currentStep === index ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <step.icon className={`w-5 h-5 ${
                        currentStep === index ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <h4 className="font-semibold">{step.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{step.description}</p>
                  <div className="flex items-center text-blue-600 text-sm font-medium">
                    <span>Learn More</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureDemo;
