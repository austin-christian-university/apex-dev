import { z } from 'zod';

// Base submission data that all types extend
export const BaseSubmissionDataSchema = z.object({
  submission_type: z.string(),
  notes: z.string().optional(),
});

export type BaseSubmissionData = z.infer<typeof BaseSubmissionDataSchema>;

// 1) Binary attendance used for several subcategories (chapel, GBE, fellow friday, company community events)
export const AttendanceSubmissionSchema = BaseSubmissionDataSchema.extend({
  submission_type: z.literal('attendance'),
  status: z.enum(['present', 'absent', 'excused']),
  location: z.string().optional(),
});
export type AttendanceSubmission = z.infer<typeof AttendanceSubmissionSchema>;

// 2) Monthly checks (small group, dream team)
export const SmallGroupMonthlyCheckSubmissionSchema = BaseSubmissionDataSchema.extend({
  submission_type: z.literal('small_group'),
  status: z.enum(['involved', 'not_involved']),
});
export type SmallGroupMonthlyCheckSubmission = z.infer<
  typeof SmallGroupMonthlyCheckSubmissionSchema
>;

export const DreamTeamMonthlyCheckSubmissionSchema = BaseSubmissionDataSchema.extend({
  submission_type: z.literal('dream_team'),
  status: z.enum(['involved', 'not_involved']),
});
export type DreamTeamMonthlyCheckSubmission = z.infer<
  typeof DreamTeamMonthlyCheckSubmissionSchema
>;

// 3) Community service (hours with caps applied downstream)
export const CommunityServiceSubmissionSchema = BaseSubmissionDataSchema.extend({
  submission_type: z.literal('community_service'),
  hours: z.number().min(0).max(24),
  organization: z.string().min(1),
  supervisor_name: z.string().min(1),
  supervisor_contact: z.string().email(),
  description: z.string().min(10),
  photos: z.array(z.string()).optional(),
  date_of_service: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
export type CommunityServiceSubmission = z.infer<
  typeof CommunityServiceSubmissionSchema
>;

// 4) Staff-assigned points: credentials, job promotions (points assigned by staff)
export const CredentialsSubmissionSchema = BaseSubmissionDataSchema.extend({
  submission_type: z.literal('credentials'),
  credential_name: z.string().min(1),
  granting_organization: z.string().min(1),
  description: z.string().min(10).optional(),
  photos: z.array(z.string()).optional(),
  date_of_credential: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  assigned_points: z.number().min(0).optional(), // set by staff upon approval
});
export type CredentialsSubmission = z.infer<typeof CredentialsSubmissionSchema>;

export const JobPromotionSubmissionSchema = BaseSubmissionDataSchema.extend({
  submission_type: z.literal('job_promotion'),
  promotion_title: z.string().min(1),
  organization: z.string().min(1),
  supervisor_name: z.string().min(1),
  supervisor_contact: z.string().email(),
  description: z.string().min(10),
  photos: z.array(z.string()).optional(),
  date_of_promotion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  assigned_points: z.number().min(0).optional(), // set by staff upon approval
});
export type JobPromotionSubmission = z.infer<typeof JobPromotionSubmissionSchema>;

// 5) Performance ratings (0–5) for participation/engagement


export const CompanyTeamBuildingSubmissionSchema = BaseSubmissionDataSchema.extend({
  submission_type: z.literal('company_team_building'),
  points: z.number().min(0).max(5),
});
export type CompanyTeamBuildingSubmission = z.infer<
  typeof CompanyTeamBuildingSubmissionSchema
>;





export const GBEParticipationSubmissionSchema = BaseSubmissionDataSchema.extend({
  submission_type: z.literal('gbe_participation'),
  points: z.number().min(0).max(5),
});
export type GBEParticipationSubmission = z.infer<
  typeof GBEParticipationSubmissionSchema
>;

// 6) Team Participation (cross-company teams: Fellow Friday Team, Chapel Team)
export const TeamParticipationSubmissionSchema = BaseSubmissionDataSchema.extend({
  submission_type: z.literal('team_participation'),
  team_type: z.enum(['fellow_friday_team', 'chapel_team']),
  date_of_participation: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  photos: z.array(z.string()).optional(),
});
export type TeamParticipationSubmission = z.infer<
  typeof TeamParticipationSubmissionSchema
>;

// 7) Lions Games involvement (staff-assigned points)
export const LionsGamesPointsSubmissionSchema = BaseSubmissionDataSchema.extend({
  submission_type: z.literal('lions_games'),
  assigned_points: z.number().min(0),
});
export type LionsGamesPointsSubmission = z.infer<
  typeof LionsGamesPointsSubmissionSchema
>;

// Union type for all submission types we support (aligned with SUBCATEGORIES)
export const EventSubmissionDataSchema = z.discriminatedUnion('submission_type', [
  AttendanceSubmissionSchema,
  SmallGroupMonthlyCheckSubmissionSchema,
  DreamTeamMonthlyCheckSubmissionSchema,
  CommunityServiceSubmissionSchema,
  CredentialsSubmissionSchema,
  JobPromotionSubmissionSchema,
  CompanyTeamBuildingSubmissionSchema,
  GBEParticipationSubmissionSchema,
  TeamParticipationSubmissionSchema,
  LionsGamesPointsSubmissionSchema,
]);

export type EventSubmissionData = z.infer<typeof EventSubmissionDataSchema>;

// Helper function to validate submission data
export function validateSubmissionData(data: unknown): EventSubmissionData {
  return EventSubmissionDataSchema.parse(data);
}

// Helper function to safely validate (returns null if invalid)
export function safeValidateSubmissionData(
  data: unknown,
): EventSubmissionData | null {
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
    small_group: SmallGroupMonthlyCheckSubmissionSchema,
    dream_team: DreamTeamMonthlyCheckSubmissionSchema,
    community_service: CommunityServiceSubmissionSchema,
    credentials: CredentialsSubmissionSchema,
    job_promotion: JobPromotionSubmissionSchema,
    company_team_building: CompanyTeamBuildingSubmissionSchema,
    gbe_participation: GBEParticipationSubmissionSchema,
    team_participation: TeamParticipationSubmissionSchema,
    lions_games: LionsGamesPointsSubmissionSchema,
  } as const;

  return schemas[submissionType as keyof typeof schemas];
}