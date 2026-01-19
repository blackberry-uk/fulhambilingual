
import { RelationshipKey } from './types';

export const RELATIONSHIP_MAPPING: Record<string, RelationshipKey> = {
  "Lycée Parent - Parent d’élève du Lycée": RelationshipKey.LYCEE_PARENT,
  "Holy Cross Parent - Parent d’élève de Holy Cross": RelationshipKey.HOLY_CROSS_PARENT,
  "Alumni Parent – Parent d’un ancien élève du Lycée": RelationshipKey.LYCEE_ALUMNI_PARENT,
  "Alumni Parent – Parent d’un ancien élève de Holy Cross": RelationshipKey.HOLY_CROSS_ALUMNI_PARENT,
  "Lycée Alumni (over 16) - Ancien élève du Lycée (16 ans ou plus)": RelationshipKey.LYCEE_ALUMNI_OVER_16,
  "Holy Cross Alumni (over 16) - Ancien élève de Holy Cross (16 ans ou plus)": RelationshipKey.HOLY_CROSS_ALUMNI_OVER_16,
  "Current School Employee - Membre actuel du personnel de l’établissement": RelationshipKey.CURRENT_SCHOOL_EMPLOYEE,
  "Former School Employee - Ancien membre du personnel de l’établissement": RelationshipKey.FORMER_SCHOOL_EMPLOYEE,
  "Prospective Family - Famille prospective – Intéressée par une future inscription": RelationshipKey.PROSPECTIVE_FAMILY,
  "Neighbour / Supporter - Riverain / Soutien de l’école": RelationshipKey.NEIGHBOUR_SUPPORTER,
};

export const RELATIONSHIP_LABELS_EN: Record<RelationshipKey, string> = {
  [RelationshipKey.LYCEE_PARENT]: "Lycée Parent",
  [RelationshipKey.HOLY_CROSS_PARENT]: "Holy Cross Parent",
  [RelationshipKey.LYCEE_ALUMNI_PARENT]: "Lycée Alumni Parent",
  [RelationshipKey.HOLY_CROSS_ALUMNI_PARENT]: "Holy Cross Alumni Parent",
  [RelationshipKey.LYCEE_ALUMNI_OVER_16]: "Lycée Alumni (over 16)",
  [RelationshipKey.HOLY_CROSS_ALUMNI_OVER_16]: "Holy Cross Alumni (over 16)",
  [RelationshipKey.CURRENT_SCHOOL_EMPLOYEE]: "Current School Employee",
  [RelationshipKey.FORMER_SCHOOL_EMPLOYEE]: "Former School Employee",
  [RelationshipKey.PROSPECTIVE_FAMILY]: "Prospective Family",
  [RelationshipKey.NEIGHBOUR_SUPPORTER]: "Neighbour / Supporter",
};

export const RELATIONSHIP_LABELS_FR: Record<RelationshipKey, string> = {
  [RelationshipKey.LYCEE_PARENT]: "Parent d’élève du Lycée",
  [RelationshipKey.HOLY_CROSS_PARENT]: "Parent d’élève de Holy Cross",
  [RelationshipKey.LYCEE_ALUMNI_PARENT]: "Parent d’un ancien élève du Lycée",
  [RelationshipKey.HOLY_CROSS_ALUMNI_PARENT]: "Parent d’un ancien élève de Holy Cross",
  [RelationshipKey.LYCEE_ALUMNI_OVER_16]: "Ancien élève du Lycée (16 ans+)",
  [RelationshipKey.HOLY_CROSS_ALUMNI_OVER_16]: "Ancien élève de Holy Cross (16 ans+)",
  [RelationshipKey.CURRENT_SCHOOL_EMPLOYEE]: "Membre du personnel actuel",
  [RelationshipKey.FORMER_SCHOOL_EMPLOYEE]: "Ancien membre du personnel",
  [RelationshipKey.PROSPECTIVE_FAMILY]: "Famille prospective",
  [RelationshipKey.NEIGHBOUR_SUPPORTER]: "Riverain / Soutien",
};

export const TRANSLATIONS = {
  EN: {
    hero: "SAVE THE FULHAM BILINGUAL",
    subtitle: "parent- and community-led initiative",
    petition_action: "Sign the Petition",
    testimonials_action: "Read / Share Testimonials",
    forum_action: "Join the Public Forum",
    disclaimer: "This website is run independently by parents and supporters of Fulham Bilingual and is not affiliated with or operated by the school.",
    nav_home: "Home",
    nav_petition: "Petition",
    nav_testimonials: "Testimonials",
    nav_forum: "Forum",
    nav_reconsent: "Update Consent",
    nav_signatories: "See Signatories",
    full_name: "Full Name",
    email: "Email Address",
    relationship: "Relationship to School",
    year_groups: "Student Year Groups (e.g. GSA, CE1)",
    comment: "Optional Supporting Comment",
    consent: "I consent to the public use of my name and comment.",
    submit: "Submit",
    loading: "Processing...",
    auto_translated: "Auto-translated",
    original: "Original",
    reconsent_title: "Update Your Public Consent",
    reconsent_intro: "Thank you for previously signing. We are now asking for explicit consent to display names and comments publicly to show the strength of our community.",
    signatures_count: "people have already signed",
    read_the_petition: "Read the Petition",
    petition_body: `We, the undersigned parents, alumni, and community members, formally request the preservation and protection of the Fulham Bilingual program. 
    
    The partnership between Holy Cross and the Lycée Français Charles de Gaulle de Londres has provided a world-class, inclusive, and culturally rich education for decades. We believe this unique model is vital for our community and must remain sustainable for future generations of students.
    
    By signing this petition, you are joining a collective voice demanding transparency, continuity, and the long-term security of the bilingual stream.`,
  },
  FR: {
    hero: "SAUVONS LE FULHAM BILINGUE",
    subtitle: "une initiative de parents et de la communauté",
    petition_action: "Signer la pétition",
    testimonials_action: "Lire / Partager des témoignages",
    forum_action: "Rejoindre le forum public",
    disclaimer: "Ce site est géré indépendamment par des parents et soutiens de Fulham Bilingual et n'est pas affilié à ou géré par l'école.",
    nav_home: "Accueil",
    nav_petition: "Pétition",
    nav_testimonials: "Témoignages",
    nav_forum: "Forum",
    nav_reconsent: "Mettre à jour le consentement",
    nav_signatories: "Voir les signataires",
    full_name: "Nom complet",
    email: "Adresse e-mail",
    relationship: "Relation avec l'école",
    year_groups: "Groupes d'âge des élèves (ex: GSA, CE1)",
    comment: "Commentaire de soutien (facultatif)",
    consent: "Je consens à l'utilisation publique de mon nom et de mon commentaire.",
    submit: "Envoyer",
    loading: "Traitement en cours...",
    auto_translated: "Traduit automatiquement",
    original: "Original",
    reconsent_title: "Mettre à jour votre consentement public",
    reconsent_intro: "Merci d'avoir signé précédemment. Nous demandons maintenant un consentement explicite pour afficher les noms et commentaires publiquement afin de montrer la force de notre communauté.",
    signatures_count: "personnes ont déjà signé",
    read_the_petition: "Lire la pétition",
    petition_body: `Nous, parents, anciens élèves et membres de la communauté soussignés, demandons formellement la préservation et la protection du programme bilingue de Fulham.
    
    Le partenariat entre Holy Cross et le Lycée Français Charles de Gaulle de Londres offre une éducation de classe mondiale, inclusive et culturellement riche depuis des décennies. Nous pensons que ce modèle unique est vital pour notre communauté et doit rester pérenne pour les futures générations d'élèves.
    
    En signant cette pétition, vous vous joignez à une voix collective exigeant de la transparence, de la continuité et la sécurité à long terme de la filière bilingue.`,
  }
};
