import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BANK_REQUIREMENTS, OBSTACLES, depositRequirement } from "@/lib/bank-requirements";
import { formatRwf } from "@/lib/financing";

export const Route = createFileRoute("/requirements")({
  head: () => ({
    meta: [
      { title: "Tunga Taxi Loan Requirements — UZA Mobility" },
      {
        name: "description",
        content:
          "Every document a Rwandan taxi driver needs for a Tunga Taxi EV loan: national ID, RRA tax clearance, 12-month MoMo and Yego history, deposit or collateral, and more.",
      },
      { property: "og:title", content: "Tunga Taxi Loan Requirements — UZA Mobility" },
      {
        property: "og:description",
        content:
          "The full bank checklist for financing your electric taxi, plus the two issues that can block approval.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RequirementsPage,
});

const EXAMPLES = [15_000_000, 25_000_000, 28_000_000];

function RequirementsPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border/60 bg-background">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <Link to="/" className="font-display text-lg font-bold tracking-tight">
            UZA<span className="text-muted-foreground"> Mobility</span>
          </Link>
          <Button asChild size="sm">
            <Link to="/apply">Apply</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12">
        <p className="text-eyebrow text-muted-foreground">Tunga Taxi</p>
        <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">
          What the bank needs from you
        </h1>
        <p className="mt-3 text-muted-foreground">
          Bring these to your instructor or upload them against your permanent candidate ID. Items
          marked as conditional only apply to some drivers.
        </p>

        <ol className="mt-8 space-y-3">
          {BANK_REQUIREMENTS.map((r, i) => (
            <li key={r.key}>
              <Card className="flex gap-4 border-border/70 p-5 shadow-soft">
                <span className="font-display text-sm font-bold text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-base font-semibold">{r.label}</h2>
                    {r.conditional && <Badge variant="secondary">{r.conditional}</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{r.detail}</p>
                </div>
              </Card>
            </li>
          ))}
        </ol>

        <Card className="mt-10 border-border/70 p-6 shadow-soft">
          <h2 className="font-display text-lg font-semibold">Deposit tiers</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            10% of the vehicle price up to 25M RWF, 15% from 26M RWF. If you cannot raise the cash,
            you may pledge collateral worth more than 30% of the vehicle value — or ask UZA Access
            to top up the gap.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {EXAMPLES.map((price) => {
              const req = depositRequirement(price);
              return (
                <div key={price} className="rounded-lg border border-border/70 bg-muted/50 p-4">
                  <p className="text-eyebrow text-muted-foreground">
                    {formatRwf(price, { compact: true })} vehicle
                  </p>
                  <p className="mt-1 font-display text-xl font-bold">
                    {formatRwf(req.amount, { compact: true })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(req.percent * 100)}% deposit · or collateral above{" "}
                    {formatRwf(req.collateralAmount, { compact: true })}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="mt-6 border-border/70 p-6 shadow-soft">
          <h2 className="font-display text-lg font-semibold">Possible obstacles</h2>
          <div className="mt-4 space-y-4">
            {OBSTACLES.map((o) => (
              <div key={o.title}>
                <h3 className="text-sm font-semibold">{o.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{o.detail}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Other than these, nothing else should stand between you and this loan.
          </p>
        </Card>

        <Button asChild size="lg" className="mt-8">
          <Link to="/apply">Start your application</Link>
        </Button>
      </main>
    </div>
  );
}
