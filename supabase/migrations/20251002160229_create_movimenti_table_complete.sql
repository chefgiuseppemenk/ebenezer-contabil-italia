/*
  # Create complete Movimenti (Movements) table with all fields
  
  1. New Tables
    - `movimenti`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `tipo` (enum: entrata, uscita)
      - `settore` (enum: bar, libreria, decima_offerta)
      - `metodo_pagamento` (enum: sumup, contanti, paypal)
      - `descrizione` (text)
      - `importo` (decimal)
      - `categoria` (enum: donazioni, affitto, utenze, etc.)
      - `data` (date, defaults to current date)
      - `created_at` (timestamp, auto-set)
      - `updated_at` (timestamp, auto-updated)
  
  2. Security
    - Enable RLS on `movimenti` table
    - Add policies for authenticated users to manage their own movements
    - Users can only access their own data
  
  3. Important Notes
    - The `data` field defaults to current date and represents when the movement was created
    - All enums are created with IF NOT EXISTS pattern for safety
    - Proper indexes added for performance
*/

-- Create enum for transaction types
DO $$ BEGIN
  CREATE TYPE public.tipo_movimento AS ENUM ('entrata', 'uscita');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enum for settore
DO $$ BEGIN
  CREATE TYPE public.settore_tipo AS ENUM ('bar', 'libreria', 'decima_offerta');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enum for metodo_pagamento
DO $$ BEGIN
  CREATE TYPE public.metodo_pagamento_tipo AS ENUM ('sumup', 'contanti', 'paypal');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enum for categories
DO $$ BEGIN
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
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.movimenti (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tipo public.tipo_movimento NOT NULL,
  settore public.settore_tipo NOT NULL,
  metodo_pagamento public.metodo_pagamento_tipo NOT NULL,
  descrizione TEXT NOT NULL,
  importo DECIMAL(10, 2) NOT NULL CHECK (importo > 0),
  categoria public.categoria_movimento NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.movimenti ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own movements"
  ON public.movimenti
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own movements"
  ON public.movimenti
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own movements"
  ON public.movimenti
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own movements"
  ON public.movimenti
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.movimenti;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.movimenti
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_movimenti_user_id ON public.movimenti(user_id);
CREATE INDEX IF NOT EXISTS idx_movimenti_data ON public.movimenti(data DESC);
CREATE INDEX IF NOT EXISTS idx_movimenti_settore ON public.movimenti(settore);
CREATE INDEX IF NOT EXISTS idx_movimenti_metodo_pagamento ON public.movimenti(metodo_pagamento);