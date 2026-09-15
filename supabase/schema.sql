-- Bảng Articles (Bài viết, Tin tức, Podcast, v.v.)
CREATE TABLE public.articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id TEXT NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    author TEXT,
    parish TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    thumbnail_url TEXT,
    audio_url TEXT,
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'hidden')),
    is_featured BOOLEAN DEFAULT FALSE,
    is_priority BOOLEAN DEFAULT FALSE,
    is_home_featured BOOLEAN DEFAULT FALSE,
    is_home_priority BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng Questions (Câu hỏi tâm lý, thắc mắc)
CREATE TABLE public.questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    content TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'answered')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng Donation_Programs (Chương trình quyên góp)
CREATE TABLE public.donation_programs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    target_amount NUMERIC DEFAULT 0,
    current_amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cấp quyền truy cập công khai (RLS) cho người dùng chỉ đọc
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cho phép tất cả mọi người đọc bài viết" ON public.articles FOR SELECT USING (true);
CREATE POLICY "Cho phép tất cả mọi người đọc chương trình từ thiện" ON public.donation_programs FOR SELECT USING (true);
CREATE POLICY "Cho phép thêm câu hỏi ẩn danh" ON public.questions FOR INSERT WITH CHECK (true);

-- (Bỏ qua cấu hình RLS bảo mật Admin để đơn giản hóa trong dự án này)
CREATE POLICY "Cho phép admin full quyền" ON public.articles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Cho phép admin full quyền" ON public.questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Cho phép admin full quyền" ON public.donation_programs FOR ALL USING (true) WITH CHECK (true);
