---
description: Comprehensive task list for building the ACU Apex Supabase database schema
globs: docs/DATABASE_SCHEMA_TASKS.md
alwaysApply: false
---

# Database Schema Implementation Tasks

## **Phase 1: Core Entity Tables**

### **1.1 Users Table Setup**
- Create `users` table with Supabase Auth integration
- Add role-based fields: `role` (student, officer, staff, admin)
- Add profile fields: `first_name`, `last_name`, `email`, `phone`
- Set up Row Level Security (RLS) policies for role-based access
- Create indexes on `email` and `role` fields

### **1.2 Companies Table Setup**
- Create `companies` table with fields:
  - `id` (UUID primary key)
  - `name` (VARCHAR unique)
  - `description` (TEXT)
  - `created_at` (TIMESTAMP)
  - `is_active` (BOOLEAN)
- Set up RLS policies for company access
- Create unique constraint on `name`

### **1.3 Students Table Setup**
- Create `students` table with fields:
  - `id` (UUID primary key, references users.id)
  - `company_id` (UUID foreign key to companies.id)
  - `academic_role` (VARCHAR) - student's academic position
  - `company_role` (VARCHAR) - student's role within company
  - `academic_year_start` (INTEGER)
  - `academic_year_end` (INTEGER)
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)
- Set up foreign key constraint to companies
- Create indexes on `company_id` and `(academic_year_start, academic_year_end)`
- Set up RLS policies for student data access

## **Phase 2: Holistic GPA System Tables**

### **2.1 Categories Table Setup**
- Create `categories` table with fields:
  - `id` (UUID primary key)
  - `name` (VARCHAR unique) - 'spiritual', 'professional', 'academic', 'team'
  - `display_name` (VARCHAR) - 'Spiritual Standing', etc.
  - `weight` (DECIMAL(3,2)) - default 1.0
  - `created_at` (TIMESTAMP)
- Insert seed data for the four main categories
- Create unique constraint on `name`

### **2.2 Subcategories Table Setup**
- Create `subcategories` table with fields:
  - `id` (UUID primary key)
  - `category_id` (UUID foreign key to categories.id)
  - `name` (VARCHAR) - internal name like 'chapel_participation'
  - `display_name` (VARCHAR) - 'Chapel Team Participation'
  - `data_source` (VARCHAR) - 'populi', 'student_input', 'officer_input', 'staff_input'
  - `weight` (DECIMAL(3,2)) - default 1.0
  - `created_at` (TIMESTAMP)
- Set up foreign key constraint to categories
- Create indexes on `category_id` and `data_source`
- Insert seed data for all subcategories based on requirements

### **2.3 Student Scores Table Setup**
- Create `student_scores` table with fields:
  - `id` (UUID primary key)
  - `student_id` (UUID foreign key to students.id)
  - `subcategory_id` (UUID foreign key to subcategories.id)
  - `score` (DECIMAL(5,2)) - the actual score value
  - `academic_year_start` (INTEGER)
  - `academic_year_end` (INTEGER)
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)
- Set up foreign key constraints
- Create composite index on `(student_id, academic_year_start)`
- Create index on `subcategory_id`
- Set up RLS policies for score access

### **2.4 Score History Table Setup**
- Create `score_history` table with fields:
  - `id` (UUID primary key)
  - `student_score_id` (UUID foreign key to student_scores.id)
  - `old_score` (DECIMAL(5,2))
  - `new_score` (DECIMAL(5,2))
  - `change_reason` (TEXT) - why the score changed
  - `changed_by` (UUID foreign key to users.id)
  - `changed_at` (TIMESTAMP)
- Set up foreign key constraints
- Create indexes on `student_score_id` and `changed_at`
- Set up RLS policies for history access

## **Phase 3: Event System Tables**

### **3.1 Events Table Setup**
- Create `events` table with fields:
  - `id` (UUID primary key)
  - `name` (VARCHAR)
  - `description` (TEXT)
  - `event_type` (VARCHAR) - 'self_report', 'officer_input', 'staff_input', 'attendance'
  - `required_roles` (TEXT[]) - array of roles that can participate
  - `required_years` (INTEGER[]) - array of academic years that can participate
  - `class_code` (VARCHAR) - optional, references classes.class_code
  - `due_date` (TIMESTAMP)
  - `is_active` (BOOLEAN) - default true
  - `created_at` (TIMESTAMP)
  - `created_by` (UUID foreign key to users.id)
- Set up foreign key constraint to users
- Create indexes on `event_type`, `due_date`, `is_active`
- Set up RLS policies for event access

### **3.2 Event Submissions Table Setup**
- Create `event_submissions` table with fields:
  - `id` (UUID primary key)
  - `event_id` (UUID foreign key to events.id)
  - `student_id` (UUID foreign key to students.id)
  - `submitted_by` (UUID foreign key to users.id)
  - `submission_data` (JSONB) - flexible data storage for different event types
  - `submitted_at` (TIMESTAMP)
  - `is_approved` (BOOLEAN) - default false
  - `approved_by` (UUID foreign key to users.id) - nullable
  - `approved_at` (TIMESTAMP) - nullable
- Set up foreign key constraints
- Create indexes on `event_id`, `student_id`, `submitted_at`
- Set up RLS policies for submission access

## **Phase 4: Academic System Tables**

### **4.1 Classes Table Setup**
- Create `classes` table with fields:
  - `id` (UUID primary key)
  - `class_code` (VARCHAR unique) - 'BIBL101'
  - `class_name` (VARCHAR) - 'Introduction to Biblical Studies'
  - `credits` (INTEGER)
  - `department` (VARCHAR)
  - `created_at` (TIMESTAMP)
- Create unique constraint on `class_code`
- Create index on `department`

### **4.2 Academic Records Table Setup**
- Create `academic_records` table with fields:
  - `id` (UUID primary key)
  - `student_id` (UUID foreign key to students.id)
  - `class_id` (UUID foreign key to classes.id)
  - `academic_year_start` (INTEGER)
  - `academic_year_end` (INTEGER)
  - `semester` (VARCHAR) - 'fall', 'spring', 'summer'
  - `grade` (VARCHAR) - 'A', 'B+', etc.
  - `grade_points` (DECIMAL(3,2)) - 4.0, 3.7, etc.
  - `attendance_percentage` (DECIMAL(5,2))
  - `imported_from_populi` (BOOLEAN) - default false
  - `imported_at` (TIMESTAMP) - nullable
  - `created_at` (TIMESTAMP)
- Set up foreign key constraints
- Create composite index on `(student_id, academic_year_start)`
- Create index on `class_id`
- Set up RLS policies for academic record access

## **Phase 5: Company Competition Tables**

### **5.1 Company Standings Table Setup**
- Create `company_standings` table with fields:
  - `id` (UUID primary key)
  - `company_id` (UUID foreign key to companies.id)
  - `academic_year_start` (INTEGER)
  - `academic_year_end` (INTEGER)
  - `average_holistic_gpa` (DECIMAL(5,2))
  - `rank` (INTEGER)
  - `total_students` (INTEGER)
  - `calculated_at` (TIMESTAMP)
- Set up foreign key constraint to companies
- Create composite index on `(company_id, academic_year_start)`
- Create index on `rank`
- Set up RLS policies for standings access

### **5.2 Company Scores Table Setup**
- Create `company_scores` table with fields:
  - `id` (UUID primary key)
  - `company_id` (UUID foreign key to companies.id)
  - `academic_year_start` (INTEGER)
  - `academic_year_end` (INTEGER)
  - `category_id` (UUID foreign key to categories.id)
  - `average_score` (DECIMAL(5,2))
  - `calculated_at` (TIMESTAMP)
- Set up foreign key constraints
- Create composite index on `(company_id, academic_year_start, category_id)`
- Set up RLS policies for company score access

## **Phase 6: Additional Data Tables**

### **6.1 Financial Records Table Setup**
- Create `financial_records` table with fields:
  - `id` (UUID primary key)
  - `student_id` (UUID foreign key to students.id)
  - `academic_year_start` (INTEGER)
  - `academic_year_end` (INTEGER)
  - `tuition_balance` (DECIMAL(10,2))
  - `financial_aid_amount` (DECIMAL(10,2))
  - `payment_plan` (VARCHAR)
  - `imported_from_populi` (BOOLEAN) - default false
  - `imported_at` (TIMESTAMP) - nullable
  - `created_at` (TIMESTAMP)
- Set up foreign key constraint to students
- Create composite index on `(student_id, academic_year_start)`
- Set up RLS policies for financial record access

### **6.2 Personality Profiles Table Setup**
- Create `personality_profiles` table with fields:
  - `id` (UUID primary key)
  - `student_id` (UUID foreign key to students.id)
  - `profile_type` (VARCHAR) - 'disc', 'enneagram', 'mbti', etc.
  - `profile_data` (JSONB) - flexible storage for different profile types
  - `is_public` (BOOLEAN) - default false
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)
- Set up foreign key constraint to students
- Create indexes on `student_id`, `profile_type`
- Set up RLS policies for personality profile access

### **6.3 Student Profiles Table Setup**
- Create `student_profiles` table with fields:
  - `id` (UUID primary key)
  - `student_id` (UUID foreign key to students.id)
  - `photo_url` (VARCHAR) - nullable
  - `biography` (TEXT) - nullable
  - `date_of_birth` (DATE) - nullable
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)
- Set up foreign key constraint to students
- Create unique constraint on `student_id`
- Set up RLS policies for profile access

## **Phase 7: Database Functions and Triggers**

### **7.1 Holistic GPA Calculation Function**
- Create PostgreSQL function to calculate holistic GPA for a student
- Function should aggregate scores across all categories with weighting
- Function should handle missing scores gracefully
- Function should return both overall GPA and category breakdowns

### **7.2 Company Score Calculation Function**
- Create PostgreSQL function to calculate company average GPA
- Function should aggregate all student GPAs within a company
- Function should update company_standings table
- Function should handle company membership changes

### **7.3 Score History Trigger**
- Create trigger on student_scores table
- Trigger should automatically create score_history records
- Trigger should capture old_score, new_score, and change metadata
- Trigger should handle both INSERT and UPDATE operations

### **7.4 Academic Year Validation Function**
- Create function to validate academic year consistency
- Function should ensure academic_year_end = academic_year_start + 1
- Function should be called by triggers on relevant tables

## **Phase 8: Row Level Security (RLS) Policies**

### **8.1 Student Access Policies**
- Students can only view their own data
- Students can view their company's data
- Students can view public company standings
- Students cannot modify their own scores (only through events)

### **8.2 Officer Access Policies**
- Officers can view all data within their company
- Officers can input scores for team events
- Officers can approve event submissions within their company
- Officers cannot modify academic or financial records

### **8.3 Staff Access Policies**
- Staff can view all student data
- Staff can input scores for staff-managed events
- Staff can approve event submissions
- Staff can import data from Populi
- Staff cannot modify core student information

### **8.4 Admin Access Policies**
- Admins have full access to all data
- Admins can modify system configuration
- Admins can manage user roles and permissions
- Admins can create and modify events

## **Phase 9: Indexing Strategy**

### **9.1 Performance Indexes**
- Composite indexes on frequently queried combinations
- Indexes on foreign key columns
- Indexes on date/time columns for historical queries
- Partial indexes for active records only

### **9.2 Query Optimization**
- Analyze common query patterns
- Create covering indexes for dashboard queries
- Optimize indexes for company standings queries
- Ensure efficient student score aggregation

## **Phase 10: Data Migration and Seeding**

### **10.1 Seed Data Creation**
- Create SQL scripts for initial categories and subcategories
- Create sample companies for testing
- Create test users with different roles
- Create sample events and academic records

### **10.2 Migration Scripts**
- Create scripts for future schema changes
- Document all table creation scripts
- Create rollback procedures
- Test migration scripts in development environment

## **Phase 11: Testing and Validation**

### **11.1 Data Integrity Testing**
- Test all foreign key constraints
- Test unique constraints
- Test check constraints
- Test trigger functions

### **11.2 Performance Testing**
- Test query performance with realistic data volumes
- Test concurrent user access
- Test data import performance
- Test dashboard query performance

### **11.3 Security Testing**
- Test RLS policies with different user roles
- Test data access restrictions
- Test authentication integration
- Test authorization boundaries

## **Phase 12: Documentation and Monitoring**

### **12.1 Schema Documentation**
- Document all tables and relationships
- Create entity relationship diagrams
- Document all functions and triggers
- Create API documentation for database access

### **12.2 Monitoring Setup**
- Set up database performance monitoring
- Create alerts for data integrity issues
- Monitor query performance
- Track data import success rates

---

**Implementation Order:**
1. Start with Phase 1 (Core Entities)
2. Proceed through phases sequentially
3. Test each phase before moving to the next
4. Document all changes and decisions
5. Validate with stakeholders before production deployment 