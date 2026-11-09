-- Hot-path indexes for the booking board, location list and fare lookups.
-- Safe to run repeatedly (IF NOT EXISTS throughout).

-- Driver board: open pending bookings awaiting a driver.
CREATE INDEX IF NOT EXISTS bookings_open_pending_idx
  ON bookings(created_at DESC)
  WHERE status = 'pending' AND driver_id IS NULL;

-- Admin/student/driver filtered lists and status counters.
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings(status);
CREATE INDEX IF NOT EXISTS bookings_student_status_idx ON bookings(student_id, status);
CREATE INDEX IF NOT EXISTS bookings_created_at_idx ON bookings(created_at DESC);

-- Active location list used by the booking form.
CREATE INDEX IF NOT EXISTS locations_active_name_idx ON locations(name) WHERE active = TRUE;

-- Latest active fare lookup (runs on every booking and fare read).
CREATE INDEX IF NOT EXISTS fare_settings_active_updated_idx
  ON fare_settings(updated_at DESC)
  WHERE active = TRUE;

-- Admin overview grouping and driver approval queue.
CREATE INDEX IF NOT EXISTS users_role_status_idx ON users(role, status);

-- Payment status filters (reported payments awaiting confirmation).
CREATE INDEX IF NOT EXISTS payment_records_status_idx ON payment_records(status);

-- Audit log lookups by entity.
CREATE INDEX IF NOT EXISTS audit_logs_entity_idx ON audit_logs(entity_type, entity_id);
