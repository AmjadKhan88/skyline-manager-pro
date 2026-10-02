import { Landmark, Smartphone, Wallet, CircleDollarSign, Clock, CheckCircle2, XCircle } from 'lucide-react';
import type { PaymentMethod, SubmissionStatus } from '../types/index';

export const METHOD_CONFIG: Record<PaymentMethod, { label: string; icon: any }> = {
  bank_transfer: { label: 'Bank Transfer', icon: Landmark },
  jazzcash: { label: 'JazzCash', icon: Smartphone },
  easypaisa: { label: 'EasyPaisa', icon: Wallet },
  other: { label: 'Other', icon: CircleDollarSign },
};

export const STATUS_CONFIG: Record<SubmissionStatus, { label: string; icon: any; badge: string }> = {
  pending: { label: 'Pending Review', icon: Clock, badge: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' },
  approved: { label: 'Approved', icon: CheckCircle2, badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' },
  rejected: { label: 'Rejected', icon: XCircle, badge: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400' },
};