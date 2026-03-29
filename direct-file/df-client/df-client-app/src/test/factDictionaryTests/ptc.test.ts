import { it, describe, expect } from 'vitest';
import { Path } from '../../flow/Path.js';
import { createBooleanWrapper, createEnumWrapper } from '../persistenceWrappers.js';
import { makeW2Data, mfjFilerData, primaryFilerId, singleFilerData, spouseId } from '../testData.js';
import { setupFactGraph } from '../setupFactGraph.js';

describe(`Premium tax credit`, () => {
  const ptcSingleFiler = {
    ...singleFilerData,
    [`/filers/#${primaryFilerId}/canBeClaimed`]: createBooleanWrapper(false),
  };
  describe(`allocations KO`, () => {
    it(`true if basic conditions met`, ({ task }) => {
      task.meta.testedFactPaths = [`/needsAllocations`];
      const { factGraph } = setupFactGraph({
        ...ptcSingleFiler,
        [`/writableHasPtcQualifyingPlan`]: createBooleanWrapper(true),
        [`/writableIsAdditionalPersonInEnrollmentFamily`]: createBooleanWrapper(false),
        [`/writableIsEnrolledWithOtherFamily`]: createBooleanWrapper(true),
      });
      expect(factGraph.get(Path.concretePath(`/needsAllocations`, null)).get).toBe(true);
    });

    it(`false if edited to no longer have qualifying plan`, ({ task }) => {
      task.meta.testedFactPaths = [`/needsAllocations`];
      const { factGraph } = setupFactGraph({
        ...ptcSingleFiler,
        [`/writableHasPtcQualifyingPlan`]: createBooleanWrapper(false),
        [`/writableIsAdditionalPersonInEnrollmentFamily`]: createBooleanWrapper(false),
        [`/writableIsEnrolledWithOtherFamily`]: createBooleanWrapper(true),
      });

      expect(factGraph.get(Path.concretePath(`/needsAllocations`, null)).get).toBe(false);
    });

    it(`false if edited to no longer be eligible for ptc`, ({ task }) => {
      task.meta.testedFactPaths = [`/needsAllocations`];
      const { factGraph } = setupFactGraph({
        ...mfjFilerData,
        [`/filers/#${primaryFilerId}/canBeClaimed`]: createBooleanWrapper(true),
        [`/filers/#${primaryFilerId}/potentialClaimerMustFile`]: createBooleanWrapper(true),
        '/maritalStatus': createEnumWrapper(`married`, `/maritalStatusOptions`),
        '/filingStatusChoice': createEnumWrapper(`wantsMarriedFilingJointly`, `/filingStatusInitialOptions`),
        [`/filers/#${spouseId}/canBeClaimed`]: createBooleanWrapper(false),
        [`/filers/#${spouseId}/isUsCitizenFullYear`]: createBooleanWrapper(true),
        [`/MFJRequiredToFile`]: createBooleanWrapper(false),
        [`/MFJDependentsFilingForCredits`]: createBooleanWrapper(false),
        [`/writableHasPtcQualifyingPlan`]: createBooleanWrapper(true),
        [`/writableIsAdditionalPersonInEnrollmentFamily`]: createBooleanWrapper(false),
        [`/writableIsEnrolledWithOtherFamily`]: createBooleanWrapper(true),
      });

      expect(factGraph.get(Path.concretePath(`/needsAllocations`, null)).get).toBe(false);
      expect(factGraph.get(Path.concretePath(`/maybeEligibleForPtc`, null)).get).toBe(false);
    });

    it(`incomplete if enrollee-not-part-of-tax-family screen is incomplete`, ({ task }) => {
      task.meta.testedFactPaths = [`/needsAllocations`];
      const { factGraph } = setupFactGraph({
        ...ptcSingleFiler,
        [`/writableHasPtcQualifyingPlan`]: createBooleanWrapper(true),
        [`/writableIsAdditionalPersonInEnrollmentFamily`]: createBooleanWrapper(true),
        [`/writableIsEnrolledWithOtherFamily`]: createBooleanWrapper(true),
      });

      expect(factGraph.get(Path.concretePath(`/needsAllocations`, null)).complete).toBe(false);
      expect(
        factGraph.get(Path.concretePath(`/writableIsAdditionalPersonPartofDifferentTaxFamily`, null)).complete
      ).toBe(false);
    });
  });

  describe(`employer-sponsored plan KO`, () => {
    const basicSetupForEmployerSponsorPlanKo = {
      ...ptcSingleFiler,
      [`/writableHasPtcQualifyingPlan`]: createBooleanWrapper(true),
      [`/writableIsAdditionalPersonInEnrollmentFamily`]: createBooleanWrapper(false),
      [`/writableIsEnrolledWithOtherFamily`]: createBooleanWrapper(false),
      [`/writableHasEmployerSponsoredPlan`]: createBooleanWrapper(true),
    };

    it(`true if basic conditions met`, ({ task }) => {
      task.meta.testedFactPaths = [`/hasEmployerSponsoredPlan`];
      const { factGraph } = setupFactGraph({
        ...basicSetupForEmployerSponsorPlanKo,
      });
      expect(factGraph.get(Path.concretePath(`/hasEmployerSponsoredPlan`, null)).get).toBe(true);
    });

    it(`true regardless of APTC`, ({ task }) => {
      task.meta.testedFactPaths = [`/hasEmployerSponsoredPlan`];
      const { factGraph } = setupFactGraph({
        ...basicSetupForEmployerSponsorPlanKo,
        [`/writableHasAdvancedPtc`]: createBooleanWrapper(true),
      });
      expect(factGraph.get(Path.concretePath(`/hasEmployerSponsoredPlan`, null)).get).toBe(true);

      const { factGraph: factGraph2 } = setupFactGraph({
        ...basicSetupForEmployerSponsorPlanKo,
        [`/writableHasAdvancedPtc`]: createBooleanWrapper(false),
      });
      expect(factGraph2.get(Path.concretePath(`/hasEmployerSponsoredPlan`, null)).get).toBe(true);
    });

    it(`false when not eligible because of qualifying plan`, ({ task }) => {
      task.meta.testedFactPaths = [`/hasEmployerSponsoredPlan`];
      const { factGraph } = setupFactGraph({
        ...ptcSingleFiler,
        [`/writableHasPtcQualifyingPlan`]: createBooleanWrapper(false),
        [`/writableIsAdditionalPersonInEnrollmentFamily`]: createBooleanWrapper(false),
        [`/writableIsEnrolledWithOtherFamily`]: createBooleanWrapper(false),
        [`/writableHasAdvancedPtc`]: createBooleanWrapper(false),
        [`/writableHasEmployerSponsoredPlan`]: createBooleanWrapper(true),
      });
      expect(factGraph.get(Path.concretePath(`/hasEmployerSponsoredPlan`, null)).get).toBe(false);
    });

    it(`false when not eligible because of not eligible for PTC`, ({ task }) => {
      task.meta.testedFactPaths = [`/hasEmployerSponsoredPlan`];
      const { factGraph } = setupFactGraph({
        ...mfjFilerData,
        [`/filers/#${primaryFilerId}/canBeClaimed`]: createBooleanWrapper(true),
        [`/filers/#${primaryFilerId}/potentialClaimerMustFile`]: createBooleanWrapper(true),
        '/maritalStatus': createEnumWrapper(`married`, `/maritalStatusOptions`),
        '/filingStatusChoice': createEnumWrapper(`wantsMarriedFilingJointly`, `/filingStatusInitialOptions`),
        [`/filers/#${spouseId}/canBeClaimed`]: createBooleanWrapper(false),
        [`/filers/#${spouseId}/isUsCitizenFullYear`]: createBooleanWrapper(true),
        [`/MFJRequiredToFile`]: createBooleanWrapper(false),
        [`/MFJDependentsFilingForCredits`]: createBooleanWrapper(false),
        [`/writableHasPtcQualifyingPlan`]: createBooleanWrapper(true),
        [`/writableIsAdditionalPersonInEnrollmentFamily`]: createBooleanWrapper(false),
        [`/writableIsEnrolledWithOtherFamily`]: createBooleanWrapper(false),
        [`/writableHasAdvancedPtc`]: createBooleanWrapper(false),
        [`/writableHasEmployerSponsoredPlan`]: createBooleanWrapper(true),
      });
      expect(factGraph.get(Path.concretePath(`/hasEmployerSponsoredPlan`, null)).get).toBe(false);
    });
  });

  describe(`FederalPovertyLevelPct Form 8962, Line 5`, () => {
    it(`calculates correct value`, ({ task }) => {
      // This test is brittle and will break next tax year when the values changes. The intent was to test a specific
      // edge case where the numbers caused incorrect rounding previously. This was fixed by adding an explicit
      // truncate function. Feel free to delete when these tests fail
      task.meta.testedFactPaths = [`/householdIncomeAsPercent`];
      const { factGraph } = setupFactGraph({
        ...ptcSingleFiler,
        ...makeW2Data(6998),
      });
      expect(factGraph.get(Path.concretePath(`/federalPovertyLevelThreshold`, null)).get.toString()).toBe(`15060.00`);
      // calculates 6998 * 100 / 15060 = 46.46746348 which should be truncated to give 46
      expect(factGraph.get(Path.concretePath(`/householdIncomeAsPercent`, null)).get).toBe(46);
    });
  });

  describe(`ptcAnnualContributionAmount Form 8962, Line 8a`, () => {
    it(`calculates correct value`, ({ task }) => {
      // This test is brittle and will break next tax year when the values changes. The intent was to test a specific
      // edge case where the numbers caused incorrect rounding previously. This was fixed by adding an explicit
      // truncate function. Feel free to delete when these tests fail
      task.meta.testedFactPaths = [`/ptcAnnualContributionAmount`];
      const { factGraph } = setupFactGraph({
        ...ptcSingleFiler,
        ...makeW2Data(38337),
      });
      expect(factGraph.get(Path.concretePath(`/formattedApplicableFigure`, null)).get).toBe(`0.0416`);
      // calculates Round(38337 * 0.0416) = Round(1594.8192)
      expect(factGraph.get(Path.concretePath(`/ptcAnnualContributionAmount`, null)).get.toString()).toBe(`1595.00`);
    });
  });
});
