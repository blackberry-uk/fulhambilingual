-- Add explicit SELECT policy for safe views
GRANT SELECT ON safe_signatories TO anon, authenticated;
GRANT SELECT ON safe_profiles TO anon, authenticated;
GRANT SELECT ON safe_analytics TO anon, authenticated;
GRANT SELECT ON safe_record_analytics TO anon, authenticated;

-- Ensure total count is accessible via a view
CREATE OR REPLACE VIEW petition_stats AS
SELECT count(*) as total
FROM petition_records
WHERE petition_support = true;

GRANT SELECT ON petition_stats TO anon, authenticated;
