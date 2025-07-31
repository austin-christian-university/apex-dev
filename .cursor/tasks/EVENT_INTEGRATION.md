# Event Integration Implementation

Integrate EVENT_INSTANCES table with the student homepage to show real upcoming and past due events instead of mock data.

## Completed Tasks

- [x] Analyze EVENT_INSTANCES table structure
- [x] Understand user role and company filtering requirements
- [x] Review existing codebase structure and patterns

## In Progress Tasks

- [ ] Monitor performance and optimize if needed

## Completed Tasks

- [x] Analyze EVENT_INSTANCES table structure
- [x] Understand user role and company filtering requirements
- [x] Review existing codebase structure and patterns
- [x] Create utility functions for event filtering and data fetching
- [x] Add database indexes for performance optimization
- [x] Create event data fetching functions in lib/
- [x] Update homepage to use real event data
- [x] Add proper error handling and loading states
- [x] Test the implementation with real data
- [x] Fix RLS authentication issue with server components
- [x] Refine "Action Required" to only show truly overdue events

## Future Tasks

- [ ] Add event submission tracking
- [ ] Implement event completion status
- [ ] Add event notifications
- [ ] Create event detail views

## Implementation Plan

### Database Optimization
- Add indexes on `required_roles`, `required_company`, `due_date`, and `is_active` columns
- Create composite indexes for common query patterns
- Ensure efficient filtering by user role and company

### Utility Functions
- Create `getUserEvents()` function in `packages/utils/` for event filtering logic
- Create `fetchUserEvents()` function in `apps/web/lib/` for data fetching
- Add proper TypeScript types for event data

### Frontend Integration
- Replace mock data with real Supabase queries
- Add loading states and error handling
- Maintain existing UI structure while using real data
- Add proper date formatting and urgency detection

### Performance Considerations
- Use server-side data fetching where possible
- Implement proper caching strategies
- Optimize queries to minimize database calls
- Add pagination for large event lists

## Relevant Files

- `apps/web/app/(student)/home/page.tsx` - ✅ Updated to use real event data
- `apps/web/app/(student)/home/loading.tsx` - ✅ Created loading component
- `apps/web/app/(student)/home/error.tsx` - ✅ Created error component
- `apps/web/lib/events.ts` - ✅ Created event fetching functions
- `packages/utils/src/index.ts` - ✅ Added event filtering utilities
- `packages/types/src/index.ts` - ✅ Added EventInstance and UserEvent types
- Supabase database - ✅ Added performance indexes for EVENT_INSTANCES table

## Technical Requirements

### Event Filtering Logic
- Filter by `required_roles` array containing user's role
- Filter by `required_company` (NULL = all companies, or specific company ID)
- Filter by `is_active = true`
- Sort by `due_date` for upcoming/past due categorization

### Data Structure
```typescript
interface EventInstance {
  id: string;
  name: string;
  description: string | null;
  event_type: 'self_report' | 'officer_input' | 'staff_input' | 'attendance';
  required_roles: string[] | null;
  required_company: string | null;
  due_date: string | null;
  is_active: boolean;
  created_at: string;
}
```

### Performance Targets
- Event list loading: < 200ms
- Filtering operations: < 50ms
- Database queries: < 100ms
- Total page load: < 500ms

## Implementation Summary

### What Was Accomplished
1. **Database Optimization**: Added comprehensive indexes on EVENT_INSTANCES table for fast filtering by role, company, and due date
2. **Type Safety**: Added proper TypeScript types for EventInstance and UserEvent interfaces
3. **Utility Functions**: Created reusable functions for event filtering and date categorization in the utils package
4. **Data Fetching**: Implemented efficient event fetching functions with proper error handling
5. **UI Integration**: Updated homepage to display real events with proper categorization (urgent/past due vs upcoming)
6. **Error Handling**: Added loading states, error boundaries, and graceful fallbacks
7. **Performance**: Optimized queries to fetch only relevant events for the current user

### Key Features
- **Role-based Filtering**: Events are filtered based on user's role and company membership
- **Smart Categorization**: Events are automatically categorized as urgent (due today/tomorrow), past due, or upcoming
- **Responsive Design**: Maintains existing mobile-first design with proper loading states
- **Error Resilience**: Continues to work even if event fetching fails
- **Performance Optimized**: Uses database indexes and efficient queries for fast loading

### Technical Implementation
- **Server Components**: Converted homepage to server component for better performance
- **Database Indexes**: Added composite indexes for common query patterns
- **Type Safety**: Full TypeScript support with proper interfaces
- **Modular Design**: Separated concerns between data fetching, filtering, and UI components
- **Best Practices**: Follows Next.js App Router patterns and Supabase best practices

### Files Created/Modified
- ✅ `apps/web/app/(student)/home/page.tsx` - Updated to use real event data
- ✅ `apps/web/app/(student)/home/loading.tsx` - Created loading component
- ✅ `apps/web/app/(student)/home/error.tsx` - Created error component
- ✅ `apps/web/lib/events.ts` - Created event fetching functions
- ✅ `packages/utils/src/index.ts` - Added event filtering utilities
- ✅ `packages/types/src/index.ts` - Added EventInstance and UserEvent types
- ✅ Supabase database - Added performance indexes for EVENT_INSTANCES table

### Next Steps
- Monitor real-world performance and optimize if needed
- Add event submission tracking functionality
- Implement event completion status
- Add event notifications
- Create event detail views 