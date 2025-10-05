/**
 * FeatureCard Component
 * Incorporates Micro Hover Interactions and 3D Tilt Effects
 */

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useGesture } from 'react-use-gesture';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  ExternalLink, 
  Star,
  Zap,
  Shield,
  Users,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  status: 'new' | 'popular' | 'beta' | 'stable';
  features: string[];
  metrics?: {
    label: string;
    value: string;
    change?: string;
  };
  onLearnMore?: () => void;
  onTryNow?: () => void;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon: Icon,
  category,
  status,
  features,
  metrics,
  onLearnMore,
  onTryNow,
  className
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Motion values for 3D tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Spring values for smooth animation
  const rotateX = useSpring(useTransform(y, [-100, 100], [15, -15]));
  const rotateY = useSpring(useTransform(x, [-100, 100], [-15, 15]));
  
  // Scale and shadow effects
  const scale = useSpring(1);
  const shadowOpacity = useSpring(0);

  // Gesture handling for 3D tilt
  const bind = useGesture({
    onMove: ({ xy: [clientX, clientY] }) => {
      if (!cardRef.current) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = clientX - centerX;
      const deltaY = clientY - centerY;
      
      x.set(deltaX);
      y.set(deltaY);
    },
    onHover: ({ hovering }) => {
      scale.set(hovering ? 1.05 : 1);
      shadowOpacity.set(hovering ? 0.3 : 0);
    },
    onLeave: () => {
      x.set(0);
      y.set(0);
      scale.set(1);
      shadowOpacity.set(0);
    }
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'new':
        return { color: 'bg-green-100 text-green-800', label: 'New' };
      case 'popular':
        return { color: 'bg-orange-100 text-orange-800', label: 'Popular' };
      case 'beta':
        return { color: 'bg-purple-100 text-purple-800', label: 'Beta' };
      case 'stable':
        return { color: 'bg-blue-100 text-blue-800', label: 'Stable' };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: 'Unknown' };
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <motion.div
      ref={cardRef}
      {...bind()}
      style={{
        rotateX,
        rotateY,
        scale,
        transformStyle: 'preserve-3d'
      }}
      className={`group ${className}`}
    >
      <Card 
        className="relative h-full overflow-hidden transition-all duration-300 cursor-pointer"
        style={{
          boxShadow: `0 20px 40px rgba(0, 0, 0, ${shadowOpacity.get()})`
        }}
      >
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4 z-10">
          <Badge className={statusConfig.color}>
            {statusConfig.label}
          </Badge>
        </div>

        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-300"
              >
                <Icon className="w-6 h-6 text-blue-600" />
              </motion.div>
              <div>
                <CardTitle className="text-lg group-hover:text-blue-600 transition-colors duration-300">
                  {title}
                </CardTitle>
                <p className="text-sm text-gray-500">{category}</p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-gray-600 text-sm leading-relaxed">
            {description}
          </p>

          {/* Features List */}
          <div className="space-y-2">
            {features.slice(0, 3).map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">{feature}</span>
              </motion.div>
            ))}
            {features.length > 3 && (
              <p className="text-xs text-gray-500 ml-6">
                +{features.length - 3} more features
              </p>
            )}
          </div>

          {/* Metrics */}
          {metrics && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{metrics.label}</p>
                  <p className="text-lg font-semibold text-gray-900">{metrics.value}</p>
                </div>
                {metrics.change && (
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600 font-medium">{metrics.change}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onLearnMore}
              className="flex-1 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors duration-300"
            >
              Learn More
              <ExternalLink className="w-4 h-4 ml-1" />
            </Button>
            <Button
              size="sm"
              onClick={onTryNow}
              className="flex-1 bg-blue-600 hover:bg-blue-700 group-hover:shadow-lg transition-all duration-300"
            >
              Try Now
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>

        {/* Hover Glow Effect */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 pointer-events-none"
        />

        {/* Micro-interactions */}
        <motion.div
          initial={{ scale: 0 }}
          whileHover={{ scale: 1 }}
          className="absolute top-2 left-2 w-2 h-2 bg-blue-500 rounded-full"
        />
        
        <motion.div
          initial={{ scale: 0 }}
          whileHover={{ scale: 1 }}
          transition={{ delay: 0.1 }}
          className="absolute top-2 left-6 w-1 h-1 bg-purple-500 rounded-full"
        />
      </Card>
    </motion.div>
  );
};

// Feature Cards Grid Component
export const FeatureCardsGrid: React.FC<{ features: FeatureCardProps[] }> = ({ features }) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <FeatureCard {...feature} />
        </motion.div>
      ))}
    </div>
  );
};

export default FeatureCard;
