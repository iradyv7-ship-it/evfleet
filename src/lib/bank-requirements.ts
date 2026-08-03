// Unguka / partner-bank document checklist for the Tunga Taxi EV loan.
// Keys match boolean columns on public.candidates.

export interface RequirementItem {
  key: string;
  label: string;
  detail: string;
  /** Not required for every applicant. */
  conditional?: string;
}

export const BANK_REQUIREMENTS: RequirementItem[] = [
  {
    key: "doc_national_id",
    label: "National ID",
    detail: "Your national ID card.",
  },
  {
    key: "doc_spouse_id",
    label: "Spouse's national ID",
    detail: "A copy of your spouse's ID.",
    conditional: "If you are married",
  },
  {
    key: "doc_loan_application_letter",
    label: "Loan application letter",
    detail: "A written request addressed to the bank.",
  },
  {
    key: "doc_tax_clearance",
    label: "Tax clearance certificate",
    detail: "An RRA document showing you have no outstanding taxes.",
  },
  {
    key: "doc_marital_status_proof",
    label: "Proof of marital status",
    detail: "A civil document showing whether you are single or married.",
  },
  {
    key: "doc_proforma_invoice",
    label: "Proforma invoice (vehicle quotation)",
    detail: "Can be submitted later, once you have chosen your vehicle.",
    conditional: "Can come later",
  },
  {
    key: "doc_deposit_proof",
    label: "Proof of deposit or collateral",
    detail:
      "10% of the vehicle price in your bank account for vehicles up to 25M RWF, 15% from 26M RWF. Instead of cash you may pledge collateral worth more than 30% of the vehicle value.",
  },
  {
    key: "doc_momo_statement",
    label: "MoMo transaction history (12 months)",
    detail: "Your mobile money statement for the past twelve months.",
  },
  {
    key: "doc_yego_history",
    label: "Yego Cabs history (12 months)",
    detail: "Your Yego Cabs trip and earnings history for the past twelve months.",
  },
  {
    key: "doc_cooperative_letter",
    label: "Cooperative president's letter",
    detail: "A certificate or letter signed by your cooperative president.",
    conditional: "If you are a cooperative member",
  },
  {
    key: "doc_driving_license",
    label: "Driving licence",
    detail: "A valid driving licence.",
  },
  {
    key: "doc_previous_vehicle_docs",
    label: "Previous vehicle documents",
    detail:
      "Documents of the vehicle you were driving. The names on them must match the names on the account and MoMo number you were using.",
    conditional: "If you drove for another taxi service",
  },
  {
    key: "doc_two_passport_photos",
    label: "Two passport-size photos",
    detail: "Recent passport-size photographs.",
  },
];

export const OBSTACLES = [
  {
    title: "Listed on CRB",
    detail:
      "If a loan from another financial institution was not repaid properly, the CRB listing must be cleared before the bank can proceed.",
  },
  {
    title: "An existing loan with no separate repayment source",
    detail:
      "If you already service another loan, you must show income to repay it that is separate from the earnings of the vehicle you are applying for.",
  },
];

/** Deposit tier: 10% up to 25M RWF, 15% from 26M RWF. */
export function requiredDepositPercent(vehiclePriceRwf: number): number {
  return vehiclePriceRwf <= 25_000_000 ? 0.1 : 0.15;
}

/** Collateral alternative must exceed 30% of the vehicle value. */
export const MIN_COLLATERAL_PERCENT = 0.3;

export function depositRequirement(vehiclePriceRwf: number) {
  const percent = requiredDepositPercent(vehiclePriceRwf);
  return {
    percent,
    amount: vehiclePriceRwf * percent,
    collateralPercent: MIN_COLLATERAL_PERCENT,
    collateralAmount: vehiclePriceRwf * MIN_COLLATERAL_PERCENT,
  };
}
