ACU Apex Event Scoring System - Context Summary
Vision & Purpose
The ACU Apex platform tracks holistic student development through a competitive company-based scoring system. Students earn points across four categories (Spiritual, Professional, Academic, Team) through various events and activities, with their scores contributing to their company's overall standing.
Core Architecture
4 Main Categories: Spiritual Standing, Professional Standing, Academic Performance, Team Execution
14 Subcategories: Specific metrics within each category (e.g., chapel participation, community service, practicum grades)
Event-Driven Scoring: Students earn points through events they report on or participate in
Company Competition: Individual scores average into company standings for competitive rankings
Event System Design
Event Types: self_report, officer_input, staff_input, attendance
Role-Based Filtering: Events can target specific user roles (student, officer, staff, admin)
Year-Based Filtering: Events can target specific academic years
Approval Workflow: Submissions require approval before scores are awarded
Flexible Data Storage: JSONB fields store different submission types (photos, text, numbers, etc.)
Scoring Workflow
Event Creation: Staff/admins create events with specific requirements and due dates
Student Participation: Students submit reports or participate in activities
Submission Review: Officers/staff review and approve submissions
Score Assignment: Approved submissions trigger score updates in the Holistic GPA system
Company Impact: Updated scores automatically affect company standings
Key Technical Requirements
Database: Supabase with RLS policies for role-based access
Event Management: CRUD operations for events with filtering capabilities
Submission Handling: Flexible forms for different event types
Approval System: Workflow for officers/staff to approve submissions
Score Calculation: Automated GPA updates when submissions are approved
Real-time Updates: Company standings update as scores change
User Experience Needs
Student Dashboard: View upcoming events, submit reports, track personal scores
Officer Interface: Review company submissions, approve/reject with comments
Staff Management: Create events, manage submissions, view all data
Company View: See company standings and member performance
Data Flow
Events → Submissions → Approval → Score Updates → GPA Calculation → Company Standings
This system enables comprehensive tracking of student development while maintaining the competitive company structure that motivates engagement across all areas of holistic growth.