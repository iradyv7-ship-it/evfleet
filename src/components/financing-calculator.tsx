import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { computeFinancing, formatRwf } from "@/lib/financing";
import {
  FALLBACK_INSTITUTION,
  PROGRAMS,
  depositPercentFor,
  institutionForProgram,
  useInstitutions,
  type Institution,
} from "@/lib/institutions";

export function FinancingCalculator() {
  const { data: institutions } = useInstitutions();
  const [program, setProgram] = useState("tunga_taxi");
  const [vehicleCost, setVehicleCost] = useState(15_000_000);
  const [depositPercent, setDepositPercent] = useState(10);
  const [termYears, setTermYears] = useState(3);

  const list = institutions ?? [];
  const routed: Institution =
    institutionForProgram(list, program) ?? list[0] ?? FALLBACK_INSTITUTION;

  const requiredPercent = Math.round(depositPercentFor(routed, vehicleCost) * 100);

  // Follow the lender's required deposit and term window when routing changes.
  useEffect(() => {
    setDepositPercent(requiredPercent);
  }, [requiredPercent]);

  useEffect(() => {
    setTermYears((t) => Math.min(Math.max(t, routed.min_term_years), routed.max_term_years));
  }, [routed.min_term_years, routed.max_term_years]);

  const terms = useMemo(() => {
    const out: number[] = [];
    for (let y = routed.min_term_years; y <= routed.max_term_years; y++) out.push(y);
    return out;
  }, [routed.min_term_years, routed.max_term_years]);

  const result = useMemo(
    () =>
      computeFinancing({
        vehicleCost,
        depositPercent: depositPercent / 100,
        termYears,
        institution: routed,
      }),
    [vehicleCost, depositPercent, termYears, routed],
  );

  const belowRequired = depositPercent < requiredPercent;

  return (
    <Card className="grid gap-0 overflow-hidden border-border/70 p-0 shadow-lift md:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-8 p-6 md:p-8">
        <div>
          <p className="text-eyebrow text-muted-foreground">Who is buying</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {PROGRAMS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setProgram(p.value)}
                className={`rounded-full border px-4 py-2 font-display text-sm font-medium transition-colors ${
                  program === p.value
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Routed to{" "}
            <span className="font-medium text-foreground">{routed.name}</span> ·{" "}
            {requiredPercent}% deposit required at this price.
          </p>
        </div>

        <div>
          <p className="text-eyebrow text-muted-foreground">Vehicle cost</p>
          <p className="mt-1 font-display text-3xl font-semibold">
            {formatRwf(vehicleCost, { compact: true })}
          </p>
          <Slider
            className="mt-4"
            value={[vehicleCost]}
            min={8_000_000}
            max={35_000_000}
            step={500_000}
            onValueChange={([v]) => setVehicleCost(v ?? vehicleCost)}
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <p className="text-eyebrow text-muted-foreground">Deposit</p>
            <p className="font-display text-lg font-semibold">{depositPercent}%</p>
          </div>
          <Slider
            className="mt-4"
            value={[depositPercent]}
            min={0}
            max={40}
            step={1}
            onValueChange={([v]) => setDepositPercent(v ?? depositPercent)}
          />
          <p className="mt-3 text-sm text-muted-foreground">
            Driver pays {formatRwf(result.clientDeposit)}
            {result.uzaAccessTopUp > 0 ? (
              <>
                {" · "}
                <span className="font-medium text-foreground">
                  UZA Access tops up {formatRwf(result.uzaAccessTopUp)}
                </span>
              </>
            ) : null}
            {belowRequired ? (
              <>
                {" · "}
                <span className="font-medium text-foreground">
                  below {routed.name}&rsquo;s {requiredPercent}% — pledge collateral above{" "}
                  {formatRwf(vehicleCost * routed.collateral_percent, { compact: true })}
                </span>
              </>
            ) : null}
          </p>
        </div>

        <div>
          <p className="text-eyebrow text-muted-foreground">Repayment term</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {terms.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTermYears(t)}
                className={`rounded-full border px-4 py-2 font-display text-sm font-medium transition-colors ${
                  termYears === t
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                {t} yr
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {routed.name} interest {(result.annualRate * 100).toFixed(0)}% per year, reducing
            balance.
          </p>
        </div>
      </div>

      <div className="surface-hero space-y-6 p-6 md:p-8">
        <div>
          <p className="text-eyebrow opacity-70">What the driver pays</p>
          <p className="mt-2 font-display text-5xl font-bold tracking-tight">
            {Math.round(result.dailyPayment).toLocaleString("en-US")}
          </p>
          <p className="text-sm opacity-80">RWF per day for {result.months} months</p>
        </div>

        <dl className="space-y-3 border-t border-white/15 pt-5 text-sm">
          <Row label="Monthly instalment" value={formatRwf(result.monthlyPayment)} />
          <Row label="Bank finances" value={formatRwf(result.principal)} />
          <Row label="Total interest" value={formatRwf(result.totalInterest)} />
          {result.processingFee > 0 && (
            <Row label="Processing fee" value={formatRwf(result.processingFee)} />
          )}
          {result.annualInsurance > 0 && (
            <Row label="Insurance per year" value={formatRwf(result.annualInsurance)} />
          )}
          <Row
            label={`Collateral released at ${Math.round(result.equityReleasePercent * 100)}% equity`}
            value={
              result.equityReleaseMonth
                ? `Month ${result.equityReleaseMonth} of ${result.months}`
                : "After final instalment"
            }
          />
        </dl>

        <Badge className="surface-volt border-transparent font-display text-xs font-semibold">
          Minimum contribution {formatRwf(result.minClientContribution)}
        </Badge>

        <p className="text-xs leading-relaxed opacity-70">
          Indicative only. {routed.name} remains the lender and sets final terms
          {routed.supports_uza_access_topup
            ? "; UZA Access support is subject to agreement per institution."
            : "; this lender does not accept UZA Access deposit top-ups."}
        </p>
      </div>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <dt className="opacity-75">{label}</dt>
      <dd className="text-right font-display font-semibold">{value}</dd>
    </div>
  );
}
