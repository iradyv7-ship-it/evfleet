import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { StaffNav, useMyRole } from "@/components/staff-nav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { formatRwf } from "@/lib/financing";
import {
  PROGRAMS,
  programLabel,
  useInstitutions,
  type DepositTier,
  type Institution,
  type RateTier,
} from "@/lib/institutions";

export const Route = createFileRoute("/_authenticated/institutions")({
  head: () => ({
    meta: [
      { title: "Financing Institutions — UZA Mobility" },
      {
        name: "description",
        content:
          "Configure each partner bank's own loan formula: interest tiers, deposit tiers, fees, collateral rules and which programme they receive applicants from.",
      },
      { property: "og:title", content: "Financing Institutions — UZA Mobility" },
      {
        property: "og:description",
        content: "Partner banks set their own rates, deposits and collateral rules.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InstitutionsPage,
});

type Draft = Omit<Institution, "id"> & { id?: string };

const BLANK: Draft = {
  name: "",
  code: "",
  target_program: "tunga_taxi",
  is_default_for_program: false,
  is_active: true,
  rate_tiers: [{ max_years: 3, annual_rate: 0.2 }],
  deposit_tiers: [{ max_price_rwf: null, percent: 0.1 }],
  min_client_contribution_rwf: 500_000,
  collateral_percent: 0.3,
  equity_release_percent: 0.9,
  min_term_years: 1,
  max_term_years: 5,
  processing_fee_percent: 0,
  insurance_percent_per_year: 0,
  supports_uza_access_topup: true,
  notes: "",
};

function InstitutionsPage() {
  const { data: role } = useMyRole();
  const isAdmin = role === "admin";
  const { data: institutions, isLoading } = useInstitutions({ activeOnly: false });
  const [draft, setDraft] = useState<Draft | null>(null);
  const queryClient = useQueryClient();

  const save = useMutation({
    mutationFn: async (d: Draft) => {
      const payload = {
        name: d.name.trim(),
        code: d.code.trim().toUpperCase(),
        target_program: d.target_program,
        is_default_for_program: d.is_default_for_program,
        is_active: d.is_active,
        rate_tiers: d.rate_tiers as unknown as never,
        deposit_tiers: d.deposit_tiers as unknown as never,
        min_client_contribution_rwf: d.min_client_contribution_rwf,
        collateral_percent: d.collateral_percent,
        equity_release_percent: d.equity_release_percent,
        min_term_years: d.min_term_years,
        max_term_years: d.max_term_years,
        processing_fee_percent: d.processing_fee_percent,
        insurance_percent_per_year: d.insurance_percent_per_year,
        supports_uza_access_topup: d.supports_uza_access_topup,
        notes: d.notes || null,
      };
      const query = d.id
        ? supabase.from("financing_institutions").update(payload).eq("id", d.id)
        : supabase.from("financing_institutions").insert(payload);
      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => {
      setDraft(null);
      queryClient.invalidateQueries({ queryKey: ["financing-institutions"] });
    },
  });

  return (
    <div className="min-h-screen bg-muted/30">
      <StaffNav />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-eyebrow text-muted-foreground">Partnerships</p>
            <h1 className="mt-1 font-display text-3xl font-bold">Financing institutions</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Each partner bank sets its own formula. Applicants in a programme are routed
              automatically to that programme&rsquo;s default lender — Tunga Taxi drivers go to
              Unguka Bank, other segments to their own institution.
            </p>
          </div>
          {isAdmin && (
            <Button onClick={() => setDraft({ ...BLANK })}>Add institution</Button>
          )}
        </div>

        {!isAdmin && (
          <p className="mt-4 rounded-lg border border-border/70 bg-background p-4 text-sm text-muted-foreground">
            Read-only view. Only administrators can change lender formulas.
          </p>
        )}

        {draft && isAdmin && (
          <InstitutionForm
            draft={draft}
            setDraft={setDraft}
            onCancel={() => setDraft(null)}
            onSave={() => save.mutate(draft)}
            saving={save.isPending}
            error={save.error instanceof Error ? save.error.message : null}
          />
        )}

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {(institutions ?? []).map((inst) => (
            <Card key={inst.id} className="border-border/70 p-6 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg font-semibold">{inst.name}</h2>
                    <Badge variant="secondary">{inst.code}</Badge>
                    {inst.is_default_for_program && <Badge>Default lender</Badge>}
                    {!inst.is_active && <Badge variant="outline">Inactive</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Receives {programLabel(inst.target_program)} applicants
                  </p>
                </div>
                {isAdmin && (
                  <Button variant="outline" size="sm" onClick={() => setDraft({ ...inst })}>
                    Edit formula
                  </Button>
                )}
              </div>

              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-eyebrow text-muted-foreground">Interest tiers</dt>
                  <dd className="mt-1 space-y-0.5">
                    {inst.rate_tiers.map((t, i) => (
                      <p key={i}>
                        up to {t.max_years} yr · {(t.annual_rate * 100).toFixed(1)}%
                      </p>
                    ))}
                  </dd>
                </div>
                <div>
                  <dt className="text-eyebrow text-muted-foreground">Deposit tiers</dt>
                  <dd className="mt-1 space-y-0.5">
                    {inst.deposit_tiers.map((t, i) => (
                      <p key={i}>
                        {t.max_price_rwf
                          ? `up to ${formatRwf(t.max_price_rwf, { compact: true })}`
                          : "above that"}{" "}
                        · {(t.percent * 100).toFixed(0)}%
                      </p>
                    ))}
                  </dd>
                </div>
                <div>
                  <dt className="text-eyebrow text-muted-foreground">Minimum contribution</dt>
                  <dd className="mt-1">{formatRwf(inst.min_client_contribution_rwf)}</dd>
                </div>
                <div>
                  <dt className="text-eyebrow text-muted-foreground">Collateral / equity</dt>
                  <dd className="mt-1">
                    &gt;{(inst.collateral_percent * 100).toFixed(0)}% of value · released at{" "}
                    {(inst.equity_release_percent * 100).toFixed(0)}%
                  </dd>
                </div>
                <div>
                  <dt className="text-eyebrow text-muted-foreground">Fees</dt>
                  <dd className="mt-1">
                    {(inst.processing_fee_percent * 100).toFixed(1)}% processing ·{" "}
                    {(inst.insurance_percent_per_year * 100).toFixed(1)}% insurance/yr
                  </dd>
                </div>
                <div>
                  <dt className="text-eyebrow text-muted-foreground">UZA Access top-up</dt>
                  <dd className="mt-1">
                    {inst.supports_uza_access_topup ? "Accepted" : "Not accepted"} ·{" "}
                    {inst.min_term_years}–{inst.max_term_years} yr terms
                  </dd>
                </div>
              </dl>

              {inst.notes && (
                <p className="mt-4 text-sm text-muted-foreground">{inst.notes}</p>
              )}
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

function InstitutionForm({
  draft,
  setDraft,
  onCancel,
  onSave,
  saving,
  error,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  error: string | null;
}) {
  const set = (patch: Partial<Draft>) => setDraft({ ...draft, ...patch });
  const setRate = (i: number, patch: Partial<RateTier>) =>
    set({ rate_tiers: draft.rate_tiers.map((t, x) => (x === i ? { ...t, ...patch } : t)) });
  const setDeposit = (i: number, patch: Partial<DepositTier>) =>
    set({ deposit_tiers: draft.deposit_tiers.map((t, x) => (x === i ? { ...t, ...patch } : t)) });

  return (
    <Card className="mt-6 border-border/70 p-6 shadow-soft">
      <h2 className="font-display text-lg font-semibold">
        {draft.id ? `Edit ${draft.name}` : "New financing institution"}
      </h2>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Bank name">
          <Input value={draft.name} onChange={(e) => set({ name: e.target.value })} />
        </Field>
        <Field label="Short code">
          <Input value={draft.code} onChange={(e) => set({ code: e.target.value })} />
        </Field>
        <Field label="Receives applicants from">
          <select
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={draft.target_program}
            onChange={(e) => set({ target_program: e.target.value })}
          >
            {PROGRAMS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Minimum client contribution (RWF)">
          <Input
            type="number"
            value={draft.min_client_contribution_rwf}
            onChange={(e) => set({ min_client_contribution_rwf: Number(e.target.value) })}
          />
        </Field>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <p className="text-eyebrow text-muted-foreground">Interest tiers</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              set({ rate_tiers: [...draft.rate_tiers, { max_years: 5, annual_rate: 0.2 }] })
            }
          >
            Add tier
          </Button>
        </div>
        <div className="mt-3 space-y-2">
          {draft.rate_tiers.map((t, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Terms up to</span>
              <Input
                className="w-20"
                type="number"
                value={t.max_years}
                onChange={(e) => setRate(i, { max_years: Number(e.target.value) })}
              />
              <span className="text-muted-foreground">years at</span>
              <Input
                className="w-24"
                type="number"
                step="0.1"
                value={(t.annual_rate * 100).toFixed(1)}
                onChange={(e) => setRate(i, { annual_rate: Number(e.target.value) / 100 })}
              />
              <span className="text-muted-foreground">% per year</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => set({ rate_tiers: draft.rate_tiers.filter((_, x) => x !== i) })}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <p className="text-eyebrow text-muted-foreground">Deposit tiers</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              set({
                deposit_tiers: [...draft.deposit_tiers, { max_price_rwf: null, percent: 0.15 }],
              })
            }
          >
            Add tier
          </Button>
        </div>
        <div className="mt-3 space-y-2">
          {draft.deposit_tiers.map((t, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Vehicles up to</span>
              <Input
                className="w-36"
                type="number"
                placeholder="no limit"
                value={t.max_price_rwf ?? ""}
                onChange={(e) =>
                  setDeposit(i, {
                    max_price_rwf: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
              />
              <span className="text-muted-foreground">RWF need</span>
              <Input
                className="w-20"
                type="number"
                value={(t.percent * 100).toFixed(0)}
                onChange={(e) => setDeposit(i, { percent: Number(e.target.value) / 100 })}
              />
              <span className="text-muted-foreground">% deposit</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  set({ deposit_tiers: draft.deposit_tiers.filter((_, x) => x !== i) })
                }
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Field label="Collateral (% of value)">
          <Input
            type="number"
            value={(draft.collateral_percent * 100).toFixed(0)}
            onChange={(e) => set({ collateral_percent: Number(e.target.value) / 100 })}
          />
        </Field>
        <Field label="Collateral released at (% equity)">
          <Input
            type="number"
            value={(draft.equity_release_percent * 100).toFixed(0)}
            onChange={(e) => set({ equity_release_percent: Number(e.target.value) / 100 })}
          />
        </Field>
        <Field label="Processing fee (%)">
          <Input
            type="number"
            step="0.1"
            value={(draft.processing_fee_percent * 100).toFixed(1)}
            onChange={(e) => set({ processing_fee_percent: Number(e.target.value) / 100 })}
          />
        </Field>
        <Field label="Insurance per year (%)">
          <Input
            type="number"
            step="0.1"
            value={(draft.insurance_percent_per_year * 100).toFixed(1)}
            onChange={(e) => set({ insurance_percent_per_year: Number(e.target.value) / 100 })}
          />
        </Field>
        <Field label="Minimum term (years)">
          <Input
            type="number"
            value={draft.min_term_years}
            onChange={(e) => set({ min_term_years: Number(e.target.value) })}
          />
        </Field>
        <Field label="Maximum term (years)">
          <Input
            type="number"
            value={draft.max_term_years}
            onChange={(e) => set({ max_term_years: Number(e.target.value) })}
          />
        </Field>
      </div>

      <div className="mt-5 flex flex-wrap gap-6 text-sm">
        <Toggle
          label="Default lender for this programme"
          checked={draft.is_default_for_program}
          onChange={(v) => set({ is_default_for_program: v })}
        />
        <Toggle
          label="Accepts UZA Access deposit top-up"
          checked={draft.supports_uza_access_topup}
          onChange={(v) => set({ supports_uza_access_topup: v })}
        />
        <Toggle label="Active" checked={draft.is_active} onChange={(v) => set({ is_active: v })} />
      </div>

      <Field label="Notes" className="mt-5">
        <Input value={draft.notes ?? ""} onChange={(e) => set({ notes: e.target.value })} />
      </Field>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-6 flex gap-3">
        <Button onClick={onSave} disabled={saving || !draft.name || !draft.code}>
          {saving ? "Saving…" : "Save formula"}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Card>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-input"
      />
      <span>{label}</span>
    </label>
  );
}
