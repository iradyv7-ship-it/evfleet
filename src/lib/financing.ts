// Financing math for the UZA Mobility driver EV ownership program.
// Bank is always the lender. Rates are nominal annual, reducing balance.
// Every parameter can be overridden per financing institution.

import {
  FALLBACK_INSTITUTION,
  rateForTerm,
  type Institution,
} from "@/lib/institutions";

export const MIN_CLIENT_CONTRIBUTION_RWF = 500_000;

/** Unguka indicative pricing: 34%/yr for 1-3 year terms, 36%/yr for 4-5 years. */
export function annualRateForTerm(years: number): number {
  return years <= 3 ? 0.34 : 0.36;
}

export interface FinancingInput {
  vehicleCost: number;
  /** Share of vehicle cost the client puts down, 0-1 (e.g. 0.1 for 10%). */
  depositPercent: number;
  termYears: number;
  /** Lender whose formula applies. Defaults to the Unguka/Tunga Taxi terms. */
  institution?: Institution;
}

export interface FinancingResult {
  vehicleCost: number;
  clientDeposit: number;
  uzaAccessTopUp: number;
  principal: number;
  annualRate: number;
  monthlyPayment: number;
  dailyPayment: number;
  totalRepaid: number;
  totalInterest: number;
  months: number;
  processingFee: number;
  annualInsurance: number;
  monthlyAllIn: number;
  minClientContribution: number;
  /** Month at which cumulative principal repaid reaches the release threshold. */
  equityReleaseMonth: number | null;
  equityReleasePercent: number;
}

function amortize(principal: number, annualRate: number, months: number) {
  const r = annualRate / 12;
  const monthly =
    r === 0 ? principal / months : (principal * r) / (1 - Math.pow(1 + r, -months));
  const schedule: number[] = [];
  let balance = principal;
  let cumulativePrincipal = 0;
  for (let m = 1; m <= months; m++) {
    const interest = balance * r;
    const principalPart = monthly - interest;
    balance -= principalPart;
    cumulativePrincipal += principalPart;
    schedule.push(cumulativePrincipal);
  }
  return { monthly, schedule };
}

export function computeFinancing({
  vehicleCost,
  depositPercent,
  termYears,
  institution = FALLBACK_INSTITUTION,
}: FinancingInput): FinancingResult {
  const months = Math.round(termYears * 12);
  const annualRate = rateForTerm(institution, termYears);
  const minContribution = institution.min_client_contribution_rwf;
  const requiredDeposit = vehicleCost * depositPercent;
  const clientDeposit = Math.min(requiredDeposit, Math.max(minContribution, requiredDeposit));
  const uzaAccessTopUp = institution.supports_uza_access_topup
    ? Math.max(0, requiredDeposit - clientDeposit)
    : 0;
  const principal = Math.max(0, vehicleCost - requiredDeposit);

  const { monthly, schedule } = amortize(principal, annualRate, months);
  const target = vehicleCost * institution.equity_release_percent - requiredDeposit;
  let equityReleaseMonth: number | null = null;
  for (let i = 0; i < schedule.length; i++) {
    if ((schedule[i] ?? 0) >= target) {
      equityReleaseMonth = i + 1;
      break;
    }
  }

  const totalRepaid = monthly * months;
  const processingFee = principal * institution.processing_fee_percent;
  const annualInsurance = vehicleCost * institution.insurance_percent_per_year;
  return {
    vehicleCost,
    clientDeposit,
    uzaAccessTopUp,
    principal,
    annualRate,
    monthlyPayment: monthly,
    dailyPayment: (monthly * 12) / 365,
    totalRepaid,
    totalInterest: totalRepaid - principal,
    months,
    processingFee,
    annualInsurance,
    monthlyAllIn: monthly + annualInsurance / 12,
    minClientContribution: minContribution,
    equityReleaseMonth,
    equityReleasePercent: institution.equity_release_percent,
  };
}

/** Cash-buyer and split-payment incentives. */
export const CASH_DISCOUNT = 0.03;
export const SPLIT_DISCOUNT = 0.015;

export function formatRwf(value: number, opts: { compact?: boolean } = {}): string {
  if (opts.compact && value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 1 : 2)}M RWF`;
  }
  return `${Math.round(value).toLocaleString("en-US")} RWF`;
}
