-- SQL Schema for Fulham Bilingual Project

-- 1. Create the persons table
CREATE TABLE IF NOT EXISTS persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email_address TEXT UNIQUE NOT NULL,
  relationship_to_school TEXT[] NOT NULL,
  student_year_groups TEXT[],
  submission_language TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create the petition_records table
CREATE TABLE IF NOT EXISTS petition_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID REFERENCES persons(id) ON DELETE CASCADE,
  petition_support BOOLEAN NOT NULL DEFAULT TRUE,
  supporting_comment TEXT,
  consent_public_use BOOLEAN NOT NULL DEFAULT FALSE,
  submission_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  comment_en TEXT,
  comment_fr TEXT
);

-- 3. Create the testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_name TEXT NOT NULL,
  content TEXT NOT NULL,
  content_translated TEXT,
  is_moderated BOOLEAN NOT NULL DEFAULT FALSE,
  language TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create the forum_threads table
CREATE TABLE IF NOT EXISTS forum_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  ai_summary TEXT,
  language TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create the forum_replies table
CREATE TABLE IF NOT EXISTS forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE petition_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;

-- CLEANUP OLD POLICIES (Preventing "Policy already exists" errors)
DO $$
BEGIN
    -- Persons
    DROP POLICY IF EXISTS "Allow public insert persons" ON persons;
    DROP POLICY IF EXISTS "Public can sign petition" ON persons;
    DROP POLICY IF EXISTS "Enable public access to persons" ON persons;
    DROP POLICY IF EXISTS "Public can update own record" ON persons;
    DROP POLICY IF EXISTS "Public can select records for upsert" ON persons;
    DROP POLICY IF EXISTS "Enable select for upsert" ON persons;
    DROP POLICY IF EXISTS "Enable update for upsert" ON persons;
    
    -- Petition Records
    DROP POLICY IF EXISTS "Allow public insert petition_records" ON petition_records;
    DROP POLICY IF EXISTS "Allow public read petition_records" ON petition_records;
    DROP POLICY IF EXISTS "Public can add petition record" ON petition_records;
    DROP POLICY IF EXISTS "Enable public access to petition_records" ON petition_records;
    DROP POLICY IF EXISTS "Enable select for petition_records" ON petition_records;
    DROP POLICY IF EXISTS "Enable update for petition_records" ON petition_records;

    -- Testimonials
    DROP POLICY IF EXISTS "Allow public read moderated testimonials" ON testimonials;
    DROP POLICY IF EXISTS "Allow public insert testimonials" ON testimonials;
    DROP POLICY IF EXISTS "Public can see moderated testimonials" ON testimonials;
    DROP POLICY IF EXISTS "Public can submit testimonials" ON testimonials;
    DROP POLICY IF EXISTS "Enable public read moderated testimonials" ON testimonials;
    DROP POLICY IF EXISTS "Enable public submit testimonials" ON testimonials;

    -- Forum
    DROP POLICY IF EXISTS "Allow public read forum threads" ON forum_threads;
    DROP POLICY IF EXISTS "Allow public insert forum_threads" ON forum_threads;
    DROP POLICY IF EXISTS "Public can read forum threads" ON forum_threads;
    DROP POLICY IF EXISTS "Public can start forum threads" ON forum_threads;
    DROP POLICY IF EXISTS "Enable public read forum threads" ON forum_threads;
    DROP POLICY IF EXISTS "Enable public start forum threads" ON forum_threads;
    DROP POLICY IF EXISTS "Allow public read forum replies" ON forum_replies;
    DROP POLICY IF EXISTS "Allow public insert forum_replies" ON forum_replies;
    DROP POLICY IF EXISTS "Public can read forum replies" ON forum_replies;
    DROP POLICY IF EXISTS "Public can post forum replies" ON forum_replies;
    DROP POLICY IF EXISTS "Enable public read forum replies" ON forum_replies;
    DROP POLICY IF EXISTS "Enable public post forum replies" ON forum_replies;
END
$$;

-- CREATE FRESH POLICIES

-- Persons: Allow public to check for existing email (Upsert) and insert/update
CREATE POLICY "Enable public access to persons" ON persons
  FOR ALL USING (true) WITH CHECK (true);

-- Petition Records: Allow public to manage their records
CREATE POLICY "Enable public access to petition_records" ON petition_records
  FOR ALL USING (true) WITH CHECK (true);

-- Testimonials: Allow public to see moderated content and submit new ones
CREATE POLICY "Enable public read moderated testimonials" ON testimonials
  FOR SELECT USING (is_moderated = true);
CREATE POLICY "Enable public submit testimonials" ON testimonials
  FOR INSERT WITH CHECK (true);

-- Forum: Allow public to read and post
CREATE POLICY "Enable public read forum threads" ON forum_threads FOR SELECT USING (true);
CREATE POLICY "Enable public start forum threads" ON forum_threads FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable public read forum replies" ON forum_replies FOR SELECT USING (true);
CREATE POLICY "Enable public post forum replies" ON forum_replies FOR INSERT WITH CHECK (true);
