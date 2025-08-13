# Non-Routine Student Events - Single-User Instances

Enable students to submit non-routine events by first creating a private `event_instances` row, then creating an `event_submissions` row, while ensuring these instances do not appear on other users' homepages.

## Completed Tasks

- [x] Draft implementation plan and tasks

## In Progress Tasks

- [x] DB: Add `show_on_homepage` boolean to `event_instances` and backfill attendance to `true`
- [x] DB: RLS policy to allow any authenticated user to insert into `event_instances` with constraints
- [x] DB: Update SELECT policy to hide non-homepage events from others (except creator, staff/admin)
- [x] FE: Update event fetching to hide events where `show_on_homepage = false`
- [x] FE: Update non-routine submission flows to create `event_instances` first, then `event_submissions` (community_service, job_promotion, credentials)

## Future Tasks

- [ ] Consider adding group visibility (e.g., small groups) via future fields (e.g., `visible_to_company`, `visible_to_group_id`)
- [ ] Staff UI to toggle `show_on_homepage`
- [ ] Metrics/logging for private instance usage

## Implementation Plan

- DB changes via Supabase:
  - Add `show_on_homepage boolean not null default true` to `public.event_instances`
  - Backfill: set `show_on_homepage = true` for `event_type = 'attendance'`
  - RLS Insert: Allow any authenticated user to insert `self_report` events with `created_by = auth.uid()` and `show_on_homepage = false`
  - RLS Select: Restrict broad select policy to `(is_active AND (show_on_homepage = true OR created_by = auth.uid()))`; keep staff/admin all-access policy
- Frontend:
  - Types: add `show_on_homepage: boolean` to `EventInstance`
  - Fetch: when building homepage events, exclude events where `show_on_homepage` is `false`
  - Submission flows: in `lib/non-routine-events.ts`, for community service, job promotion, credentials:
    1) Create `event_instances` row with `event_type = 'self_report'`, `subcategory_id` mapped, `created_by = auth.uid()`, `show_on_homepage = false`
    2) Create `event_submissions` referencing the new `event_id`

### Relevant Files

- apps/web/lib/events.ts - Homepage event fetching and filtering ✅
- apps/web/lib/non-routine-events.ts - Non-routine submissions (3 flows) ✅
- apps/web/components/staff/event-forms.tsx - Staff create instance now sets `show_on_homepage` ✅
- packages/types/src/index.ts - `EventInstance` type updated ✅
- Supabase RLS/migrations (via MCP) - event visibility and insert permissions ✅
