
import { RelationshipKey } from './types';

export const RELATIONSHIP_MAPPING: Record<string, RelationshipKey> = {
  [RelationshipKey.LYCEE_PARENT]: RelationshipKey.LYCEE_PARENT,
  [RelationshipKey.HOLY_CROSS_PARENT]: RelationshipKey.HOLY_CROSS_PARENT,
  [RelationshipKey.LYCEE_ALUMNI_PARENT]: RelationshipKey.LYCEE_ALUMNI_PARENT,
  [RelationshipKey.HOLY_CROSS_ALUMNI_PARENT]: RelationshipKey.HOLY_CROSS_ALUMNI_PARENT,
  [RelationshipKey.LYCEE_ALUMNI_OVER_16]: RelationshipKey.LYCEE_ALUMNI_OVER_16,
  [RelationshipKey.HOLY_CROSS_ALUMNI_OVER_16]: RelationshipKey.HOLY_CROSS_ALUMNI_OVER_16,
  [RelationshipKey.CURRENT_SCHOOL_EMPLOYEE]: RelationshipKey.CURRENT_SCHOOL_EMPLOYEE,
  [RelationshipKey.FORMER_SCHOOL_EMPLOYEE]: RelationshipKey.FORMER_SCHOOL_EMPLOYEE,
  [RelationshipKey.PROSPECTIVE_FAMILY]: RelationshipKey.PROSPECTIVE_FAMILY,
  [RelationshipKey.NEIGHBOUR_SUPPORTER]: RelationshipKey.NEIGHBOUR_SUPPORTER,
};

export const RELATIONSHIP_LABELS_EN: Record<RelationshipKey, string> = {
  [RelationshipKey.LYCEE_PARENT]: RelationshipKey.LYCEE_PARENT,
  [RelationshipKey.HOLY_CROSS_PARENT]: RelationshipKey.HOLY_CROSS_PARENT,
  [RelationshipKey.LYCEE_ALUMNI_PARENT]: RelationshipKey.LYCEE_ALUMNI_PARENT,
  [RelationshipKey.HOLY_CROSS_ALUMNI_PARENT]: RelationshipKey.HOLY_CROSS_ALUMNI_PARENT,
  [RelationshipKey.LYCEE_ALUMNI_OVER_16]: RelationshipKey.LYCEE_ALUMNI_OVER_16,
  [RelationshipKey.HOLY_CROSS_ALUMNI_OVER_16]: RelationshipKey.HOLY_CROSS_ALUMNI_OVER_16,
  [RelationshipKey.CURRENT_SCHOOL_EMPLOYEE]: RelationshipKey.CURRENT_SCHOOL_EMPLOYEE,
  [RelationshipKey.FORMER_SCHOOL_EMPLOYEE]: RelationshipKey.FORMER_SCHOOL_EMPLOYEE,
  [RelationshipKey.PROSPECTIVE_FAMILY]: RelationshipKey.PROSPECTIVE_FAMILY,
  [RelationshipKey.NEIGHBOUR_SUPPORTER]: RelationshipKey.NEIGHBOUR_SUPPORTER,
};

export const RELATIONSHIP_LABELS_FR: Record<RelationshipKey, string> = RELATIONSHIP_LABELS_EN;

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
    year_groups: "For current students, please enter your year's group, separated by comma (GSA, CE1, etc)",
    comment: "Optional Supporting Comment",
    petition_support_label: "I support this petition / Je soutiens cette pétition",
    consent: "I consent to the public use of my name and comment.",
    submit: "Submit",
    loading: "Processing...",
    auto_translated: "Auto-translated",
    original: "Original",
    reconsent_title: "Update Your Public Consent",
    reconsent_intro: "Thank you for previously signing. We are now asking for explicit consent to display names and comments publicly to show the strength of our community.",
    signatures_count: "people have already signed",
    read_the_petition: "Read the Petition",
    petition_title: "FUTURE OF THE FULHAM BILINGUAL PARTNERSHIP",
    petition_body: `To:
The Leadership of the Lycée Français Charles de Gaulle
The French Embassy and Cultural Services in the United Kingdom
The Governing Bodies of Fulham Bilingual School and Holy Cross School
AEFE – Agence pour l’Enseignement Français à l’Étranger

London, Monday 19 January 2026

Preserving a Proven, Strategic, and Sustainable Educational Partnership

We write as parents and members of the Fulham Bilingual community to express our deep concern regarding the possible termination of the long-standing partnership between the Lycée Français Charles de Gaulle (LFCG) and Holy Cross School.

We fully acknowledge the financial pressures currently facing the Lycée, as well as the broader demographic challenges affecting French education in London following Brexit. However, we firmly believe that ending this partnership would be a strategic mistake—educationally, financially, and culturally—and that constructive solutions should be explored before any irreversible decision is taken.

1. Fulham Bilingual Is a Proven Feeder Into the Lycée
Fulham Bilingual provides authentic exposure to the French education system for families who would otherwise never consider it. For many non-French households, this school is the sole entry point into French education.

This exposure converts directly into fee-paying enrolments at secondary level. A consistent proportion of pupils from the Holy Cross stream later join the Lycée in Sixième and continue through collège and lycée. These families go on to pay full Lycée tuition for several years—often for more than one child.

Conservatively calculated, a single pupil entering the Lycée in Sixième represents approximately £80,000 in secondary tuition revenue over seven years. Even assuming that only one-third of Holy Cross pupils later convert to Lycée students, the partnership generates an expected future value of approximately £720,000 per cohort (28 Holy Cross seats × one-third conversion × £80,000).

Ending the partnership therefore does not merely reduce access—it dismantles a functioning and measurable enrolment pipeline into the Lycée’s secondary school.

2. The Partnership Maximises UK-Funded Resources
The Fulham Bilingual benefits from substantial UK public investment via Holy Cross School, including:
- Shared administration and leadership
- Highly qualified, UK-trained English teachers
- Access to a strong local and regional school network

This enables the French curriculum to be delivered within a broader, well-resourced educational ecosystem that the Lycée would be unable to replicate independently without significantly higher cost and operational risk.

The partnership therefore represents not a financial liability, but an efficient and mutually beneficial use of complementary public resources in the UK and France.

3. Cultural Mission and Franco-British Engagement
Beyond enrolment and finances, Fulham Bilingual fulfils a wider cultural mission. It fosters genuine Franco-British educational exchange and deep linguistic and cultural fluency among non-French children and families.

In a post-Brexit context, this form of educational and cultural “soft power” is not incidental—it is strategically important. The school sustains long-term engagement with the French language, values, and educational model among future generations of Europeans and non-Europeans alike.

4. Addressing Under-Filled Lycée Seats Through Outreach, Not Withdrawal
We recognise that some of the fee-paying Lycée places within Fulham Bilingual have not always been filled, and we understand the concern that family movement between streams can contribute to this dynamic.

For this reason, we believe it is particularly important to explore complementary solutions alongside any structural changes—such as enhanced local outreach, clearer communication of the value of the Lycée stream, and targeted engagement with non-French families already within the bilingual ecosystem.

Strengthening awareness and facilitating access to available places may help stabilise enrolment and financial sustainability while preserving the partnership’s long-term role as a pathway into the Lycée’s secondary school.

Our Request
We respectfully ask for:
- A moratorium on any decision to terminate the partnership
- The opening of a transparent dialogue with parents and partners
- Serious consideration of financial, marketing, or hybrid solutions that preserve the bilingual model while addressing the Lycée’s constraints
- A transparent review of the partnership rules to address concerns raised by the Lycée

The parent community on both sides would overwhelmingly prefer to explore sustainable solutions rather than face the permanent loss of a school model that has delivered clear educational, financial, and cultural value for over 15 years.

Fulham Bilingual is a thriving and well-established community with a substantial alumni base and a strong record of academic progression.

This partnership works. It feeds the Lycée. It broadens access. It strengthens France’s educational presence in the United Kingdom. It deserves to be strengthened—not dismantled.

Signed,
Parents, families, alumni, and supporters of Fulham Bilingual School`,
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
    year_groups: "Pour les élèves actuellement scolarisés, indiquez le niveau de classe, séparé par des virgules (GSA, CE1, etc.).",
    comment: "Commentaire de soutien (facultatif)",
    petition_support_label: "Je soutiens cette pétition / I support this petition",
    consent: "Je consens à l'utilisation publique de mon nom et de mon commentaire.",
    submit: "Envoyer",
    loading: "Traitement en cours...",
    auto_translated: "Traduit automatiquement",
    original: "Original",
    reconsent_title: "Mettre à jour votre consentement public",
    reconsent_intro: "Merci d'avoir signé précédemment. Nous demandons maintenant un consentement explicite pour afficher les noms et commentaires publiquement afin de montrer la force de notre communauté.",
    signatures_count: "personnes ont déjà signé",
    read_the_petition: "Lire la pétition",
    petition_title: "AVENIR DU PARTENARIAT FULHAM BILINGUAL",
    petition_body: `À l’attention de :
La Direction du Lycée Français Charles de Gaulle
L’Ambassade de France et les Services Culturels au Royaume-Uni
Les instances dirigeantes de l’école Fulham Bilingual et de l’école Holy Cross
L’AEFE – Agence pour l’Enseignement Français à l’Étranger

Londres, lundi 19 janvier 2026

Préserver un partenariat éducatif éprouvé, stratégique et durable

Nous vous écrivons en tant que parents et membres de la communauté de Fulham Bilingual pour exprimer notre profonde inquiétude concernant l'éventuelle fin du partenariat de longue date entre le Lycée Français Charles de Gaulle (LFCG) et l'école Holy Cross.

Nous sommes pleinement conscients des pressions financières auxquelles le Lycée est actuellement confronté, ainsi que des défis démographiques plus larges affectant l'enseignement français à Londres après le Brexit. Cependant, nous sommes fermement convaincus que mettre fin à ce partenariat serait une erreur stratégique — sur les plans éducatif, financier et culturel — et que des solutions constructives doivent être explorées avant toute décision irréversible.

1. Fulham Bilingual : une source de recrutement éprouvée pour le Lycée
Fulham Bilingual offre une exposition authentique au système éducatif français pour des familles qui, autrement, ne l'envisageraient jamais. Pour de nombreux foyers non français, cette école constitue le seul point d'entrée dans l'enseignement français.

Cette exposition se traduit directement par des inscriptions payantes au niveau secondaire. Une proportion constante d'élèves issus de la filière Holy Cross rejoint ensuite le Lycée en Sixième et poursuit son cursus au collège et au lycée. Ces familles paient ainsi l'intégralité des frais de scolarité du Lycée pendant plusieurs années, souvent pour plus d'un enfant.

Selon un calcul prudent, un seul élève entrant au Lycée en Sixième représente environ 80 000 £ de revenus de scolarité sur sept ans. Même en supposant que seul un tiers des élèves de Holy Cross poursuive au Lycée, le partenariat génère une valeur future attendue d'environ 720 000 £ par cohorte (28 places Holy Cross × un tiers de conversion × 80 000 £).

Mettre fin au partenariat ne réduit pas seulement l'accès — cela démantèle un vivier de recrutement fonctionnel et mesurable pour le collège et le lycée du Lycée Français.

2. Le partenariat maximise les ressources financées par le Royaume-Uni
Le programme Fulham Bilingual bénéficie d'investissements publics britanniques substantiels via l'école Holy Cross, notamment :
- Une administration et une direction partagées
- Des enseignants d'anglais hautement qualifiés et formés au Royaume-Uni
- L'accès à un solide réseau scolaire local et régional

Cela permet de dispenser le programme français au sein d'un écosystème éducatif plus large et bien doté, que le Lycée ne pourrait reproduire de manière indépendante sans des coûts et des risques opérationnels nettement plus élevés.

Le partenariat ne représente donc pas une charge financière, mais une utilisation efficace et mutuellement bénéfique de ressources publiques complémentaires au Royaume-Uni et en France.

3. Mission culturelle et engagement franco-britannique
Au-delà des effectifs et des finances, Fulham Bilingual remplit une mission culturelle plus large. Il favorise un véritable échange éducatif franco-britannique et une profonde maîtrise linguistique et culturelle chez les enfants et les familles non français.

Dans un contexte post-Brexit, cette forme de « soft power » éducatif et culturel n'est pas accessoire — elle est stratégiquement importante. L'école soutient un engagement durable envers la langue française, ses valeurs et son modèle éducatif parmi les futures générations, européennes ou non.

4. Remédier aux places vacantes au Lycée par la sensibilisation, non par le retrait
Nous reconnaissons que certaines places payantes du Lycée au sein de Fulham Bilingual n'ont pas toujours été pourvues, et nous comprenons la préoccupation selon laquelle les mouvements de familles entre les filières peuvent contribuer à cette dynamique.

C'est pourquoi nous pensons qu'il est particulièrement important d'explorer des solutions complémentaires aux changements structurels, telles qu'une sensibilisation locale accrue, une communication plus claire sur la valeur de la filière Lycée et un engagement ciblé auprès des familles non françaises déjà présentes dans l'écosystème bilingue.

Renforcer la notoriété et faciliter l'accès aux places disponibles pourrait aider à stabiliser les effectifs et la viabilité financière, tout en préservant le rôle à long terme du partenariat comme voie d'accès vers le secondaire du Lycée.

Notre demande
Nous demandons respectueusement :
- Un moratoire sur toute décision de mettre fin au partenariat
- L'ouverture d'un dialogue transparent avec les parents et les partenaires
- Un examen sérieux de solutions financières, marketing ou hybrides préservant le modèle bilingue tout en répondant aux contraintes du Lycée
- Une révision transparente des règles du partenariat pour répondre aux préoccupations soulevées par le Lycée

La communauté des parents des deux côtés préférerait de loin explorer des solutions durables plutôt que de faire face à la perte permanente d'un modèle scolaire qui apporte une valeur éducative, financière et culturelle claire depuis plus de 15 ans.

Fulham Bilingual est une communauté dynamique et bien établie, dotée d'un important réseau d'anciens élèves et d'un solide historique de progression académique.

Ce partenariat fonctionne. Il alimente le Lycée. Il élargit l'accès. Il renforce la présence éducative de la France au Royaume-Uni. Il mérite d'être renforcé — et non démantelé.

Signé,
Parents, familles, anciens élèves et soutiens de l’école Fulham Bilingual`,
  }
};
