
export enum Language {
  EN = 'EN',
  FR = 'FR'
}

export enum RelationshipKey {
  LYCEE_PARENT = 'Lycée Parent - Parent d’élève du Lycée',
  HOLY_CROSS_PARENT = 'Holy Cross Parent - Parent d’élève de Holy Cross',
  LYCEE_ALUMNI_PARENT = 'Alumni Parent – Parent d’un ancien élève du Lycée',
  HOLY_CROSS_ALUMNI_PARENT = 'Alumni Parent – Parent d’un ancien élève de Holy Cross',
  LYCEE_ALUMNI_OVER_16 = 'Lycée Alumni (over 16) - Ancien élève du Lycée (16 ans ou plus)',
  HOLY_CROSS_ALUMNI_OVER_16 = 'Holy Cross Alumni (over 16) - Ancien élève de Holy Cross (16 ans ou plus)',
  CURRENT_SCHOOL_EMPLOYEE = 'Current School Employee - Membre actuel du personnel de l’établissement',
  FORMER_SCHOOL_EMPLOYEE = 'Former School Employee - Ancien membre du personnel de l’établissement',
  PROSPECTIVE_FAMILY = 'Prospective Family - Famille prospective – Intéressée par une future inscription',
  NEIGHBOUR_SUPPORTER = 'Neighbour / Supporter - Riverain / Soutien de l’école'
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
