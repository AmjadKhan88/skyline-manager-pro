import { Info, AlertTriangle, AlertOctagon } from 'lucide-react';
import type { AnnouncementPriority } from '../types/index';

export const PRIORITY_CONFIG: Record<AnnouncementPriority, { label: string; icon: any; badge: string; border: string }> = {
  info: {
    label: 'Info', icon: Info,
    badge: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
    border: 'border-l-blue-400',
  },
  warning: {
    label: 'Warning', icon: AlertTriangle,
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    border: 'border-l-amber-400',
  },
  urgent: {
    label: 'Urgent', icon: AlertOctagon,
    badge: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
    border: 'border-l-red-500',
  },
};