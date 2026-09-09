import { useState } from 'react';
import { Header } from '../components/Home/Header';
import { Hero } from '../components/Home/Hero';
import { ValueProposition } from '../components/Home/ValueProposition';
import { FeaturesShowcase } from '../components/Home/FeaturesShowcase';
import { TrustIndicators } from '../components/Home/TrustIndicators';
import { CTASection } from '../components/Home/CTASection';
import { Footer } from '../components/Home/Footer';
import { RoleModal } from '../components/Home/RoleModal';

import { UserRole } from '../types/index';

export default function Home() {
const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
     
      <Header />
      
      <main>
        <Hero onRoleSelect={setSelectedRole} />
        <ValueProposition />
        <FeaturesShowcase />
        <TrustIndicators />
        <CTASection onRoleSelect={setSelectedRole} />
      </main>
      <Footer />

      <RoleModal 
        selectedRole={selectedRole}
        onClose={() => setSelectedRole(null)}
      />

    </div>
  );
}