import type { ItemCondition } from '../types/index';

export const CONDITION_STYLES: Record<ItemCondition, string> = {
  excellent: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  good: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400',
  fair: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  poor: 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
  damaged: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  not_applicable: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};

export const CONDITION_LABELS: Record<ItemCondition, string> = {
  excellent: 'Excellent', good: 'Good', fair: 'Fair', poor: 'Poor', damaged: 'Damaged', not_applicable: 'N/A',
};