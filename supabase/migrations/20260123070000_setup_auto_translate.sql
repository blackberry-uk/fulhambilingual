-- Migration to setup database trigger for auto translation

-- 1. Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_testimonial_translation()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the Supabase Edge Function
  -- Only trigger if content_translated is same as content or null
  -- And and only if content is not empty
  IF (NEW.content IS NOT NULL AND (NEW.content_translated IS NULL OR NEW.content_translated = NEW.content)) THEN
    PERFORM
      net.http_post(
        url := 'https://iudzniedgwoicmezsvfj.supabase.co/functions/v1/auto-translate',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || 'sb_publishable_xKoDd2Nq7GICNyQqLmn_pw_XGJPWkDb'
        ),
        body := jsonb_build_object('record', row_to_json(NEW))
      );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger on testimonials
DROP TRIGGER IF EXISTS on_testimonial_created ON testimonials;
CREATE TRIGGER on_testimonial_created
  AFTER INSERT ON testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_testimonial_translation();

-- 3. Optional: Trigger on update if content changes and is not translated
DROP TRIGGER IF EXISTS on_testimonial_updated ON testimonials;
CREATE TRIGGER on_testimonial_updated
  AFTER UPDATE OF content ON testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_testimonial_translation();
