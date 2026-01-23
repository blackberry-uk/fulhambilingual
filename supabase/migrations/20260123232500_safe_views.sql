-- Refined Safe Signatories View
CREATE OR REPLACE VIEW safe_signatories AS
SELECT 
    pr.submission_timestamp as timestamp,
    CASE 
        WHEN pr.consent_public_use = true THEN p.full_name 
        ELSE 'Anonymous' 
    END as name,
    p.relationship_to_school as relationship,
    p.student_year_groups as years,
    pr.consent_public_use as consent,
    pr.supporting_comment,
    pr.petition_support,
    t.id as testimonial_id
FROM petition_records pr
JOIN persons p ON p.id = pr.person_id
LEFT JOIN testimonials t ON t.person_id = p.id AND t.is_moderated = true
WHERE pr.petition_support = true;

GRANT SELECT ON safe_signatories TO anon, authenticated;

-- Safe Profile View for Testimonials
CREATE OR REPLACE VIEW safe_profiles AS
SELECT 
    id,
    full_name,
    relationship_to_school,
    student_year_groups
FROM persons;

GRANT SELECT ON safe_profiles TO anon, authenticated;
