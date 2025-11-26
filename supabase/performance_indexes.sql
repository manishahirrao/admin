-- Performance Optimization Indexes
-- Add indexes to frequently queried columns for better query performance

-- Bookings table indexes
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_time ON bookings(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_temple_id ON bookings(temple_id);
CREATE INDEX IF NOT EXISTS idx_bookings_priest_id ON bookings(priest_id);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_bookings_status_scheduled ON bookings(status, scheduled_time);
CREATE INDEX IF NOT EXISTS idx_bookings_user_status ON bookings(user_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_temple_status ON bookings(temple_id, status);

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_cart_value ON profiles(cart_value DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_activity_score ON profiles(activity_score DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_registration_date ON profiles(registration_date DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_last_activity ON profiles(last_activity DESC);

-- Admin users table indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_last_login ON admin_users(last_login DESC);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_user ON audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON audit_log(resource_type, resource_id);

-- Communication log indexes
CREATE INDEX IF NOT EXISTS idx_communication_log_user ON communication_log(user_id);
CREATE INDEX IF NOT EXISTS idx_communication_log_sent_at ON communication_log(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_communication_log_status ON communication_log(status);

-- User journey events indexes
CREATE INDEX IF NOT EXISTS idx_user_journey_events_user ON user_journey_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_journey_events_created ON user_journey_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_journey_events_type ON user_journey_events(event_type);

-- Banners indexes
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active);
CREATE INDEX IF NOT EXISTS idx_banners_dates ON banners(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_banners_order ON banners(display_order);

-- Performance metrics cache indexes
CREATE INDEX IF NOT EXISTS idx_performance_metrics_entity ON performance_metrics_cache(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_expires ON performance_metrics_cache(expires_at);

-- Materialized Views for Analytics

-- Revenue by Service Type
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_revenue_by_service AS
SELECT 
  service_type,
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as booking_count,
  SUM(total_value) as total_revenue,
  AVG(total_value) as avg_value
FROM bookings
WHERE payment_status = 'completed'
GROUP BY service_type, DATE_TRUNC('day', created_at);

CREATE INDEX IF NOT EXISTS idx_mv_revenue_service_date ON mv_revenue_by_service(service_type, date DESC);

-- Temple Performance
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_temple_performance AS
SELECT 
  t.id as temple_id,
  t.name as temple_name,
  COUNT(b.id) as total_bookings,
  AVG(b.rating) as avg_rating,
  SUM(CASE WHEN b.payment_status = 'completed' THEN b.total_value ELSE 0 END) as revenue,
  COUNT(CASE WHEN b.status = 'completed' THEN 1 END)::FLOAT / NULLIF(COUNT(b.id), 0) as completion_rate
FROM temples t
LEFT JOIN bookings b ON t.id = b.temple_id
GROUP BY t.id, t.name;

CREATE INDEX IF NOT EXISTS idx_mv_temple_perf_revenue ON mv_temple_performance(revenue DESC);
CREATE INDEX IF NOT EXISTS idx_mv_temple_perf_rating ON mv_temple_performance(avg_rating DESC);

-- Priest Utilization
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_priest_utilization AS
SELECT 
  p.id as priest_id,
  p.name as priest_name,
  p.temple_id,
  COUNT(b.id) as assigned_rituals,
  COUNT(CASE WHEN b.status = 'completed' THEN 1 END) as completed_rituals,
  COUNT(CASE WHEN b.status = 'completed' THEN 1 END)::FLOAT / NULLIF(COUNT(b.id), 0) as completion_rate,
  AVG(b.rating) as avg_rating
FROM priests p
LEFT JOIN bookings b ON p.id = b.priest_id
GROUP BY p.id, p.name, p.temple_id;

CREATE INDEX IF NOT EXISTS idx_mv_priest_util_temple ON mv_priest_utilization(temple_id);
CREATE INDEX IF NOT EXISTS idx_mv_priest_util_rate ON mv_priest_utilization(completion_rate DESC);

-- User Engagement Metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_user_engagement AS
SELECT 
  u.id as user_id,
  u.full_name,
  u.cart_value,
  COUNT(b.id) as order_count,
  MAX(b.created_at) as last_order_date,
  SUM(CASE WHEN b.payment_status = 'completed' THEN b.total_value ELSE 0 END) as lifetime_value,
  COUNT(CASE WHEN b.created_at > NOW() - INTERVAL '30 days' THEN 1 END) as orders_last_30_days
FROM profiles u
LEFT JOIN bookings b ON u.id = b.user_id
GROUP BY u.id, u.full_name, u.cart_value;

CREATE INDEX IF NOT EXISTS idx_mv_user_eng_cart ON mv_user_engagement(cart_value DESC);
CREATE INDEX IF NOT EXISTS idx_mv_user_eng_ltv ON mv_user_engagement(lifetime_value DESC);

-- Refresh function for materialized views
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_revenue_by_service;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_temple_performance;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_priest_utilization;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_engagement;
END;
$$ LANGUAGE plpgsql;

-- Schedule automatic refresh (run this manually or via cron)
-- SELECT cron.schedule('refresh-analytics', '*/10 * * * *', 'SELECT refresh_analytics_views()');

-- Query optimization functions

-- Get dashboard metrics with caching
CREATE OR REPLACE FUNCTION get_dashboard_metrics(period TEXT DEFAULT 'today')
RETURNS JSON AS $$
DECLARE
  result JSON;
  start_date TIMESTAMP;
BEGIN
  -- Determine date range
  CASE period
    WHEN 'today' THEN start_date := DATE_TRUNC('day', NOW());
    WHEN 'week' THEN start_date := DATE_TRUNC('week', NOW());
    WHEN 'month' THEN start_date := DATE_TRUNC('month', NOW());
    ELSE start_date := DATE_TRUNC('day', NOW());
  END CASE;

  SELECT json_build_object(
    'totalUsers', (SELECT COUNT(*) FROM profiles WHERE registration_date >= start_date),
    'activeBookings', (SELECT COUNT(*) FROM bookings WHERE status IN ('upcoming', 'in_progress') AND created_at >= start_date),
    'pendingDeliveries', (SELECT COUNT(*) FROM bookings WHERE aashirwad_status = 'pending' AND created_at >= start_date),
    'revenue', (SELECT COALESCE(SUM(total_value), 0) FROM bookings WHERE payment_status = 'completed' AND created_at >= start_date)
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Get temple performance with optimization
CREATE OR REPLACE FUNCTION get_temple_performance_metrics()
RETURNS TABLE (
  temple_id UUID,
  temple_name TEXT,
  total_bookings BIGINT,
  avg_rating NUMERIC,
  revenue NUMERIC,
  completion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM mv_temple_performance
  ORDER BY revenue DESC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql;

-- Get priest workload with optimization
CREATE OR REPLACE FUNCTION get_priests_with_workload()
RETURNS TABLE (
  id UUID,
  name TEXT,
  temple_id UUID,
  specializations TEXT[],
  current_load BIGINT,
  max_capacity INTEGER,
  availability BOOLEAN,
  rating NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.temple_id,
    p.specializations,
    COUNT(b.id) as current_load,
    p.max_capacity,
    p.availability,
    COALESCE(AVG(b.rating), 0) as rating
  FROM priests p
  LEFT JOIN bookings b ON p.id = b.priest_id AND b.status IN ('upcoming', 'in_progress')
  GROUP BY p.id, p.name, p.temple_id, p.specializations, p.max_capacity, p.availability;
END;
$$ LANGUAGE plpgsql;

-- Connection pooling is handled by Supabase automatically
-- For additional optimization, consider using pgBouncer in transaction mode

COMMENT ON FUNCTION refresh_analytics_views() IS 'Refreshes all materialized views for analytics';
COMMENT ON FUNCTION get_dashboard_metrics(TEXT) IS 'Gets dashboard metrics with optional period filter';
COMMENT ON FUNCTION get_temple_performance_metrics() IS 'Gets temple performance from materialized view';
COMMENT ON FUNCTION get_priests_with_workload() IS 'Gets priests with current workload calculation';
