-- Add UTM parameter columns to clicks table
ALTER TABLE public.clicks 
ADD COLUMN IF NOT EXISTS utm_source text,
ADD COLUMN IF NOT EXISTS utm_medium text,
ADD COLUMN IF NOT EXISTS utm_campaign text,
ADD COLUMN IF NOT EXISTS utm_term text,
ADD COLUMN IF NOT EXISTS utm_content text;

-- Create indexes for UTM parameters for better query performance
CREATE INDEX IF NOT EXISTS clicks_utm_source_idx ON public.clicks(utm_source);
CREATE INDEX IF NOT EXISTS clicks_utm_campaign_idx ON public.clicks(utm_campaign);
CREATE INDEX IF NOT EXISTS clicks_utm_medium_idx ON public.clicks(utm_medium);
