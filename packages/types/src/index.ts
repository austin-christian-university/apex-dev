// Event submission types and validation
export * from './event-submissions';

// User types - matches Supabase users table
export interface User {
  id: string;
  role: 'student' | 'officer' | 'staff' | 'admin';
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone_number: string | null;
  created_at: string | null;
  updated_at: string | null;
  disc_profile: string | null;
  myers_briggs_profile: string | null;
  enneagram_profile: string | null;
  has_completed_onboarding: boolean | null;
  date_of_birth: string | null; // Date string
  photo: string | null; // Base64 encoded photo
}

// Student types - matches Supabase students table
export interface Student {
  id: string; // References users.id
  company_id: string; // References companies.id
  academic_role: string | null; // e.g., "Freshman", "Sophomore"
  company_role: string | null; // Student role within their company
  academic_year_start: number; // e.g., 2024 for 2024-2025
  academic_year_end: number; // e.g., 2025 for 2024-2025
  created_at: string | null;
  updated_at: string | null;
  student_id: number | null; // Unique 6-digit identifier (100000-999999)
}

// Extended Student type with user and company data
export interface StudentWithDetails extends Student {
  user: User;
  company: Company;
  scores?: Score[];
}

// Utility types for different user roles
export type StudentUser = User & { role: 'student' };
export type OfficerUser = User & { role: 'officer' };
export type StaffUser = User & { role: 'staff' };
export type AdminUser = User & { role: 'admin' };

// Complete student profile (user + student data)
export interface StudentProfile {
  user: StudentUser;
  student: Student;
  company: Company;
  scores?: Score[];
}

// Staff profile (user only, no student data)
export interface StaffProfile {
  user: StaffUser | AdminUser;
}

// Union type for any user profile
export type UserProfile = StudentProfile | StaffProfile;

// Type guard to check if user is a student
export function isStudent(user: User): user is StudentUser {
  return user.role === 'student';
}

// Type guard to check if user is staff/admin
export function isStaff(user: User): user is StaffUser | AdminUser {
  return user.role === 'staff' || user.role === 'admin';
}

// Company types - matches Supabase companies table
export interface Company {
  id: string;
  name: string;
  description: string | null;
  motto: string | null;
  vision: string | null;
  quote: string | null;
  created_at?: string | null; // Made optional since it's nullable and not always selected
  is_active: boolean | null;
}

// Score types (keeping existing structure as it may be used elsewhere)
export interface Score {
  id: string;
  value: number;
  category: string;
  date: string;
  notes?: string;
}

// Admin types (keeping for backward compatibility)
export interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Dashboard types
export interface DashboardStats {
  totalStudents: number;
  averageScore: number;
  topPerformers: StudentProfile[];
  recentActivity: Activity[];
}

export interface Activity {
  id: string;
  type: 'score_added' | 'student_added' | 'score_updated';
  studentId: string;
  studentName: string;
  timestamp: string;
  details?: string;
}

// Form types
export interface StudentFormData {
  name: string;
  email: string;
  avatar?: File;
}

export interface ScoreFormData {
  value: number;
  category: string;
  notes?: string;
}

// Chart types
export interface ChartData {
  name: string;
  value: number;
  date?: string;
}

export interface ChartConfig {
  title: string;
  data: ChartData[];
  type: 'line' | 'bar' | 'pie' | 'area';
}

// Onboarding types - updated to match User interface
export interface OnboardingData {
  role: 'student' | 'officer' | 'staff' | 'admin';
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  date_of_birth?: string;
  photo?: string;
  company_id?: string;
  company_name?: string; // Store company name for display purposes
  disc_profile?: string;
  myers_briggs_profile?: string;
  enneagram_profile?: string;
}

// Event types - matches Supabase recurring_events table
export interface RecurringEvent {
  id: string;
  name: string;
  description: string | null;
  event_type: 'self_report' | 'attendance';
  required_roles: string[] | null;
  required_years: number[] | null;
  class_code: string | null;
  recurrence_pattern: {
    type: 'daily' | 'weekly' | 'monthly';
    day_of_week?: number; // 0-6 for weekly patterns
    time: string; // HH:MM format
    timezone: string;
  };
  recurrence_interval: number | null; // Legacy field
  recurrence_days: number[] | null; // Legacy field
  start_date: string;
  end_date: string | null;
  time_due: string | null; // Legacy field
  is_active: boolean;
  created_at: string;
  created_by: string | null;
  required_company: string | null;
}

// Event instances - matches Supabase event_instances table
export interface EventInstance {
  id: string;
  name: string;
  description: string | null;
  event_type: 'self_report' | 'attendance';
  required_roles: string[] | null;
  required_years: number[] | null;
  class_code: string | null;
  due_date: string | null;
  is_active: boolean;
  created_at: string;
  created_by: string | null;
  recurring_event_id: string | null;
  required_company: string | null;
}

// Event filtering and categorization
export interface UserEvent {
  event: EventInstance;
  isUrgent: boolean;
  isPastDue: boolean;
  daysUntilDue: number;
  formattedDueDate: string;
  hasSubmitted?: boolean; // For attendance events
  isEligibleForAttendance?: boolean; // For attendance events
}

export interface EventFilters {
  userRole: string;
  userCompanyId?: string;
  includePastDue?: boolean;
  limit?: number;
}

// Supabase Database types (for direct database operations)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'> & {
          id: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Omit<User, 'id'>>;
      };
      students: {
        Row: Student;
        Insert: Omit<Student, 'created_at' | 'updated_at'> & {
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Omit<Student, 'id'>>;
      };
      companies: {
        Row: Company;
        Insert: Omit<Company, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string | null;
        };
        Update: Partial<Omit<Company, 'id'>>;
      };
      recurring_events: {
        Row: RecurringEvent;
        Insert: Omit<RecurringEvent, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string | null;
        };
        Update: Partial<Omit<RecurringEvent, 'id'>>;
      };
      event_instances: {
        Row: EventInstance;
        Insert: Omit<EventInstance, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string | null;
        };
        Update: Partial<Omit<EventInstance, 'id'>>;
      };
    };
  };
}; 