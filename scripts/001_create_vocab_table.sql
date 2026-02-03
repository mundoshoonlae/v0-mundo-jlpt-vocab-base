-- Create the vocabulary table for JLPT vocab storage
CREATE TABLE IF NOT EXISTS public.vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL UNIQUE,
  reading TEXT,
  meaning TEXT,
  jlpt_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster word lookups
CREATE INDEX IF NOT EXISTS idx_vocabulary_word ON public.vocabulary(word);

-- Enable Row Level Security (but allow public access for this simple app)
ALTER TABLE public.vocabulary ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access (no auth required for this vocab management tool)
CREATE POLICY "Allow public read access" ON public.vocabulary FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.vocabulary FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.vocabulary FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.vocabulary FOR DELETE USING (true);
