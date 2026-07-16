-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'viewer');

-- Create enum for post status
CREATE TYPE public.post_status AS ENUM ('draft', 'pending', 'published', 'failed');

-- Create enum for social platform
CREATE TYPE public.social_platform AS ENUM ('facebook', 'instagram', 'both');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'viewer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE (user_id, role)
);

-- Create topics table for categorizing content
CREATE TABLE public.topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Insert default topics
INSERT INTO public.topics (name, description) VALUES
    ('Innovation', 'Cutting-edge technology and breakthrough ideas'),
    ('Tech', 'Software, hardware, and digital solutions'),
    ('Entertainment', 'Media, culture, and lifestyle content'),
    ('Business', 'Industry news and business insights'),
    ('Africa', 'African tech ecosystem and development');

-- Create ai_posts table for AI-generated content
CREATE TABLE public.ai_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    topic_id UUID REFERENCES public.topics(id),
    topic_name TEXT NOT NULL,
    keywords TEXT,
    link TEXT,
    status post_status DEFAULT 'draft' NOT NULL,
    platform social_platform DEFAULT 'both' NOT NULL,
    external_post_id TEXT,
    external_response JSONB,
    error_message TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create activity_logs table for tracking user actions
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.has_role(_user_id, 'admin')
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (public.is_admin(auth.uid()));

-- User roles policies
CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
    ON public.user_roles FOR ALL
    USING (public.is_admin(auth.uid()));

-- Topics policies (public read)
CREATE POLICY "Anyone can view topics"
    ON public.topics FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage topics"
    ON public.topics FOR ALL
    USING (public.is_admin(auth.uid()));

-- AI Posts policies
CREATE POLICY "Users can view their own posts"
    ON public.ai_posts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own posts"
    ON public.ai_posts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
    ON public.ai_posts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
    ON public.ai_posts FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all posts"
    ON public.ai_posts FOR ALL
    USING (public.is_admin(auth.uid()));

-- Activity logs policies
CREATE POLICY "Users can view their own activity"
    ON public.activity_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activity logs"
    ON public.activity_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity"
    ON public.activity_logs FOR SELECT
    USING (public.is_admin(auth.uid()));

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
    
    -- Assign default viewer role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'viewer');
    
    RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_posts_updated_at
    BEFORE UPDATE ON public.ai_posts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();