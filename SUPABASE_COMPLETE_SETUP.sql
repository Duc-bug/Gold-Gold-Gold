-- ==============================================================================
-- 🏆 VINAGOLD AI - SUPABASE COMPLETE DATABASE SETUP
-- ==============================================================================
-- ⚠️ WARNING: RUNNING THIS SCRIPT WILL WIPE EXISTING DATA IN THESE TABLES.
-- ==============================================================================

-- 1. CLEANUP (Drop existing tables to ensure clean state)
DROP TABLE IF EXISTS alert_history CASCADE;
DROP TABLE IF EXISTS user_portfolio CASCADE;
DROP TABLE IF EXISTS user_alerts CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE; -- Settings page
DROP TABLE IF EXISTS user_profiles CASCADE;    -- Profile data
DROP TABLE IF EXISTS gold_prices CASCADE;      -- Real-time prices

-- ==============================================================================
-- 2. TABLE: GOLD PRICES (Real-time data)
-- ==============================================================================
CREATE TABLE gold_prices (
  id BIGSERIAL PRIMARY KEY,
  brand TEXT NOT NULL,          -- SJC, PNJ, DOJI, SILVER
  buy_price DECIMAL(15, 2) NOT NULL,
  sell_price DECIMAL(15, 2) NOT NULL,
  region TEXT DEFAULT 'global', -- vietnam, global
  currency TEXT DEFAULT 'VND',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX idx_gold_prices_updated ON gold_prices(updated_at DESC);
CREATE INDEX idx_gold_prices_brand ON gold_prices(brand);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE gold_prices;

-- RLS: Public can read/insert (for demo simplicity)
ALTER TABLE gold_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read gold_prices" ON gold_prices FOR SELECT TO public USING (true);
CREATE POLICY "Public insert gold_prices" ON gold_prices FOR INSERT TO public WITH CHECK (true);

-- ==============================================================================
-- 3. TABLE: USER PROFILES (Auth)
-- ==============================================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- TRIGGER: Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'display_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- 4. TABLE: USER PREFERENCES (Settings)
-- ==============================================================================
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark',
  currency TEXT DEFAULT 'VND',
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  alert_sound BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own preferences" ON user_preferences FOR ALL USING (auth.uid() = user_id);

-- ==============================================================================
-- 5. TABLE: USER PORTFOLIO (Investment Tracking)
-- ==============================================================================
CREATE TABLE user_portfolio (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand TEXT NOT NULL,
  quantity DECIMAL(10, 4) NOT NULL,
  purchase_price DECIMAL(15, 2) NOT NULL,
  purchase_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_portfolio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own portfolio" ON user_portfolio FOR ALL USING (auth.uid() = user_id);

-- ==============================================================================
-- 6. TABLE: USER ALERTS (Price Notifications)
-- ==============================================================================
CREATE TABLE user_alerts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, 
  email TEXT NOT NULL,
  target_price DECIMAL(15, 2) NOT NULL,
  notify_email BOOLEAN DEFAULT TRUE,
  notify_browser BOOLEAN DEFAULT FALSE,
  region TEXT DEFAULT 'all',
  is_triggered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own alerts" ON user_alerts FOR ALL USING (auth.uid() = user_id);

-- ==============================================================================
-- 7. TABLE: ALERT HISTORY (Logs)
-- ==============================================================================
CREATE TABLE alert_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand TEXT NOT NULL,
  target_price DECIMAL(15, 2) NOT NULL,
  actual_price DECIMAL(15, 2) NOT NULL,
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE
);

-- Enable RLS
ALTER TABLE alert_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own history" ON alert_history FOR SELECT USING (auth.uid() = user_id);

-- ==============================================================================
-- 8. TRIGGER: CHECK PRICE ALERTS LOGIC
-- ==============================================================================
CREATE OR REPLACE FUNCTION check_price_alerts()
RETURNS TRIGGER AS $$
DECLARE
  alert_row RECORD;
BEGIN
  -- Find matching active alerts
  FOR alert_row IN 
    SELECT * FROM user_alerts 
    WHERE is_triggered = false 
    AND target_price <= NEW.buy_price
  LOOP
    -- 1. Mark alert as triggered
    UPDATE user_alerts SET is_triggered = true WHERE id = alert_row.id;

    -- 2. Log to history if user_id exists
    IF alert_row.user_id IS NOT NULL THEN
      INSERT INTO alert_history (user_id, brand, target_price, actual_price, triggered_at)
      VALUES (alert_row.user_id, NEW.brand, alert_row.target_price, NEW.buy_price, NOW());
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_check_alerts ON gold_prices;
CREATE TRIGGER trigger_auto_check_alerts
  AFTER INSERT ON gold_prices
  FOR EACH ROW
  EXECUTE FUNCTION check_price_alerts();

-- ==============================================================================
-- SETUP COMPLETE
-- ==============================================================================
