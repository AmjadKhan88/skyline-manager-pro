import { Wrench, Zap, Wind, Refrigerator, Building2, Bug, HelpCircle } from 'lucide-react';
import type { MaintenanceCategory, MaintenancePriority, MaintenanceStatus } from '../types/index';

export const CATEGORY_CONFIG: Record<MaintenanceCategory, { label: string; icon: any }> = {
  plumbing: { label: 'Plumbing', icon: Wrench },
  electrical: { label: 'Electrical', icon: Zap },
  hvac: { label: 'HVAC', icon: Wind },
  appliance: { label: 'Appliance', icon: Refrigerator },
  structural: { label: 'Structural', icon: Building2 },
  'pest-control': { label: 'Pest Control', icon: Bug },
  other: { label: 'Other', icon: HelpCircle },
};

export const PRIORITY_STYLES: Record<MaintenancePriority, string> = {
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  medium: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  high: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  urgent: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
};

export const STATUS_STYLES: Record<MaintenanceStatus, string> = {
  open: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  'in-progress': 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  resolved: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  cancelled: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};

export const STATUS_LABELS: Record<MaintenanceStatus, string> = {
  open: 'Open', 'in-progress': 'In Progress', resolved: 'Resolved', cancelled: 'Cancelled',
};