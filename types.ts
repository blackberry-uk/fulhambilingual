
export enum Language {
  EN = 'EN',
  FR = 'FR'
}

export enum RelationshipKey {
  LYCEE_PARENT = 'lycee_parent',
  HOLY_CROSS_PARENT = 'holy_cross_parent',
  LYCEE_ALUMNI_PARENT = 'lycee_alumni_parent',
  HOLY_CROSS_ALUMNI_PARENT = 'holy_cross_alumni_parent',
  LYCEE_ALUMNI_OVER_16 = 'lycee_alumni_over_16',
  HOLY_CROSS_ALUMNI_OVER_16 = 'holy_cross_alumni_over_16',
  CURRENT_SCHOOL_EMPLOYEE = 'current_school_employee',
  FORMER_SCHOOL_EMPLOYEE = 'former_school_employee',
  PROSPECTIVE_FAMILY = 'prospective_family',
  NEIGHBOUR_SUPPORTER = 'neighbour_supporter'
}

export interface Person {
  id: string;
  full_name: string;
  email_address: string;
  relationship_to_school: RelationshipKey[];
  student_year_groups?: string[];
  submission_language: Language;
  created_at: string;
}

export interface PetitionRecord {
  id: string;
  person_id: string;
  petition_support: boolean;
  supporting_comment?: string;
  consent_public_use: boolean;
  submission_timestamp: string;
  // Translation fields
  comment_en?: string;
  comment_fr?: string;
}

export interface Testimonial {
  id: string;
  person_name: string;
  content: string;
  content_translated?: string;
  image_url?: string;
  is_moderated: boolean;
  language: Language;
  created_at: string;
}

export interface ForumThread {
  id: string;
  title: string;
  author_name: string;
  content: string;
  ai_summary?: string;
  language: Language;
  replies: ForumReply[];
  created_at: string;
}

export interface ForumReply {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

// Data Model requested for High Level Reuse
export interface EnhancedDataModel {
  person: Person;
  former_applicant_record?: any;
  bachelor_application_history?: any;
  education_timeline?: any[];
  career_timeline?: any[];
  linkedin_profile?: string;
  contact_channels?: string[];
  reengagement_window?: string;
  outreach_recommendation?: string;
  confidence_score?: number;
}
