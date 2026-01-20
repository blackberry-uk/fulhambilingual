-- Migration to setup database trigger for email confirmation

-- 1. Enable pg_net extension if not enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_petition_record()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the Supabase Edge Function
  -- We use the project URL and the service role key (or anon key if no-verify-jwt is used)
  PERFORM
    net.http_post(
      url := 'https://iudzniedgwoicmezsvfj.supabase.co/functions/v1/send-confirmation',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || 'sb_publishable_xKoDd2Nq7GICNyQqLmn_pw_XGJPWkDb' -- Using anon key as fallback, but ideally service role
      ),
      body := jsonb_build_object('record', row_to_json(NEW))
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger
DROP TRIGGER IF EXISTS on_petition_record_created ON petition_records;
CREATE TRIGGER on_petition_record_created
  AFTER INSERT ON petition_records
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_petition_record();
