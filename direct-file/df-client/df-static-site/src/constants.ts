export const baseRouterPath = import.meta.env.STATIC_SITE_PUBLIC_PATH || ``;
import { commonOverrideOverrideDateIfRequired } from '@irs/df-common';
export const spanishUrl = `https://openfile.tax/df/file/es/`;
export const englishUrl = `https://openfile.tax/df/file/`;
commonOverrideOverrideDateIfRequired();
/** Date on which the user first opened this site. */
export const TODAY = new Date();

/** Javascript Date zero-indexes months. Try to prevent off-by one errors. */
export const MONTH = {
  January: 0,
  FEBRUARY: 1,
  MARCH: 2,
  APRIL: 3,
  OCTOBER: 9,
};

/** Critical dates on which the site should change appearance/functionality. */
export const DATES = {
  /** Historically, when the Direct File pilot opened to general access. */
  /** Changed the date for a week before launch so we can test in lower envs won't deploy until opening day */
  FIRST_OPEN: new Date(2025, MONTH.January, 21, 0, 0, 0),
  /** Roughly four weeks before the Massachusetts filing deadline. */
  CLOSING_SOON: new Date(2025, MONTH.APRIL, 1, 0, 0, 0),
  /** Tax returns can be submitted but penalities and interest might be assessed. Data may be available for download. */
  AFTER_DEADLINE: new Date(2025, MONTH.APRIL, 16, 0, 0, 0),
  /** No tax returns can be submitted. Data may be available for download. */
  CLOSED: new Date(2025, MONTH.OCTOBER, 16, 0, 0, 0),
};

export type ProjectPhases = 'open' | 'closing_soon' | 'after_deadline' | 'closed';
/**
 * Control which content is showing in the screener and landing page.
 *
 * There are different banners, screens, and text for various phases.
 *   - Use `open` if DF is open to the public
 *   - Use `closing_soon` if tax day is approaching
 *   - Use `after_deadline` for 4/16 and later
 *   - Add more options by editing `ProjectPhases`
 *
 * See `ProjectPhaseMap` to fine-tune the what is included in each phase.
 *
 * CAUTION: This is set dynamically by date in Providers.tsx. Setting it here will
 *    override the date-based calculation.
 */
export const CURRENT_PHASE: ProjectPhases | null = null;

/** List of things which can be controlled. */
export type ProjectPhaseVariables =
  | 'enableScreener'
  | 'showAfterDeadlineBanner'
  | 'showAfterDeadlineSections'
  | 'showAfterDeadlineInvitationalHero'
  | 'showBenefitsSections'
  | 'showClosingSoonBanner'
  | 'showEndOfFilingFAQs'
  | 'showDataImportContent'
  | 'showInvitationalHero'
  | 'showLandingPageImage'
  | 'showOpenAccessBanner'
  | 'showOpenDoneSection'
  | 'showOpenSeasonFAQs'
  | 'showPilotClosedBanner'
  | 'showPostFilingSeasonFAQs'
  | 'showThankYouHero';

export type FeatureFlagMap = {
  [K in ProjectPhaseVariables]?: boolean;
};

type ProjectPhaseMap = {
  [K in ProjectPhases]: FeatureFlagMap;
};

/** Map a set of booleans to each phase of the project. */
export const ProjectPhaseMap: ProjectPhaseMap = {
  open: {
    enableScreener: true,
    showBenefitsSections: true,
    showDataImportContent: true,
    showInvitationalHero: true,
    showLandingPageImage: true,
    showOpenAccessBanner: true,
    showOpenDoneSection: true,
    showOpenSeasonFAQs: true,
  },
  closing_soon: {
    enableScreener: true,
    showBenefitsSections: true,
    showClosingSoonBanner: true,
    showDataImportContent: true,
    showInvitationalHero: true,
    showLandingPageImage: true,
    showOpenSeasonFAQs: true,
  },
  after_deadline: {
    enableScreener: true,
    showAfterDeadlineBanner: true,
    showAfterDeadlineSections: true,
    showAfterDeadlineInvitationalHero: true,
    showBenefitsSections: true,
    showDataImportContent: true,
    showInvitationalHero: false,
    showLandingPageImage: true,
    showOpenSeasonFAQs: true,
  },
  closed: {
    enableScreener: true,
    showAfterDeadlineInvitationalHero: true,
    showAfterDeadlineSections: true,
    showBenefitsSections: true,
    showDataImportContent: true,
    showInvitationalHero: true,
    showLandingPageImage: true,
    showPilotClosedBanner: true,
    showPostFilingSeasonFAQs: true,
  },
};
