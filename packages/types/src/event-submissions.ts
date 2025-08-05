import { z } from 'zod';

// Base submission data that all types extend
export const BaseSubmissionDataSchema = z.object({
  submission_type: z.string(),
  notes: z.string().optional(),
});

export type BaseSubmissionData = z.infer<typeof BaseSubmissionDataSchema>;

// Attendance Events
export const AttendanceSubmissionSchema = BaseSubmissionDataSchema.extend({
  submission_type: z.literal('attendance'),
  status: z.enum(['present', 'absent', 'excused']),
  location: z.string().optional(), // Optional override for event location
});

export type AttendanceSubmission = z.infer<typeof AttendanceSubmissionSchema>;

// Community Service Events
export const CommunityServiceSubmissionSchema = BaseSubmissionDataSchema.extend({
  submission_type: z.literal('community_service'),
  hours: z.number().min(0).max(24),
  organization: z.string().min(1),
  supervisor_name: z.string().min(1),
  supervisor_contact: z.string().email(),
  description: z.string().min(10),
  photo_url: z.string().url().optional(),
  location: z.string().min(1),
  date_of_service: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // "2024-01-15"
  verification_method: z.enum(['photo', 'supervisor_signature', 'organization_letter']),
});

export type CommunityServiceSubmission = z.infer<typeof CommunityServiceSubmissionSchema>;

// Team Meeting Events
export const TeamMeetingSubmissionSchema = BaseSubmissionDataSchema.extend({
  submission_type: z.literal('team_meeting'),
  meeting_type: z.enum(['company_meeting', 'leadership_meeting', 'planning_session']),
  duration_minutes: z.number().min(1).max(480), // 1 minute to 8 hours
  participants: z.array(z.string()).min(1),
  agenda_items: z.array(z.string()).min(1),
  decisions_made: z.array(z.string()),
  action_items: z.array(z.string()),
  meeting_location: z.string().optional(),
});

export type TeamMeetingSubmission = z.infer<typeof TeamMeetingSubmissionSchema>;

// Leader Meeting Events
export const LeaderMeetingSubmissionSchema = BaseSubmissionDataSchema.extend({
  submission_type: z.literal('leader_meeting'),
  meeting_type: z.enum(['officer_meeting', 'staff_meeting', 'planning_retreat']),
  duration_minutes: z.number().min(1).max(480),
  attendees: z.array(z.string()).min(1),
  topics_discussed: z.array(z.string()).min(1),
  decisions_made: z.array(z.string()),
  follow_up_actions: z.array(z.string()),
  meeting_notes: z.string().optional(),
});

export type LeaderMeetingSubmission = z.infer<typeof LeaderMeetingSubmissionSchema>;

// Academic Events
export const AcademicSubmissionSchema = BaseSubmissionDataSchema.extend({
  submission_type: z.literal('academic'),
  class_code: z.string().min(1),
  participation_type: z.enum(['discussion', 'presentation', 'group_work', 'assignment']),
  grade: z.number().min(0).max(100).optional(),
  feedback: z.string().optional(),
  materials_submitted: z.array(z.string()).optional(),
});

export type AcademicSubmission = z.infer<typeof AcademicSubmissionSchema>;

// Spiritual Events
export const SpiritualSubmissionSchema = BaseSubmissionDataSchema.extend({
  submission_type: z.literal('spiritual'),
  activity_type: z.enum(['chapel', 'small_group', 'prayer_meeting', 'bible_study']),
  participation_level: z.enum(['active', 'passive', 'leading']),
  reflection: z.string().optional(),
  prayer_requests: z.array(z.string()).optional(),
  group_size: z.number().min(1).optional(),
});

export type SpiritualSubmission = z.infer<typeof SpiritualSubmissionSchema>;

// Professional Development Events
export const ProfessionalSubmissionSchema = BaseSubmissionDataSchema.extend({
  submission_type: z.literal('professional'),
  activity_type: z.enum(['certification', 'workshop', 'conference', 'mentorship']),
  duration_hours: z.number().min(0.5).max(40),
  provider: z.string().min(1),
  certificate_url: z.string().url().optional(),
  skills_developed: z.array(z.string()).min(1),
  networking_contacts: z.array(z.string()).optional(),
});

export type ProfessionalSubmission = z.infer<typeof ProfessionalSubmissionSchema>;

// GBE Participation
export const GBESubmissionSchema = BaseSubmissionDataSchema.extend({
  submission_type: z.literal('gbe_participation'),
  event_name: z.string().min(1),
  role: z.enum(['participant', 'leader', 'organizer', 'volunteer']),
  hours_contributed: z.number().min(0).max(24),
  responsibilities: z.array(z.string()).min(1),
  team_size: z.number().min(1).optional(),
  outcomes_achieved: z.array(z.string()).min(1),
});

export type GBESubmission = z.infer<typeof GBESubmissionSchema>;

// Lions Games Participation
export const LionsGamesSubmissionSchema = BaseSubmissionDataSchema.extend({
  submission_type: z.literal('lions_games'),
  sport: z.string().min(1),
  team_placement: z.number().min(1).optional(),
  performance_rating: z.number().min(1).max(10),
  sportsmanship_rating: z.number().min(1).max(10),
  participation_level: z.enum(['full', 'partial', 'spectator']),
  team_contribution: z.string().min(1),
});

export type LionsGamesSubmission = z.infer<typeof LionsGamesSubmissionSchema>;

// Dream Team Involvement
export const DreamTeamSubmissionSchema = BaseSubmissionDataSchema.extend({
  submission_type: z.literal('dream_team'),
  team_name: z.string().min(1),
  role: z.enum(['member', 'leader', 'coordinator']),
  hours_contributed: z.number().min(0).max(24),
  projects_completed: z.array(z.string()).min(1),
  impact_description: z.string().min(10),
  team_size: z.number().min(1),
});

export type DreamTeamSubmission = z.infer<typeof DreamTeamSubmissionSchema>;

// Fellow Friday Participation
export const FellowFridaySubmissionSchema = BaseSubmissionDataSchema.extend({
  submission_type: z.literal('fellow_friday'),
  activity_type: z.enum(['workshop', 'presentation', 'networking', 'skill_building']),
  duration_minutes: z.number().min(1).max(480),
  skills_practiced: z.array(z.string()).min(1),
  connections_made: z.array(z.string()).optional(),
  takeaways: z.array(z.string()).min(1),
  follow_up_planned: z.boolean().optional(),
});

export type FellowFridaySubmission = z.infer<typeof FellowFridaySubmissionSchema>;

// Union type for all submission types
export const EventSubmissionDataSchema = z.discriminatedUnion('submission_type', [
  AttendanceSubmissionSchema,
  CommunityServiceSubmissionSchema,
  TeamMeetingSubmissionSchema,
  LeaderMeetingSubmissionSchema,
  AcademicSubmissionSchema,
  SpiritualSubmissionSchema,
  ProfessionalSubmissionSchema,
  GBESubmissionSchema,
  LionsGamesSubmissionSchema,
  DreamTeamSubmissionSchema,
  FellowFridaySubmissionSchema,
]);

export type EventSubmissionData = z.infer<typeof EventSubmissionDataSchema>;

// Helper function to validate submission data
export function validateSubmissionData(data: unknown): EventSubmissionData {
  return EventSubmissionDataSchema.parse(data);
}

// Helper function to safely validate (returns null if invalid)
export function safeValidateSubmissionData(data: unknown): EventSubmissionData | null {
  const result = EventSubmissionDataSchema.safeParse(data);
  return result.success ? result.data : null;
}

// Type guard function
export function isValidSubmissionData(data: unknown): data is EventSubmissionData {
  return EventSubmissionDataSchema.safeParse(data).success;
}

// Get the appropriate schema for a submission type
export function getSubmissionSchema(submissionType: string) {
  const schemas = {
    attendance: AttendanceSubmissionSchema,
    community_service: CommunityServiceSubmissionSchema,
    team_meeting: TeamMeetingSubmissionSchema,
    leader_meeting: LeaderMeetingSubmissionSchema,
    academic: AcademicSubmissionSchema,
    spiritual: SpiritualSubmissionSchema,
    professional: ProfessionalSubmissionSchema,
    gbe_participation: GBESubmissionSchema,
    lions_games: LionsGamesSubmissionSchema,
    dream_team: DreamTeamSubmissionSchema,
    fellow_friday: FellowFridaySubmissionSchema,
  };
  
  return schemas[submissionType as keyof typeof schemas];
} 