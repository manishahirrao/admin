-- Mandir Mitra Admin Dashboard - Database Schema Extensions
-- This file contains all additional tables needed for the admin dashboard
-- Run this after the main mandir_mitra schema is set up

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ADMIN USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'temple_admin', 'priest_manager', 'content_manager')),
  temple_ids UUID[],
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret TEXT,
  backup_codes TEXT[],
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ADMIN PERMISSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  resource TEXT NOT NULL,
  actions TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- AUDIT LOG TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID REFERENCES admin_users(id),
  action_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- BANNER MANAGEMENT TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  display_order INTEGER NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  target_segments TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- USER JOURNEY EVENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_journey_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  page_url TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- COMMUNICATION LOG TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS communication_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  admin_user_id UUID REFERENCES admin_users(id),
  type TEXT NOT NULL CHECK (type IN ('sms', 'email', 'in_app')),
  template_name TEXT,
  message_content TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  response TEXT,
  metadata JSONB
);

-- ============================================================================
-- SAVED FILTERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS saved_filters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  filter_name TEXT NOT NULL,
  section TEXT NOT NULL,
  filter_config JSONB NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PERFORMANCE METRICS CACHE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS performance_metrics_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_type TEXT NOT NULL,
  entity_id UUID,
  entity_type TEXT,
  metric_data JSONB NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_user ON audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON audit_log(resource_type, resource_id);

-- User journey events indexes
CREATE INDEX IF NOT EXISTS idx_user_journey_events_user ON user_journey_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_journey_events_created ON user_journey_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_journey_events_type ON user_journey_events(event_type);

-- Communication log indexes
CREATE INDEX IF NOT EXISTS idx_communication_log_user ON communication_log(user_id);
CREATE INDEX IF NOT EXISTS idx_communication_log_sent_at ON communication_log(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_communication_log_status ON communication_log(status);

-- Performance metrics cache indexes
CREATE INDEX IF NOT EXISTS idx_performance_metrics_entity ON performance_metrics_cache(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_expires ON performance_metrics_cache(expires_at);

-- Banner indexes
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active);
CREATE INDEX IF NOT EXISTS idx_banners_dates ON banners(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_banners_order ON banners(display_order);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Admin Users RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view their own profile"
  ON admin_users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Super admins can view all admin users"
  ON admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can manage admin users"
  ON admin_users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Audit Log RLS
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "System can insert audit logs"
  ON audit_log FOR INSERT
  WITH CHECK (true);

-- Banners RLS
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Content managers can manage banners"
  ON banners FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'content_manager')
    )
  );

CREATE POLICY "All admins can view banners"
  ON banners FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

-- User Journey Events RLS
ALTER TABLE user_journey_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view user journey events"
  ON user_journey_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "System can insert journey events"
  ON user_journey_events FOR INSERT
  WITH CHECK (true);

-- Communication Log RLS
ALTER TABLE communication_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view communication log"
  ON communication_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert communications"
  ON communication_log FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

-- Saved Filters RLS
ALTER TABLE saved_filters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage their own filters"
  ON saved_filters FOR ALL
  USING (admin_user_id = auth.uid());

-- Performance Metrics Cache RLS
ALTER TABLE performance_metrics_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view metrics cache"
  ON performance_metrics_cache FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "System can manage metrics cache"
  ON performance_metrics_cache FOR ALL
  WITH CHECK (true);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for admin_users
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for banners
CREATE TRIGGER update_banners_updated_at
  BEFORE UPDATE ON banners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to clean expired metrics cache
CREATE OR REPLACE FUNCTION clean_expired_metrics_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM performance_metrics_cache
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default super admin (update with actual credentials)
-- Note: This should be done manually with proper password hashing
-- INSERT INTO admin_users (id, email, name, role)
-- VALUES (
--   uuid_generate_v4(),
--   'admin@mandirmitra.com',
--   'Super Administrator',
--   'super_admin'
-- );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE admin_users IS 'Administrative users with access to the dashboard';
COMMENT ON TABLE admin_permissions IS 'Granular permissions for admin users';
COMMENT ON TABLE audit_log IS 'Audit trail of all administrative actions';
COMMENT ON TABLE banners IS 'Promotional banners displayed in the mobile app';
COMMENT ON TABLE user_journey_events IS 'Tracking of user interactions and behavior';
COMMENT ON TABLE communication_log IS 'Log of all communications sent to users';
COMMENT ON TABLE saved_filters IS 'Saved filter configurations for admin users';
COMMENT ON TABLE performance_metrics_cache IS 'Cached performance metrics for faster dashboard loading';
