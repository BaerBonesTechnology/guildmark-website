-- Add Square customer ID to companies.
--
-- Created when a company signs up so that all payment history, saved cards,
-- and invoices are owned by Square rather than stored in our database.
-- NULL until the async Square API call completes after signup.

ALTER TABLE companies
  ADD COLUMN square_customer_id TEXT;

CREATE INDEX companies_square_customer_idx ON companies(square_customer_id)
  WHERE square_customer_id IS NOT NULL;
