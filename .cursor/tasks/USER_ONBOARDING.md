# User Onboarding Process Implementation

Complete user onboarding flow for new users to fill in USERS table information in Supabase with role-based routing and local storage persistence until completion.

## Completed Tasks

- [x] Initial task list creation and scoping
- [x] Create User and onboarding types in packages/types
- [x] Create onboarding route structure and directories
- [x] Create local storage utility functions for onboarding data
- [x] Create onboarding layout with progress indicators  
- [x] Implement role selection page
- [x] Create pending approval informational page
- [x] Create personal information collection form
- [x] Create company selection for students (with fallback mock data)
- [x] Create personality assessments page with dropdowns
- [x] Implement final data sync and completion logic
- [x] Integrate onboarding check with auth provider
- [x] Create temporary staff dashboard page
- [x] Add `has_completed_onboarding`, `date_of_birth`, and `photo` fields to USERS table
- [x] Create photo upload page with drag-and-drop functionality
- [x] Add date of birth field to personal info form with validation
- [x] Update onboarding flow to include photo upload step
- [x] Fix routing flow: personal info → photo upload → company selection (students) / personality assessments (staff)

## In Progress Tasks

- [ ] Test complete onboarding flow end-to-end

## Future Tasks

### Database Schema Updates
- [x] Add `has_completed_onboarding` field to USERS table in Supabase (boolean, default false)
- [x] Add `date_of_birth` field to USERS table (date, nullable)
- [x] Add `photo` field to USERS table (text, nullable, for base64 encoded photos)
- [x] Add `phone_number` field to USERS table (text, nullable, renamed from phone)
- [x] Verify USERS table schema supports all required onboarding fields

### Authentication Flow Integration  
- [ ] Modify login logic in `auth-provider.tsx` to check `has_completed_onboarding` status
- [ ] Update routing logic to redirect to onboarding if `has_completed_onboarding` is false
- [ ] Ensure login flow properly queries USERS table after authentication

### Onboarding Route Structure
- [x] Create `apps/web/app/(onboarding)/` route group directory
- [x] Create `apps/web/app/(onboarding)/layout.tsx` for onboarding shell
- [x] Create `apps/web/app/(onboarding)/role-selection/page.tsx` for role selection
- [x] Create `apps/web/app/(onboarding)/pending-approval/page.tsx` for leader/staff approval message
- [x] Create `apps/web/app/(onboarding)/personal-info/page.tsx` for basic user information
- [x] Create `apps/web/app/(onboarding)/photo-upload/page.tsx` for photo upload with drag-and-drop
- [x] Create `apps/web/app/(onboarding)/company-selection/page.tsx` for company assignment (students only)
- [x] Create `apps/web/app/(onboarding)/personality-assessments/page.tsx` for disc/myers-briggs/enneagram
- [x] Create `apps/web/app/(onboarding)/complete/page.tsx` for final completion step

### Local Storage Management
- [ ] Create utility functions for onboarding data persistence in local storage
- [ ] Implement data validation and type safety for local storage operations
- [ ] Add data restoration logic to populate forms from local storage
- [ ] Create cleanup logic to clear local storage after successful completion

### Role Selection Screen
- [ ] Design and implement role selection UI with three buttons (student, student leader, staff)
- [ ] Add single-selection logic (radio button behavior)
- [ ] Implement navigation to appropriate next screen based on role selection
- [ ] Add validation to ensure role is selected before proceeding

### Pending Approval Screen
- [ ] Create informational screen for student leader and staff roles
- [ ] Add messaging about pending approval and student-level access
- [ ] **Clarification**: Users can continue with full onboarding flow, elevated privileges will be granted on next login after approval
- [ ] Implement "Continue" button to proceed with onboarding
- [ ] Add proper routing to next appropriate screen

### Personal Information Collection
- [x] Create form fields for all required USERS table columns
- [x] **Required fields**: First name, last name, email, phone number, date of birth
- [x] Implement form validation with proper error handling for required fields
- [x] Add skip/optional field handling where appropriate
- [x] Integrate with local storage for data persistence
- [x] Ensure email field is pre-populated from auth user data
- [x] Add date of birth validation (age 16-100)

### Company Selection (Students Only)
- [ ] Create company selection interface for student role
- [ ] Fetch available companies from database
- [ ] Implement company assignment logic
- [ ] Skip this screen for staff/student leader roles

### Personality Assessments Screen
- [ ] Create dropdown/select options for DISC profile types
- [ ] Create dropdown/select options for Myers-Briggs types  
- [ ] Create dropdown/select options for Enneagram types
- [ ] All three assessments on single screen with optional completion
- [ ] Add warning message if user tries to skip all assessments
- [ ] Include information about getting assessments if user doesn't have them

### Data Synchronization & Completion
- [x] Implement final sync logic to push all local storage data to USERS table
- [x] Set `has_completed_onboarding` to true in database
- [x] Clear local storage after successful sync
- [x] Handle sync errors and retry logic
- [x] Redirect to appropriate dashboard after completion
- [x] Include new fields (date_of_birth, photo) in sync process

### Staff Role Handling
- [ ] Create temporary `apps/web/app/staff/page.tsx` with "coming soon" message
- [ ] Implement staff role routing to skip company selection
- [ ] Add staff-specific onboarding flow variations
- [ ] Ensure staff users route to staff page after onboarding completion

## Implementation Plan

### Architecture Decisions

**Local Storage Strategy**: Use localStorage with JSON serialization for onboarding data persistence. This provides simple implementation while maintaining data between screen navigation without complex state management.

**Route Structure**: Use Next.js route groups `(onboarding)` to create isolated onboarding flow that doesn't interfere with main app routing.

**Role-Based Routing**: Implement conditional routing logic based on selected role to skip irrelevant screens (e.g., company selection for staff).

**Data Validation**: Implement both client-side validation for UX and server-side validation during final sync for security.

**Error Handling**: Provide graceful degradation and retry mechanisms for network failures during final sync.

### Technical Components

1. **OnboardingProvider**: React context for managing onboarding state and local storage operations
2. **OnboardingLayout**: Common layout with progress indicators and navigation
3. **Form Components**: Reusable form components with validation and local storage integration
4. **Role-based Conditional Rendering**: Components that adapt based on selected user role
5. **Sync Service**: Utility for batch uploading all onboarding data to Supabase

### Data Flow

1. User completes authentication
2. AuthProvider checks `has_completed_onboarding` status
3. If false, redirect to `/role-selection`
4. Each onboarding screen saves data to localStorage
5. Role selection determines which screens to show
6. Final screen syncs all data to USERS table
7. Mark onboarding complete and redirect to appropriate dashboard

### Key User Experience Considerations

- **Progress Indication**: Show users where they are in the onboarding process
- **Data Persistence**: Never lose user input due to navigation or refresh
- **Conditional Flows**: Only show relevant screens based on role selection
- **Graceful Errors**: Handle network issues and provide clear error messages
- **Accessibility**: Ensure all forms and interactions are accessible
- **Pre-populated Data**: Email field should be pre-filled from authentication data
- **Required Field Validation**: Clear indication of required vs optional fields

### Relevant Files Created

- ✅ `packages/types/src/index.ts` - Added User and OnboardingData types with new fields
- ✅ `apps/web/app/(onboarding)/layout.tsx` - Onboarding shell layout with progress indicators
- ✅ `apps/web/app/(onboarding)/role-selection/page.tsx` - Role selection with three buttons
- ✅ `apps/web/app/(onboarding)/pending-approval/page.tsx` - Informational screen for leaders/staff
- ✅ `apps/web/app/(onboarding)/personal-info/page.tsx` - Personal information form with date of birth
- ✅ `apps/web/app/(onboarding)/photo-upload/page.tsx` - Photo upload with drag-and-drop and base64 encoding
- ✅ `apps/web/app/(onboarding)/company-selection/page.tsx` - Company selection with search
- ✅ `apps/web/app/(onboarding)/personality-assessments/page.tsx` - Assessment dropdowns
- ✅ `apps/web/app/(onboarding)/complete/page.tsx` - Final sync and completion
- ✅ `apps/web/app/staff/page.tsx` - Temporary staff dashboard placeholder
- ✅ `apps/web/components/auth/auth-provider.tsx` - Modified for onboarding check and routing
- ✅ `apps/web/lib/onboarding/storage.ts` - Local storage management utilities
- ✅ `apps/web/lib/onboarding/sync.ts` - Database sync with new fields
- ✅ `apps/web/lib/onboarding/types.ts` - Onboarding types and assessment options

## Implementation Status

**✅ Core Onboarding Flow**: Complete and functional
- Role-based conditional routing (staff skip company selection)
- Local storage persistence between steps
- Form validation and error handling
- Progress indicators and navigation
- Final sync to Supabase with completion marking

**✅ Database Schema**: Complete
- Added `has_completed_onboarding` field to USERS table
- Added `date_of_birth` field to USERS table  
- Added `photo` field to USERS table (base64 encoded)
- Added `phone_number` field to USERS table
- COMPANIES table already exists

**🧪 Testing Required**: End-to-end flow testing
- Test all role paths (student, student_leader, staff)
- Verify local storage persistence
- Test error handling and retry logic
- Confirm proper redirects after completion