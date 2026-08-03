
CREATE TABLE public.financing_institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  target_program text NOT NULL DEFAULT 'tunga_taxi',
  is_default_for_program boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  -- [{ "max_years": 3, "annual_rate": 0.34 }, ...]
  rate_tiers jsonb NOT NULL DEFAULT '[{"max_years":3,"annual_rate":0.34},{"max_years":5,"annual_rate":0.36}]'::jsonb,
  -- [{ "max_price_rwf": 25000000, "percent": 0.10 }, ...]
  deposit_tiers jsonb NOT NULL DEFAULT '[{"max_price_rwf":25000000,"percent":0.10},{"max_price_rwf":null,"percent":0.15}]'::jsonb,
  min_client_contribution_rwf numeric NOT NULL DEFAULT 500000,
  collateral_percent numeric NOT NULL DEFAULT 0.30,
  equity_release_percent numeric NOT NULL DEFAULT 0.90,
  min_term_years integer NOT NULL DEFAULT 1,
  max_term_years integer NOT NULL DEFAULT 5,
  processing_fee_percent numeric NOT NULL DEFAULT 0,
  insurance_percent_per_year numeric NOT NULL DEFAULT 0,
  supports_uza_access_topup boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.financing_institutions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.financing_institutions TO authenticated;
GRANT ALL ON public.financing_institutions TO service_role;

ALTER TABLE public.financing_institutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY institutions_public_read ON public.financing_institutions
  FOR SELECT TO anon USING (is_active);
CREATE POLICY institutions_staff_read ON public.financing_institutions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY institutions_admin_write ON public.financing_institutions
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_financing_institutions_updated_at
  BEFORE UPDATE ON public.financing_institutions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE UNIQUE INDEX financing_institutions_default_per_program
  ON public.financing_institutions (target_program)
  WHERE is_default_for_program;

INSERT INTO public.financing_institutions
  (name, code, target_program, is_default_for_program, rate_tiers, deposit_tiers,
   min_client_contribution_rwf, collateral_percent, min_term_years, max_term_years,
   processing_fee_percent, insurance_percent_per_year, supports_uza_access_topup, notes)
VALUES
  ('Unguka Bank', 'UNGUKA', 'tunga_taxi', true,
   '[{"max_years":3,"annual_rate":0.34},{"max_years":5,"annual_rate":0.36}]'::jsonb,
   '[{"max_price_rwf":25000000,"percent":0.10},{"max_price_rwf":null,"percent":0.15}]'::jsonb,
   500000, 0.30, 1, 5, 0.02, 0.04, true,
   'Default lender for Tunga Taxi taxi-driver EV ownership. Reducing balance, collateral released at 90% equity.'),
  ('NCBA Rwanda', 'NCBA', 'fleet_partners', true,
   '[{"max_years":2,"annual_rate":0.19},{"max_years":4,"annual_rate":0.21},{"max_years":6,"annual_rate":0.23}]'::jsonb,
   '[{"max_price_rwf":40000000,"percent":0.20},{"max_price_rwf":null,"percent":0.25}]'::jsonb,
   2000000, 0.35, 1, 6, 0.015, 0.035, false,
   'Fleet and corporate partners. Higher deposit, lower rate, no UZA Access top-up.'),
  ('Bank of Kigali', 'BK', 'individual_buyers', true,
   '[{"max_years":3,"annual_rate":0.16},{"max_years":5,"annual_rate":0.18}]'::jsonb,
   '[{"max_price_rwf":null,"percent":0.20}]'::jsonb,
   3000000, 0.40, 1, 5, 0.01, 0.03, false,
   'Salaried individual buyers with payroll deduction.');
