import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StaffNav } from "@/components/staff-nav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";


export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Instructor Dashboard — UZA Mobility" },
      {
        name: "description",
        content:
          "Cohort overview for Tunga Taxi instructors: seats filled, waiting list depth and candidate progress.",
      },
      { property: "og:title", content: "Instructor Dashboard — UZA Mobility" },
      {
        property: "og:description",
        content: "Seats, waiting lists and candidate progress across every Tunga Taxi cohort.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

type CohortRow = {
  id: string;
  name: string;
  code: string;
  capacity: number;
  location: string | null;
  start_date: string | null;
  applications_open: boolean;
  partner_bank: string | null;
};

function Dashboard() {


  const { data, isPending } = useQuery({
    queryKey: ["cohort-overview"],
    queryFn: async () => {
      const [cohorts, candidates] = await Promise.all([
        supabase
          .from("cohorts")
          .select("id,name,code,capacity,location,start_date,applications_open,partner_bank")
          .order("start_date", { ascending: true }),
        supabase.from("candidates").select("id,cohort_id,status,training_status"),
      ]);
      if (cohorts.error) throw cohorts.error;
      if (candidates.error) throw candidates.error;
      return { cohorts: (cohorts.data ?? []) as CohortRow[], candidates: candidates.data ?? [] };
    },
  });
  const cohorts = data?.cohorts ?? [];
  const candidates = data?.candidates ?? [];
  const totalEnrolled = candidates.filter((c) => c.status === "enrolled").length;
  const totalWaiting = candidates.filter((c) => c.status === "waitlisted").length;

  return (
    <div className="min-h-screen bg-muted/30">
      <StaffNav />



      <main className="mx-auto max-w-6xl px-5 py-10">
        <p className="text-eyebrow text-muted-foreground">Instructor dashboard</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Training cohorts</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Every applicant carries a permanent candidate ID. Seats fill in order of application; once
          a cohort is full the rest queue on the waiting list and are promoted automatically when a
          seat frees up.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Card className="border-border/70 p-5 shadow-soft">
            <p className="text-eyebrow text-muted-foreground">Cohorts</p>
            <p className="mt-1 font-display text-3xl font-bold">{cohorts.length}</p>
          </Card>
          <Card className="border-border/70 p-5 shadow-soft">
            <p className="text-eyebrow text-muted-foreground">Enrolled candidates</p>
            <p className="mt-1 font-display text-3xl font-bold">{totalEnrolled}</p>
          </Card>
          <Card className="border-border/70 p-5 shadow-soft">
            <p className="text-eyebrow text-muted-foreground">On waiting list</p>
            <p className="mt-1 font-display text-3xl font-bold">{totalWaiting}</p>
          </Card>
        </div>

        {isPending ? (
          <p className="mt-10 text-sm text-muted-foreground">Loading cohorts…</p>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {cohorts.map((c) => {
              const inCohort = candidates.filter((x) => x.cohort_id === c.id);
              const enrolled = inCohort.filter(
                (x) => x.status === "enrolled" || x.status === "graduated",
              ).length;
              const waiting = inCohort.filter((x) => x.status === "waitlisted").length;
              const pct = Math.min(100, Math.round((enrolled / c.capacity) * 100));
              return (
                <Card key={c.id} className="border-border/70 p-6 shadow-soft">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-lg font-semibold">{c.name}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {c.code} · {c.location ?? "Location TBC"} ·{" "}
                        {c.start_date ?? "Start date TBC"}
                      </p>
                    </div>
                    <Badge variant={c.applications_open ? "default" : "secondary"}>
                      {c.applications_open ? "Open" : "Closed"}
                    </Badge>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-medium">
                        {enrolled} / {c.capacity} seats
                      </span>
                      <span className="text-muted-foreground">{waiting} waiting</span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  {c.partner_bank && (
                    <p className="mt-4 text-xs text-muted-foreground">
                      Partner bank: {c.partner_bank}
                    </p>
                  )}

                  <Button asChild size="sm" className="mt-5">
                    <Link to="/cohorts/$cohortId" params={{ cohortId: c.id }}>
                      View candidates
                    </Link>
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
