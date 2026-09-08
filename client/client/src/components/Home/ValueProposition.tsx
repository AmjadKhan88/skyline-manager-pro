import { motion } from 'motion/react';
import { Building2, Users, Briefcase, TrendingUp, Wrench, CreditCard, FileText, MessageSquare, BarChart3 } from 'lucide-react';

const roles = [
  {
    icon: Building2,
    title: 'For Building Owners',
    color: 'bg-blue-600',
    features: [
      {
        icon: CreditCard,
        title: 'Rent Collection',
        description: 'Automated billing and payment processing',
      },
      {
        icon: Wrench,
        title: 'Maintenance Management',
        description: 'Track and manage all property maintenance',
      },
      {
        icon: BarChart3,
        title: 'Analytics & Reporting',
        description: 'Real-time insights and financial reports',
      },
    ],
  },
  {
    icon: Users,
    title: 'For Tenants',
    color: 'bg-purple-600',
    features: [
      {
        icon: CreditCard,
        title: 'Easy Payments',
        description: 'Pay rent and fees securely online',
      },
      {
        icon: MessageSquare,
        title: 'Service Requests',
        description: 'Submit and track maintenance requests',
      },
      {
        icon: FileText,
        title: 'Portal Access',
        description: '24/7 access to documents and information',
      },
    ],
  },
  {
    icon: Briefcase,
    title: 'For Property Agents',
    color: 'bg-emerald-600',
    features: [
      {
        icon: Building2,
        title: 'Portfolio Management',
        description: 'Manage multiple properties efficiently',
      },
      {
        icon: Users,
        title: 'Client Coordination',
        description: 'Streamlined communication tools',
      },
      {
        icon: TrendingUp,
        title: 'Commission Tracking',
        description: 'Automated reporting and payments',
      },
    ],
  },
];

export function ValueProposition() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            Built for Every Stakeholder
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools designed specifically for your role in commercial property management
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {roles.map((role, index) => {
            const RoleIcon = role.icon;
            return (
              <motion.div
                key={index}
                className="bg-card border border-border rounded-xl p-6 lg:p-8 hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -8 }}
              >
                <div className={`${role.color} text-white w-12 h-12 rounded-lg flex items-center justify-center mb-6`}>
                  <RoleIcon className="w-6 h-6" />
                </div>

                <h3 className="text-xl font-semibold mb-6">{role.title}</h3>

                <div className="space-y-4">
                  {role.features.map((feature, featureIndex) => {
                    const FeatureIcon = feature.icon;
                    return (
                      <div key={featureIndex} className="flex gap-3">
                        <div className="flex-shrink-0">
                          <FeatureIcon className="w-5 h-5 text-muted-foreground mt-0.5" />
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">{feature.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
