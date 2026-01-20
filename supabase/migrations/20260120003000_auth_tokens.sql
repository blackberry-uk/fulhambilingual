-- Add auth_tokens table for OTP-based editing

CREATE TABLE IF NOT EXISTS auth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used BOOLEAN DEFAULT FALSE
);

-- Index for faster lookup
CREATE INDEX IF NOT EXISTS idx_auth_tokens_email_token ON auth_tokens(email, token);

-- RLS for auth_tokens (internal use mostly, but let's be safe)
ALTER TABLE auth_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Internal service role only" ON auth_tokens 
  FOR ALL USING (false);
