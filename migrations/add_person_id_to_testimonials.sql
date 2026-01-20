-- Add person_id column to testimonials table
ALTER TABLE testimonials ADD COLUMN person_id UUID;

-- Add foreign key constraint
ALTER TABLE testimonials 
ADD CONSTRAINT testimonials_person_id_fkey 
FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE;

-- Backfill person_id for existing testimonials by matching person_name to full_name
UPDATE testimonials t
SET person_id = p.id
FROM persons p
WHERE t.person_name = p.full_name;

-- For Anonymous testimonials, we can't automatically match them
-- They will remain with NULL person_id (or you can manually assign them)

-- Create an index for better query performance
CREATE INDEX idx_testimonials_person_id ON testimonials(person_id);
