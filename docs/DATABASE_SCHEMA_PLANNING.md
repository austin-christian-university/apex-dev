# Database Schema Planning - ACU Blueprint Student Development Platform

## Project Overview

ACU Blueprint is a comprehensive student development platform that tracks holistic student growth through a competitive company-based system. Students are organized into competing companies, with company scores calculated as the average of each student's Holistic GPA.

## Core Concepts

### Holistic GPA System
The platform tracks student development across four main categories:
1. **Spiritual Standing** - Spiritual formation, chapel participation, small groups, community service
2. **Professional Standing** - Leadership roles, certifications, practicum performance
3. **Academic Performance** - Class attendance, grades, academic achievements
4. **Team Execution** - Company team-building, GBE participation, community events

### Company Competition
- Students are assigned to companies
- Companies compete based on average Holistic GPA
- Historical standings are tracked over time
- Events and activities contribute to company and individual scores

### Data Sources
- **Populi LMS** - Academic grades, attendance, spiritual formation grades
- **Student Self-Input** - Service hours, certifications, community involvement
- **Officer Input** - Team-building activities, GBE participation
- **Staff Input** - Lions Games involvement, administrative data

## Application Screens

### 1. Company Standings Dashboard
- Current company rankings
- Historical standings over time
- Upcoming events requiring self-reporting
- Overdue events needing attention

### 2. Company Overview
- Company member list with contact information
- Company performance metrics
- Team activities and achievements

### 3. Student Profile
- Personal information (photo, bio, DOB)
- Holistic GPA breakdown and history
- Financial standing (Populi import)
- Academic transcript (Populi import)
- Personality profiles (DiSC, Enneagram, etc.)
- Complete history of GPA-impacting changes

## Schema Design Goals

- **Normalized Structure** - Minimize data redundancy while maintaining performance
- **Audit Trail** - Track all changes to student scores and company standings
- **Flexible Scoring** - Support future weighting systems and scoring algorithms
- **Data Integration** - Efficient import/export with Populi LMS
- **Scalability** - Handle growing student body and historical data
- **Security** - Role-based access control for different user types

## Schema Design Decisions

### Core Entity Structure
- **Companies**: Permanent student assignments (no transfers allowed)
- **Students**: Individual student records with contact information
- **Users**: Authentication layer linked to students, staff, admins, and officers

### Holistic GPA System
- **Categories Table**: Reference table for the four main categories (Spiritual, Professional, Academic, Team)
- **Subcategories Table**: Reference table for specific metrics within each category
- **Flexible Weighting**: Both categories and subcategories have weight fields for future scoring algorithms
- **Data Source Tracking**: Each subcategory tracks its data source (Populi, student_input, officer_input, staff_input)

### Academic Year Management
- **Two-Field Approach**: `academic_year_start` and `academic_year_end` (e.g., 2024, 2025)
- **Consistent Usage**: All time-based data uses this format across tables
- **No Validation Constraints**: Avoids potential issues with complex business logic

### Event System
- **Single Events Table**: All events in one table with filtering fields
- **Role-Based Filtering**: `required_roles` array field for role-specific events
- **Year-Based Filtering**: `required_years` array field for year-specific events
- **Event Types**: Different form types based on `event_type` (self_report, officer_input, staff_input, attendance)
- **Optional Class Integration**: `class_code` field for academic attendance events

### Academic Records
- **Classes Table**: Centralized class definitions with codes and names
- **Academic Records Table**: Student-specific class performance data
- **Populi Integration**: Import tracking with `imported_from_populi` and `imported_at` fields

### Audit Trail Strategy
- **Score History**: Tracks all changes to student scores without redundant academic year data
- **Date-Based Lookup**: Academic year can be determined from timestamps when needed
- **Complete Tracking**: Every score change is recorded with before/after values

### Data Import Philosophy
- **Direct Schema Storage**: Populi data goes directly into our schema, not staging tables
- **Import Tracking**: Fields to track what was imported and when
- **Flexible Integration**: Schema designed to handle various data sources

## Technical Considerations

### Performance Optimizations
- Indexes on `(student_id, academic_year_start)` for student_scores
- Indexes on `(company_id, academic_year_start)` for company standings
- Proper foreign key relationships for data integrity

### Security Approach
- Role-based access control (RLS) for different user types
- Student officers have elevated permissions within their companies
- Staff and admin roles for system-wide access

### Scalability Planning
- Normalized structure to minimize redundancy
- Efficient querying patterns for dashboard displays
- Historical data management for long-term tracking

## Next Steps

This document will be expanded with:
- Detailed table schemas
- Relationship diagrams
- Indexing strategies
- Data migration plans
- API endpoint specifications

---

*This is a planning document. The actual schema design will be developed through iterative discussion and refinement.* 