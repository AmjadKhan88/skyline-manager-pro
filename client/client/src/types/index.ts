/**
 * types/index.ts — Global TypeScript Type Definitions
 *
 * Single source of truth for all data shapes used across the frontend.
 * Matches the backend API response structure exactly.
 */

// ─── Core User Types ──────────────────────────────────────────────────────────

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
  recentBuildings: Building[];
  recentStaff: User[];
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
