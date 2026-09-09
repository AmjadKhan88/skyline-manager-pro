import { motion } from 'motion/react';
import { Building2, Users, Briefcase, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { UserRole } from '../../types/index';
import React, { useState } from 'react';
import {toast} from 'react-hot-toast';
interface CTASectionProps {
  onRoleSelect: (role: UserRole) => void;
}

export function CTASection({ onRoleSelect }: CTASectionProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Demo request submitted! We\'ll contact you soon.');
    setFormData({ name: '', email: '', company: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section className="py-16 md:py-24 bg-linear-to-br from-blue-600 via-purple-600 to-emerald-600 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Ready to Transform Your Property Management?
          </h2>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Join hundreds of property managers who have streamlined their operations with Skyline Manager Pro
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {/* Quick Access Buttons */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold mb-6 text-foreground">Get Started Today</h3>
              <p className="text-muted-foreground mb-6">
                Choose your role to access your personalized dashboard
              </p>

              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start"
                  onClick={() => onRoleSelect('owner')}
                >
                  <Building2 className="w-5 h-5 mr-3" />
                  Building Owner Portal
                </Button>

                <Button
                  size="lg"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start"
                  onClick={() => onRoleSelect('tenant')}
                >
                  <Users className="w-5 h-5 mr-3" />
                  Tenant/Business Portal
                </Button>

                <Button
                  size="lg"
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white justify-start"
                  onClick={() => onRoleSelect('employee')}
                >
                  <Users className="w-5 h-5 mr-3" />
                  I'm a Employee
                </Button>

                <Button
                  size="lg"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white justify-start"
                  onClick={() => onRoleSelect('manager')}
                >
                  <Briefcase className="w-5 h-5 mr-3" />
                  I'm a Manager
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Free 30-day trial</span>
                  </div>
                  <div>•</div>
                  <span>No credit card required</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Demo Request Form */}
          <motion.div
            className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Request a Live Demo</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="company">Company/Building Name</Label>
                <Input
                  id="company"
                  name="company"
                  placeholder="Acme Properties"
                  value={formData.company}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell us about your property management needs..."
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>

              <Button type="submit" size="lg" className="w-full">
                Schedule My Demo
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By submitting, you agree to our Terms of Service and Privacy Policy
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
