import { motion } from 'motion/react';
import { Shield, Lock, CheckCircle, Award } from 'lucide-react';

const logos = [
  { name: 'TechCorp', initial: 'TC' },
  { name: 'BuildMax', initial: 'BM' },
  { name: 'PropTech', initial: 'PT' },
  { name: 'RealEstate Co', initial: 'RE' },
  { name: 'Skyrise', initial: 'SR' },
  { name: 'UrbanSpace', initial: 'US' },
];

const badges = [
  {
    icon: Shield,
    title: 'SSL Secured',
    description: '256-bit encryption',
  },
  {
    icon: Lock,
    title: 'GDPR Compliant',
    description: 'Data protection',
  },
  {
    icon: CheckCircle,
    title: 'SOC 2 Type II',
    description: 'Security certified',
  },
  {
    icon: Award,
    title: 'ISO 27001',
    description: 'Information security',
  },
];

export function TrustIndicators() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Statement */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Trusted by 500+ commercial buildings worldwide</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            Industry-Leading Security & Reliability
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Your data and operations are protected by enterprise-grade security standards
          </p>
        </motion.div>

        {/* Client Logos */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-center text-sm text-muted-foreground mb-8">
            TRUSTED BY LEADING ORGANIZATIONS
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
            {logos.map((logo, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.1 }}
              >
                <div className="bg-card border border-border rounded-lg p-4 w-full aspect-square flex flex-col items-center justify-center hover:shadow-lg transition-all duration-300">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {logo.initial}
                  </div>
                  <div className="text-xs text-muted-foreground text-center">
                    {logo.name}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Security Badges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-5xl mx-auto">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={index}
                className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-full mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="font-semibold mb-2">{badge.title}</h4>
                <p className="text-sm text-muted-foreground">{badge.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Additional Trust Statement */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-sm text-muted-foreground">
            Uptime: 99.9% | Response Time: {"<"}100ms | 24/7 Support
          </p>
        </motion.div>
      </div>
    </section>
  );
}
