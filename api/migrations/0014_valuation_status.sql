-- Track background valuation job state per company.
--
-- valuation_status:      lifecycle of the most recent valuation run
--                        idle | running | complete | failed
-- valuation_started_at:  wall-clock time the last job was kicked off
-- valuation_asset_count: number of assets the job was asked to value
--                        (stored at job start so the frontend can show
--                        progress messaging like "valuing N assets")
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS valuation_status       TEXT         NOT NULL DEFAULT 'idle',
  ADD COLUMN IF NOT EXISTS valuation_started_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS valuation_asset_count  INT          NOT NULL DEFAULT 0;
