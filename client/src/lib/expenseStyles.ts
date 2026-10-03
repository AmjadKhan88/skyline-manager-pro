import { Wrench, Zap, Users, ShieldCheck, Receipt, Hammer, Package, MoreHorizontal } from 'lucide-react';
import type { ExpenseCategory } from '../types/index';

export const EXPENSE_CATEGORY_CONFIG: Record<ExpenseCategory, { label: string; icon: any }> = {
  maintenance: { label: 'Maintenance', icon: Wrench },
  utilities: { label: 'Utilities', icon: Zap },
  salary: { label: 'Salary', icon: Users },
  insurance: { label: 'Insurance', icon: ShieldCheck },
  tax: { label: 'Tax', icon: Receipt },
  repairs: { label: 'Repairs', icon: Hammer },
  supplies: { label: 'Supplies', icon: Package },
  other: { label: 'Other', icon: MoreHorizontal },
};