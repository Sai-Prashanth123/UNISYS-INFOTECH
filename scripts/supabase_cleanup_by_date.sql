-- =============================================================================
-- SUPABASE DATA CLEANUP BY DATE RANGE
-- =============================================================================
-- Run in Supabase Dashboard → SQL Editor. Edit CONFIG (v_from_date, v_to_date)
-- then run. Deletes rows where the table's date column is BETWEEN from and to.
--
-- QUICK EXAMPLES (set inside the DO block):
--   Fixed range:     v_from_date := '2022-01-01'; v_to_date := '2023-12-31';
--   Last 6 months:  v_from_date := (CURRENT_DATE - INTERVAL '6 months')::date;
--                    v_to_date   := CURRENT_DATE::date;
--   Older than 1yr: v_from_date := '1970-01-01';
--                    v_to_date   := (CURRENT_DATE - INTERVAL '1 year')::date;
--
-- To run only specific tables: comment out the DELETE blocks you don't need.
-- Order matters for FKs: job_applications before job_postings; payroll_deductions
-- before invoices if you use those.
-- =============================================================================

-- ----------------------------- CONFIG (edit these) ---------------------------
-- Option A: Fixed date range (YYYY-MM-DD)
-- Option B: Relative to today (uncomment one of the pairs and set months/years)

-- FROM date (start of period) — rows with date >= this are eligible for delete
-- Examples:
--   '2020-01-01'::date
--   (CURRENT_DATE - INTERVAL '2 years')::date
--   (CURRENT_DATE - INTERVAL '6 months')::date

-- TO date (end of period) — rows with date <= this are eligible for delete
-- Examples:
--   '2023-12-31'::date
--   CURRENT_DATE::date
--   (CURRENT_DATE - INTERVAL '1 day')::date

DO $$
DECLARE
  v_from_date date := '2020-01-01';           -- CHANGE: start of period
  v_to_date   date := '2023-12-31';           -- CHANGE: end of period
  v_deleted   int;
BEGIN
  -- Optional: delete only OLDER than X (ignore from/to and use this instead)
  -- Uncomment and set to e.g. INTERVAL '1 year' to delete everything older than 1 year
  -- v_from_date := (CURRENT_DATE - INTERVAL '1 year')::date;
  -- v_to_date   := CURRENT_DATE::date;

  RAISE NOTICE 'Cleanup from % to %', v_from_date, v_to_date;

  -- ---------------------------------------------------------------------------
  -- 1. job_applications (child of job_postings — run before job_postings)
  -- Date column: applied_date, created_at
  -- ---------------------------------------------------------------------------
  WITH deleted AS (
    DELETE FROM public.job_applications
    WHERE (COALESCE(applied_date, created_at)::date BETWEEN v_from_date AND v_to_date)
    RETURNING id
  )
  SELECT count(*) INTO v_deleted FROM deleted;
  RAISE NOTICE 'job_applications: % rows deleted', v_deleted;

  -- ---------------------------------------------------------------------------
  -- 2. job_postings
  -- Date columns: posted_date, end_date, created_at
  -- ---------------------------------------------------------------------------
  WITH deleted AS (
    DELETE FROM public.job_postings
    WHERE (COALESCE(posted_date, created_at)::date BETWEEN v_from_date AND v_to_date)
    RETURNING id
  )
  SELECT count(*) INTO v_deleted FROM deleted;
  RAISE NOTICE 'job_postings: % rows deleted', v_deleted;

  -- ---------------------------------------------------------------------------
  -- 3. resumes (if linked to applications, may already be removed by FK)
  -- Date column: created_at
  -- ---------------------------------------------------------------------------
  WITH deleted AS (
    DELETE FROM public.resumes
    WHERE created_at::date BETWEEN v_from_date AND v_to_date
    RETURNING id
  )
  SELECT count(*) INTO v_deleted FROM deleted;
  RAISE NOTICE 'resumes: % rows deleted', v_deleted;

  -- ---------------------------------------------------------------------------
  -- 4. time_cards
  -- Date column: date
  -- ---------------------------------------------------------------------------
  WITH deleted AS (
    DELETE FROM public.time_cards
    WHERE date::date BETWEEN v_from_date AND v_to_date
    RETURNING id
  )
  SELECT count(*) INTO v_deleted FROM deleted;
  RAISE NOTICE 'time_cards: % rows deleted', v_deleted;

  -- ---------------------------------------------------------------------------
  -- 5. contact_messages
  -- Date column: created_at
  -- ---------------------------------------------------------------------------
  WITH deleted AS (
    DELETE FROM public.contact_messages
    WHERE created_at::date BETWEEN v_from_date AND v_to_date
    RETURNING id
  )
  SELECT count(*) INTO v_deleted FROM deleted;
  RAISE NOTICE 'contact_messages: % rows deleted', v_deleted;

  -- ---------------------------------------------------------------------------
  -- 6. password_reset_tokens (expired or in range)
  -- Date column: created_at or expires_at
  -- ---------------------------------------------------------------------------
  WITH deleted AS (
    DELETE FROM public.password_reset_tokens
    WHERE created_at::date BETWEEN v_from_date AND v_to_date
    RETURNING id
  )
  SELECT count(*) INTO v_deleted FROM deleted;
  RAISE NOTICE 'password_reset_tokens: % rows deleted', v_deleted;

  -- ---------------------------------------------------------------------------
  -- 7. password_change_requests
  -- Date column: created_at
  -- ---------------------------------------------------------------------------
  WITH deleted AS (
    DELETE FROM public.password_change_requests
    WHERE created_at::date BETWEEN v_from_date AND v_to_date
    RETURNING id
  )
  SELECT count(*) INTO v_deleted FROM deleted;
  RAISE NOTICE 'password_change_requests: % rows deleted', v_deleted;

  -- ---------------------------------------------------------------------------
  -- 8. users (use with caution — prefer deactivate instead of delete)
  -- Date column: created_at
  -- ---------------------------------------------------------------------------
  -- WITH deleted AS (
  --   DELETE FROM public.users
  --   WHERE created_at::date BETWEEN v_from_date AND v_to_date
  --   RETURNING id
  -- )
  -- SELECT count(*) INTO v_deleted FROM deleted;
  -- RAISE NOTICE 'users: % rows deleted', v_deleted;

  -- ---------------------------------------------------------------------------
  -- 9. clients
  -- Date columns: onboarding_date, created_at
  -- ---------------------------------------------------------------------------
  -- WITH deleted AS (
  --   DELETE FROM public.clients
  --   WHERE created_at::date BETWEEN v_from_date AND v_to_date
  --   RETURNING id
  -- )
  -- SELECT count(*) INTO v_deleted FROM deleted;
  -- RAISE NOTICE 'clients: % rows deleted', v_deleted;

  -- ---------------------------------------------------------------------------
  -- 10. user_client_assignments (depends on users, clients)
  -- Date column: created_at if exists
  -- ---------------------------------------------------------------------------
  -- WITH deleted AS (
  --   DELETE FROM public.user_client_assignments
  --   WHERE created_at::date BETWEEN v_from_date AND v_to_date
  --   RETURNING id
  -- )
  -- SELECT count(*) INTO v_deleted FROM deleted;
  -- RAISE NOTICE 'user_client_assignments: % rows deleted', v_deleted;

  -- ---------------------------------------------------------------------------
  -- 11. contacts
  -- Date column: created_at
  -- ---------------------------------------------------------------------------
  -- WITH deleted AS (
  --   DELETE FROM public.contacts
  --   WHERE created_at::date BETWEEN v_from_date AND v_to_date
  --   RETURNING id
  -- )
  -- SELECT count(*) INTO v_deleted FROM deleted;
  -- RAISE NOTICE 'contacts: % rows deleted', v_deleted;

  -- ---------------------------------------------------------------------------
  -- 12. hours_logs
  -- Date column: date
  -- ---------------------------------------------------------------------------
  -- WITH deleted AS (
  --   DELETE FROM public.hours_logs
  --   WHERE date::date BETWEEN v_from_date AND v_to_date
  --   RETURNING id
  -- )
  -- SELECT count(*) INTO v_deleted FROM deleted;
  -- RAISE NOTICE 'hours_logs: % rows deleted', v_deleted;

  -- ---------------------------------------------------------------------------
  -- 13. invoices (delete payroll_deductions for those invoices first if FK exists)
  -- Date column: invoice_date
  -- ---------------------------------------------------------------------------
  -- WITH deleted AS (
  --   DELETE FROM public.invoices
  --   WHERE invoice_date::date BETWEEN v_from_date AND v_to_date
  --   RETURNING id
  -- )
  -- SELECT count(*) INTO v_deleted FROM deleted;
  -- RAISE NOTICE 'invoices: % rows deleted', v_deleted;

  -- ---------------------------------------------------------------------------
  -- 14. payroll_deductions (often child of invoices)
  -- ---------------------------------------------------------------------------
  -- WITH deleted AS (
  --   DELETE FROM public.payroll_deductions
  --   WHERE created_at::date BETWEEN v_from_date AND v_to_date
  --   RETURNING id
  -- )
  -- SELECT count(*) INTO v_deleted FROM deleted;
  -- RAISE NOTICE 'payroll_deductions: % rows deleted', v_deleted;

  -- ---------------------------------------------------------------------------
  -- 15. client_logos
  -- ---------------------------------------------------------------------------
  -- WITH deleted AS (
  --   DELETE FROM public.client_logos
  --   WHERE created_at::date BETWEEN v_from_date AND v_to_date
  --   RETURNING id
  -- )
  -- SELECT count(*) INTO v_deleted FROM deleted;
  -- RAISE NOTICE 'client_logos: % rows deleted', v_deleted;

  RAISE NOTICE 'Cleanup done.';
END $$;

-- =============================================================================
-- DRY RUN (optional): Run this block first to see how many rows would be deleted.
-- Replace the DO block above with this, or run in a separate query.
-- =============================================================================
/*
DO $$
DECLARE
  v_from_date date := '2020-01-01';
  v_to_date   date := '2023-12-31';
BEGIN
  RAISE NOTICE 'job_applications: %', (SELECT count(*) FROM public.job_applications WHERE (COALESCE(applied_date, created_at)::date BETWEEN v_from_date AND v_to_date));
  RAISE NOTICE 'job_postings: %',     (SELECT count(*) FROM public.job_postings     WHERE (COALESCE(posted_date, created_at)::date BETWEEN v_from_date AND v_to_date));
  RAISE NOTICE 'resumes: %',          (SELECT count(*) FROM public.resumes          WHERE created_at::date BETWEEN v_from_date AND v_to_date);
  RAISE NOTICE 'time_cards: %',       (SELECT count(*) FROM public.time_cards       WHERE date::date BETWEEN v_from_date AND v_to_date);
  RAISE NOTICE 'contact_messages: %', (SELECT count(*) FROM public.contact_messages WHERE created_at::date BETWEEN v_from_date AND v_to_date);
  RAISE NOTICE 'password_reset_tokens: %', (SELECT count(*) FROM public.password_reset_tokens WHERE created_at::date BETWEEN v_from_date AND v_to_date);
  RAISE NOTICE 'password_change_requests: %', (SELECT count(*) FROM public.password_change_requests WHERE created_at::date BETWEEN v_from_date AND v_to_date);
END $$;
*/
