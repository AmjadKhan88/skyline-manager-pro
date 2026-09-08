import { motion } from 'motion/react';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Monitor, Smartphone, Activity } from 'lucide-react';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';

const features = [
  {
    category: 'Owner Dashboard',
    title: 'Comprehensive Property Overview',
    description: 'Monitor all your properties from a single, intuitive dashboard. Track occupancy rates, financial performance, and maintenance requests in real-time.',
    image: 'https://images.unsplash.com/photo-1768483538267-fce52de424d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGRhc2hib2FyZCUyMHNjcmVlbnxlbnwxfHx8fDE3Njg3MTAwMDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    icon: Monitor,
  },
  {
    category: 'Mobile App',
    title: 'Manage on the Go',
    description: 'Stay connected with your properties wherever you are. Our mobile app provides full functionality for tenants and managers alike.',
    image: 'https://images.unsplash.com/photo-1605108222700-0d605d9ebafe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjBpbnRlcmZhY2V8ZW58MXx8fHwxNzY4NjQ2NTM2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    icon: Smartphone,
  },
  {
    category: 'Real-time Monitoring',
    title: 'Live Performance Metrics',
    description: 'Access real-time data visualization and analytics. Make informed decisions with up-to-the-minute insights into your property portfolio.',
    image: 'https://images.unsplash.com/photo-1744663835766-0f9970e7aa65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tZXJjaWFsJTIwYnVpbGRpbmclMjBpbnRlcmlvcnxlbnwxfHx8fDE3Njg3MTAwMDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    icon: Activity,
  },
];

export function FeaturesShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % features.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);
  };

  const currentFeature = features[currentIndex];
  const FeatureIcon = currentFeature.icon;

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            Powerful Features at Your Fingertips
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our comprehensive suite of tools designed to simplify property management
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Image Section */}
              <motion.div
                className="relative h-64 sm:h-80 lg:h-[500px] bg-muted overflow-hidden"
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <ImageWithFallback
                  src={currentFeature.image}
                  alt={currentFeature.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                
                {/* Icon Badge */}
                <div className="absolute top-6 left-6 bg-primary text-primary-foreground p-3 rounded-lg shadow-lg">
                  <FeatureIcon className="w-6 h-6" />
                </div>
              </motion.div>

              {/* Content Section */}
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm mb-4">
                    {currentFeature.category}
                  </div>
                  
                  <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                    {currentFeature.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    {currentFeature.description}
                  </p>

                  {/* Navigation Controls */}
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={prevSlide}
                      className="rounded-full"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>

                    <div className="flex gap-2">
                      {features.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentIndex(index)}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            index === currentIndex
                              ? 'w-8 bg-primary'
                              : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                          }`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={nextSlide}
                      className="rounded-full"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
