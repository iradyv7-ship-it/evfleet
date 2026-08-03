import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FinancingCalculator } from "@/components/financing-calculator";
import heroImage from "@/assets/hero-ev-taxi.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UZA Mobility — Driver EV Ownership Programme in Rwanda" },
      {
        name: "description",
        content:
          "Own an electric taxi in Rwanda from 500,000 RWF. Bank financing, guided document checklists, vehicle allocation and shipment tracking on one platform.",
      },
      { property: "og:title", content: "UZA Mobility — Driver EV Ownership Programme" },
      {
        property: "og:description",
        content:
          "From a driver ID to keys in hand: financing, documents, allocation and tracking for electric taxi ownership in Rwanda.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const STEPS = [
  {
    n: "01",
    title: "Register and get a driver ID",
    body: "Every applicant receives a permanent UZA ID. Everything after this — training, documents, financing, the vehicle itself — hangs off that one number.",
  },
  {
    n: "02",
    title: "Complete training",
    body: "Graduates move into a verified cohort folder that partner banks can review directly. Some cohorts are pre-qualified for a specific institution.",
  },
  {
    n: "03",
    title: "Upload documents, guided",
    body: "Each bank publishes its own checklist. The system walks the driver item by item and refuses to submit an incomplete file, so nothing is skipped.",
  },
  {
    n: "04",
    title: "Choose how you are financed",
    body: "Declare your deposit. If you fall short of the bank's requirement, UZA Access can top up the gap — recorded, visible to the bank, and recovered later.",
  },
  {
    n: "05",
    title: "Get allocated a vehicle",
    body: "When a container leaves China, its vehicles are listed. Bank or UZA staff link an approved driver to a specific car; the driver is notified with full details.",
  },
  {
    n: "06",
    title: "Track it to your door",
    body: "Sea freight follows the container number; inland from Mombasa is updated by our team. Driver, bank and UZA see the same timeline.",
  },
];

const OFFERS = [
  {
    tag: "Cash",
    discount: "3%",
    title: "Pay in full, drive cheaper",
    body: "Full payment before the container sails earns a 3% discount off vehicle cost, applied at invoice.",
    highlight: true,
  },
  {
    tag: "Split",
    discount: "1.5%",
    title: "30% now, 70% on delivery",
    body: "Lock your unit with 30%, settle the balance when the vehicle is handed over. Discount applies to the full price.",
  },
  {
    tag: "Financed",
    discount: "500K",
    title: "Bank-financed from 500,000 RWF",
    body: "The minimum driver contribution. The bank lends the rest; UZA Access can bridge the gap to the required deposit.",
  },
];

const PORTALS = [
  {
    title: "Driver",
    points: ["Document checklist", "Daily payment view", "Allocation + shipment inbox"],
  },
  {
    title: "Bank",
    points: ["Cohort folders", "UZA Access-supported flag", "Equity and collateral status"],
  },
  {
    title: "UZA operations",
    points: ["Container manifests", "Driver-to-vehicle linking", "Weekly tracking updates"],
  },
];

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <span className="font-display text-lg font-bold tracking-tight">
            UZA<span className="text-muted-foreground"> Mobility</span>
          </span>
          <nav className="hidden gap-7 text-sm text-muted-foreground md:flex">
            <a href="#programme" className="transition-colors hover:text-foreground">
              Programme
            </a>
            <a href="#calculator" className="transition-colors hover:text-foreground">
              Financing
            </a>
            <a href="#offers" className="transition-colors hover:text-foreground">
              Buy options
            </a>
            <Link to="/apply" className="transition-colors hover:text-foreground">
              Apply
            </Link>
            <Link to="/auth" className="transition-colors hover:text-foreground">
              Staff
            </Link>
          </nav>
          <Button size="sm" asChild>
            <Link to="/apply">Apply for training</Link>
          </Button>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <img
            src={heroImage}
            alt="Electric taxi charging on a Kigali street at golden hour"
            width={1600}
            height={1104}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[oklch(0.2_0.04_158)]/75" />
          <div className="relative mx-auto max-w-6xl px-5 py-24 text-ink-foreground md:py-32">
            <Badge className="surface-volt border-transparent font-display text-xs font-semibold">
              Driver EV Ownership Programme
            </Badge>
            <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold leading-[1.05] md:text-6xl">
              Rwanda's taxi drivers should own the electric car they drive.
            </h1>
            <p className="mt-6 max-w-2xl text-lg opacity-85">
              One platform from application to ownership: a driver ID, guided bank paperwork,
              transparent daily repayments, vehicle allocation the moment a container ships, and
              tracking all the way to Kigali.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <a href="#calculator">See what you'd pay per day</a>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <a href="#programme">How the programme works</a>
              </Button>
            </div>
            <dl className="mt-14 grid max-w-3xl grid-cols-2 gap-8 border-t border-white/15 pt-8 md:grid-cols-4">
              {[
                ["500K RWF", "Minimum contribution"],
                ["34–36%", "Bank rate, reducing balance"],
                ["1–5 yrs", "Repayment terms"],
                ["90%", "Equity at collateral release"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="font-display text-2xl font-bold">{v}</dt>
                  <dd className="mt-1 text-xs opacity-75">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="programme" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
          <p className="text-eyebrow text-muted-foreground">The path to ownership</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold md:text-4xl">
            Six steps, one ID, nothing lost between offices.
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((s) => (
              <Card key={s.n} className="border-border/70 p-6 shadow-soft">
                <span className="font-display text-sm font-bold text-muted-foreground">{s.n}</span>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </Card>
            ))}
          </div>
        </section>

        <section id="calculator" className="border-y border-border/60 bg-muted/40 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-5">
            <p className="text-eyebrow text-muted-foreground">Financing calculator</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold md:text-4xl">
              Know the daily number before you sign anything.
            </h2>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Drivers think in daily takings, not amortisation tables. Move the sliders to see the
              instalment, what the bank finances, and the month your collateral is freed to fund the
              next driver.
            </p>
            <div className="mt-10">
              <FinancingCalculator />
            </div>
          </div>
        </section>

        <section id="offers" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
          <p className="text-eyebrow text-muted-foreground">Buy options</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold md:text-4xl">
            Three ways in. Every one of them ends in an EV.
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {OFFERS.map((o) => (
              <Card
                key={o.tag}
                className={`flex flex-col gap-4 p-7 shadow-soft ${
                  o.highlight
                    ? "surface-hero border-transparent text-ink-foreground"
                    : "border-border/70"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-eyebrow opacity-70">{o.tag}</span>
                  <span className="font-display text-3xl font-bold">{o.discount}</span>
                </div>
                <h3 className="text-lg font-semibold">{o.title}</h3>
                <p
                  className={`text-sm leading-relaxed ${
                    o.highlight ? "opacity-80" : "text-muted-foreground"
                  }`}
                >
                  {o.body}
                </p>
              </Card>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Discounts are tied to a container's sailing date — allocation closes when the manifest is
            locked.
          </p>
        </section>

        <section id="partners" className="border-t border-border/60 bg-muted/40 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-5">
            <p className="text-eyebrow text-muted-foreground">Built for partnerships</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold md:text-4xl">
              Same data, three points of view.
            </h2>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Each partner financial institution defines its own document checklist, deposit rule and
              collateral policy. Add an institution without changing the platform.
            </p>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {PORTALS.map((p) => (
                <Card key={p.title} className="border-border/70 p-7 shadow-soft">
                  <h3 className="font-display text-xl font-semibold">{p.title}</h3>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    {p.points.map((pt) => (
                      <li key={pt} className="flex gap-2">
                        <span aria-hidden className="text-volt">
                          —
                        </span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-ink py-12 text-ink-foreground">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-lg font-bold">UZA Mobility</p>
            <p className="mt-1 text-sm opacity-70">
              Electric mobility ownership for Rwanda's professional drivers.
            </p>
          </div>
          <p className="text-xs opacity-60">
            Financing figures are indicative. Final terms are set by the lending institution.
          </p>
        </div>
      </footer>
    </div>
  );
}
