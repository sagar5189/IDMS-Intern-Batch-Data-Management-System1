// ── Intern Models ─────────────────────────────────────────────────────────────
export type IdCardType = 'FREE' | 'PREMIUM';
export type InternStatus = 'ACTIVE' | 'COMPLETED' | 'TERMINATED';

export interface Intern {
  id: number;
  internId: string;
  name: string;
  email: string;
  mobileNumber: string;
  idCardType: IdCardType;
  dateOfJoining: string;
  batchName: string;
  batchId: number;
  status: InternStatus;
  performanceScore?: number;
  performanceRemarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInternRequest {
  name: string;
  email: string;
  mobileNumber: string;
  idCardType: IdCardType;
  dateOfJoining: string;
  batchId: number;
}

export interface UpdateInternRequest {
  name?: string;
  email?: string;
  mobileNumber?: string;
  status?: InternStatus;
  performanceScore?: number;
  performanceRemarks?: string;
  batchId?: number;
}

export interface PerformanceUpdate {
  performanceScore: number;
  performanceRemarks: string;
}

// ── Batch Models ──────────────────────────────────────────────────────────────
export type BatchStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED';

export interface Batch {
  id: number;
  batchName: string;
  startDate: string;
  endDate: string;
  description?: string;
  status: BatchStatus;
  totalInterns: number;
  averagePerformanceScore?: number;
  interns?: Intern[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BatchSummary {
  id: number;
  batchName: string;
  startDate: string;
  endDate: string;
  status: BatchStatus;
  totalInterns: number;
}

export interface CreateBatchRequest {
  batchName: string;
  startDate: string;
  description?: string;
}

// ── Auth Models ───────────────────────────────────────────────────────────────
export type UserRole = 'ADMIN' | 'MANAGER' | 'VIEWER';

export interface LoginRequest { username: string; password: string; }
export interface AuthResponse {
  token: string;
  username: string;
  fullName: string;
  roles: UserRole[];
}

// ── Search / Filter ───────────────────────────────────────────────────────────
export interface InternSearchParams {
  name?: string;
  batchId?: number;
  idCardType?: IdCardType;
  status?: InternStatus;
}

// ── Dashboard Stats — aligned with backend DashboardDTO.Stats ─────────────────
export interface DashboardStats {
  totalInterns: number;
  activeInterns: number;
  totalBatches: number;
  activeBatches: number;
  completedBatches: number;
  premiumInterns: number;
  freeInterns: number;
  averagePerformanceScore: number;
}
