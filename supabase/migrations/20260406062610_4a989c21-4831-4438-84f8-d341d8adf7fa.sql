
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('restaurant', 'volunteer');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'volunteer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create food_posts table
CREATE TABLE public.food_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  restaurant_name TEXT NOT NULL,
  food_item TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  location TEXT NOT NULL,
  pickup_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'claimed', 'picked_up')),
  claimed_by UUID REFERENCES auth.users(id),
  claimed_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.food_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Food posts viewable by everyone" ON public.food_posts FOR SELECT USING (true);
CREATE POLICY "Restaurants can create food posts" ON public.food_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can update food posts" ON public.food_posts FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'volunteer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
