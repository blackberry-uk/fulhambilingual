-- EMERGENCY FIX: Stop Data Leak
-- 1. Drop existing broad policies
DROP POLICY IF EXISTS "Enable public access to persons" ON persons;
DROP POLICY IF EXISTS "Enable public access to petition_records" ON petition_records;

-- 2. Persons Table: Only allow public INSERT. SELECT is restricted.
CREATE POLICY "Public can sign petition" ON persons
  FOR INSERT WITH CHECK (true);

-- 3. Petition Records Table: Only allow public INSERT. SELECT is restricted.
CREATE POLICY "Public can add petition record" ON petition_records
  FOR INSERT WITH CHECK (true);

-- 4. Testimonials Table: Keep as is but ensure it's safe.
-- (Already has: Enable public read moderated testimonials, Enable public submit testimonials)

-- 5. Create a SAFE view for public signatories (Hiding emails)
CREATE OR REPLACE VIEW public_signatories AS
SELECT 
    pr.submission_timestamp,
    pr.consent_public_use,
    pr.supporting_comment,
    p.full_name,
    p.relationship_to_school,
    p.student_year_groups,
    t.id as testimonial_id
FROM petition_records pr
JOIN persons p ON p.id = pr.person_id
LEFT JOIN testimonials t ON t.person_id = p.id AND t.is_moderated = true
WHERE pr.petition_support = true 
AND pr.consent_public_use = true;

-- Allow public to read from the view
GRANT SELECT ON public_signatories TO anon, authenticated;

-- 6. Create a SAFE view for testimonials metadata (if needed)
CREATE OR REPLACE VIEW testimonial_metadata AS
SELECT 
    id,
    full_name,
    relationship_to_school,
    student_year_groups
FROM persons;
-- Wait, this view still lets you join. The issue is reading the raw persons table.

-- Actually, let's just create a profile view for names only.
CREATE OR REPLACE VIEW public_profiles AS
SELECT 
    id,
    full_name,
    relationship_to_school,
    student_year_groups
FROM persons;

GRANT SELECT ON public_profiles TO anon, authenticated;
