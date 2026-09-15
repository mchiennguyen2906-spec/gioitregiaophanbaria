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
    attachment_url TEXT,
    attachment_name TEXT,
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
    sender_name TEXT NOT NULL,
    sender_email TEXT,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'answered')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng Donation_Programs (Chương trình quyên góp)
CREATE TABLE public.donation_programs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    target_amount NUMERIC DEFAULT 0,
    raised_amount NUMERIC DEFAULT 0,
    bank_info TEXT,
    qr_code_url TEXT,
    linked_article_id TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng Footer Config (Cấu hình Footer - Chỉ có 1 dòng)
CREATE TABLE public.footer_config (
    id TEXT PRIMARY KEY DEFAULT 'main',
    about_text TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    facebook_url TEXT,
    youtube_url TEXT
);

INSERT INTO public.footer_config (id, about_text, address, phone, email, facebook_url, youtube_url)
VALUES ('main', 'Giới Trẻ Giáo Phận Bà Rịa là nơi quy tụ, giao lưu và học hỏi Lời Chúa dành cho các bạn trẻ Công giáo.', '123 Đường Công Giáo, TP. Bà Rịa', '(0254) 3 123 456', 'lienhe@gioitrebaria.org', 'https://facebook.com', 'https://youtube.com') ON CONFLICT DO NOTHING;

-- Bảng Word of Gods (Lời Chúa Mỗi Ngày)
CREATE TABLE public.word_of_gods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    day_of_week INTEGER,
    verse_text TEXT,
    reference TEXT
);

-- Bảng Settings (Cài đặt chung như Radio Link, v.v.)
CREATE TABLE public.settings (
    id TEXT PRIMARY KEY,
    value TEXT
);

-- Bảng Mass Schedules (Giờ lễ)
CREATE TABLE public.mass_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parish_name TEXT NOT NULL,
    times JSONB DEFAULT '[]'::jsonb
);

-- Cấp quyền truy cập công khai (RLS) cho người dùng chỉ đọc
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.word_of_gods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mass_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cho phép tất cả mọi người đọc bài viết" ON public.articles FOR SELECT USING (true);
CREATE POLICY "Cho phép tất cả mọi người đọc chương trình từ thiện" ON public.donation_programs FOR SELECT USING (true);
CREATE POLICY "Cho phép thêm câu hỏi ẩn danh" ON public.questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Cho phép tất cả mọi người đọc footer" ON public.footer_config FOR SELECT USING (true);
CREATE POLICY "Cho phép tất cả mọi người đọc lời chúa" ON public.word_of_gods FOR SELECT USING (true);
CREATE POLICY "Cho phép tất cả mọi người đọc cài đặt" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Cho phép tất cả mọi người đọc giờ lễ" ON public.mass_schedules FOR SELECT USING (true);

-- (Bỏ qua cấu hình RLS bảo mật Admin để đơn giản hóa trong dự án này)
CREATE POLICY "Cho phép admin full quyền" ON public.articles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Cho phép admin full quyền" ON public.questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Cho phép admin full quyền" ON public.donation_programs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Cho phép admin full quyền" ON public.footer_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Cho phép admin full quyền" ON public.word_of_gods FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Cho phép admin full quyền" ON public.settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Cho phép admin full quyền" ON public.mass_schedules FOR ALL USING (true) WITH CHECK (true);

-- Bảng phân quyền (RBAC)
CREATE TABLE public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'category_admin', 'editor')),
    allowed_categories JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cho phép xem roles" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "SuperAdmin full quyền user_roles" ON public.user_roles FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'super_admin')
) WITH CHECK (
    auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'super_admin')
);
