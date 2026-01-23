-- Analytics Safe View
CREATE OR REPLACE VIEW safe_analytics AS
SELECT 
    relationship_to_school,
    student_year_groups,
    submission_language
FROM persons;

GRANT SELECT ON safe_analytics TO anon, authenticated;

-- Petition Records Analytics Safe View
CREATE OR REPLACE VIEW safe_record_analytics AS
SELECT 
    petition_support,
    consent_public_use
FROM petition_records;

GRANT SELECT ON safe_record_analytics TO anon, authenticated;
