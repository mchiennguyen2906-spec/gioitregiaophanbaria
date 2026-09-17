-- Xóa các policy lỏng lẻo cũ
DROP POLICY IF EXISTS "Cho phAcp admin full quy?n" ON public.articles;
DROP POLICY IF EXISTS "Cho phAcp admin full quy?n" ON public.questions;
DROP POLICY IF EXISTS "Cho phAcp admin full quy?n" ON public.donation_programs;
DROP POLICY IF EXISTS "Cho phAcp admin full quy?n" ON public.footer_config;
DROP POLICY IF EXISTS "Cho phAcp admin full quy?n" ON public.word_of_gods;
DROP POLICY IF EXISTS "Cho phAcp admin full quy?n" ON public.settings;
DROP POLICY IF EXISTS "Cho phAcp admin full quy?n" ON public.mass_schedules;

-- (Tên Policy gốc có thể chứa ký tự lạ do encoding, xóa theo wildcard bằng anonymous blocks nếu cần, nhưng ta cứ thử viết đè policy chặt chẽ, vì PostgreSQL cho phép gộp policy nhưng policy SELECT/INSERT có thể bị đụng nếu có nhiều cái. Tốt nhất là lấy danh sách các policy trước).

