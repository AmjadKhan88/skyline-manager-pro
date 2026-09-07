import { Building } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
      <div className="relative">
        <Building className="w-12 h-12 text-blue-600 dark:text-blue-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10" />
        <div className="w-24 h-24 border-4 border-slate-200 dark:border-slate-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
      </div>
      <h2 className="mt-6 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
        SkyLine Manager Pro
      </h2>
      <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">Loading...</p>
    </div>
  );
}
