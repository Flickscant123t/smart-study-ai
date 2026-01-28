-- Add daily usage tracking for free users
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS daily_uses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_usage_date DATE DEFAULT CURRENT_DATE;

-- Create function to reset daily usage
CREATE OR REPLACE FUNCTION public.check_and_reset_daily_uses()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If it's a new day, reset the daily uses
  IF NEW.last_usage_date < CURRENT_DATE THEN
    NEW.daily_uses := 0;
    NEW.last_usage_date := CURRENT_DATE;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to reset daily uses on profile access
DROP TRIGGER IF EXISTS reset_daily_uses_trigger ON public.profiles;
CREATE TRIGGER reset_daily_uses_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.check_and_reset_daily_uses();