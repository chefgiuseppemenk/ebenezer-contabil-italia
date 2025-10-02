-- Create enum for transaction types
CREATE TYPE public.tipo_movimento AS ENUM ('entrata', 'uscita');

-- Create enum for categories
CREATE TYPE public.categoria_movimento AS ENUM (
  'donazioni',
  'affitto',
  'utenze',
  'stipendi',
  'forniture',
  'manutenzione',
  'eventi',
  'altro'
);

-- Create transactions table
CREATE TABLE public.movimenti (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tipo public.tipo_movimento NOT NULL,
  descrizione TEXT NOT NULL,
  importo DECIMAL(10, 2) NOT NULL CHECK (importo > 0),
  categoria public.categoria_movimento NOT NULL,
  data DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.movimenti ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own movements"
  ON public.movimenti
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own movements"
  ON public.movimenti
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own movements"
  ON public.movimenti
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own movements"
  ON public.movimenti
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.movimenti
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create index for better performance
CREATE INDEX idx_movimenti_user_id ON public.movimenti(user_id);
CREATE INDEX idx_movimenti_data ON public.movimenti(data DESC);