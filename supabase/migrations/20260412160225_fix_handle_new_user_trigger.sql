/*
  # Fix handle_new_user trigger

  The trigger function needs to explicitly set the search_path and have
  proper permissions to insert into the profiles table. The function
  runs as SECURITY DEFINER but needs the schema search path set to
  avoid permission issues.

  1. Changes
    - Recreate handle_new_user function with SET search_path = public
    - Grant usage on public schema to the function
*/

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, COALESCE(NEW.email, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT ALL ON public.profiles TO postgres;
GRANT USAGE ON SCHEMA public TO postgres;