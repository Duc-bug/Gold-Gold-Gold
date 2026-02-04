-- ==============================================================================
-- MASTER SETUP SCRIPT CHO VINAGOLD AI
-- Chạy script này trong Supabase SQL Editor để thiết lập lại toàn bộ Database
-- ==============================================================================

-- 1. DỌN DẸP (CLEANUP)
-- Xóa các bảng và trigger cũ để tránh xung đột (Cẩn thận: Dữ liệu cũ sẽ mất)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.price_alerts;
DROP TABLE IF EXISTS public.user_profiles;
-- Nếu bạn muốn giữ lại dữ liệu giá vàng cũ thì comment dòng dưới lại:
-- DROP TABLE IF EXISTS public.gold_prices; 

-- ==============================================================================

-- 2. BẢNG GIÁ VÀNG (GOLD PRICES)
CREATE TABLE IF NOT EXISTS public.gold_prices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    brand TEXT NOT NULL,           -- Ví dụ: SJC, DOJI, PNJ
    metal_type TEXT NOT NULL,      -- Ví dụ: Gold, Silver
    buy_price DECIMAL NOT NULL,    -- Giá mua
    sell_price DECIMAL NOT NULL,   -- Giá bán
    currency TEXT DEFAULT 'VND',   -- Đơn vị tiền tệ
    created_at TIMESTAMPTZ DEFAULT NOW() -- Thời gian cập nhật
);

-- Tạo Index để truy vấn lịch sử giá nhanh hơn
CREATE INDEX IF NOT EXISTS idx_gold_prices_created_at ON public.gold_prices(created_at DESC);

-- Bật bảo mật (RLS)
ALTER TABLE public.gold_prices ENABLE ROW LEVEL SECURITY;

-- Chính sách: Ai cũng xem được giá
CREATE POLICY "Public Read Access" 
ON public.gold_prices FOR SELECT USING (true);

-- Chính sách: Chỉ hệ thống (hoặc login authenticated) mới được thêm giá
CREATE POLICY "System Insert Access" 
ON public.gold_prices FOR INSERT WITH CHECK (true); -- Tạm để true để script crawl chạy dễ dàng

-- ==============================================================================

-- 3. BẢNG HỒ SƠ NGƯỜI DÙNG (USER PROFILES)
-- Đây là bảng quan trọng để fix lỗi "Database error saving new user"
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    display_name TEXT,
    role TEXT DEFAULT 'user', -- 'user' hoặc 'admin'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bật bảo mật (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Chính sách: Ai cũng xem được (để hiển thị tên người khác nếu cần)
CREATE POLICY "Public Profiles View" 
ON public.user_profiles FOR SELECT USING (true);

-- Chính sách: Chỉ chủ sở hữu mới được sửa thông tin mình
CREATE POLICY "Users Update Own Profile" 
ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

-- Chính sách: Cho phép tự Insert khi đăng ký (Quan trọng)
CREATE POLICY "Users Insert Own Profile" 
ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ==============================================================================

-- 4. TỰ ĐỘNG TẠO USER PROFILE KHI ĐĂNG KÝ (BẢN FIX)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER 
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name, role)
  VALUES (
    new.id, 
    new.email, 
    -- Ưu tiên lấy full_name hoặc display_name từ metadata, nếu không có thì lấy phần trước dấu @ của email
    COALESCE(
      new.raw_user_meta_data->>'display_name', 
      new.raw_user_meta_data->>'full_name', 
      split_part(new.email, '@', 1)
    ),
    'user'
  );
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Nếu có lỗi, vẫn cho phép tạo User bên Auth để không bị treo hệ thống
  RETURN new; 
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Xóa trigger cũ và tạo lại để đảm bảo cập nhật
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================

-- 5. BẢNG CẢNH BÁO GIÁ (PRICE ALERTS)
CREATE TABLE public.price_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    target_price DECIMAL NOT NULL, -- Mức giá mong muốn
    condition TEXT NOT NULL CHECK (condition IN ('above', 'below')), -- 'above' (cao hơn) hoặc 'below' (thấp hơn)
    status TEXT DEFAULT 'active',   -- 'active' hoặc 'triggered'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bật bảo mật (RLS)
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

-- Chính sách: Chỉ xem/sửa/xóa cảnh báo của chính mình
CREATE POLICY "Users Manage Own Alerts" 
ON public.price_alerts 
FOR ALL 
USING (auth.uid() = user_id);

-- ==============================================================================

-- 6. THIẾT LẬP REALTIME (CẬP NHẬT TRỰC TIẾP)
-- Để bảng gold_prices tự động đẩy dữ liệu mới về web
ALTER PUBLICATION supabase_realtime ADD TABLE public.gold_prices;

-- ==============================================================================

-- 7. CẤP QUYỀN (PREMISSIONS)
-- Đảm bảo API truy cập được các bảng này
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- DONE!
