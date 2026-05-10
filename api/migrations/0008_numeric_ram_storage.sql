-- Widen ram_gb and storage_gb from INT to NUMERIC so fractional values
-- (e.g. 32.0 from JSON) are accepted without type errors.
ALTER TABLE assets
  ALTER COLUMN ram_gb     TYPE NUMERIC USING ram_gb::NUMERIC,
  ALTER COLUMN storage_gb TYPE NUMERIC USING storage_gb::NUMERIC;
