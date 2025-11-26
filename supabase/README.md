# Supabase Database Setup for Admin Dashboard

This directory contains SQL scripts for setting up the admin dashboard database schema.

## Prerequisites

- Access to the Mandir Mitra Supabase project
- Supabase CLI installed (optional, for local development)
- Database admin credentials

## Setup Instructions

### 1. Run the Admin Schema

The admin dashboard requires additional tables beyond the main mobile app schema.

**Option A: Using Supabase Dashboard (Recommended)**

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `admin_schema.sql`
4. Paste and run the SQL script
5. Verify all tables were created successfully

**Option B: Using Supabase CLI**

```bash
# From the admin-dashboard directory
supabase db push

# Or run the specific file
psql -h your-db-host -U postgres -d postgres -f supabase/admin_schema.sql
```

### 2. Verify Installation

Run this query to verify all tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'admin_users',
  'admin_permissions',
  'audit_log',
  'banners',
  'user_journey_events',
  'communication_log',
  'saved_filters',
  'performance_metrics_cache'
);
```

You should see all 8 tables listed.

### 3. Create Initial Admin User

After running the schema, create your first admin user:

```sql
-- First, create an auth user in Supabase Auth
-- Then link it to the admin_users table

INSERT INTO admin_users (id, email, name, role, two_factor_enabled)
VALUES (
  'your-auth-user-id-here',  -- Get this from auth.users table
  'admin@mandirmitra.com',
  'Super Administrator',
  'super_admin',
  true
);
```

### 4. Set Up Permissions

Grant default permissions to the admin user:

```sql
INSERT INTO admin_permissions (admin_user_id, resource, actions)
VALUES 
  ('your-admin-user-id', '*', ARRAY['create', 'read', 'update', 'delete']);
```

## Tables Overview

### Core Admin Tables

- **admin_users**: Administrative users with dashboard access
- **admin_permissions**: Granular permissions for each admin user
- **audit_log**: Complete audit trail of all admin actions

### Content Management

- **banners**: Promotional banners for the mobile app
- **user_journey_events**: User behavior tracking
- **communication_log**: All communications sent to users

### Utility Tables

- **saved_filters**: Saved filter configurations
- **performance_metrics_cache**: Cached metrics for performance

## Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

- Super admins have full access to everything
- Temple admins can only access their temple's data
- Content managers can manage content tables
- All admin actions are logged in audit_log

## Indexes

Performance indexes are created on:
- Foreign keys
- Frequently queried columns
- Date/timestamp columns for sorting

## Maintenance

### Clean Expired Cache

Run periodically to clean expired metrics:

```sql
SELECT clean_expired_metrics_cache();
```

### View Audit Log

Check recent admin actions:

```sql
SELECT 
  au.email as admin_email,
  al.action_type,
  al.resource_type,
  al.created_at
FROM audit_log al
JOIN admin_users au ON al.admin_user_id = au.id
ORDER BY al.created_at DESC
LIMIT 100;
```

## Troubleshooting

### RLS Policies Not Working

If you can't access data:

1. Check if you're authenticated as an admin user
2. Verify the admin_users table has your user ID
3. Check the RLS policies are enabled

```sql
-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### Performance Issues

If queries are slow:

1. Check if indexes are being used
2. Review the performance_metrics_cache table
3. Consider adding more specific indexes

```sql
-- Check index usage
SELECT * FROM pg_stat_user_indexes 
WHERE schemaname = 'public';
```

## Security Notes

- Never commit actual credentials to version control
- Always use environment variables for sensitive data
- Rotate service role keys regularly
- Monitor the audit_log for suspicious activity
- Enable 2FA for all super admin accounts

## Support

For issues or questions:
1. Check the main README.md
2. Review Supabase documentation
3. Contact the development team
