-- Xóa các policy bị lỗi (mở toang cửa)
DROP POLICY IF EXISTS "Cho phAcp admin full quy?n" ON public.articles;
DROP POLICY IF EXISTS "Cho phAcp admin full quy?n" ON public.questions;
DROP POLICY IF EXISTS "Cho phAcp admin full quy?n" ON public.donation_programs;
DROP POLICY IF EXISTS "Cho phAcp admin full quy?n" ON public.footer_config;
DROP POLICY IF EXISTS "Cho phAcp admin full quy?n" ON public.word_of_gods;
DROP POLICY IF EXISTS "Cho phAcp admin full quy?n" ON public.settings;
DROP POLICY IF EXISTS "Cho phAcp admin full quy?n" ON public.mass_schedules;

-- Xóa cả các policy cũ nếu có tên khác
DROP POLICY IF EXISTS "Cho phép admin full quyền" ON public.articles;
DROP POLICY IF EXISTS "Cho phép admin full quyền" ON public.questions;
DROP POLICY IF EXISTS "Cho phép admin full quyền" ON public.donation_programs;
DROP POLICY IF EXISTS "Cho phép admin full quyền" ON public.footer_config;
DROP POLICY IF EXISTS "Cho phép admin full quyền" ON public.word_of_gods;
DROP POLICY IF EXISTS "Cho phép admin full quyền" ON public.settings;
DROP POLICY IF EXISTS "Cho phép admin full quyền" ON public.mass_schedules;

-- THIẾT LẬP LẠI RLS BẢO MẬT --

-- 1. Bảng Articles
CREATE POLICY "Admin_FullAccess_Articles" ON public.articles FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 2. Bảng Questions (Public chỉ được INSERT, Admin được ALL)
-- Lưu ý: Policy "Cho phAcp thA^m cA^u hO?i A?n danh" (INSERT) đã có ở file schema gốc, nhưng ta có thể tạo lại cho chuẩn.
DROP POLICY IF EXISTS "Cho phAcp thA^m cA^u hO?i A?n danh" ON public.questions;
CREATE POLICY "Public_Insert_Questions" ON public.questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin_FullAccess_Questions" ON public.questions FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 3. Bảng Donation Programs
CREATE POLICY "Admin_FullAccess_Donations" ON public.donation_programs FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 4. Bảng Footer Config
CREATE POLICY "Admin_FullAccess_Footer" ON public.footer_config FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 5. Bảng Word of Gods
CREATE POLICY "Admin_FullAccess_WordOfGods" ON public.word_of_gods FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 6. Bảng Settings
CREATE POLICY "Admin_FullAccess_Settings" ON public.settings FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 7. Bảng Mass Schedules
CREATE POLICY "Admin_FullAccess_MassSchedules" ON public.mass_schedules FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
