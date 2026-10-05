/**
 * types/index.ts — Global TypeScript Type Definitions
 *
 * Single source of truth for all data shapes used across the frontend.
 * Matches the backend API response structure exactly.
 */

// ─── Core User Types ──────────────────────────────────────────────────────────

export type MaintenanceCategory = 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'pest-control' | 'other';
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent';
export type MaintenanceStatus = 'open' | 'in-progress' | 'resolved' | 'cancelled';

export interface MaintenanceRequest {
  id: string;
  buildingId: string;
  unitNumber?: string;
  title: string;
  description?: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  photoUrl?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  createdAt: string;
  building?: { id: string; name: string; address: string };
  reportedBy?: { id: string; name: string; email: string; role: string };
  assignedTo?: { id: string; name: string; email: string; role: string } | null;
  assignedVendor?: { id: string; name: string; companyName?: string | null; phone?: string | null } | null;
}

export type AnnouncementPriority = 'info' | 'warning' | 'urgent';

export interface Announcement {
  id: string;
  buildingId: string | null;
  title: string;
  body: string;
  priority: AnnouncementPriority;
  createdAt: string;
  building?: { id: string; name: string } | null;
  author?: { id: string; name: string; role: string };
}

export type DocumentCategory = 'lease' | 'id_proof' | 'insurance' | 'inspection' | 'permit' | 'financial' | 'other';

export interface AppDocument {
  id: string;
  buildingId: string | null;
  tenancyId: string | null;
  subjectUserId: string | null;
  title: string;
  category: DocumentCategory;
  fileUrl: string;
  fileType: string;
  createdAt: string;
  building?: { id: string; name: string } | null;
  subject?: { id: string; name: string; role: string } | null;
  uploadedBy: { id: string; name: string; role: string };
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorTimestamp?: number;
}

export interface ErrorBoundaryFallbackProps {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  resetError: () => void;
  boundaryName?: string;
  isFullScreen?: boolean;
}

export interface ErrorBoundaryProps {
  children: import("react").ReactNode;
  FallbackComponent?: import("react").ComponentType<ErrorBoundaryFallbackProps>;
  fallbackProps?: Partial<ErrorBoundaryFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onReset?: () => void;
  reportUrl?: string;
  boundaryName?: string;
  resetKeys?: any[];
  context?: Record<string, any>;
  isFullScreen?: boolean;
}


export type UserRole = "owner" | "manager" | "employee" | "tenant";
export type UserStatus = "active" | "inactive" | "pending";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  verified: boolean;
  googleId?: string | null;
  ownerId?: string | null;
  mustChangePassword?: boolean;
  createdAt: string;
  updatedAt: string;
  // Included via associations
  profile?: UserProfile;
  ownerProfile?: OwnerProfile;
}

export interface OwnerProfile {
  id: string;
  userId: string;
  businessName?: string;
  businessAddress?: string;
  phone?: string;
  taxId?: string;
  avatar?: string;
  subscriptionPlan: "basic" | "pro" | "enterprise";
  maxBuildings: number;
}

export interface UserProfile {
  id: string;
  userId: string;
  phone?: string;
  avatar?: string;
  cnic?: string;
  salary?: number;
  jobTitle?: string;
  buildingId?: string;
  extraFields?: ExtraField[];
  building?: Building;
}

export interface ExtraField {
  key: string;
  value: string;
}

// ─── Building Types ───────────────────────────────────────────────────────────

export type BuildingType =
  | "residential"
  | "commercial"
  | "industrial"
  | "mixed-use"
  | "educational"
  | "healthcare";

export type BuildingStatus =
  | "planning"
  | "under-construction"
  | "completed"
  | "occupied"
  | "renovating"
  | "operational";

export interface Building {
  id: string;
  name: string;
  address: string;
  city?: string;
  description?: string;
  buildingType: BuildingType;
  floors?: number;
  units?: number;
  status: BuildingStatus;
  occupancy: number;
  energyRating?: string;
  greenCertification?: string;
  isActive: boolean;
  ownerId: string;
  managerId?: string | null;
  extraFields?: ExtraField[];
  createdAt: string;
  // Associations
  manager?: Pick<User, "id" | "name" | "email">;
  owner?: Pick<User, "id" | "name" | "email">;
}

// ─── Tenancy Types ────────────────────────────────────────────────────────────

export type PaymentStatus = "paid" | "unpaid" | "overdue" | "partial";
export type TenancyStatus = "active" | "terminated" | "pending";

export interface Tenancy {
  id: string;
  tenantId: string;
  buildingId: string;
  ownerId: string;
  unitNumber: string;
  monthlyRent: number;
  depositAmount: number;
  leaseStart: string;
  leaseEnd?: string | null;
  paymentStatus: PaymentStatus;
  status: TenancyStatus;
  notes?: string;
  createdAt: string;
  // Associations
  building?: Pick<Building, "id" | "name" | "address" | "buildingType">;
  tenant?: Pick<User, "id" | "name" | "email">;
}

export interface AnalyticsData {
  buildingsByType: { type: string; count: number }[];
  buildingsByStatus: { status: string; count: number }[];
  buildings: {
    id: string;
    name: string;
    units: number;
    occupied: number;
    vacant: number;
    occupancyRate: number;
    hasManager: boolean;
    employees: number;
  }[];
}

export interface FinancialData {
  revenueByBuilding: { id: string; name: string; expected: number; collected: number; outstanding: number; expenses: number; netProfit: number }[];
  outstanding: {
    tenancyId: string;
    tenantId: string;
    tenantName: string;
    tenantEmail: string;
    buildingName: string;
    unitNumber: string;
    monthlyRent: number;
    paymentStatus: 'unpaid' | 'overdue' | 'partial';
    leaseStart: string;
  }[];
  totals: { expected: number; collected: number; outstanding: number; expenses: number; netProfit: number };
}

// ─── Dashboard Stats Types ────────────────────────────────────────────────────

export interface DashboardStats {
  buildings: { total: number; active: number };
  managers: { total: number; active: number };
  employees: { total: number; active: number };
  tenants: { total: number; active: number };
  tenancies: {
    total: number;
    paid: number;
    unpaid: number;
    overdue: number;
  };
}

export interface DashboardData {
  stats: DashboardStats;
  revenue: { expected: number; collected: number; overdue: number };
  occupancy: { totalUnits: number; occupiedUnits: number; vacantUnits: number; occupancyRate: number };
  recentBuildings: Building[];
  recentStaff: User[];
  recentTenants: User[];
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface LoginResponse {
  user: User;
  mustChangePassword: boolean;
  redirectTo: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export type PaymentMethod = 'bank_transfer' | 'jazzcash' | 'easypaisa' | 'other';
export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface PaymentAccount {
  id: string;
  method: PaymentMethod;
  label: string;
  accountTitle: string;
  accountNumber: string;
  bankName?: string | null;
  iban?: string | null;
  qrCodeUrl?: string | null;
  instructions?: string | null;
  isActive: boolean;
}

export interface PaymentSubmission {
  id: string;
  amount: number;
  periodMonth?: string | null;
  transactionReference?: string | null;
  proofImageUrl: string;
  status: SubmissionStatus;
  method: PaymentMethod;
  reviewNotes?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  tenant: { id: string; name: string; email: string };
  reviewedBy?: { id: string; name: string } | null;
  tenancy: { id: string; unitNumber: string; monthlyRent: number; building: { id: string; name: string } };
  paymentAccount?: { id: string; label: string; method: PaymentMethod } | null;
}

export type ExpenseCategory = 'maintenance' | 'utilities' | 'salary' | 'insurance' | 'tax' | 'repairs' | 'supplies' | 'other';

export interface Expense {
  id: string;
  buildingId: string;
  category: ExpenseCategory;
  description: string;
  vendor?: string | null;
  amount: number;
  expenseDate: string;
  receiptUrl?: string | null;
  building: { id: string; name: string };
  recordedBy: { id: string; name: string; role: string };
}

export type VendorSpecialty = 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'pest-control' | 'general';

export interface Vendor {
  id: string;
  name: string;
  companyName?: string | null;
  phone?: string | null;
  email?: string | null;
  specialty: VendorSpecialty;
  notes?: string | null;
  isActive: boolean;
}

export type InspectionType = 'move_in' | 'move_out';
export type InspectionStatus = 'draft' | 'completed';
export type ItemCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'damaged' | 'not_applicable';

export interface InspectionItem {
  area: string;
  item: string;
  condition: ItemCondition;
  notes?: string;
  photoUrl?: string;
}

export interface Inspection {
  id: string;
  tenancyId: string;
  type: InspectionType;
  inspectionDate: string;
  items: InspectionItem[];
  generalNotes?: string | null;
  status: InspectionStatus;
  tenantAcknowledged: boolean;
  tenantAcknowledgedAt?: string | null;
  building: { id: string; name: string };
  inspectedBy: { id: string; name: string; role: string };
  tenancy: { id: string; unitNumber: string; tenantId: string };
}

export type SignerRole = 'tenant' | 'owner' | 'manager';

export interface LeaseSignature {
  id: string;
  tenancyId: string;
  signerRole: SignerRole;
  signatureImageUrl: string;
  typedName: string;
  agreedAt: string;
  signer: { id: string; name: string; role: string };
}