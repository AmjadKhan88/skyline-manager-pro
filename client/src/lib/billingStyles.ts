import type { ChargeStatus } from '../types/index';

export const CHARGE_STATUS_STYLES: Record<ChargeStatus, string> = {
  pending: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  partial: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  paid: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  overdue: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  waived: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
};

export const CHARGE_STATUS_LABELS: Record<ChargeStatus, string> = {
  pending: 'Pending', partial: 'Partial', paid: 'Paid', overdue: 'Overdue', waived: 'Waived',
};