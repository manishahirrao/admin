-- Workload Alerts Table
CREATE TABLE IF NOT EXISTS workload_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  priest_id UUID NOT NULL REFERENCES priests(id) ON DELETE CASCADE,
  alert_level TEXT NOT NULL CHECK (alert_level IN ('warning', 'critical')),
  current_load INTEGER NOT NULL,
  optimal_capacity INTEGER NOT NULL,
  utilization_percentage INTEGER NOT NULL,
  suggested_actions TEXT[] NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'dismissed', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  dismissed_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  dismissed_by UUID REFERENCES admin_users(id),
  resolved_by UUID REFERENCES admin_users(id),
  notes TEXT
);

-- Create indexes for performance
CREATE INDEX idx_workload_alerts_priest ON workload_alerts(priest_id);
CREATE INDEX idx_workload_alerts_status ON workload_alerts(status);
CREATE INDEX idx_workload_alerts_level ON workload_alerts(alert_level);
CREATE INDEX idx_workload_alerts_created ON workload_alerts(created_at DESC);

-- Add current_load and optimal_capacity to priests table if not exists
ALTER TABLE priests 
ADD COLUMN IF NOT EXISTS current_load INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS optimal_capacity INTEGER DEFAULT 20;

-- Function to automatically update priest current_load
CREATE OR REPLACE FUNCTION update_priest_current_load()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the priest's current load based on assigned rituals
  UPDATE priests
  SET current_load = (
    SELECT COUNT(*)
    FROM ritual_assignments
    WHERE priest_id = NEW.priest_id
    AND status IN ('pending', 'in_progress')
  )
  WHERE id = NEW.priest_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update current_load when assignments change
DROP TRIGGER IF EXISTS trigger_update_priest_load ON ritual_assignments;
CREATE TRIGGER trigger_update_priest_load
AFTER INSERT OR UPDATE OR DELETE ON ritual_assignments
FOR EACH ROW
EXECUTE FUNCTION update_priest_current_load();

-- Function to check workload and create alerts
CREATE OR REPLACE FUNCTION check_priest_workload_alerts()
RETURNS void AS $$
DECLARE
  priest_record RECORD;
  utilization_pct INTEGER;
  alert_level TEXT;
BEGIN
  FOR priest_record IN 
    SELECT id, name, current_load, optimal_capacity
    FROM priests
    WHERE current_load > 0
  LOOP
    utilization_pct := ROUND((priest_record.current_load::NUMERIC / priest_record.optimal_capacity::NUMERIC) * 100);
    
    -- Check if alert should be created
    IF utilization_pct >= 85 THEN
      alert_level := 'critical';
    ELSIF utilization_pct >= 75 THEN
      alert_level := 'warning';
    ELSE
      CONTINUE;
    END IF;
    
    -- Check if active alert already exists
    IF NOT EXISTS (
      SELECT 1 FROM workload_alerts
      WHERE priest_id = priest_record.id
      AND status = 'active'
      AND created_at > NOW() - INTERVAL '24 hours'
    ) THEN
      -- Create new alert
      INSERT INTO workload_alerts (
        priest_id,
        alert_level,
        current_load,
        optimal_capacity,
        utilization_percentage,
        suggested_actions,
        status
      ) VALUES (
        priest_record.id,
        alert_level,
        priest_record.current_load,
        priest_record.optimal_capacity,
        utilization_pct,
        ARRAY[
          'Review priest workload immediately',
          'Consider redistributing rituals',
          'Check priest availability and wellbeing'
        ],
        'active'
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security
ALTER TABLE workload_alerts ENABLE ROW LEVEL SECURITY;

-- Admins can view all alerts
CREATE POLICY "Admins can view workload alerts"
  ON workload_alerts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

-- Admins can update alerts (dismiss/resolve)
CREATE POLICY "Admins can update workload alerts"
  ON workload_alerts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

-- System can insert alerts
CREATE POLICY "System can insert workload alerts"
  ON workload_alerts FOR INSERT
  WITH CHECK (true);

-- Comments
COMMENT ON TABLE workload_alerts IS 'Tracks priest workload alerts when capacity thresholds are exceeded';
COMMENT ON COLUMN workload_alerts.alert_level IS 'Severity level: warning (75-84%) or critical (85%+)';
COMMENT ON COLUMN workload_alerts.utilization_percentage IS 'Current workload as percentage of optimal capacity';
COMMENT ON COLUMN workload_alerts.suggested_actions IS 'Array of recommended actions to resolve the alert';
