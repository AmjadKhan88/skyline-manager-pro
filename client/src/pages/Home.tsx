import { useState, useEffect } from 'react';
import { Header } from '../components/Home/Header';
import { Hero } from '../components/Home/Hero';
import { ValueProposition } from '../components/Home/ValueProposition';
import { FeaturesShowcase } from '../components/Home/FeaturesShowcase';
import { TrustIndicators } from '../components/Home/TrustIndicators';
import { CTASection } from '../components/Home/CTASection';
import { Footer } from '../components/Home/Footer';
import { RoleModal } from '../components/Home/RoleModal';
import useGlobal from '../context/GlobalContext';

export type UserRole = 'owner' | 'tenant' | 'agent' | 'employee' | null;

export default function Home() {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const {darkMode, setDarkMode, language, setLanguage} = useGlobal();
  

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
     
      <Header 
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        language={language}
        setLanguage={setLanguage}
      />
      
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


// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Building2, ShieldCheck, Users2, ArrowRight } from 'lucide-react';
// import api from '../lib/api';
// import { useGlobal } from '../context/GlobalContext';
// import toast from 'react-hot-toast';

// export default function Home() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();
//   const { dispatch } = useGlobal();

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const res = await api.post('/api/v1/auth/login', { email, password });
//       const { user, token, mustChangePassword } = res.data.data || res.data;
      
//       dispatch({ type: 'LOGIN', payload: { user, token } });
      
//       if (mustChangePassword) {
//         navigate('/change-password');
//         return;
//       }
      
//       switch (user.role) {
//         case 'superadmin':
//           navigate('/superadmin');
//           break;
//         case 'owner':
//           navigate('/owner');
//           break;
//         case 'manager':
//           navigate('/manager');
//           break;
//         case 'employee':
//           navigate('/employee');
//           break;
//         case 'tenant':
//           navigate('/tenant');
//           break;
//         default:
//           navigate('/dashboard');
//       }
      
//       toast.success('Successfully logged in');
//     } catch (err: any) {
//       toast.error(err.response?.data?.message || 'Login failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGoogleLogin = () => {
//     window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/auth/google`;
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
//       {/* Left side - Branding & Features (Hidden on mobile) */}
//       <div className="hidden lg:flex flex-1 flex-col justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white p-12 relative overflow-hidden">
//         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
        
//         <div className="relative z-10 max-w-xl mx-auto w-full">
//           <div className="flex items-center gap-3 mb-12">
//             <Building2 className="w-10 h-10 text-blue-400" />
//             <span className="text-2xl font-bold tracking-tight">SkyLine Manager Pro</span>
//           </div>
          
//           <h1 className="text-5xl font-extrabold mb-6 leading-tight">
//             Premium Building Management
//           </h1>
//           <p className="text-xl text-blue-200 mb-12 font-light">
//             The all-in-one multi-tenant SaaS platform for seamless property administration.
//           </p>
          
//           <div className="space-y-6">
//             <div className="flex items-start gap-4">
//               <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
//                 <Building2 className="w-6 h-6 text-blue-300" />
//               </div>
//               <div>
//                 <h3 className="text-lg font-semibold text-white">Multi-Tenant Architecture</h3>
//                 <p className="text-blue-200/80 mt-1">Isolated workspaces for owners, managers, and staff.</p>
//               </div>
//             </div>
//             <div className="flex items-start gap-4">
//               <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
//                 <Users2 className="w-6 h-6 text-blue-300" />
//               </div>
//               <div>
//                 <h3 className="text-lg font-semibold text-white">Role-Based Access</h3>
//                 <p className="text-blue-200/80 mt-1">Precise permission controls for every user level.</p>
//               </div>
//             </div>
//             <div className="flex items-start gap-4">
//               <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
//                 <ShieldCheck className="w-6 h-6 text-blue-300" />
//               </div>
//               <div>
//                 <h3 className="text-lg font-semibold text-white">Enterprise Security</h3>
//                 <p className="text-blue-200/80 mt-1">Bank-grade encryption and secure authentication.</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Right side - Login Form */}
//       <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12">
//         <div className="w-full max-w-md">
//           <div className="lg:hidden flex items-center justify-center gap-2 mb-10">
//             <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
//             <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">SkyLine</span>
//           </div>

//           <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 dark:border-slate-700 p-8 sm:p-10">
//             <div className="text-center mb-8">
//               <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
//               <p className="text-slate-500 dark:text-slate-400 mt-2">Sign in to your account to continue</p>
//             </div>

//             <form onSubmit={handleLogin} className="space-y-5">
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
//                   Email Address
//                 </label>
//                 <input
//                   type="email"
//                   required
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
//                   placeholder="you@example.com"
//                 />
//               </div>

//               <div>
//                 <div className="flex justify-between items-center mb-1.5">
//                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
//                     Password
//                   </label>
//                   <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
//                     Forgot password?
//                   </a>
//                 </div>
//                 <input
//                   type="password"
//                   required
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
//                   placeholder="••••••••"
//                 />
//               </div>

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full py-3 px-4 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all shadow-md shadow-blue-500/25 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
//               >
//                 {loading ? 'Signing in...' : 'Sign In'}
//                 {!loading && <ArrowRight className="w-4 h-4" />}
//               </button>
//             </form>

//             <div className="mt-8 flex items-center">
//               <div className="flex-1 border-t border-slate-200 dark:border-slate-700"></div>
//               <span className="px-4 text-sm text-slate-500 dark:text-slate-400 font-medium">Or continue with</span>
//               <div className="flex-1 border-t border-slate-200 dark:border-slate-700"></div>
//             </div>

//             <button
//               onClick={handleGoogleLogin}
//               type="button"
//               className="mt-6 w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
//             >
//               <svg className="w-5 h-5" viewBox="0 0 24 24">
//                 <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
//                 <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
//                 <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
//                 <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
//               </svg>
//               Google
//             </button>
//           </div>
          
//           <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
//             © {new Date().getFullYear()} SkyLine Manager Pro. All rights reserved.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
