// Current Tax Year was hardcoded in several places.
// This needs to be dynamic eventually, so we'll centralize usages to one constant to reduce the torment
// of that burden, by making it clear where our debts lie.
export const CURRENT_TAX_YEAR = `2025`;
export const DEFAULT_TAX_DAY = `April 15, 2026`;

// I would've just inlined a "4", but Javascript made weird choices with dates
const APRIL_MONTH_INDEX = 3;
// This was changed to "+ 1" when we increment the CURRENT_TAX_YEAR/taxYear
const FILING_DEADLINE_YEAR = parseInt(CURRENT_TAX_YEAR) + 1;

// These deadline facts + their supported renderings need to be re-evaluated.
// https://git.irslabs.org/irslabs-prototypes/direct-file/-/issues/8045

export const FILING_DEADLINE = new Date(FILING_DEADLINE_YEAR, APRIL_MONTH_INDEX, 15);
export const END_OF_FILING_DEADLINE = new Date(
  FILING_DEADLINE.getFullYear(),
  FILING_DEADLINE.getMonth(),
  FILING_DEADLINE.getDate() + 1
);
export const PERFECTION_DEADLINE = new Date(FILING_DEADLINE_YEAR, APRIL_MONTH_INDEX, 20);
export const END_OF_PERFECTION_DEADLINE = new Date(
  PERFECTION_DEADLINE.getFullYear(),
  PERFECTION_DEADLINE.getMonth(),
  PERFECTION_DEADLINE.getDate() + 1
);
export const DAY_WHEN_UNABLE_TO_FILE_FEDERAL = new Date(FILING_DEADLINE_YEAR, APRIL_MONTH_INDEX, 16);
export const DAY_WHEN_UNABLE_TO_FILE_MA = new Date(FILING_DEADLINE_YEAR, APRIL_MONTH_INDEX, 16);
export const DAY_WHEN_UNABLE_TO_RESUBMIT = new Date(FILING_DEADLINE_YEAR, APRIL_MONTH_INDEX, 21);

export const FEDERAL_RETURN_STATUS = {
  PENDING: `Pending`,
  ACCEPTED: `Accepted`,
  REJECTED: `Rejected`,
  ERROR: `Error`,
} as const;
export const federalReturnStatuses = Object.values(FEDERAL_RETURN_STATUS);

export const TAX_YEAR_2023 = {
  EITC_INCOME_THRESHOLDS: {
    INELIGIBLE_INCOME_EITC_3QC: 56838.0,
    INELIGIBLE_INCOME_EITC_2QC: 52918.0,
    INELIGIBLE_INCOME_EITC_1QC: 46560.0,
    INELIGIBLE_INCOME_EITC_0QC: 17640.0,
    INELIGIBLE_INCOME_EITC_3QC_MFJ: 63398.0,
    INELIGIBLE_INCOME_EITC_2QC_MFJ: 59478.0,
    INELIGIBLE_INCOME_EITC_1QC_MFJ: 53120.0,
    INELIGIBLE_INCOME_EITC_0QC_MFJ: 24210.0,
  },
} as const;

export const TAX_YEAR_2024 = {
  EITC_INCOME_THRESHOLDS: {
    INELIGIBLE_INCOME_EITC_3QC: 59899.0,
    INELIGIBLE_INCOME_EITC_2QC: 55768.0,
    INELIGIBLE_INCOME_EITC_1QC: 49084.0,
    INELIGIBLE_INCOME_EITC_0QC: 18591.0,
    INELIGIBLE_INCOME_EITC_3QC_MFJ: 66819.0,
    INELIGIBLE_INCOME_EITC_2QC_MFJ: 62688.0,
    INELIGIBLE_INCOME_EITC_1QC_MFJ: 56004.0,
    INELIGIBLE_INCOME_EITC_0QC_MFJ: 25511.0,
  },
} as const;

export const TAX_YEAR_2025 = {
  EITC_INCOME_THRESHOLDS: {
    INELIGIBLE_INCOME_EITC_3QC: 61555.0,
    INELIGIBLE_INCOME_EITC_2QC: 57310.0,
    INELIGIBLE_INCOME_EITC_1QC: 50434.0,
    INELIGIBLE_INCOME_EITC_0QC: 19104.0,
    INELIGIBLE_INCOME_EITC_3QC_MFJ: 68675.0,
    INELIGIBLE_INCOME_EITC_2QC_MFJ: 64430.0,
    INELIGIBLE_INCOME_EITC_1QC_MFJ: 57554.0,
    INELIGIBLE_INCOME_EITC_0QC_MFJ: 26214.0,
  },
} as const;
