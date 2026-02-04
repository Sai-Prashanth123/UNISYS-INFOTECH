-- =============================================================================
-- SIMPLE CLEANUP: Set your dates and pick tables. Run in Supabase SQL Editor.
-- =============================================================================
-- 1. Edit the two dates below (FROM and TO). Rows in this range are deleted.
-- 2. Uncomment ONLY the DELETE lines for the tables you want to clean.
-- 3. Run the script.
-- =============================================================================

DO $$
DECLARE
  -- *** CHANGE THESE TWO DATES *** (YYYY-MM-DD)
  v_from_date date := '2020-01-01';
  v_to_date   date := '2023-12-31';
  v_deleted   int;
BEGIN
  RAISE NOTICE 'Deleting data from % to %', v_from_date, v_to_date;

  -- Uncomment the 2 lines for each table you want to clean (date range above):

  -- DELETE FROM public.job_applications WHERE (COALESCE(applied_date, created_at)::date BETWEEN v_from_date AND v_to_date);
  -- GET DIAGNOSTICS v_deleted = ROW_COUNT; RAISE NOTICE 'job_applications: % rows', v_deleted;

  -- DELETE FROM public.job_postings WHERE (COALESCE(posted_date, created_at)::date BETWEEN v_from_date AND v_to_date);
  -- GET DIAGNOSTICS v_deleted = ROW_COUNT; RAISE NOTICE 'job_postings: % rows', v_deleted;

  -- DELETE FROM public.time_cards WHERE date::date BETWEEN v_from_date AND v_to_date;
  -- GET DIAGNOSTICS v_deleted = ROW_COUNT; RAISE NOTICE 'time_cards: % rows', v_deleted;

  -- DELETE FROM public.contact_messages WHERE created_at::date BETWEEN v_from_date AND v_to_date;
  -- GET DIAGNOSTICS v_deleted = ROW_COUNT; RAISE NOTICE 'contact_messages: % rows', v_deleted;

  -- DELETE FROM public.password_reset_tokens WHERE created_at::date BETWEEN v_from_date AND v_to_date;
  -- GET DIAGNOSTICS v_deleted = ROW_COUNT; RAISE NOTICE 'password_reset_tokens: % rows', v_deleted;

  -- DELETE FROM public.password_change_requests WHERE created_at::date BETWEEN v_from_date AND v_to_date;
  -- GET DIAGNOSTICS v_deleted = ROW_COUNT; RAISE NOTICE 'password_change_requests: % rows', v_deleted;

  -- DELETE FROM public.resumes WHERE created_at::date BETWEEN v_from_date AND v_to_date;
  -- GET DIAGNOSTICS v_deleted = ROW_COUNT; RAISE NOTICE 'resumes: % rows', v_deleted;

  -- DELETE FROM public.users WHERE created_at::date BETWEEN v_from_date AND v_to_date;
  -- GET DIAGNOSTICS v_deleted = ROW_COUNT; RAISE NOTICE 'users: % rows', v_deleted;

  -- DELETE FROM public.clients WHERE created_at::date BETWEEN v_from_date AND v_to_date;
  -- GET DIAGNOSTICS v_deleted = ROW_COUNT; RAISE NOTICE 'clients: % rows', v_deleted;

  -- DELETE FROM public.invoices WHERE invoice_date::date BETWEEN v_from_date AND v_to_date;
  -- GET DIAGNOSTICS v_deleted = ROW_COUNT; RAISE NOTICE 'invoices: % rows', v_deleted;

  -- DELETE FROM public.hours_logs WHERE date::date BETWEEN v_from_date AND v_to_date;
  -- GET DIAGNOSTICS v_deleted = ROW_COUNT; RAISE NOTICE 'hours_logs: % rows', v_deleted;

  RAISE NOTICE 'Done.';
END $$;

-- =============================================================================
-- OPTIONAL: Delete ALL data from one table (no date filter)
-- =============================================================================
-- Copy the line below, change TABLE_NAME to your table (e.g. job_postings, time_cards), then run.
-- DELETE FROM public.TABLE_NAME;
