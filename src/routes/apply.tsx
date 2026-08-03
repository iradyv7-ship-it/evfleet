import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { depositRequirement } from "@/lib/bank-requirements";
import { formatRwf } from "@/lib/financing";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/apply")({
  head: () => ({
    meta: [
      { title: "Apply for Tunga Taxi Training — UZA Mobility" },
      {
        name: "description",
        content:
          "Apply for the Tunga Taxi EV ownership training in Rwanda. 30 seats per cohort; later applicants join the waiting list and get a permanent candidate ID.",
      },
      { property: "og:title", content: "Apply for Tunga Taxi Training — UZA Mobility" },
      {
        property: "og:description",
        content:
          "Call for applications: 30 seats per cohort, automatic waiting list, permanent candidate ID for training, documents and financing.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ApplyPage,
});

const schema = z.object({
  cohort_id: z.string().uuid({ message: "Choose a cohort" }),
  full_name: z.string().trim().min(2, "Enter your full name").max(120),
  national_id: z.string().trim().min(5, "Enter your national ID").max(32),
  date_of_birth: z.string().min(1, "Enter your date of birth"),
  gender: z.string().min(1, "Select your gender"),
  phone: z.string().trim().min(9, "Enter a valid phone number").max(20),
  email: z.string().trim().email("Invalid email").max(255).or(z.literal("")),
  district: z.string().trim().min(2, "Enter your district").max(60),
  sector: z.string().trim().max(60),
  cell: z.string().trim().max(60),
  education_level: z.string().max(60),
  preferred_language: z.string().max(40),
  driving_license_number: z.string().trim().min(3, "Enter your licence number").max(40),
  license_categories: z.string().trim().max(40),
  license_issue_date: z.string(),
  years_driving_experience: z.coerce.number().min(0).max(60),
  taxi_association: z.string().trim().max(120),
  current_vehicle_plate: z.string().trim().max(20),
  currently_driving_for: z.string().trim().max(120),
  monthly_income_rwf: z.coerce.number().min(0),
  average_daily_earnings_rwf: z.coerce.number().min(0),
  bank_name: z.string().trim().max(80),
  bank_account_number: z.string().trim().max(40),
  existing_loan_details: z.string().trim().max(300),
  deposit_available_rwf: z.coerce.number().min(0),
  preferred_term_years: z.coerce.number().min(1).max(5),
  preferred_financing: z.string().max(60),
  next_of_kin_name: z.string().trim().max(120),
  next_of_kin_phone: z.string().trim().max(20),
  next_of_kin_relationship: z.string().trim().max(60),
  guarantor_name: z.string().trim().max(120),
  guarantor_phone: z.string().trim().max(20),
  guarantor_occupation: z.string().trim().max(80),
  marital_status: z.string().min(1, "Select your marital status"),
  spouse_name: z.string().trim().max(120),
  cooperative_name: z.string().trim().max(120),
  target_vehicle_price_rwf: z.coerce.number().min(0),
  collateral_description: z.string().trim().max(300),
  collateral_value_rwf: z.coerce.number().min(0),
  crb_resolution_notes: z.string().trim().max(300),
  other_loan_bank: z.string().trim().max(120),
  other_loan_repayment_source: z.string().trim().max(300),
});

const initial = {
  cohort_id: "",
  full_name: "",
  national_id: "",
  date_of_birth: "",
  gender: "",
  phone: "",
  email: "",
  district: "",
  sector: "",
  cell: "",
  education_level: "",
  preferred_language: "Kinyarwanda",
  has_smartphone: false,
  driving_license_number: "",
  license_categories: "",
  license_issue_date: "",
  years_driving_experience: "",
  taxi_association: "",
  current_vehicle_plate: "",
  currently_driving_for: "",
  monthly_income_rwf: "",
  average_daily_earnings_rwf: "",
  has_bank_account: false,
  bank_name: "",
  bank_account_number: "",
  has_existing_loan: false,
  existing_loan_details: "",
  deposit_available_rwf: "",
  needs_uza_access_support: false,
  preferred_term_years: "3",
  preferred_financing: "Bank financed",
  next_of_kin_name: "",
  next_of_kin_phone: "",
  next_of_kin_relationship: "",
  guarantor_name: "",
  guarantor_phone: "",
  guarantor_occupation: "",
  marital_status: "",
  spouse_name: "",
  is_cooperative_member: false,
  cooperative_name: "",
  target_vehicle_price_rwf: "",
  offers_collateral: false,
  collateral_description: "",
  collateral_value_rwf: "",
  listed_on_crb: false,
  crb_resolution_notes: "",
  other_loan_bank: "",
  other_loan_repayment_source: "",
  previously_drove_for_service: false,
};

type FormState = typeof initial;
type Errors = Partial<Record<string, string>>;

const STEPS = [
  {
    title: "Cohort",
    blurb: "Pick the training intake you want to join.",
    fields: ["cohort_id"],
  },
  {
    title: "About you",
    blurb: "Your identity and where we can reach you.",
    fields: [
      "full_name",
      "national_id",
      "date_of_birth",
      "gender",
      "phone",
      "email",
      "district",
      "sector",
      "cell",
      "education_level",
      "preferred_language",
    ],
  },
  {
    title: "Driving",
    blurb: "Your licence and experience behind the wheel.",
    fields: [
      "driving_license_number",
      "license_categories",
      "license_issue_date",
      "years_driving_experience",
      "taxi_association",
      "current_vehicle_plate",
      "currently_driving_for",
    ],
  },
  {
    title: "Income",
    blurb: "What you earn and what you can put down today.",
    fields: [
      "monthly_income_rwf",
      "average_daily_earnings_rwf",
      "bank_name",
      "bank_account_number",
      "existing_loan_details",
      "deposit_available_rwf",
      "preferred_term_years",
      "preferred_financing",
    ],
  },
  {
    title: "Bank checks",
    blurb: "What Unguka needs before approving a vehicle loan.",
    fields: [
      "marital_status",
      "spouse_name",
      "cooperative_name",
      "target_vehicle_price_rwf",
      "collateral_value_rwf",
      "collateral_description",
      "crb_resolution_notes",
      "other_loan_bank",
      "other_loan_repayment_source",
    ],
  },
  {
    title: "References",
    blurb: "Someone who can vouch for you.",
    fields: [
      "next_of_kin_name",
      "next_of_kin_phone",
      "next_of_kin_relationship",
      "guarantor_name",
      "guarantor_phone",
      "guarantor_occupation",
    ],
  },
] as const;

function ApplyPage() {
  const [form, setForm] = useState<FormState>(initial);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ code: string; status: string; position: number | null } | null>(
    null,
  );

  const { data: cohorts } = useQuery({
    queryKey: ["open-cohorts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cohorts")
        .select("id,name,code,capacity,location,start_date,partner_bank")
        .eq("applications_open", true)
        .order("start_date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (e[key as string] ? { ...e, [key as string]: undefined } : e));
  }

  function collectErrors(fields: readonly string[]): Errors {
    const parsed = schema.safeParse(form);
    if (parsed.success) return {};
    const out: Errors = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (fields.includes(key) && !out[key]) out[key] = issue.message;
    }
    return out;
  }

  function goNext() {
    const found = collectErrors(STEPS[step]!.fields);
    if (Object.keys(found).length) {
      setErrors(found);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (step < STEPS.length - 1) {
      goNext();
      return;
    }
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const firstBadStep = STEPS.findIndex((s) =>
        parsed.error.issues.some((i) => s.fields.includes(String(i.path[0]) as never)),
      );
      if (firstBadStep >= 0) {
        setStep(firstBadStep);
        setErrors(collectErrors(STEPS[firstBadStep]!.fields));
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setBusy(true);
    try {
      const v = parsed.data;
      const { data, error } = await supabase
        .from("candidates")
        .insert({
          ...v,
          candidate_code: "",
          email: v.email || null,
          license_issue_date: v.license_issue_date || null,
          has_smartphone: form.has_smartphone,
          has_bank_account: form.has_bank_account,
          has_existing_loan: form.has_existing_loan,
          needs_uza_access_support: form.needs_uza_access_support,
          is_cooperative_member: form.is_cooperative_member,
          offers_collateral: form.offers_collateral,
          listed_on_crb: form.listed_on_crb,
          previously_drove_for_service: form.previously_drove_for_service,
        })
        .select("candidate_code,status,waitlist_position")
        .single();
      if (error) throw error;
      setResult({
        code: data.candidate_code,
        status: data.status,
        position: data.waitlist_position,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not submit application";
      toast.error(
        msg.includes("duplicate") ? "You have already applied to this cohort." : msg,
      );
    } finally {
      setBusy(false);
    }
  }

  const deposit = useMemo(() => {
    const price = Number(form.target_vehicle_price_rwf);
    return price > 0 ? depositRequirement(price) : null;
  }, [form.target_vehicle_price_rwf]);

  if (result) {
    const enrolled = result.status === "enrolled";
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 px-5 py-16">
        <Card className="w-full max-w-lg border-border/70 p-8 shadow-soft">
          <p className="text-eyebrow text-muted-foreground">Application received</p>
          <h1 className="mt-2 font-display text-2xl font-bold">
            {enrolled ? "You have a seat in this cohort." : "You are on the waiting list."}
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            {enrolled
              ? "Your instructor will contact you with the training schedule and document checklist."
              : `You are number ${result.position} in the queue. If an enrolled candidate is disqualified or withdraws, the next person on the list is moved into the free seat automatically.`}
          </p>
          <div className="mt-6 rounded-lg border border-border/70 bg-muted/50 p-5">
            <p className="text-eyebrow text-muted-foreground">Your permanent candidate ID</p>
            <p className="mt-1 font-display text-2xl font-bold">{result.code}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Keep this number. It follows you through training, documents, financing and vehicle
              allocation.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link to="/">Back to home</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/requirements">See what documents to prepare</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const current = STEPS[step]!;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="min-h-screen bg-muted/30 pb-28">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <Link to="/" className="font-display text-lg font-bold tracking-tight">
            UZA<span className="text-muted-foreground"> Mobility</span>
          </Link>
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">
            Staff sign in
          </Link>
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} className="h-1 rounded-none" />
      </header>

      <main className="mx-auto max-w-3xl px-5 py-8 md:py-12">
        {step === 0 && (
          <div className="mb-8">
            <p className="text-eyebrow text-muted-foreground">Call for applications</p>
            <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">
              Apply for Tunga Taxi driver training
            </h1>
            <p className="mt-3 text-sm text-muted-foreground md:text-base">
              Takes about 10 minutes. Each Kigali cohort has 30 seats — later applicants join the
              waiting list in order and are promoted automatically when a seat frees up. See the{" "}
              <Link to="/requirements" className="font-medium underline underline-offset-4">
                document checklist
              </Link>{" "}
              before you start.
            </p>
          </div>
        )}

        {/* Step rail */}
        <ol className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-2 text-xs">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 transition-colors",
                  i === step
                    ? "border-primary bg-primary text-primary-foreground"
                    : i < step
                      ? "border-border bg-background text-foreground hover:bg-muted"
                      : "border-border/60 bg-background/40 text-muted-foreground",
                )}
              >
                <span className="font-mono">{i + 1}</span>
                <span className="font-medium">{s.title}</span>
              </button>
            </li>
          ))}
        </ol>

        <form onSubmit={submit} className="space-y-6">
          <Card className="border-border/70 p-5 shadow-soft md:p-7">
            <div className="mb-6">
              <h2 className="font-display text-xl font-semibold">{current.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{current.blurb}</p>
            </div>

            {step === 0 && (
              <Grid>
                <Field
                  className="md:col-span-2"
                  label="Which training cohort?"
                  hint="Only intakes that are currently accepting applications are shown."
                  error={errors.cohort_id}
                >
                  <Select value={form.cohort_id} onValueChange={(v) => set("cohort_id", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a cohort" />
                    </SelectTrigger>
                    <SelectContent>
                      {(cohorts ?? []).map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} · {c.start_date ?? "date TBC"} · {c.capacity} seats
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                {(cohorts ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground md:col-span-2">
                    No cohorts are open right now. Check back soon.
                  </p>
                )}
              </Grid>
            )}

            {step === 1 && (
              <Grid>
                <Text
                  label="Full name"
                  value={form.full_name}
                  onChange={(v) => set("full_name", v)}
                  error={errors.full_name}
                  placeholder="As written on your national ID"
                />
                <Text
                  label="National ID number"
                  value={form.national_id}
                  onChange={(v) => set("national_id", v)}
                  error={errors.national_id}
                  inputMode="numeric"
                />
                <Text
                  label="Date of birth"
                  type="date"
                  value={form.date_of_birth}
                  onChange={(v) => set("date_of_birth", v)}
                  error={errors.date_of_birth}
                />
                <Choice
                  label="Gender"
                  value={form.gender}
                  options={["Male", "Female", "Other"]}
                  onChange={(v) => set("gender", v)}
                  error={errors.gender}
                />
                <Text
                  label="Phone number"
                  value={form.phone}
                  onChange={(v) => set("phone", v)}
                  error={errors.phone}
                  inputMode="tel"
                  placeholder="07XX XXX XXX"
                  hint="We use this number for MTN MoMo checks and training updates."
                />
                <Text
                  label="Email"
                  type="email"
                  optional
                  value={form.email}
                  onChange={(v) => set("email", v)}
                  error={errors.email}
                />
                <Text
                  label="District"
                  value={form.district}
                  onChange={(v) => set("district", v)}
                  error={errors.district}
                />
                <Text label="Sector" optional value={form.sector} onChange={(v) => set("sector", v)} />
                <Text label="Cell" optional value={form.cell} onChange={(v) => set("cell", v)} />
                <Choice
                  label="Highest education"
                  optional
                  value={form.education_level}
                  options={["Primary", "Ordinary level", "Advanced level", "TVET", "University"]}
                  onChange={(v) => set("education_level", v)}
                />
                <Choice
                  label="Preferred language"
                  value={form.preferred_language}
                  options={["Kinyarwanda", "English", "French", "Swahili"]}
                  onChange={(v) => set("preferred_language", v)}
                />
                <Check
                  className="md:col-span-2"
                  label="I own a smartphone"
                  hint="Needed for the driver app, trip records and payment reminders."
                  checked={form.has_smartphone}
                  onChange={(v) => set("has_smartphone", v)}
                />
              </Grid>
            )}

            {step === 2 && (
              <Grid>
                <Text
                  label="Driving licence number"
                  value={form.driving_license_number}
                  onChange={(v) => set("driving_license_number", v)}
                  error={errors.driving_license_number}
                />
                <Text
                  label="Licence categories"
                  optional
                  placeholder="e.g. B, D"
                  value={form.license_categories}
                  onChange={(v) => set("license_categories", v)}
                />
                <Text
                  label="Licence issue date"
                  type="date"
                  optional
                  value={form.license_issue_date}
                  onChange={(v) => set("license_issue_date", v)}
                />
                <Text
                  label="Years of driving experience"
                  type="number"
                  value={form.years_driving_experience}
                  onChange={(v) => set("years_driving_experience", v)}
                  error={errors.years_driving_experience}
                />
                <Text
                  label="Taxi association / cooperative"
                  optional
                  value={form.taxi_association}
                  onChange={(v) => set("taxi_association", v)}
                />
                <Text
                  label="Current vehicle plate"
                  optional
                  value={form.current_vehicle_plate}
                  onChange={(v) => set("current_vehicle_plate", v)}
                />
                <Text
                  label="Currently driving for"
                  optional
                  placeholder="e.g. Yego Cabs, own taxi"
                  value={form.currently_driving_for}
                  onChange={(v) => set("currently_driving_for", v)}
                />
                <Check
                  className="md:col-span-2"
                  label="I previously drove for another taxi service"
                  hint="If yes, the bank will ask for that vehicle's documents in the same names as your MoMo account."
                  checked={form.previously_drove_for_service}
                  onChange={(v) => set("previously_drove_for_service", v)}
                />
              </Grid>
            )}

            {step === 3 && (
              <Grid>
                <Money
                  label="Monthly income"
                  value={form.monthly_income_rwf}
                  onChange={(v) => set("monthly_income_rwf", v)}
                  error={errors.monthly_income_rwf}
                />
                <Money
                  label="Average daily takings"
                  value={form.average_daily_earnings_rwf}
                  onChange={(v) => set("average_daily_earnings_rwf", v)}
                  error={errors.average_daily_earnings_rwf}
                />
                <Check
                  className="md:col-span-2"
                  label="I have a bank account"
                  checked={form.has_bank_account}
                  onChange={(v) => set("has_bank_account", v)}
                />
                {form.has_bank_account && (
                  <>
                    <Text label="Bank name" value={form.bank_name} onChange={(v) => set("bank_name", v)} />
                    <Text
                      label="Bank account number"
                      value={form.bank_account_number}
                      onChange={(v) => set("bank_account_number", v)}
                    />
                  </>
                )}
                <Check
                  className="md:col-span-2"
                  label="I have an existing loan"
                  checked={form.has_existing_loan}
                  onChange={(v) => set("has_existing_loan", v)}
                />
                {form.has_existing_loan && (
                  <Area
                    className="md:col-span-2"
                    label="Existing loan details"
                    hint="Which lender, how much is left, and how you are repaying it."
                    value={form.existing_loan_details}
                    onChange={(v) => set("existing_loan_details", v)}
                  />
                )}
                <Money
                  label="Deposit you can raise now"
                  hint="Minimum driver contribution is 500,000 RWF."
                  value={form.deposit_available_rwf}
                  onChange={(v) => set("deposit_available_rwf", v)}
                  error={errors.deposit_available_rwf}
                />
                <Check
                  label="I may need UZA Access to top up my deposit"
                  hint="UZA can bridge the gap to the required 10%."
                  checked={form.needs_uza_access_support}
                  onChange={(v) => set("needs_uza_access_support", v)}
                />
                <Choice
                  label="Preferred repayment term"
                  hint="34% interest for 1–3 years, 36% for 4–5 years."
                  value={form.preferred_term_years}
                  options={["1", "2", "3", "4", "5"]}
                  onChange={(v) => set("preferred_term_years", v)}
                />
                <Choice
                  label="Preferred payment route"
                  value={form.preferred_financing}
                  options={["Bank financed", "Cash (3% discount)", "30/70 split (1.5% discount)"]}
                  onChange={(v) => set("preferred_financing", v)}
                />
              </Grid>
            )}

            {step === 4 && (
              <Grid>
                <Choice
                  label="Marital status"
                  value={form.marital_status}
                  options={["Single", "Married", "Divorced", "Widowed"]}
                  onChange={(v) => set("marital_status", v)}
                  error={errors.marital_status}
                />
                {form.marital_status === "Married" && (
                  <Text
                    label="Spouse full name"
                    hint="The bank also needs your spouse's national ID."
                    value={form.spouse_name}
                    onChange={(v) => set("spouse_name", v)}
                  />
                )}
                <Check
                  className="md:col-span-2"
                  label="I belong to a taxi cooperative"
                  hint="A letter from the cooperative president will be requested."
                  checked={form.is_cooperative_member}
                  onChange={(v) => set("is_cooperative_member", v)}
                />
                {form.is_cooperative_member && (
                  <Text
                    label="Cooperative name"
                    value={form.cooperative_name}
                    onChange={(v) => set("cooperative_name", v)}
                  />
                )}
                <Money
                  className="md:col-span-2"
                  label="Vehicle price you are targeting"
                  value={form.target_vehicle_price_rwf}
                  onChange={(v) => set("target_vehicle_price_rwf", v)}
                />
                <div className="rounded-lg border border-border/70 bg-muted/50 p-4 text-sm md:col-span-2">
                  {deposit ? (
                    <>
                      <p className="font-medium">
                        Deposit needed: {formatRwf(deposit.amount)} (
                        {Math.round(deposit.percent * 100)}%)
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        Or pledge collateral worth more than {formatRwf(deposit.collateralAmount)}.
                      </p>
                    </>
                  ) : (
                    <p className="text-muted-foreground">
                      10% deposit for vehicles up to 25M RWF, 15% from 26M RWF. Collateral must be
                      worth over 30% of the vehicle value.
                    </p>
                  )}
                </div>
                <Check
                  className="md:col-span-2"
                  label="I will pledge collateral instead of cash"
                  checked={form.offers_collateral}
                  onChange={(v) => set("offers_collateral", v)}
                />
                {form.offers_collateral && (
                  <>
                    <Money
                      label="Estimated collateral value"
                      value={form.collateral_value_rwf}
                      onChange={(v) => set("collateral_value_rwf", v)}
                    />
                    <Area
                      className="md:col-span-2"
                      label="What is the collateral?"
                      hint="Land, house, another vehicle — include location or plate."
                      value={form.collateral_description}
                      onChange={(v) => set("collateral_description", v)}
                    />
                  </>
                )}
                <Check
                  className="md:col-span-2"
                  label="I am currently listed on CRB"
                  hint="A CRB listing must be resolved before the loan can proceed."
                  checked={form.listed_on_crb}
                  onChange={(v) => set("listed_on_crb", v)}
                />
                {form.listed_on_crb && (
                  <Area
                    className="md:col-span-2"
                    label="How are you resolving the CRB listing?"
                    value={form.crb_resolution_notes}
                    onChange={(v) => set("crb_resolution_notes", v)}
                  />
                )}
                {form.has_existing_loan && (
                  <>
                    <Text
                      label="Other loan — which bank?"
                      value={form.other_loan_bank}
                      onChange={(v) => set("other_loan_bank", v)}
                    />
                    <Text
                      label="Repayment source separate from this vehicle"
                      value={form.other_loan_repayment_source}
                      onChange={(v) => set("other_loan_repayment_source", v)}
                    />
                  </>
                )}
              </Grid>
            )}

            {step === 5 && (
              <Grid>
                <Text
                  label="Next of kin name"
                  value={form.next_of_kin_name}
                  onChange={(v) => set("next_of_kin_name", v)}
                />
                <Text
                  label="Next of kin phone"
                  inputMode="tel"
                  value={form.next_of_kin_phone}
                  onChange={(v) => set("next_of_kin_phone", v)}
                />
                <Text
                  label="Relationship"
                  placeholder="e.g. spouse, brother"
                  value={form.next_of_kin_relationship}
                  onChange={(v) => set("next_of_kin_relationship", v)}
                />
                <Text
                  label="Guarantor name"
                  value={form.guarantor_name}
                  onChange={(v) => set("guarantor_name", v)}
                />
                <Text
                  label="Guarantor phone"
                  inputMode="tel"
                  value={form.guarantor_phone}
                  onChange={(v) => set("guarantor_phone", v)}
                />
                <Text
                  label="Guarantor occupation"
                  value={form.guarantor_occupation}
                  onChange={(v) => set("guarantor_occupation", v)}
                />
                <div className="rounded-lg border border-border/70 bg-muted/50 p-4 text-sm text-muted-foreground md:col-span-2">
                  When you submit, you get a permanent candidate ID. It follows you through
                  training, documents, financing and vehicle allocation.
                </div>
              </Grid>
            )}
          </Card>
        </form>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-3">
          <div className="text-xs text-muted-foreground">
            Step {step + 1} of {STEPS.length} · {current.title}
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <Button type="button" variant="outline" onClick={goBack} disabled={busy}>
                Back
              </Button>
            )}
            {isLast ? (
              <Button type="button" onClick={submit} disabled={busy}>
                {busy ? "Submitting…" : "Submit application"}
              </Button>
            ) : (
              <Button type="button" onClick={goNext}>
                Continue
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 md:grid-cols-2">{children}</div>;
}

function Field({
  label,
  hint,
  error,
  optional,
  className,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="flex items-center gap-2">
        {label}
        {optional && <span className="text-xs font-normal text-muted-foreground">Optional</span>}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function Text({
  label,
  value,
  onChange,
  type = "text",
  hint,
  error,
  optional,
  placeholder,
  inputMode,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  placeholder?: string;
  inputMode?: "text" | "numeric" | "tel" | "email";
  className?: string;
}) {
  return (
    <Field label={label} hint={hint} error={error} optional={optional} className={className}>
      <Input
        type={type}
        value={value}
        inputMode={inputMode}
        placeholder={placeholder}
        aria-invalid={!!error}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

function Money({
  label,
  value,
  onChange,
  hint,
  error,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  error?: string;
  className?: string;
}) {
  const preview = Number(value) > 0 ? formatRwf(Number(value)) : null;
  return (
    <Field
      label={label}
      hint={preview ?? hint}
      error={error}
      className={className}
    >
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
          RWF
        </span>
        <Input
          type="number"
          min={0}
          value={value}
          inputMode="numeric"
          aria-invalid={!!error}
          className="pl-12"
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </Field>
  );
}

function Area({
  label,
  value,
  onChange,
  hint,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  className?: string;
}) {
  return (
    <Field label={label} hint={hint} className={className}>
      <Textarea maxLength={300} rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

function Choice({
  label,
  value,
  options,
  onChange,
  hint,
  error,
  optional,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  hint?: string;
  error?: string;
  optional?: boolean;
}) {
  return (
    <Field label={label} hint={hint} error={error} optional={optional}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger aria-invalid={!!error}>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

function Check({
  label,
  checked,
  onChange,
  hint,
  className,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
        checked ? "border-primary bg-primary/5" : "border-border/70 hover:bg-muted/50",
        className,
      )}
    >
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(v === true)} className="mt-0.5" />
      <span className="text-sm">
        <span className="font-medium">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>}
      </span>
    </label>
  );
}
