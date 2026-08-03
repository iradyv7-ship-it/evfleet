import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import { BANK_REQUIREMENTS, depositRequirement } from "@/lib/bank-requirements";


export const Route = createFileRoute("/_authenticated/cohorts/$cohortId")({
  head: () => ({
    meta: [
      { title: "Cohort Candidates — UZA Mobility" },
      {
        name: "description",
        content:
          "Review enrolled candidates and the waiting list for a Tunga Taxi training cohort, with full application details.",
      },
      { property: "og:title", content: "Cohort Candidates — UZA Mobility" },
      {
        property: "og:description",
        content: "Enrolled candidates, waiting list and application details for one cohort.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CohortDetail,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-10 text-sm text-destructive">
      {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="p-10">Cohort not found.</div>,
});

type Candidate = Tables<"candidates">;

const STATUSES = ["enrolled", "waitlisted", "rejected", "withdrawn", "graduated"] as const;
const TRAINING = ["not_started", "in_progress", "completed", "failed"] as const;

const DOCS: Array<[keyof Candidate, string]> = BANK_REQUIREMENTS.map((r) => [
  r.key as keyof Candidate,
  r.conditional ? `${r.label} (${r.conditional.toLowerCase()})` : r.label,
]);


function money(v: number | null) {
  return v == null ? "—" : `${Number(v).toLocaleString("en-RW")} RWF`;
}

function CohortDetail() {
  const { cohortId } = Route.useParams();
  const queryClient = useQueryClient();
  const [openId, setOpenId] = useState<string | null>(null);

  const { data, isPending } = useQuery({
    queryKey: ["cohort", cohortId],
    queryFn: async () => {
      const [cohort, candidates] = await Promise.all([
        supabase.from("cohorts").select("*").eq("id", cohortId).maybeSingle(),
        supabase
          .from("candidates")
          .select("*")
          .eq("cohort_id", cohortId)
          .order("waitlist_position", { ascending: true, nullsFirst: true })
          .order("applied_at", { ascending: true }),
      ]);
      if (cohort.error) throw cohort.error;
      if (candidates.error) throw candidates.error;
      return { cohort: cohort.data, candidates: (candidates.data ?? []) as Candidate[] };
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Candidate> }) => {
      const { error } = await supabase.from("candidates").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Candidate updated");
      queryClient.invalidateQueries({ queryKey: ["cohort", cohortId] });
      queryClient.invalidateQueries({ queryKey: ["cohort-overview"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const cohort = data?.cohort;
  const candidates = data?.candidates ?? [];
  const enrolled = candidates.filter((c) => c.status === "enrolled" || c.status === "graduated");
  const waiting = candidates.filter((c) => c.status === "waitlisted");
  const inactive = candidates.filter((c) => c.status === "rejected" || c.status === "withdrawn");

  function Row({ c }: { c: Candidate }) {
    const open = openId === c.id;
    const docsDone = DOCS.filter(([k]) => c[k] === true).length;
    return (
      <Card className="border-border/70 p-4 shadow-soft">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-[190px]">
            <p className="font-display text-sm font-bold">{c.candidate_code}</p>
            <p className="text-sm text-muted-foreground">{c.full_name}</p>
          </div>
          <div className="min-w-[130px] text-sm text-muted-foreground">{c.phone}</div>
          <Badge variant={c.status === "enrolled" ? "default" : "secondary"}>
            {c.status}
            {c.waitlist_position ? ` #${c.waitlist_position}` : ""}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Docs {docsDone}/{DOCS.length}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Select
              value={c.status}
              onValueChange={(v) =>
                update.mutate({ id: c.id, patch: { status: v as Candidate["status"] } })
              }
            >
              <SelectTrigger className="h-9 w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => setOpenId(open ? null : c.id)}>
              {open ? "Hide" : "Details"}
            </Button>
          </div>
        </div>

        {open && (
          <div className="mt-5 grid gap-6 border-t border-border/60 pt-5 md:grid-cols-3">
            <Detail title="Identity">
              <Field label="National ID" value={c.national_id} />
              <Field label="Date of birth" value={c.date_of_birth} />
              <Field label="Gender" value={c.gender} />
              <Field label="Email" value={c.email} />
              <Field
                label="Residence"
                value={[c.district, c.sector, c.cell].filter(Boolean).join(" / ") || null}
              />
              <Field label="Education" value={c.education_level} />
              <Field label="Language" value={c.preferred_language} />
              <Field label="Smartphone" value={c.has_smartphone ? "Yes" : "No"} />
            </Detail>

            <Detail title="Driving">
              <Field label="Licence no." value={c.driving_license_number} />
              <Field label="Categories" value={c.license_categories} />
              <Field label="Issued" value={c.license_issue_date} />
              <Field label="Experience" value={`${c.years_driving_experience ?? "—"} yrs`} />
              <Field label="Association" value={c.taxi_association} />
              <Field label="Current plate" value={c.current_vehicle_plate} />
              <Field label="Driving for" value={c.currently_driving_for} />
            </Detail>

            <Detail title="Financing readiness">
              <Field label="Monthly income" value={money(c.monthly_income_rwf)} />
              <Field label="Daily takings" value={money(c.average_daily_earnings_rwf)} />
              <Field label="Bank" value={c.has_bank_account ? c.bank_name : "No account"} />
              <Field label="Account no." value={c.bank_account_number} />
              <Field
                label="Existing loan"
                value={c.has_existing_loan ? (c.existing_loan_details ?? "Yes") : "None"}
              />
              <Field label="Deposit ready" value={money(c.deposit_available_rwf)} />
              <Field label="UZA Access top-up" value={c.needs_uza_access_support ? "Yes" : "No"} />
              <Field label="Preferred term" value={`${c.preferred_term_years ?? "—"} yrs`} />
              <Field label="Payment route" value={c.preferred_financing} />
            </Detail>

            <Detail title="Bank eligibility">
              <Field label="Marital status" value={c.marital_status} />
              <Field label="Spouse" value={c.spouse_name} />
              <Field
                label="Cooperative"
                value={c.is_cooperative_member ? (c.cooperative_name ?? "Member") : "Not a member"}
              />
              <Field label="Target vehicle price" value={money(c.target_vehicle_price_rwf)} />
              <Field
                label="Deposit required"
                value={
                  c.target_vehicle_price_rwf
                    ? `${money(depositRequirement(Number(c.target_vehicle_price_rwf)).amount)} (${Math.round(
                        depositRequirement(Number(c.target_vehicle_price_rwf)).percent * 100,
                      )}%)`
                    : "—"
                }
              />
              <Field
                label="Collateral offered"
                value={
                  c.offers_collateral
                    ? `${money(c.collateral_value_rwf)} · ${c.collateral_description ?? ""}`
                    : "No"
                }
              />
              <Field
                label="CRB listing"
                value={c.listed_on_crb ? (c.crb_resolution_notes ?? "Listed — must clear") : "Clear"}
              />
              <Field label="Other loan bank" value={c.other_loan_bank} />
              <Field label="Separate repayment source" value={c.other_loan_repayment_source} />
              <Field
                label="Drove for another service"
                value={c.previously_drove_for_service ? "Yes" : "No"}
              />
            </Detail>


            <Detail title="Next of kin & guarantor">
              <Field
                label="Next of kin"
                value={[c.next_of_kin_name, c.next_of_kin_phone, c.next_of_kin_relationship]
                  .filter(Boolean)
                  .join(" · ")}
              />
              <Field
                label="Guarantor"
                value={[c.guarantor_name, c.guarantor_phone, c.guarantor_occupation]
                  .filter(Boolean)
                  .join(" · ")}
              />
            </Detail>

            <Detail title="Documents">
              <div className="space-y-2">
                {DOCS.map(([key, label]) => (
                  <label key={String(key)} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={c[key] === true}
                      onChange={(e) =>
                        update.mutate({
                          id: c.id,
                          patch: { [key]: e.target.checked } as Partial<Candidate>,
                        })
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>
            </Detail>

            <Detail title="Training">
              <div className="space-y-3">
                <Select
                  value={c.training_status}
                  onValueChange={(v) =>
                    update.mutate({
                      id: c.id,
                      patch: { training_status: v as Candidate["training_status"] },
                    })
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRAINING.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Field label="Attendance" value={`${c.attendance_percentage ?? "—"}%`} />
                <Field label="Exam score" value={`${c.exam_score ?? "—"}`} />
                <Field label="Notes" value={c.instructor_notes} />
                <Field label="Applied" value={new Date(c.applied_at).toLocaleDateString()} />
              </div>
            </Detail>
          </div>
        )}
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border/60 bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            ← All cohorts
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10">
        {isPending && <p className="text-sm text-muted-foreground">Loading candidates…</p>}
        {cohort && (
          <>
            <p className="text-eyebrow text-muted-foreground">{cohort.code}</p>
            <h1 className="mt-2 font-display text-3xl font-bold">{cohort.name}</h1>
            <p className="mt-2 text-muted-foreground">
              {enrolled.length} of {cohort.capacity} seats taken · {waiting.length} on the waiting
              list · {cohort.location ?? "Location TBC"}
            </p>

            <Section title={`Enrolled (${enrolled.length})`}>
              {enrolled.map((c) => (
                <Row key={c.id} c={c} />
              ))}
              {enrolled.length === 0 && <Empty>No candidates enrolled yet.</Empty>}
            </Section>

            <Section title={`Waiting list (${waiting.length})`}>
              {waiting.map((c) => (
                <Row key={c.id} c={c} />
              ))}
              {waiting.length === 0 && <Empty>Nobody is waiting for a seat.</Empty>}
            </Section>

            {inactive.length > 0 && (
              <Section title={`Rejected / withdrawn (${inactive.length})`}>
                {inactive.map((c) => (
                  <Row key={c.id} c={c} />
                ))}
              </Section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-eyebrow text-muted-foreground">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

function Detail({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-eyebrow text-muted-foreground">{title}</h3>
      <div className="mt-3 space-y-1.5">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <p className="text-sm">
      <span className="text-muted-foreground">{label}: </span>
      <span className="font-medium">{value === "" || value == null ? "—" : value}</span>
    </p>
  );
}
