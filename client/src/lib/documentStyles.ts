import { FileText, IdCard, ShieldCheck, ClipboardCheck, FileCheck2, Receipt, File } from 'lucide-react';
import type { DocumentCategory } from '../types/index';

export const DOC_CATEGORY_CONFIG: Record<DocumentCategory, { label: string; icon: any }> = {
  lease: { label: 'Lease Agreement', icon: FileText },
  id_proof: { label: 'ID Proof', icon: IdCard },
  insurance: { label: 'Insurance', icon: ShieldCheck },
  inspection: { label: 'Inspection Report', icon: ClipboardCheck },
  permit: { label: 'Permit', icon: FileCheck2 },
  financial: { label: 'Financial', icon: Receipt },
  other: { label: 'Other', icon: File },
};