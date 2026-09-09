import { motion } from 'motion/react';
import { Building2, Users, Briefcase, TrendingUp, Wrench, CreditCard } from 'lucide-react';
import { Button } from '../ui/button';
import { UserRole } from '../../types/index';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useState } from 'react';
import useGlobal from '../../context/GlobalContext';

interface HeroProps {
  onRoleSelect: (role: UserRole) => void;
}

const features = [
  { icon: TrendingUp, label: 'Real-time Analytics' },
  { icon: Wrench, label: 'Maintenance Management' },
  { icon: CreditCard, label: 'Automated Billing' },
];

export function Hero({ onRoleSelect }: HeroProps) {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const {darkMode} = useGlobal();


  return (
    <section className="relative min-h-screen flex items-center pt-16 md:pt-20 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1764675107575-7a33cbdb7905?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjaXR5JTIwc2t5bGluZXxlbnwxfHx8fDE3Njg2Njg3OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Modern city skyline"
          className="w-full h-full object-cover"
        />
        <div className={`absolute inset-0 bg-gradient-to-b ${darkMode ? 'from-background/95 via-background/90' : 'from-background/90 via-background/85'} to-background`} />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
              Streamline Your Commercial
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Property Operations
              </span>
            </h1>
          </motion.div>

          <motion.p
            className="text-base md:text-lg lg:text-xl text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Complete solution for building owners, tenants, and property managers
          </motion.p>

          {/* Role Selection Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12 md:mb-16 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
              onClick={() => onRoleSelect('owner')}
              onMouseEnter={() => setHoveredButton('owner')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <Building2 className="w-5 h-5 mr-2" />
              <span>I'm a Building Owner</span>
            </Button>

            <Button
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
              onClick={() => onRoleSelect('tenant')}
              onMouseEnter={() => setHoveredButton('tenant')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <Users className="w-5 h-5 mr-2" />
              <span>I'm a Tenant/Business</span>
            </Button>

            <Button
              size="lg"
              className="bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
              onClick={() => onRoleSelect('employee')}
              onMouseEnter={() => setHoveredButton('employee')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <Users className="w-5 h-5 mr-2" />
              <span>I'm a Employee</span>
            </Button>

            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
              onClick={() => onRoleSelect('manager')}
              onMouseEnter={() => setHoveredButton('manager')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <Briefcase className="w-5 h-5 mr-2" />
              <span>I'm a Manager</span>
            </Button>
          </motion.div>

          {/* Feature Showcase on Hover */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: hoveredButton ? 1 : 0.6 }}
            transition={{ duration: 0.3 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4 md:p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <feature.icon className="w-8 h-8 mb-3 mx-auto text-primary" />
                <p className="text-sm md:text-base">{feature.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden md:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-border rounded-full flex justify-center">
            <div className="w-1 h-3 bg-foreground rounded-full mt-2" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
