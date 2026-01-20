-- Migration to add site_content table for dynamic text editing

CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  en_content TEXT,
  fr_content TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public can read site_content" ON site_content
  FOR SELECT USING (true);

-- Insert initial petition content
INSERT INTO site_content (key, en_content, fr_content)
VALUES (
  'petition_body',
  'Enter English petition here (supports <b>bold</b>, <i>italics</i>, and <ul><li>bullets</li></ul>)',
  'Entrez la pétition en français ici (supporte le <b>gras</b>, l''<i>italique</i> et les <ul><li>puces</li></ul>)'
) ON CONFLICT (key) DO NOTHING;
