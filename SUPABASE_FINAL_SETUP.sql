-- ==============================================================================
-- FINAL SETUP SCRIPT FOR VINAGOLD AI (BẢN CHUẨN ĐẦY ĐỦ)
-- ==============================================================================

-- 1. DỌN DẸP SẠCH SẼ (CLEANUP)
-- Xóa bảng và function cũ để tránh lỗi trùng lặp
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.price_alerts;
DROP TABLE IF EXISTS public.user_profiles;
-- Lưu ý: Nếu muốn giữ lại dữ liệu giá vàng cũ thì thêm 2 dấu gạch ngang (--) trước dòng dưới
DROP TABLE IF EXISTS public.gold_prices; 

-- ==============================================================================

-- 2. TẠO BẢNG GIÁ VÀNG (GOLD PRICES)
CREATE TABLE public.gold_prices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    brand TEXT NOT NULL,           -- Ví dụ: SJC, DOJI
    metal_type TEXT NOT NULL,      -- Ví dụ: Gold, Silver
    buy_price DECIMAL NOT NULL,    -- Giá mua
    sell_price DECIMAL NOT NULL,   -- Giá bán
    currency TEXT DEFAULT 'VND',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tối ưu tốc độ tìm kiếm theo thời gian
CREATE INDEX idx_gold_prices_created_at ON public.gold_prices(created_at DESC);

-- Bảo mật (RLS)
ALTER TABLE public.gold_prices ENABLE ROW LEVEL SECURITY;
-- Ai cũng xem được
CREATE POLICY "Public Read Access" ON public.gold_prices FOR SELECT USING (true);
-- Chỉ Admin/Service Role mới được thêm (Tạm để true để dễ crawl data)
CREATE POLICY "System Insert Access" ON public.gold_prices FOR INSERT WITH CHECK (true);

-- ==============================================================================

-- 3. TẠO BẢNG HỒ SƠ NGƯỜI DÙNG (USER PROFILES)
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    display_name TEXT,
    role TEXT DEFAULT 'user', -- 'user' hoặc 'admin'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảo mật (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
-- Ai cũng xem được thông tin cơ bản
CREATE POLICY "Public Profiles View" ON public.user_profiles FOR SELECT USING (true);
-- Chỉ chính chủ mới được sửa
CREATE POLICY "Users Update Own Profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
-- Cho phép Insert khi đăng ký
CREATE POLICY "Users Insert Own Profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ==============================================================================

-- 4. TỰ ĐỘNG TẠO USER PROFILE KHI ĐĂNG KÝ (FIX LỖI DATABASE ERROR)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name, role)
  VALUES (
    new.id, 
    new.email, 
    -- Lấy tên hiển thị từ metadata hoặc lấy phần đầu email
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'user'
  );
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Nếu lỗi tạo profile, VẪN CHO PHÉP tạo user để không bị lỗi 500 khi đăng ký
  RAISE WARNING 'Lỗi tạo profile cho user %: %', new.id, SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kích hoạt Trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================

-- 5. TẠO BẢNG CẢNH BÁO GIÁ (PRICE ALERTS)
CREATE TABLE public.price_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    target_price DECIMAL NOT NULL,
    condition TEXT NOT NULL CHECK (condition IN ('above', 'below')),
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảo mật (RLS)
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
-- Chỉ xem/sửa các cảnh báo của chính mình
CREATE POLICY "Users Manage Own Alerts" ON public.price_alerts FOR ALL USING (auth.uid() = user_id);

-- ==============================================================================

-- 6. CẤP QUYỀN TRUY CẬP (PREMISSIONS)
-- Đảm bảo API bên ngoài (Anon key) có thể đọc/ghi đúng luật
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

-- ==============================================================================

-- 7. KÍCH HOẠT REALTIME
-- Để bảng giá vàng tự động nhảy số trên web
ALTER PUBLICATION supabase_realtime ADD TABLE public.gold_prices;

-- HOÀN TẤT!
