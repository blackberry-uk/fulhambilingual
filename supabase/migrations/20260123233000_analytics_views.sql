-- Analytics Safe View (Filtered to only show supporters)
CREATE OR REPLACE VIEW safe_analytics AS
SELECT 
    p.relationship_to_school,
    p.student_year_groups,
    p.submission_language
FROM persons p
JOIN petition_records pr ON p.id = pr.person_id
WHERE pr.petition_support = true;

GRANT SELECT ON safe_analytics TO anon, authenticated;

-- Petition Records Analytics Safe View (Filtered to only show supporters)
CREATE OR REPLACE VIEW safe_record_analytics AS
SELECT 
    petition_support,
    consent_public_use
FROM petition_records
WHERE petition_support = true;

GRANT SELECT ON safe_record_analytics TO anon, authenticated;
