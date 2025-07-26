// Student types
export interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  scores: Score[];
  createdAt: string;
  updatedAt: string;
}

// Score types
export interface Score {
  id: string;
  value: number;
  category: string;
  date: string;
  notes?: string;
}

// Admin types
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
  topPerformers: Student[];
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