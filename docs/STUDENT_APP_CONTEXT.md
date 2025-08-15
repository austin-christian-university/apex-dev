# ACU Blueprint - Student Development Platform Vision

## Project Overview

ACU Blueprint is a comprehensive student development platform designed to track and encourage holistic student growth through a competitive, company-based system. The platform moves beyond traditional academic tracking to evaluate students across four key development areas: Spiritual Standing, Professional Standing, Academic Performance, and Team Execution.

## Core Philosophy

### Holistic Development Approach
ACU believes in developing the whole person, not just academic achievement. The platform reflects this philosophy by tracking multiple dimensions of student growth and providing a competitive framework that encourages engagement across all areas of development.

### Competitive Motivation
Students are organized into competing "companies" that compete based on the average Holistic GPA of their members. This creates a team-based competitive environment that motivates students to excel not just for themselves, but for their company.

### Data-Driven Growth
The platform provides comprehensive tracking and analytics, allowing students, staff, and administrators to identify growth areas, celebrate achievements, and make data-informed decisions about student development.

## Key Features

### 1. Holistic GPA System
The platform's core innovation is the Holistic GPA, which combines four development categories:

- **Spiritual Standing**: Chapel participation, small group involvement, community service
- **Professional Standing**: Leadership roles, certifications, practicum performance  
- **Academic Performance**: Class attendance, grades, academic achievements
- **Team Execution**: Company team-building, GBE participation, community events

Each category contains multiple subcategories with flexible weighting systems that can be adjusted as the program evolves.

### 2. Company Competition
- Students are permanently assigned to companies (no transfers)
- Company scores calculated as average of member Holistic GPAs
- Historical standings tracked over time
- Competitive events and activities contribute to scores

### 3. Multi-Source Data Integration
The platform aggregates data from multiple sources:
- **Populi LMS**: Academic grades, attendance, spiritual formation grades
- **Student Self-Input**: Service hours, certifications, community involvement
- **Officer Input**: Team-building activities, GBE participation
- **Staff Input**: Lions Games involvement, administrative data

### 4. Event-Driven Scoring
- Upcoming events requiring student self-reporting
- Overdue event tracking and notifications
- Different event types with role-specific requirements
- Photo check-ins for service activities

## User Experience

### Student Dashboard
Students see their company's current standing, historical performance, upcoming events requiring action, and overdue items needing attention. This creates urgency and engagement while providing clear next steps.

### Company Overview
Students can view their company members, contact information, and collective achievements. This fosters team identity and collaboration.

### Personal Profile
Comprehensive student profiles include:
- Personal information (photo, bio, date of birth)
- Holistic GPA breakdown and historical trends
- Financial standing (imported from Populi)
- Academic transcript with class-by-class breakdown
- Personality profiles (DiSC, Enneagram, etc.)
- Complete audit trail of all GPA-impacting changes

## Technical Architecture

### Technology Stack
- **Frontend**: Next.js 15 with App Router
- **UI Components**: Shadcn/ui with custom ACU branding
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Styling**: Tailwind CSS with dark-first design
- **Authentication**: Supabase Auth with role-based access

### Design Philosophy
- **Dark Mode First**: Soft black backgrounds with almost white text and light blue accents
- **Google Roboto Font**: Clean, modern typography
- **Responsive Design**: Mobile-first approach for student accessibility
- **Accessibility**: WCAG compliant components and interactions

### Data Architecture
- **Normalized Schema**: Minimize redundancy while maintaining performance
- **Audit Trail**: Complete history of all score changes
- **Flexible Scoring**: Support for future weighting algorithms
- **Scalable Design**: Handle growing student body and historical data

## Business Context

### Target Users
- **Students**: Primary users tracking their development and competing with other companies
- **Student Officers**: Elevated permissions within their companies for input and management
- **Staff**: Administrative access for data management and oversight
- **Admins**: System-wide access for configuration and reporting

### Academic Year Structure
- **August to May**: Standard academic year tracking
- **Flexible Periods**: Support for semester, quarter, or custom time periods
- **Historical Data**: Long-term tracking for trend analysis

### Integration Requirements
- **Populi LMS**: Primary academic data source
- **Future Integrations**: Potential for additional LMS or administrative systems
- **Export Capabilities**: Data export for reporting and analysis

## Development Priorities

### Phase 1: Core Platform
- Basic authentication and user management
- Company and student data structure
- Holistic GPA calculation system
- Basic dashboard views

### Phase 2: Event System
- Event creation and management
- Student self-reporting interface
- Officer and staff input capabilities
- Notification system

### Phase 3: Advanced Features
- Historical analytics and reporting
- Advanced scoring algorithms
- Mobile optimization
- Integration with additional data sources

## Success Metrics

### Student Engagement
- Event participation rates
- Self-reporting completion rates
- Time spent on platform
- Company competition engagement

### Academic Outcomes
- Holistic GPA improvements
- Company performance trends
- Individual growth trajectories
- Cross-category development balance

### System Performance
- Data accuracy and consistency
- User satisfaction scores
- System reliability and uptime
- Integration success rates

## Future Vision

The platform is designed to evolve with the institution's needs, supporting:
- Advanced analytics and predictive modeling
- Integration with additional educational technologies
- Expanded competition frameworks
- Alumni tracking and engagement
- Research capabilities for educational effectiveness

---

*This document serves as the foundational context for all ACU Blueprint development work. It should be referenced when making architectural decisions, feature prioritization, and user experience design choices.* 