import { Path as FDPath } from '../../fact-dictionary/Path.js';
import { Path } from '../../flow/Path.js';
import {
  createBooleanWrapper,
  createCollectionItemWrapper,
  createCollectionWrapper,
  createDayWrapper,
  createDollarWrapper,
  createEnumWrapper,
} from '../persistenceWrappers.js';
import { setupFactGraph } from '../setupFactGraph.js';
import {
  baseFilerData,
  makeMultipleW2s,
  makeW2Data,
  primaryFilerId,
  spouseId,
  singleFilerData,
  uuid,
  mfjFilerData,
  mfsFilerData,
  singleWithMfsEditCondition,
  singleFilerWithHsaDeductions,
  mfjBothWithQualifiedHsaDeductions,
  mfjHsaContributionFactsWithoutContributionAmounts,
  mfjPrimaryOnlyWithQualifiedHsaDeductions,
  mfjSecondaryOnlyWithQualifiedHsaDeductions,
  basePrimaryFilerHSAFactsWithoutContributionAmounts,
  baseHSAFactsSkipToTestingPeriod,
  makeMultipleHsaDistributions,
} from '../testData.js';
import { describe, it, expect } from 'vitest';

const w2Id = `9ba9d216-81a8-4944-81ac-9410b2fad150`;
const w2Id2 = `9ba9d216-81a8-4944-81ac-9410b2fad151`;
const singleFilerWithOnlyW2Income = {
  ...singleFilerData,
  ...makeW2Data(50000, w2Id),
  [Path.concretePath(`/formW2s/*/filer`, w2Id)]: createCollectionItemWrapper(primaryFilerId),
  [`/formW2s/#${w2Id}/employerHsaContributions`]: createDollarWrapper(`500.00`),
};

const singleFilerWithOnlyW2Income55Plus = {
  ...singleFilerData,
  ...baseHSAFactsSkipToTestingPeriod,
  ...makeW2Data(50000, w2Id),
  [`/filers/#${primaryFilerId}/dateOfBirth`]: createDayWrapper(`1957-06-06`),
  [Path.concretePath(`/formW2s/*/filer`, w2Id)]: createCollectionItemWrapper(primaryFilerId),
  [`/formW2s/#${w2Id}/employerHsaContributions`]: createDollarWrapper(`500.00`),
  [`/filers/#${primaryFilerId}/enrolledInMedicare`]: createEnumWrapper(`noneOfYear`, `/enrolledInMedicareOptions`),
  [`/filers/#${primaryFilerId}/hsaHdhpCoverageStatus`]: createEnumWrapper(`allYear`, `/hsaHdhpCoverageStatusOptions`),
  [`/filers/#${primaryFilerId}/canBeClaimed`]: createBooleanWrapper(false),
};

const mfsFilerWithOnlyW2Income55Plus = {
  ...mfsFilerData,
  ...baseHSAFactsSkipToTestingPeriod,
  ...makeW2Data(50000, w2Id),
  [`/filers/#${primaryFilerId}/dateOfBirth`]: createDayWrapper(`1957-06-06`),
  [Path.concretePath(`/formW2s/*/filer`, w2Id)]: createCollectionItemWrapper(primaryFilerId),
  [`/formW2s/#${w2Id}/employerHsaContributions`]: createDollarWrapper(`500.00`),
  [`/filers/#${primaryFilerId}/enrolledInMedicare`]: createEnumWrapper(`noneOfYear`, `/enrolledInMedicareOptions`),
  [`/filers/#${primaryFilerId}/hsaHdhpCoverageStatus`]: createEnumWrapper(`allYear`, `/hsaHdhpCoverageStatusOptions`),
  [`/filers/#${primaryFilerId}/canBeClaimed`]: createBooleanWrapper(false),
};

const mfjFilerWithW2Contributions = {
  ...mfjFilerData,
  ...baseHSAFactsSkipToTestingPeriod,
  ...makeMultipleW2s([
    { w2Id: w2Id, income: 50000 },
    { w2Id: w2Id2, income: 25000 },
  ]),
  [`/filers/#${primaryFilerId}/canBeClaimed`]: createBooleanWrapper(false),
  [`/filers/#${spouseId}/canBeClaimed`]: createBooleanWrapper(false),
  [`/filers/#${primaryFilerId}/enrolledInMedicare`]: createEnumWrapper(`noneOfYear`, `/enrolledInMedicareOptions`),
  [`/filers/#${spouseId}/enrolledInMedicare`]: createEnumWrapper(`noneOfYear`, `/enrolledInMedicareOptions`),
  [`/filers/#${primaryFilerId}/hsaHdhpCoverageStatus`]: createEnumWrapper(`allYear`, `/hsaHdhpCoverageStatusOptions`),
  [`/filers/#${spouseId}/hsaHdhpCoverageStatus`]: createEnumWrapper(`allYear`, `/hsaHdhpCoverageStatusOptions`),
  [Path.concretePath(`/formW2s/*/filer`, w2Id)]: createCollectionItemWrapper(primaryFilerId),
  [`/formW2s/#${w2Id}/employerHsaContributions`]: createDollarWrapper(`500.00`),
  [Path.concretePath(`/formW2s/*/filer`, w2Id2)]: createCollectionItemWrapper(spouseId),
  [`/formW2s/#${w2Id2}/employerHsaContributions`]: createDollarWrapper(`250.75`),
};

const mfjFilerSelfOnlySpouseFamilyHDHP = {
  ...mfjFilerWithW2Contributions,
  [Path.concretePath(`/filers/*/typeOfHdhp`, primaryFilerId)]: createEnumWrapper(`selfOnly`, `/typeOfHdhpOptions`),
  [Path.concretePath(`/filers/*/typeOfHdhp`, spouseId)]: createEnumWrapper(`family`, `/typeOfHdhpOptions`),
};
const mfjFilerFamilySpouseSelfOnlyHDHP = {
  ...mfjFilerWithW2Contributions,
  [Path.concretePath(`/filers/*/typeOfHdhp`, primaryFilerId)]: createEnumWrapper(`family`, `/typeOfHdhpOptions`),
  [Path.concretePath(`/filers/*/typeOfHdhp`, spouseId)]: createEnumWrapper(`selfOnly`, `/typeOfHdhpOptions`),
};

describe(`HSA Intro`, () => {
  describe(`For a single filer`, () => {
    describe(`when the filer has a W2 with HSA contributions`, () => {
      it(`has an incomplete HSA and intro section before answering the intro questions`, ({ task }) => {
        task.meta.testedFactPaths = [`/isHsaSectionComplete`, `/hsaIntroSectionIsComplete`];
        const { factGraph } = setupFactGraph({
          ...singleFilerWithOnlyW2Income,
        });

        const isHsaSectionComplete = factGraph.get(Path.concretePath(`/isHsaSectionComplete`, null));
        const isHsaIntroComplete = factGraph.get(Path.concretePath(`/hsaIntroSectionIsComplete`, null));
        expect(isHsaSectionComplete.get.toString()).toBe(`false`);
        expect(isHsaIntroComplete.get.toString()).toBe(`false`);
      });
      it(`has a complete HSA intro section after answering all the intro questions`, ({ task }) => {
        task.meta.testedFactPaths = [`/hsaIntroSectionIsComplete`];
        const { factGraph } = setupFactGraph({
          ...singleFilerWithOnlyW2Income,
          [`/writableHasHsaExcessContributionsPreviousYear`]: createBooleanWrapper(false),
          [`/writableHasHsaWithdrawnExcessContributionsYesNo`]: createBooleanWrapper(false),
          [`/hasHsaMedicalSavingsAccountType`]: createBooleanWrapper(false),
          [`/filers/#${primaryFilerId}/writablePrimaryFilerHasMadeContributionsToHsa`]: createBooleanWrapper(true),
        });

        const isHsaIntroComplete = factGraph.get(Path.concretePath(`/hsaIntroSectionIsComplete`, null));
        expect(isHsaIntroComplete.get.toString()).toBe(`true`);
      });
    });
    describe(`when the filer has non-employer HSA contributions`, () => {
      it(`has an incomplete HSA and intro section before answering the intro questions`, ({ task }) => {
        task.meta.testedFactPaths = [`/isHsaSectionComplete`, `/hsaIntroSectionIsComplete`];
        const { factGraph } = setupFactGraph({
          ...singleFilerData,
          ...makeW2Data(50000, w2Id),
          // No employer contributions
        });

        const isHsaSectionComplete = factGraph.get(Path.concretePath(`/isHsaSectionComplete`, null));
        const isHsaIntroComplete = factGraph.get(Path.concretePath(`/hsaIntroSectionIsComplete`, null));
        expect(isHsaSectionComplete.get.toString()).toBe(`false`);
        expect(isHsaIntroComplete.get.toString()).toBe(`false`);
      });
      it(`has a complete HSA intro section if the filer didn't have HSA activity`, ({ task }) => {
        task.meta.testedFactPaths = [`/hsaIntroSectionIsComplete`];
        const { factGraph } = setupFactGraph({
          ...singleFilerData,
          ...makeW2Data(50000, w2Id),
          [`/someFilerHadNonW2HsaActivity`]: createBooleanWrapper(false),
        });

        const isHsaIntroComplete = factGraph.get(Path.concretePath(`/hsaIntroSectionIsComplete`, null));
        expect(isHsaIntroComplete.get.toString()).toBe(`true`);
      });
      it(`has a complete HSA intro section if they had HSA activity but not in the TY`, ({ task }) => {
        task.meta.testedFactPaths = [`/hsaIntroSectionIsComplete`];
        const { factGraph } = setupFactGraph({
          ...singleFilerData,
          ...makeW2Data(50000, w2Id),
          [`/someFilerHadNonW2HsaActivity`]: createBooleanWrapper(true),
          [`/writablePrimaryFilerHadNonW2HsaActivity`]: createBooleanWrapper(false),
        });

        const isHsaIntroComplete = factGraph.get(Path.concretePath(`/hsaIntroSectionIsComplete`, null));
        expect(isHsaIntroComplete.get.toString()).toBe(`true`);
      });
      it(`has a complete HSA intro section after answering all the intro questions`, ({ task }) => {
        task.meta.testedFactPaths = [`/hsaIntroSectionIsComplete`];
        const { factGraph } = setupFactGraph({
          ...singleFilerData,
          ...makeW2Data(50000, w2Id),
          [`/someFilerHadNonW2HsaActivity`]: createBooleanWrapper(true),
          [`/writableHasHsaExcessContributionsPreviousYear`]: createBooleanWrapper(false),
          [`/writableHasHsaWithdrawnExcessContributionsYesNo`]: createBooleanWrapper(false),
          [`/hasHsaMedicalSavingsAccountType`]: createBooleanWrapper(false),
          [`/writablePrimaryFilerHadNonW2HsaActivity`]: createBooleanWrapper(true),
        });

        const isHsaIntroComplete = factGraph.get(Path.concretePath(`/hsaIntroSectionIsComplete`, null));
        expect(isHsaIntroComplete.get.toString()).toBe(`true`);
      });
    });
  });
});

describe(`HSA Contributions and Coverage`, () => {
  describe(`For a single filer`, () => {
    describe(`when the filer can be claimed and has contributions`, () => {
      it(`knocks the user out of the flow`, ({ task }) => {
        task.meta.testedFactPaths = [`/flowKnockoutFilerIsDependentAndContributesToHsa`];
        const { factGraph } = setupFactGraph({
          ...singleFilerWithHsaDeductions,
          [`/filers/#${primaryFilerId}/canBeClaimed`]: createBooleanWrapper(true),
        });

        const isKnockedOutForExpectedReason = factGraph.get(
          Path.concretePath(`/flowKnockoutFilerIsDependentAndContributesToHsa`, null)
        );
        const isKnockedOut = factGraph.get(Path.concretePath(`/flowIsKnockedOut`, null));
        expect(isKnockedOutForExpectedReason.get.toString()).toBe(`true`);
        expect(isKnockedOut.get.toString()).toBe(`true`);
      });
    });
    describe(`when the filer selects self-only coverage`, () => {
      it(`sets the line 1 value to self-only regardless of secondary filer values`, ({ task }) => {
        task.meta.testedFactPaths = [`/primaryFiler/isCoveredBySelfOnlyHdhp`];
        const { factGraph } = setupFactGraph({
          ...singleFilerWithHsaDeductions,
          ...singleWithMfsEditCondition,
          [Path.concretePath(`/filers/*/typeOfHdhp`, primaryFilerId)]: createEnumWrapper(
            `selfOnly`,
            `/typeOfHdhpOptions`
          ),
          [Path.concretePath(`/filers/*/typeOfHdhp`, spouseId)]: createEnumWrapper(`family`, `/typeOfHdhpOptions`),
        });

        const isCoveredBySelfOnlyHdhp = factGraph.get(Path.concretePath(`/primaryFiler/isCoveredBySelfOnlyHdhp`, null));
        expect(isCoveredBySelfOnlyHdhp.get.toString()).toBe(`true`);
      });
    });
    describe(`when the filer has a w2 without HSA contributions`, () => {
      it(`sets the fact for form 8889 line 11 to 0`, ({ task }) => {
        // because we don't support qualified funding distributions yet
        task.meta.testedFactPaths = [`/primaryFiler/hsaEmployerContributionsAndFundingDistributionTotal`];
        const { factGraph } = setupFactGraph({
          ...singleFilerData,
          ...makeW2Data(50000),
        });

        const hasWithdrawnMoreThanDistributions = factGraph.get(
          Path.concretePath(`/primaryFiler/hsaEmployerContributionsAndFundingDistributionTotal`, null)
        );
        expect(hasWithdrawnMoreThanDistributions.get.toString()).toBe(`0.00`);
      });
    });

    describe(`when the filer has a w2 with HSA contributions`, () => {
      it(`sets the fact for form 8889 line 11 to the amount of contributions from the W2`, ({ task }) => {
        task.meta.testedFactPaths = [`/primaryFiler/hsaEmployerContributionsAndFundingDistributionTotal`];
        const { factGraph } = setupFactGraph({
          ...singleFilerWithOnlyW2Income,
        });

        const line11 = factGraph.get(
          Path.concretePath(`/primaryFiler/hsaEmployerContributionsAndFundingDistributionTotal`, null)
        );
        expect(line11.get.toString()).toBe(`500.00`);
      });
    });

    describe(`when the filer is 55+ and has a w2 with HSA contributions`, () => {
      it(`sets the fact for form 8889 line 3 to the amount of their contribution limit`, ({ task }) => {
        task.meta.testedFactPaths = [`/primaryFiler/hsaInitialContributionLimit`];
        const { factGraph } = setupFactGraph({
          ...singleFilerWithOnlyW2Income55Plus,
          [`/filers/#${primaryFilerId}/typeOfHdhp`]: createEnumWrapper(`family`, `/typeOfHdhpOptions`),
        });

        const line3 = factGraph.get(Path.concretePath(`/primaryFiler/hsaInitialContributionLimit`, null));
        expect(line3.get.toString()).toBe(`9550.00`);

        const line7 = factGraph.get(Path.concretePath(`/primaryFiler/additionToHsaContributionLimit`, null));
        expect(line7.get.toString()).toBe(`0.00`);
      });
    });

    describe(`when the filer has multiple w2s with and without contributions`, () => {
      it(`sets the fact for form 8889 line 11 equal to the sum of all contributions from across W2s`, ({ task }) => {
        task.meta.testedFactPaths = [`/primaryFiler/hsaEmployerContributionsAndFundingDistributionTotal`];
        const w2Id = `9ba9d216-81a8-4944-81ac-9410b2fad150`;
        const w2Id2 = `9ba9d216-81a8-4944-81ac-9410b2fad151`;
        const w2Id3 = `9ba9d216-81a8-4944-81ac-9410b2fad152`;

        const { factGraph } = setupFactGraph({
          ...singleFilerData,
          ...makeMultipleW2s([
            { w2Id: w2Id, income: 50000 },
            { w2Id: w2Id2, income: 25000 },
            { w2Id: w2Id3, income: 25000 },
          ]),
          [Path.concretePath(`/formW2s/*/filer`, w2Id)]: createCollectionItemWrapper(primaryFilerId),
          [`/formW2s/#${w2Id}/employerHsaContributions`]: createDollarWrapper(`500.00`),
          [Path.concretePath(`/formW2s/*/filer`, w2Id2)]: createCollectionItemWrapper(primaryFilerId),
          [`/formW2s/#${w2Id2}/employerHsaContributions`]: createDollarWrapper(`250.75`),
          [Path.concretePath(`/formW2s/*/filer`, w2Id3)]: createCollectionItemWrapper(primaryFilerId),
        });

        const line11 = factGraph.get(
          Path.concretePath(`/primaryFiler/hsaEmployerContributionsAndFundingDistributionTotal`, null)
        );
        expect(line11.get.toString()).toBe(`751.00`);
      });
    });
    describe(`when filer has a qualified HSA deduction`, () => {
      it(`has a complete HSA section`, ({ task }) => {
        task.meta.testedFactPaths = [`/isHsaSectionComplete`];
        const { factGraph } = setupFactGraph({
          ...singleFilerWithHsaDeductions,
        });

        const isHsaSectionComplete = factGraph.get(Path.concretePath(`/isHsaSectionComplete`, null));
        expect(isHsaSectionComplete.get.toString()).toBe(`true`);
      });
      it(`requires a form 8889`, ({ task }) => {
        task.meta.testedFactPaths = [`/requiresForm8889`];
        const { factGraph } = setupFactGraph({
          ...singleFilerWithHsaDeductions,
        });

        const requiresForm8889 = factGraph.get(Path.concretePath(`/requiresForm8889`, null));
        expect(requiresForm8889.get.toString()).toBe(`true`);
      });
      it(`has a total deduction equal to the primary filer's deduction`, ({ task }) => {
        task.meta.testedFactPaths = [`/hsaTotalDeductibleAmount`];
        const { factGraph } = setupFactGraph({
          ...singleFilerWithHsaDeductions,
        });

        const totalDeductions = factGraph.get(Path.concretePath(`/hsaTotalDeductibleAmount`, null));
        expect(totalDeductions.get.toString()).toBe(`3000.00`);
      });
      describe(`when the filer edits their answer to not having HSA activity at all`, () => {
        const { factGraph } = setupFactGraph({
          ...singleFilerWithHsaDeductions,
          [`/someFilerHadNonW2HsaActivity`]: createBooleanWrapper(false),
          [`/someFilersMadeTestingPeriodContribution`]: createBooleanWrapper(false),
        });
        it(`no longer requires a form 8889`, ({ task }) => {
          task.meta.testedFactPaths = [`/requiresForm8889`];

          const requiresForm8889 = factGraph.get(Path.concretePath(`/requiresForm8889`, null));
          expect(requiresForm8889.get.toString()).toBe(`false`);
        });
        it(`has no filers required to file a form 8889`, ({ task }) => {
          task.meta.testedFactPaths = [`/numberOfFilersRequiredToFileForm8889`];

          const numberOfFilersRequiredToFileForm8889 = factGraph.get(
            Path.concretePath(`/numberOfFilersRequiredToFileForm8889`, null)
          );
          expect(numberOfFilersRequiredToFileForm8889.get.toString()).toBe(`0`);
        });
      });
      describe(`when the filer edits their answer to not having HSA contributions and has distributions`, () => {
        const { factGraph } = setupFactGraph({
          ...singleFilerWithHsaDeductions,
          [`/filers/#${primaryFilerId}/writablePrimaryFilerHasMadeContributionsToHsa`]: createBooleanWrapper(false),
          [`/someFilersMadeTestingPeriodContribution`]: createBooleanWrapper(false),
          [`/hsaDistributions`]: createCollectionWrapper([uuid]),
          [`/hsaDistributions/#${uuid}/filer`]: createCollectionItemWrapper(primaryFilerId),
          [`/hsaDistributions/#${uuid}/writableGrossDistribution`]: createDollarWrapper(`100.00`),
        });
        it(`Requires the filers to file a form 8889`, ({ task }) => {
          task.meta.testedFactPaths = [`/numberOfFilersRequiredToFileForm8889`];

          const numberOfFilersRequiredToFileForm8889 = factGraph.get(
            Path.concretePath(`/numberOfFilersRequiredToFileForm8889`, null)
          );
          expect(numberOfFilersRequiredToFileForm8889.get.toString()).toBe(`1`);
        });
        it(`no longer has a total deduction for the filer`, ({ task }) => {
          task.meta.testedFactPaths = [`/filers/*/hasHsaDeduction`];

          const hasDeductions = factGraph.get(Path.concretePath(`/primaryFiler/hasHsaDeduction`, null));
          expect(hasDeductions.get.toString()).toBe(`false`);
        });
        it(`leaves all the supported lines for part 1 of the filer's form 8889 incomplete`, ({ task }) => {
          const primaryFilerPart1Lines = [
            `/primaryFiler/isCoveredBySelfOnlyHdhp`,
            `/primaryFiler/isCoveredByFamilyHdhp`,
            // `/primaryFiler/hsaNonemployerContributionsTotal`,
            `/primaryFiler/hsaNonemployerContributionsTotalForExport`, // See if we can remove this and use ^
            `/primaryFiler/hsaInitialContributionLimit`,
            `/primaryFiler/hsaContributionLimitLessMsaContributions`,
            `/primaryFiler/hsaContributionLimitLessAddition`,
            `/primaryFiler/additionToHsaContributionLimit`,
            `/primaryFiler/hsaTotalContributionLimit`,
            // `/primaryFiler/hsaContributionsW2sTotal`, // Anytime we have W2 contributions, we have a form 8889
            // `/primaryFiler/hsaFundingDistributionsTotal`, // This always has a value of 0 but is not exported
            // `/primaryFiler/hsaEmployerContributionsAndFundingDistributionTotal`,
            `/primaryFiler/hsaEmployerContributionsAndFundingDistributionTotalForExport`, // See if we can remove this
            `/primaryFiler/hsaContributionLimitLessLine11`,
            `/primaryFiler/hsaTotalDeductibleAmount`,
          ] as FDPath[];

          task.meta.testedFactPaths = primaryFilerPart1Lines;
          primaryFilerPart1Lines.forEach((line) => {
            const fact = factGraph.get(Path.concretePath(line, null));
            const factHasValueOrIsComplete = fact.hasValue ? fact.complete : false;
            expect(factHasValueOrIsComplete, `The fact ${line} had a value and was complete`).toBe(false);
          });
        });
      });
    });
  });
  describe(`For a MFS filer`, () => {
    describe(`when the filer is 55+ and has a w2 with HSA contributions`, () => {
      it(`sets the fact for form 8889 line 3 to the amount of their contribution limit`, ({ task }) => {
        task.meta.testedFactPaths = [`/primaryFiler/hsaInitialContributionLimit`];
        const { factGraph } = setupFactGraph({
          ...mfsFilerWithOnlyW2Income55Plus,
          [`/filers/#${primaryFilerId}/typeOfHdhp`]: createEnumWrapper(`selfOnly`, `/typeOfHdhpOptions`),
        });

        const line3 = factGraph.get(Path.concretePath(`/primaryFiler/hsaInitialContributionLimit`, null));
        expect(line3.get.toString()).toBe(`5300.00`);

        const line7 = factGraph.get(Path.concretePath(`/primaryFiler/additionToHsaContributionLimit`, null));
        expect(line7.get.toString()).toBe(`0.00`);
      });
    });
    describe(`when the filer is 55+ and has a w2 with HSA contributions`, () => {
      it(`sets the fact for form 8889 line 7 to the amount of their contribution limit`, ({ task }) => {
        task.meta.testedFactPaths = [`/primaryFiler/hsaInitialContributionLimit`];
        const { factGraph } = setupFactGraph({
          ...mfsFilerWithOnlyW2Income55Plus,
          [`/filers/#${primaryFilerId}/typeOfHdhp`]: createEnumWrapper(`family`, `/typeOfHdhpOptions`),
        });

        const line3 = factGraph.get(Path.concretePath(`/primaryFiler/hsaInitialContributionLimit`, null));
        expect(line3.get.toString()).toBe(`8550.00`);

        const line7 = factGraph.get(Path.concretePath(`/primaryFiler/additionToHsaContributionLimit`, null));
        expect(line7.get.toString()).toBe(`1000.00`);
      });
    });
  });
  describe(`For MFJ TPs`, () => {
    describe(`when primary filer has an HSA with self-only and spouse has family HDHP coverage`, () => {
      it(`sets primary filer coverage to family`, ({ task }) => {
        task.meta.testedFactPaths = [`/primaryFiler/isCoveredByFamilyHdhp`];
        const { factGraph } = setupFactGraph({
          ...mfjFilerSelfOnlySpouseFamilyHDHP,
        });
        const isCoveredBySelfOnlyHdhp = factGraph.get(Path.concretePath(`/primaryFiler/isCoveredByFamilyHdhp`, null));
        expect(isCoveredBySelfOnlyHdhp.get.toString()).toBe(`true`);
      });
      it(`does NOT set the primary filer coverage to self-only`, ({ task }) => {
        task.meta.testedFactPaths = [`/primaryFiler/isCoveredBySelfOnlyHdhp`];
        const { factGraph } = setupFactGraph({
          ...mfjFilerSelfOnlySpouseFamilyHDHP,
        });
        const isCoveredBySelfOnlyHdhp = factGraph.get(Path.concretePath(`/primaryFiler/isCoveredBySelfOnlyHdhp`, null));
        expect(isCoveredBySelfOnlyHdhp.get.toString()).toBe(`false`);
      });
      it(`sets secondary Filer coverage to family`, ({ task }) => {
        task.meta.testedFactPaths = [`/secondaryFiler/isCoveredByFamilyHdhp`];
        const { factGraph } = setupFactGraph({
          ...mfjFilerSelfOnlySpouseFamilyHDHP,
        });
        const isCoveredBySelfOnlyHdhp = factGraph.get(Path.concretePath(`/secondaryFiler/isCoveredByFamilyHdhp`, null));
        expect(isCoveredBySelfOnlyHdhp.get.toString()).toBe(`true`);
      });
      it(`does NOT set the secondary filer coverage to self-only`, ({ task }) => {
        task.meta.testedFactPaths = [`/secondaryFiler/isCoveredBySelfOnlyHdhp`];
        const { factGraph } = setupFactGraph({
          ...mfjFilerSelfOnlySpouseFamilyHDHP,
        });
        const isCoveredBySelfOnlyHdhp = factGraph.get(
          Path.concretePath(`/secondaryFiler/isCoveredBySelfOnlyHdhp`, null)
        );
        expect(isCoveredBySelfOnlyHdhp.get.toString()).toBe(`false`);
      });
    });
    describe(`when the primary filer has an HSA with family and spouse has self-only HDHP coverage`, () => {
      it(`sets primary filer coverage to family`, ({ task }) => {
        task.meta.testedFactPaths = [`/primaryFiler/isCoveredByFamilyHdhp`];
        const { factGraph } = setupFactGraph({
          ...mfjFilerFamilySpouseSelfOnlyHDHP,
        });

        const isCoveredBySelfOnlyHdhp = factGraph.get(Path.concretePath(`/primaryFiler/isCoveredByFamilyHdhp`, null));
        expect(isCoveredBySelfOnlyHdhp.get.toString()).toBe(`true`);
      });
      it(`does NOT set the primary filer coverage to self-only`, ({ task }) => {
        task.meta.testedFactPaths = [`/primaryFiler/isCoveredBySelfOnlyHdhp`];
        const { factGraph } = setupFactGraph({
          ...mfjFilerFamilySpouseSelfOnlyHDHP,
        });

        const isCoveredBySelfOnlyHdhp = factGraph.get(Path.concretePath(`/primaryFiler/isCoveredBySelfOnlyHdhp`, null));
        expect(isCoveredBySelfOnlyHdhp.get.toString()).toBe(`false`);
      });
      it(`sets secondary Filer coverage to family`, ({ task }) => {
        task.meta.testedFactPaths = [`/secondaryFiler/isCoveredByFamilyHdhp`];
        const { factGraph } = setupFactGraph({
          ...mfjFilerFamilySpouseSelfOnlyHDHP,
        });

        const isCoveredBySelfOnlyHdhp = factGraph.get(Path.concretePath(`/secondaryFiler/isCoveredByFamilyHdhp`, null));
        expect(isCoveredBySelfOnlyHdhp.get.toString()).toBe(`true`);
      });
      it(`does NOT set the secondary filer coverage to self-only`, ({ task }) => {
        task.meta.testedFactPaths = [`/secondaryFiler/isCoveredBySelfOnlyHdhp`];
        const { factGraph } = setupFactGraph({
          ...mfjFilerFamilySpouseSelfOnlyHDHP,
        });

        const isCoveredBySelfOnlyHdhp = factGraph.get(
          Path.concretePath(`/secondaryFiler/isCoveredBySelfOnlyHdhp`, null)
        );
        expect(isCoveredBySelfOnlyHdhp.get.toString()).toBe(`false`);
      });
    });
    describe(`when both filers have W2s with HSA contributions`, () => {
      it(`does not include the other filer's contributions in the form 8889 line 11 total`, ({ task }) => {
        task.meta.testedFactPaths = [`/secondaryFiler/hsaEmployerContributionsAndFundingDistributionTotal`];
        const { factGraph } = setupFactGraph({
          ...mfjFilerWithW2Contributions,
        });

        const line11 = factGraph.get(
          Path.concretePath(`/secondaryFiler/hsaEmployerContributionsAndFundingDistributionTotal`, null)
        );
        expect(line11.get.toString()).toBe(`251.00`);
      });
    });
    describe(`form 8889 contribution limits`, () => {
      const testCases = [
        {
          description: `Filer under 55, spouse over 55`,
          filerAge: 54,
          spouseAge: 56,
          filerHdHpCoverageType: `family`,
          spouseHdHpCoverageType: `family`,
          filerW2Contributions: `4200.00`,
          spouseW2Contributions: `4200.00`,
          expectedFilerLine5Limit: `8550.00`,
          expectedSpouseLine5Limit: `8550.00`,
          expectedFilerLine6: `4200.00`,
          expectedSpouseLine6: `4350.00`,
          expectedFilerLine7: `0.00`,
          expectedSpouseLine7: `1000.00`,
          expectedFilerLine8TotalContributionLimit: `4200.00`,
          expectedSpouseLine8TotalContributionLimit: `5350.00`,
          expectedFilerLine11Contribution: `4200.00`,
          expectedSpouseLine11Contribution: `4200.00`,
          expectedFilerLine12: `0.00`,
          expectedSpouseLine12: `1150.00`,
        },
        {
          description: `Filer over 55, spouse under 55`,
          filerAge: 56,
          spouseAge: 54,
          filerHdHpCoverageType: `family`,
          spouseHdHpCoverageType: `family`,
          filerW2Contributions: `4200.00`,
          spouseW2Contributions: `4200.00`,
          expectedFilerLine5Limit: `8550.00`,
          expectedSpouseLine5Limit: `8550.00`,
          expectedFilerLine6: `3200.00`,
          expectedSpouseLine6: `5350.00`,
          expectedFilerLine7: `1000.00`,
          expectedSpouseLine7: `0.00`,
          expectedFilerLine8TotalContributionLimit: `4200.00`,
          expectedSpouseLine8TotalContributionLimit: `5350.00`,
          expectedFilerLine11Contribution: `4200.00`,
          expectedSpouseLine11Contribution: `4200.00`,
          expectedFilerLine12: `0.00`,
          expectedSpouseLine12: `1150.00`,
        },
        {
          description: `Filer over limit, over 55`,
          filerAge: 56,
          spouseAge: 54,
          filerHdHpCoverageType: `family`,
          spouseHdHpCoverageType: `family`,
          filerW2Contributions: `10000.00`,
          spouseW2Contributions: `50.00`,
          expectedFilerLine5Limit: `8550.00`,
          expectedSpouseLine5Limit: `8550.00`,
          expectedFilerLine6: `8550.00`,
          expectedSpouseLine6: `0.00`,
          expectedFilerLine7: `1000.00`,
          expectedSpouseLine7: `0.00`,
          expectedFilerLine8TotalContributionLimit: `9550.00`,
          expectedSpouseLine8TotalContributionLimit: `0.00`,
          expectedFilerLine11Contribution: `10000.00`,
          expectedSpouseLine11Contribution: `50.00`,
          expectedFilerLine12: `0.00`,
          expectedSpouseLine12: `0.00`,
        },
        {
          description: `Filer over limit, spouse over 55 and under limit`,
          filerAge: 54,
          spouseAge: 56,
          filerHdHpCoverageType: `family`,
          spouseHdHpCoverageType: `family`,
          filerW2Contributions: `8500.00`,
          spouseW2Contributions: `800.00`,
          expectedFilerLine5Limit: `8550.00`,
          expectedSpouseLine5Limit: `8550.00`,
          expectedFilerLine6: `8500.00`,
          expectedSpouseLine6: `50.00`,
          expectedFilerLine7: `0.00`,
          expectedSpouseLine7: `1000.00`,
          expectedFilerLine8TotalContributionLimit: `8500.00`,
          expectedSpouseLine8TotalContributionLimit: `1050.00`,
          expectedFilerLine11Contribution: `8500.00`,
          expectedSpouseLine11Contribution: `800.00`,
          expectedFilerLine12: `0.00`,
          expectedSpouseLine12: `250.00`,
        },
        {
          description: `Filer over 55, under additional limit`,
          filerAge: 56,
          spouseAge: 54,
          filerHdHpCoverageType: `family`,
          spouseHdHpCoverageType: `family`,
          filerW2Contributions: `500.00`,
          spouseW2Contributions: `2000.00`,
          expectedFilerLine5Limit: `8550.00`,
          expectedSpouseLine5Limit: `8550.00`,
          expectedFilerLine6: `0.00`,
          expectedSpouseLine6: `8550.00`,
          expectedFilerLine7: `1000.00`,
          expectedSpouseLine7: `0.00`,
          expectedFilerLine8TotalContributionLimit: `1000.00`,
          expectedSpouseLine8TotalContributionLimit: `8550.00`,
          expectedFilerLine11Contribution: `500.00`,
          expectedSpouseLine11Contribution: `2000.00`,
          expectedFilerLine12: `500.00`,
          expectedSpouseLine12: `6550.00`,
        },
      ];

      testCases.forEach((testCase) => {
        describe(`when ${testCase.description}`, () => {
          // setup the test data
          const primaryFilerDob = new Date();
          primaryFilerDob.setFullYear(primaryFilerDob.getFullYear() - testCase.filerAge);
          const spouseDob = new Date();
          spouseDob.setFullYear(spouseDob.getFullYear() - testCase.spouseAge);
          const w2Id1 = `9ba9d216-81a8-4944-81ac-9410b2fad150`;
          const w2Id2 = `9ba9d216-81a8-4944-81ac-9410b2fad151`;
          const { factGraph } = setupFactGraph({
            ...mfjHsaContributionFactsWithoutContributionAmounts,
            [`/filers/#${primaryFilerId}/dateOfBirth`]: createDayWrapper(primaryFilerDob.toISOString().split(`T`)[0]),
            [`/filers/#${spouseId}/dateOfBirth`]: createDayWrapper(spouseDob.toISOString().split(`T`)[0]),
            ...makeMultipleW2s([
              { w2Id: w2Id1, income: 50000 },
              { w2Id: w2Id2, income: 50000 },
            ]),
            [`/filers/#${spouseId}/hasMadeQualifiedHsaFundingDistribution`]: createBooleanWrapper(false),
            [Path.concretePath(`/filers/*/typeOfHdhp`, primaryFilerId)]: createEnumWrapper(
              testCase.filerHdHpCoverageType,
              `/typeOfHdhpOptions`
            ),
            [Path.concretePath(`/filers/*/typeOfHdhp`, spouseId)]: createEnumWrapper(
              testCase.spouseHdHpCoverageType,
              `/typeOfHdhpOptions`
            ),
            [Path.concretePath(`/formW2s/*/filer`, w2Id1)]: createCollectionItemWrapper(primaryFilerId),
            [`/formW2s/#9ba9d216-81a8-4944-81ac-9410b2fad150/employerHsaContributions`]: createDollarWrapper(
              testCase.filerW2Contributions
            ),
            [Path.concretePath(`/formW2s/*/filer`, w2Id2)]: createCollectionItemWrapper(spouseId),
            [`/formW2s/#9ba9d216-81a8-4944-81ac-9410b2fad151/employerHsaContributions`]: createDollarWrapper(
              testCase.spouseW2Contributions
            ),
          });

          // Verify the results
          it(`sets the primary filer's line 5 contribution limit to ${testCase.expectedFilerLine5Limit}`, ({
            task,
          }) => {
            task.meta.testedFactPaths = [`/primaryFiler/hsaContributionLimitLessMsaContributions`];
            const line5Limit = factGraph.get(
              Path.concretePath(`/primaryFiler/hsaContributionLimitLessMsaContributions`, null)
            );
            expect(line5Limit.get.toString()).toBe(testCase.expectedFilerLine5Limit.toString());
          });

          it(`sets the spouse's line 5 contribution limit to ${testCase.expectedSpouseLine5Limit}`, ({ task }) => {
            task.meta.testedFactPaths = [`/secondaryFiler/hsaContributionLimitLessMsaContributions`];
            const line5Limit = factGraph.get(
              Path.concretePath(`/secondaryFiler/hsaContributionLimitLessMsaContributions`, null)
            );
            expect(line5Limit.get.toString()).toBe(testCase.expectedSpouseLine5Limit.toString());
          });

          it(`sets the filer's addition to contribution limit to
          ${testCase.expectedFilerLine7}`, ({ task }) => {
            task.meta.testedFactPaths = [`/primaryFiler/additionToHsaContributionLimit`];
            const additionalContributionLimit = factGraph.get(
              Path.concretePath(`/primaryFiler/additionToHsaContributionLimit`, null)
            );
            expect(additionalContributionLimit.get.toString()).toBe(testCase.expectedFilerLine7.toString());
          });

          it(`sets the spouse's addition to contribution limit to
          ${testCase.expectedSpouseLine7}`, ({ task }) => {
            task.meta.testedFactPaths = [`/secondaryFiler/additionToHsaContributionLimit`];
            const additionalContributionLimit = factGraph.get(
              Path.concretePath(`/secondaryFiler/additionToHsaContributionLimit`, null)
            );
            expect(additionalContributionLimit.get.toString()).toBe(testCase.expectedSpouseLine7.toString());
          });

          it(`sets the filer's allocated contribution for form 8889 line 6 to ${testCase.expectedFilerLine6}`, ({
            task,
          }) => {
            task.meta.testedFactPaths = [`/primaryFiler/hsaContributionLimitLessAddition`];
            const allocatedContribution = factGraph.get(
              Path.concretePath(`/primaryFiler/hsaContributionLimitLessAddition`, null)
            );
            expect(allocatedContribution.get.toString()).toBe(testCase.expectedFilerLine6.toString());
          });

          it(`sets the spouse's allocated contribution for form 8889 line 6 to ${testCase.expectedSpouseLine6}`, ({
            task,
          }) => {
            task.meta.testedFactPaths = [`/secondaryFiler/hsaContributionLimitLessAddition`];
            const allocatedContribution = factGraph.get(
              Path.concretePath(`/secondaryFiler/hsaContributionLimitLessAddition`, null)
            );
            expect(allocatedContribution.get.toString()).toBe(testCase.expectedSpouseLine6.toString());
          });

          it(`sets the filer's total contribution limit for form 8889 line 8
          to ${testCase.expectedFilerLine8TotalContributionLimit}`, ({ task }) => {
            task.meta.testedFactPaths = [`/primaryFiler/hsaTotalContributionLimit`];
            const totalContributionLimit = factGraph.get(
              Path.concretePath(`/primaryFiler/hsaTotalContributionLimit`, null)
            );
            expect(totalContributionLimit.get.toString()).toBe(testCase.expectedFilerLine8TotalContributionLimit);
          });

          it(`sets the spouse's total contribution limit for form 8889 line 8
          to ${testCase.expectedSpouseLine8TotalContributionLimit}`, ({ task }) => {
            task.meta.testedFactPaths = [`/secondaryFiler/hsaTotalContributionLimit`];
            const totalContributionLimit = factGraph.get(
              Path.concretePath(`/secondaryFiler/hsaTotalContributionLimit`, null)
            );
            expect(totalContributionLimit.get.toString()).toBe(testCase.expectedSpouseLine8TotalContributionLimit);
          });

          it(`sets the filer's line 11 contribution to ${testCase.expectedFilerLine11Contribution}`, ({ task }) => {
            task.meta.testedFactPaths = [`/primaryFiler/hsaEmployerContributionsAndFundingDistributionTotal`];
            const line11 = factGraph.get(
              Path.concretePath(`/primaryFiler/hsaEmployerContributionsAndFundingDistributionTotal`, null)
            );
            expect(line11.get.toString()).toBe(testCase.expectedFilerLine11Contribution);
          });

          it(`sets the spouse's line 11 contribution to ${testCase.expectedSpouseLine11Contribution}`, ({ task }) => {
            task.meta.testedFactPaths = [`/secondaryFiler/hsaEmployerContributionsAndFundingDistributionTotal`];
            const line11 = factGraph.get(
              Path.concretePath(`/secondaryFiler/hsaEmployerContributionsAndFundingDistributionTotal`, null)
            );
            expect(line11.get.toString()).toBe(testCase.expectedSpouseLine11Contribution);
          });

          it(`sets the filer's line 12 to ${testCase.expectedFilerLine12}`, ({ task }) => {
            task.meta.testedFactPaths = [`/primaryFiler/hsaContributionLimitLessLine11`];
            const line12 = factGraph.get(Path.concretePath(`/primaryFiler/hsaContributionLimitLessLine11`, null));
            expect(line12.get.toString()).toBe(testCase.expectedFilerLine12);
          });

          it(`sets the spouse's line 12 to ${testCase.expectedSpouseLine12}`, ({ task }) => {
            task.meta.testedFactPaths = [`/secondaryFiler/hsaContributionLimitLessLine11`];
            const line12 = factGraph.get(Path.concretePath(`/secondaryFiler/hsaContributionLimitLessLine11`, null));
            expect(line12.get.toString()).toBe(testCase.expectedSpouseLine12);
          });
        });
      });
    });
    describe(`when both filers have qualified HSA deductions`, () => {
      it(`has a complete HSA section`, ({ task }) => {
        task.meta.testedFactPaths = [`/isHsaSectionComplete`];
        const { factGraph } = setupFactGraph({
          ...mfjBothWithQualifiedHsaDeductions,
        });

        const isHsaSectionComplete = factGraph.get(Path.concretePath(`/isHsaSectionComplete`, null));
        expect(isHsaSectionComplete.get.toString()).toBe(`true`);
      });
      it(`requires a form 8889s`, ({ task }) => {
        task.meta.testedFactPaths = [`/requiresForm8889`];
        const { factGraph } = setupFactGraph({
          ...mfjBothWithQualifiedHsaDeductions,
        });

        const requiresForm8889 = factGraph.get(Path.concretePath(`/requiresForm8889`, null));
        expect(requiresForm8889.get.toString()).toBe(`true`);
      });
      it(`has both filers have contributions`, ({ task }) => {
        task.meta.testedFactPaths = [`/bothFilersHaveHsa`];
        const { factGraph } = setupFactGraph({
          ...mfjBothWithQualifiedHsaDeductions,
        });

        const bothFilersHaveContributions = factGraph.get(Path.concretePath(`/bothFilersHaveHsa`, null));
        expect(bothFilersHaveContributions.get.toString()).toBe(`true`);
      });
      it(`has both filers required to file a form 8889`, ({ task }) => {
        task.meta.testedFactPaths = [`/numberOfFilersRequiredToFileForm8889`];
        const { factGraph } = setupFactGraph({
          ...mfjBothWithQualifiedHsaDeductions,
        });

        const numberOfFilersRequiredToFileForm8889 = factGraph.get(
          Path.concretePath(`/numberOfFilersRequiredToFileForm8889`, null)
        );
        expect(numberOfFilersRequiredToFileForm8889.get.toString()).toBe(`2`);
      });
      it(`has total deductions`, ({ task }) => {
        task.meta.testedFactPaths = [`/hasHsaDeduction`];
        const { factGraph } = setupFactGraph({
          ...mfjBothWithQualifiedHsaDeductions,
        });

        const hasDeductions = factGraph.get(Path.concretePath(`/hasHsaDeduction`, null));
        expect(hasDeductions.get.toString()).toBe(`true`);
      });
      it(`has total deductions equal to the sum of both filers' deductions`, ({ task }) => {
        task.meta.testedFactPaths = [`/hsaTotalDeductibleAmount`];
        const { factGraph } = setupFactGraph({
          ...mfjBothWithQualifiedHsaDeductions,
        });

        const totalDeductions = factGraph.get(Path.concretePath(`/hsaTotalDeductibleAmount`, null));
        expect(totalDeductions.get.toString()).toBe(`6000.00`);
      });
      describe(`when the secondary filer edits their answer to having HSA contributions`, () => {
        const { factGraph } = setupFactGraph({
          ...mfjBothWithQualifiedHsaDeductions,
          [`/filers/#${spouseId}/writableSecondaryFilerHasMadeContributionsToHsa`]: createBooleanWrapper(false),
        });

        it(`no longer requires the secondary filer to file a form 8889 
          when they edit their answer to having HSA contributions in the TY`, ({ task }) => {
          task.meta.testedFactPaths = [`/numberOfFilersRequiredToFileForm8889`];
          const numberOfFilersRequiredToFileForm8889 = factGraph.get(
            Path.concretePath(`/numberOfFilersRequiredToFileForm8889`, null)
          );
          expect(numberOfFilersRequiredToFileForm8889.get.toString()).toBe(`1`);
        });
        it(`has contributions for only the primary filer`, ({ task }) => {
          task.meta.testedFactPaths = [`/bothFilersHaveHsa`];
          const bothFilersHaveContributions = factGraph.get(Path.concretePath(`/bothFilersHaveHsa`, null));
          expect(bothFilersHaveContributions.get.toString()).toBe(`false`);
        });
        it(`no longer has a total deduction for the secondary filer`, ({ task }) => {
          task.meta.testedFactPaths = [`/filers/*/hasHsaDeduction`];

          const hasDeductions = factGraph.get(Path.concretePath(`/secondaryFiler/hasHsaDeduction`, null));
          expect(hasDeductions.get.toString()).toBe(`false`);
        });
        it(`has a total deduction equal to the primary filer's deduction`, ({ task }) => {
          task.meta.testedFactPaths = [`/hsaTotalDeductibleAmount`];

          const totalDeductions = factGraph.get(Path.concretePath(`/hsaTotalDeductibleAmount`, null));
          expect(totalDeductions.get.toString()).toBe(`3000.00`);
        });
        it(`still requires a form 8889`, ({ task }) => {
          task.meta.testedFactPaths = [`/requiresForm8889`];

          const requiresForm8889 = factGraph.get(Path.concretePath(`/requiresForm8889`, null));
          expect(requiresForm8889.get.toString()).toBe(`true`);
        });
        it(`requires the secondary filer to go through the testing period questions`, ({ task }) => {
          task.meta.testedFactPaths = [
            `/flowSkipToHsaTestingPeriodContributionCheck`,
            `/flowShowHsaTestingPeriodContributionCheck`,
          ];

          const skipToHsaTestingPeriodContributionCheck = factGraph.get(
            Path.concretePath(`/secondaryFiler/flowSkipToHsaTestingPeriodContributionCheck`, null)
          );
          const showHsaTestingPeriodContributionCheck = factGraph.get(
            Path.concretePath(`/flowShowHsaTestingPeriodContributionCheck`, null)
          );
          expect(skipToHsaTestingPeriodContributionCheck.get.toString()).toBe(`true`);
          expect(showHsaTestingPeriodContributionCheck.get.toString()).toBe(`true`);
        });
        it(`has HSA section incomplete because the secondary filer has not answered the testing period questions`, ({
          task,
        }) => {
          task.meta.testedFactPaths = [`/isHsaSectionComplete`, `/hsaTestingPeriodCheckSectionIsComplete`];

          const hsaSectionComplete = factGraph.get(Path.concretePath(`/isHsaSectionComplete`, null));
          const hsaTestingPeriodCheckSectionIsComplete = factGraph.get(
            Path.concretePath(`/hsaTestingPeriodCheckSectionIsComplete`, null)
          );
          expect(hsaSectionComplete.get.toString()).toBe(`false`);
          expect(hsaTestingPeriodCheckSectionIsComplete.get.toString()).toBe(`false`);
        });
      });
      describe(`when the secondary filer edits their answer to not 
        having HSA contributions and has distributions`, () => {
        const { factGraph } = setupFactGraph({
          ...mfjBothWithQualifiedHsaDeductions,
          [`/filers/#${spouseId}/writableSecondaryFilerHasMadeContributionsToHsa`]: createBooleanWrapper(false),
          [`/someFilersMadeTestingPeriodContribution`]: createBooleanWrapper(false),
          [`/hsaDistributions`]: createCollectionWrapper([uuid]),
          [`/hsaDistributions/#${uuid}/filer`]: createCollectionItemWrapper(spouseId),
          [`/hsaDistributions/#${uuid}/writableGrossDistribution`]: createDollarWrapper(`100.00`),
        });
        it(`Requires both filers to file a form 8889`, ({ task }) => {
          task.meta.testedFactPaths = [`/numberOfFilersRequiredToFileForm8889`];

          const numberOfFilersRequiredToFileForm8889 = factGraph.get(
            Path.concretePath(`/numberOfFilersRequiredToFileForm8889`, null)
          );
          expect(numberOfFilersRequiredToFileForm8889.get.toString()).toBe(`2`);
        });
        it(`still only has contributions for the primary filer`, ({ task }) => {
          task.meta.testedFactPaths = [`/bothFilersHaveHsa`];

          const bothFilersHaveContributions = factGraph.get(Path.concretePath(`/bothFilersHaveHsa`, null));
          expect(bothFilersHaveContributions.get.toString()).toBe(`false`);
        });
        it(`has a total deduction equal to the primary filer's deduction`, ({ task }) => {
          task.meta.testedFactPaths = [`/hsaTotalDeductibleAmount`];

          const totalDeductions = factGraph.get(Path.concretePath(`/hsaTotalDeductibleAmount`, null));
          expect(totalDeductions.get.toString()).toBe(`3000.00`);
        });
        it(`no longer has a total deduction for the secondary filer`, ({ task }) => {
          task.meta.testedFactPaths = [`/filers/*/hasHsaDeduction`];

          const hasDeductions = factGraph.get(Path.concretePath(`/secondaryFiler/hasHsaDeduction`, null));
          expect(hasDeductions.get.toString()).toBe(`false`);
        });
        it(`leaves all the supported lines for part 1 of the secondary filer's form 8889 incomplete`, ({ task }) => {
          const secondaryFilerPart1Lines = [
            `/secondaryFiler/isCoveredBySelfOnlyHdhp`,
            `/secondaryFiler/isCoveredByFamilyHdhp`,
            // `/secondaryFiler/hsaNonemployerContributionsTotal`,
            `/secondaryFiler/hsaNonemployerContributionsTotalForExport`, // See if we can remove this
            `/secondaryFiler/hsaInitialContributionLimit`,
            `/secondaryFiler/hsaContributionLimitLessMsaContributions`,
            `/secondaryFiler/hsaContributionLimitLessAddition`,
            `/secondaryFiler/additionToHsaContributionLimit`,
            `/secondaryFiler/hsaTotalContributionLimit`,
            // `/secondaryFiler/hsaContributionsW2sTotal`, // Anytime we have W2 contributions, we have a form 8889
            // `/secondaryFiler/hsaFundingDistributionsTotal`, // This always has a value of 0 but is not exported
            // `/secondaryFiler/hsaEmployerContributionsAndFundingDistributionTotal`,
            `/secondaryFiler/hsaEmployerContributionsAndFundingDistributionTotalForExport`, // See if we can remove this
            `/secondaryFiler/hsaContributionLimitLessLine11`,
            `/secondaryFiler/hsaTotalDeductibleAmount`,
          ] as FDPath[];

          task.meta.testedFactPaths = secondaryFilerPart1Lines;
          secondaryFilerPart1Lines.forEach((line) => {
            const fact = factGraph.get(Path.concretePath(line, null));
            const factHasValueOrIsComplete = fact.hasValue ? fact.complete : false;
            expect(factHasValueOrIsComplete, `The fact ${line} had a value and was complete`).toBe(false);
          });
        });
      });
    });
  });
});

describe(`HSA distributions`, () => {
  describe(`for non-mfj filers`, () => {
    describe(`when the filer has non-w2 contributions`, () => {
      it(`displays the distributions section when filer has HSA activity`, ({ task }) => {
        task.meta.testedFactPaths = [`/someFilerCanHaveDistribution`];
        const { factGraph } = setupFactGraph({
          ...singleFilerWithHsaDeductions,
        });

        const hasHsaActivity = factGraph.get(Path.concretePath(`/someFilerCanHaveDistribution`, null));
        expect(hasHsaActivity.get.toString()).toBe(`true`);
      });
    });
  });
  describe(`for mfj filers`, () => {
    describe(`when filers have HSA activity`, () => {
      it(`displays the distributions section when both filers have HSA activity`, ({ task }) => {
        task.meta.testedFactPaths = [`/someFilerCanHaveDistribution`];
        const { factGraph } = setupFactGraph({
          ...mfjBothWithQualifiedHsaDeductions,
        });

        const hasHsaActivity = factGraph.get(Path.concretePath(`/someFilerCanHaveDistribution`, null));
        expect(hasHsaActivity.get.toString()).toBe(`true`);
      });
      it(`displays the distributions section when only the primary filer has HSA activity`, ({ task }) => {
        task.meta.testedFactPaths = [`/someFilerCanHaveDistribution`];
        const { factGraph } = setupFactGraph({
          ...mfjPrimaryOnlyWithQualifiedHsaDeductions,
        });

        const hasHsaActivity = factGraph.get(Path.concretePath(`/someFilerCanHaveDistribution`, null));
        expect(hasHsaActivity.get.toString()).toBe(`true`);
      });
      it(`displays the distributions section when only the secondary filer has HSA activity`, ({ task }) => {
        task.meta.testedFactPaths = [`/someFilerCanHaveDistribution`];
        const { factGraph } = setupFactGraph({
          ...mfjSecondaryOnlyWithQualifiedHsaDeductions,
        });

        const hasHsaActivity = factGraph.get(Path.concretePath(`/someFilerCanHaveDistribution`, null));
        expect(hasHsaActivity.get.toString()).toBe(`true`);
      });
      it(`displays the distributions section when only the primary filer has W2-based HSA activity`, ({ task }) => {
        task.meta.testedFactPaths = [`/someFilerCanHaveDistribution`];
        const { factGraph } = setupFactGraph({
          ...mfjFilerData,
          ...basePrimaryFilerHSAFactsWithoutContributionAmounts,
          ...makeMultipleW2s([{ w2Id: w2Id, income: 50000 }]),
          [Path.concretePath(`/formW2s/*/filer`, w2Id)]: createCollectionItemWrapper(primaryFilerId),
          [`/formW2s/#${w2Id}/employerHsaContributions`]: createDollarWrapper(`500.00`),
          [`/someFilerHadNonW2HsaActivity`]: createBooleanWrapper(false),
          [`/writablePrimaryFilerHadNonW2HsaActivity`]: createBooleanWrapper(false),
          [`/writableSecondaryFilerHadNonW2HsaActivity`]: createBooleanWrapper(false),
        });

        const hasHsaActivity = factGraph.get(Path.concretePath(`/someFilerCanHaveDistribution`, null));
        const primaryFilerCanHaveDistributions = factGraph.get(
          Path.concretePath(`/primaryFiler/hasHsaCanHaveDistribution`, null)
        );
        const secondaryFilerCanHaveDistributions = factGraph.get(
          Path.concretePath(`/secondaryFiler/hasHsaCanHaveDistribution`, null)
        );
        expect(hasHsaActivity.get.toString(), `Expected some filer could have distributions`).toBe(`true`);
        expect(primaryFilerCanHaveDistributions.get.toString(), `Expected primary filer could have distributions`).toBe(
          `true`
        );
        expect(secondaryFilerCanHaveDistributions.get.toString(), `Expected spouse can not have distributions`).toBe(
          `false`
        );
      });
      it(`still requires a form 8889 if both filers only had distributions`, ({ task }) => {
        task.meta.testedFactPaths = [`/requiresForm8889`];
        const hsaDistributionIdOne = `9ba9d216-81a8-4944-81ac-9410b2fad150`;
        const hsaDistributionIdTwo = `9ba9d216-81a8-4944-81ac-9410b2fad151`;
        const { factGraph } = setupFactGraph({
          ...mfjFilerData,
          ...baseHSAFactsSkipToTestingPeriod,
          [`/someFilerHadNonW2HsaActivity`]: createBooleanWrapper(true),
          [`/writablePrimaryFilerHadNonW2HsaActivity`]: createBooleanWrapper(true),
          [`/writableSecondaryFilerHadNonW2HsaActivity`]: createBooleanWrapper(true),
          ...makeMultipleHsaDistributions([
            { amount: 100, distributionId: hsaDistributionIdOne, filerId: primaryFilerId },
            { amount: 100, distributionId: hsaDistributionIdTwo, filerId: spouseId },
          ]),
        });

        const requiresForm8889 = factGraph.get(Path.concretePath(`/requiresForm8889`, null));
        expect(requiresForm8889.get.toString()).toBe(`true`);
      });
      it(`only requires a form 8889 for the primary filer if only the primary filer had distributions`, ({ task }) => {
        task.meta.testedFactPaths = [
          `/requiresForm8889`,
          `/primaryFiler/hasHsaDistributions`,
          `/secondaryFiler/hasHsaDistributions`,
          `/numberOfFilersRequiredToFileForm8889`,
        ];
        const hsaDistributionIdOne = `9ba9d216-81a8-4944-81ac-9410b2fad150`;
        const hsaDistributionIdTwo = `9ba9d216-81a8-4944-81ac-9410b2fad151`;
        const { factGraph } = setupFactGraph({
          ...mfjFilerData,
          ...baseHSAFactsSkipToTestingPeriod,
          [`/someFilerHadNonW2HsaActivity`]: createBooleanWrapper(true),
          [`/writablePrimaryFilerHadNonW2HsaActivity`]: createBooleanWrapper(true),
          // Secondary Filer does not have HSA activity
          [`/writableSecondaryFilerHadNonW2HsaActivity`]: createBooleanWrapper(false),
          ...makeMultipleHsaDistributions([
            { amount: 100, distributionId: hsaDistributionIdOne, filerId: primaryFilerId },
            { amount: 100, distributionId: hsaDistributionIdTwo, filerId: spouseId },
          ]),
        });

        const requiresForm8889 = factGraph.get(Path.concretePath(`/requiresForm8889`, null));
        const primaryFilerHasHsaDistributions = factGraph.get(
          Path.concretePath(`/primaryFiler/hasHsaDistributions`, null)
        );
        const secondaryFilerHasHsaDistributions = factGraph.get(
          Path.concretePath(`/secondaryFiler/hasHsaDistributions`, null)
        );
        const numberOfFilersRequiredToFileForm8889 = factGraph.get(
          Path.concretePath(`/numberOfFilersRequiredToFileForm8889`, null)
        );
        expect(requiresForm8889.get.toString()).toBe(`true`);
        expect(primaryFilerHasHsaDistributions.get.toString()).toBe(`true`);
        expect(secondaryFilerHasHsaDistributions.get.toString()).toBe(`false`);
        expect(numberOfFilersRequiredToFileForm8889.get.toString()).toBe(`1`);
      });
      it(`only requires a form 8889 for the secondary filer if only the secondary filer had distributions`, ({
        task,
      }) => {
        task.meta.testedFactPaths = [
          `/requiresForm8889`,
          `/primaryFiler/hasHsaDistributions`,
          `/secondaryFiler/hasHsaDistributions`,
          `/numberOfFilersRequiredToFileForm8889`,
        ];

        const hsaDistributionIdOne = `9ba9d216-81a8-4944-81ac-9410b2fad150`;
        const hsaDistributionIdTwo = `9ba9d216-81a8-4944-81ac-9410b2fad151`;
        const { factGraph } = setupFactGraph({
          ...mfjFilerData,
          ...baseHSAFactsSkipToTestingPeriod,
          [`/someFilerHadNonW2HsaActivity`]: createBooleanWrapper(true),
          [`/writablePrimaryFilerHadNonW2HsaActivity`]: createBooleanWrapper(false),
          [`/writableSecondaryFilerHadNonW2HsaActivity`]: createBooleanWrapper(true),
          ...makeMultipleHsaDistributions([
            { amount: 100, distributionId: hsaDistributionIdOne, filerId: primaryFilerId },
            { amount: 100, distributionId: hsaDistributionIdTwo, filerId: spouseId },
          ]),
        });

        const requiresForm8889 = factGraph.get(Path.concretePath(`/requiresForm8889`, null));
        const primaryFilerHasHsaDistributions = factGraph.get(
          Path.concretePath(`/primaryFiler/hasHsaDistributions`, null)
        );
        const secondaryFilerHasHsaDistributions = factGraph.get(
          Path.concretePath(`/secondaryFiler/hasHsaDistributions`, null)
        );
        const numberOfFilersRequiredToFileForm8889 = factGraph.get(
          Path.concretePath(`/numberOfFilersRequiredToFileForm8889`, null)
        );
        expect(requiresForm8889.get.toString()).toBe(`true`);
        expect(primaryFilerHasHsaDistributions.get.toString()).toBe(`false`);
        expect(secondaryFilerHasHsaDistributions.get.toString()).toBe(`true`);
        expect(numberOfFilersRequiredToFileForm8889.get.toString()).toBe(`1`);
      });
      it(`alerts the primary filer needs to remove distributions if they edit their answer to not have HSA activity`, ({
        task,
      }) => {
        task.meta.testedFactPaths = [
          `/hasHsaDistributionsWithoutActivity`,
          `/hsaDistributions/*/hasDistributionsWithoutHsaActivity`,
        ];
        const hsaDistributionIdOne = `9ba9d216-81a8-4944-81ac-9410b2fad150`;
        const hsaDistributionIdTwo = `9ba9d216-81a8-4944-81ac-9410b2fad151`;
        const { factGraph } = setupFactGraph({
          ...mfjFilerData,
          ...baseHSAFactsSkipToTestingPeriod,
          [`/someFilerHadNonW2HsaActivity`]: createBooleanWrapper(true),
          [`/writablePrimaryFilerHadNonW2HsaActivity`]: createBooleanWrapper(false),
          [`/writableSecondaryFilerHadNonW2HsaActivity`]: createBooleanWrapper(true),
          ...makeMultipleHsaDistributions([
            { amount: 100, distributionId: hsaDistributionIdOne, filerId: primaryFilerId },
            { amount: 100, distributionId: hsaDistributionIdTwo, filerId: spouseId },
          ]),
        });

        const primaryFilerHasDistributionsWithoutHsaActivity = factGraph.get(
          Path.concretePath(`/hsaDistributions/*/hasDistributionsWithoutHsaActivity`, hsaDistributionIdOne)
        );
        const hasHsaDistributionsWithoutActivity = factGraph.get(
          Path.concretePath(`/hasHsaDistributionsWithoutActivity`, null)
        );

        expect(hasHsaDistributionsWithoutActivity.get.toString(), `Expected distributions without HSA activity`).toBe(
          `true`
        );
        expect(
          primaryFilerHasDistributionsWithoutHsaActivity.get.toString(),
          `Expected primary to have distributions without activity`
        ).toBe(`true`);
      });
      it(`does not alert on HSA distribution activity if there are no distributions`, ({ task }) => {
        task.meta.testedFactPaths = [`/hasHsaDistributionsWithoutActivity`];
        const { factGraph } = setupFactGraph({
          ...mfjFilerData,
          ...baseHSAFactsSkipToTestingPeriod,
        });

        const hasHsaDistributionsWithoutActivity = factGraph.get(
          Path.concretePath(`/hasHsaDistributionsWithoutActivity`, null)
        );
        expect(hasHsaDistributionsWithoutActivity.get.toString()).toBe(`false`);
      });
      it(`does not alert on HSA distribution activity if neither filer has HSA activity`, ({ task }) => {
        task.meta.testedFactPaths = [`/hasHsaDistributionsWithoutActivity`];
        const hsaDistributionIdOne = `9ba9d216-81a8-4944-81ac-9410b2fad150`;
        const hsaDistributionIdTwo = `9ba9d216-81a8-4944-81ac-9410b2fad151`;
        const { factGraph } = setupFactGraph({
          ...mfjFilerData,
          ...baseHSAFactsSkipToTestingPeriod,
          [`/someFilerHadNonW2HsaActivity`]: createBooleanWrapper(false),
          ...makeMultipleHsaDistributions([
            { amount: 100, distributionId: hsaDistributionIdOne, filerId: primaryFilerId },
            { amount: 100, distributionId: hsaDistributionIdTwo, filerId: spouseId },
          ]),
        });

        const hasHsaDistributionsWithoutActivity = factGraph.get(
          Path.concretePath(`/hasHsaDistributionsWithoutActivity`, null)
        );
        expect(hasHsaDistributionsWithoutActivity.get.toString()).toBe(`false`);
      });
    });
  });
  describe(`Excess contributions withdrawn`, () => {
    describe(`when user has withdrawn more than their distributions`, () => {
      it(`sets fact true for alerting the user`, ({ task }) => {
        task.meta.testedFactPaths = [`/hsaDistributions/*/hasWithdrawnMoreThanGrossDistributions`];
        const { factGraph } = setupFactGraph({
          ...baseFilerData,
          [`/hsaDistributions`]: createCollectionWrapper([uuid]),
          [`/hsaDistributions/#${uuid}/hasWithdrawnExcessContributions`]: createBooleanWrapper(true),
          [`/hsaDistributions/#${uuid}/writableGrossDistribution`]: createDollarWrapper(`100.00`),
          [`/hsaDistributions/#${uuid}/writableWithdrawnExcessContributionsAmount`]: createDollarWrapper(`200.00`),
        });

        const hasWithdrawnMoreThanDistributions = factGraph.get(
          Path.concretePath(`/hsaDistributions/*/hasWithdrawnMoreThanGrossDistributions`, uuid)
        );
        expect(hasWithdrawnMoreThanDistributions.get.toString()).toBe(`true`);
      });

      it(`sets fact false so user is not alerted for edit condition`, ({ task }) => {
        task.meta.testedFactPaths = [`/hsaDistributions/*/hasWithdrawnMoreThanGrossDistributions`];
        const { factGraph } = setupFactGraph({
          ...baseFilerData,
          [`/hsaDistributions`]: createCollectionWrapper([uuid]),
          [`/hsaDistributions/#${uuid}/hasWithdrawnExcessContributions`]: createBooleanWrapper(false),
          [`/hsaDistributions/#${uuid}/writableGrossDistribution`]: createDollarWrapper(`100.00`),
          [`/hsaDistributions/#${uuid}/writableWithdrawnExcessContributionsAmount`]: createDollarWrapper(`200.00`),
        });

        const hasWithdrawnMoreThanDistributions = factGraph.get(
          Path.concretePath(`/hsaDistributions/*/hasWithdrawnMoreThanGrossDistributions`, uuid)
        );
        expect(hasWithdrawnMoreThanDistributions.get.toString()).toBe(`false`);
      });
    });

    describe(`when user has not withdrawn more than their distributions`, () => {
      it(`sets fact false so user is not alerted`, ({ task }) => {
        task.meta.testedFactPaths = [`/hsaDistributions/*/hasWithdrawnMoreThanGrossDistributions`];
        const { factGraph } = setupFactGraph({
          ...baseFilerData,
          [`/hsaDistributions`]: createCollectionWrapper([uuid]),
          [`/hsaDistributions/#${uuid}/hasWithdrawnExcessContributions`]: createBooleanWrapper(true),
          [`/hsaDistributions/#${uuid}/writableGrossDistribution`]: createDollarWrapper(`300.00`),
          [`/hsaDistributions/#${uuid}/writableWithdrawnExcessContributionsAmount`]: createDollarWrapper(`200.00`),
        });

        const hasWithdrawnMoreThanDistributions = factGraph.get(
          Path.concretePath(`/hsaDistributions/*/hasWithdrawnMoreThanGrossDistributions`, uuid)
        );
        expect(hasWithdrawnMoreThanDistributions.get.toString()).toBe(`false`);
      });
    });
  });
});
