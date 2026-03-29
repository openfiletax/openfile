import { describe, it, expect } from 'vitest';
import {
  createBooleanWrapper,
  createCollectionWrapper,
  createDayWrapper,
  createDollarWrapper,
  createEnumWrapper,
  createStringWrapper,
  createTinWrapper,
} from '../persistenceWrappers.js';
import { ConcretePath } from '@irs/js-factgraph-scala';
import { mfjFilerData, mfsFilerData, singleFilerData, uuid } from '../testData.js';
import { setupFactGraph } from '../setupFactGraph.js';
import { CURRENT_TAX_YEAR } from '../../constants/taxConstants.js';

export const primaryFilerId = `959c03d1-af4a-447f-96aa-d19397048a44`;
export const spouseId = `859c03d1-af4a-447f-96aa-d19397048a48`;

const birthYearIfTurnedXInTaxYear = (x: number): number => parseInt(CURRENT_TAX_YEAR) - x;

describe(`Reduced Standard Deduction`, () => {
  const singleFilerData = {
    [`/filers/#${primaryFilerId}/firstName`]: createStringWrapper(`Test`),
    '/filers': createCollectionWrapper([primaryFilerId, spouseId]),
    [`/filers/#${primaryFilerId}/dateOfBirth`]: createDayWrapper(`1987-01-01`),
    [`/filers/#${primaryFilerId}/isBlind`]: createBooleanWrapper(false),
    [`/filers/#${primaryFilerId}/isPrimaryFiler`]: createBooleanWrapper(true),
    [`/filers/#${spouseId}/isPrimaryFiler`]: createBooleanWrapper(false),
    '/maritalStatus': createEnumWrapper(`single`, `/maritalStatusOptions`),
    '/filingStatus': createEnumWrapper(`single`, `/filingStatusOptions`),

    // Must make a US citizen, give them a TIN, and give them earned income to pass EITC eligibility
    [`/filers/#${primaryFilerId}/isUsCitizenFullYear`]: createBooleanWrapper(true),
    [`/filers/#${primaryFilerId}/tin`]: createTinWrapper({ area: `555`, group: `55`, serial: `5555` }),
    '/formW2s': createCollectionWrapper([uuid]),
    [`/formW2s/#${uuid}/writableWages`]: createDollarWrapper(`1`),
  };

  it(`Receives the normal standard deduction when the filer cannot be claimed`, ({ task }) => {
    task.meta.testedFactPaths = [`/standardDeduction`];
    const { factGraph } = setupFactGraph({
      ...singleFilerData,
      ...{ [`/filers/#${primaryFilerId}/canBeClaimed`]: createBooleanWrapper(false) },
    });
    // Normal standard deduction for 2025= $15,000
    expect(factGraph.get(`/standardDeduction` as ConcretePath).get.toString()).toBe(`15000.00`);
  });

  it(`When the filer can be claimed, but the claimer is filing for refund only or not filing,
      receives the normal standard deduction`, ({ task }) => {
    // When the claimer is filing for refund only
    task.meta.testedFactPaths = [`/standardDeduction`];
    const { factGraph: filingFactGraph } = setupFactGraph({
      ...singleFilerData,
      ...{
        [`/filers/#${primaryFilerId}/canBeClaimed`]: createBooleanWrapper(true),
        [`/filers/#${primaryFilerId}/potentialClaimerMustFile`]: createBooleanWrapper(false),
        [`/filers/#${primaryFilerId}/potentialClaimerDidFile`]: createBooleanWrapper(true),
        [`/primaryFilerPotentialClaimerFiledOnlyForRefund`]: createBooleanWrapper(true),
      },
    });
    // Normal standard deduction for 2025= $15,000
    expect(filingFactGraph.get(`/standardDeduction` as ConcretePath).get.toString()).toBe(`15000.00`);
    task.meta.testedFactPaths = [`/standardDeduction`];

    // The claimer isn't filing
    const { factGraph } = setupFactGraph({
      ...singleFilerData,
      ...{
        [`/filers/#${primaryFilerId}/canBeClaimed`]: createBooleanWrapper(true),
        [`/filers/#${primaryFilerId}/potentialClaimerMustFile`]: createBooleanWrapper(false),
        [`/filers/#${primaryFilerId}/potentialClaimerDidFile`]: createBooleanWrapper(false),
      },
    });
    // Normal standard deduction for 2025= $15,000
    expect(factGraph.get(`/standardDeduction` as ConcretePath).get.toString()).toBe(`15000.00`);
  });

  it(`When the filer can be claimed,
     receives lower standard deduction when claimer is required to file or filing for refund and credits`, ({
    task,
  }) => {
    // When the claimer must file
    task.meta.testedFactPaths = [`/standardDeduction`];
    const { factGraph: mustFileFactGraph } = setupFactGraph({
      ...singleFilerData,
      ...{
        [`/filers/#${primaryFilerId}/canBeClaimed`]: createBooleanWrapper(true),
        [`/filers/#${primaryFilerId}/potentialClaimerMustFile`]: createBooleanWrapper(true),
      },
    });
    expect(mustFileFactGraph.get(`/standardDeduction` as ConcretePath).get.toString()).toBe(`1350.00`);

    // The claimer is filing for refund + credits
    const { factGraph } = setupFactGraph({
      ...singleFilerData,
      ...{
        [`/filers/#${primaryFilerId}/canBeClaimed`]: createBooleanWrapper(true),
        [`/filers/#${primaryFilerId}/potentialClaimerMustFile`]: createBooleanWrapper(false),
        [`/filers/#${primaryFilerId}/potentialClaimerDidFile`]: createBooleanWrapper(true),
        [`/primaryFilerPotentialClaimerFiledOnlyForRefund`]: createBooleanWrapper(false),
      },
    });
    expect(factGraph.get(`/standardDeduction` as ConcretePath).get.toString()).toBe(`1350.00`);
  });
});

describe(`Standard deduction additional items`, () => {
  describe(`For a single filer`, () => {
    it(`additional items are zero if not blind or over 65`, ({ task }) => {
      task.meta.testedFactPaths = [`/additionalStandardDeductionItems`];

      const { factGraph } = setupFactGraph(singleFilerData);
      expect(factGraph.get(`/additionalStandardDeductionItems` as ConcretePath).get).toBe(0);
    });
    it(`ignores a spouse that they previously entered`, ({ task }) => {
      task.meta.testedFactPaths = [`/additionalStandardDeductionItems`];

      const { factGraph } = setupFactGraph({
        ...singleFilerData,
        ...{
          [`/filingStatus`]: createEnumWrapper(`single`, `/filingStatusOptions`),
          [`/filers/#${spouseId}/isBlind`]: createBooleanWrapper(true),
        },
      });
      expect(factGraph.get(`/additionalStandardDeductionItems` as ConcretePath).get).toBe(0);
    });
    it(`adds an item if the filer is over 65`, ({ task }) => {
      task.meta.testedFactPaths = [`/additionalStandardDeductionItems`];

      const yob = birthYearIfTurnedXInTaxYear(66);
      const { factGraph } = setupFactGraph({
        ...singleFilerData,
        [`/filers/#${primaryFilerId}/dateOfBirth`]: createDayWrapper(`${yob}-06-06`),
      });
      expect(factGraph.get(`/additionalStandardDeductionItems` as ConcretePath).get).toBe(1);
    });
    it(`adds an item if the filer is blind`, ({ task }) => {
      task.meta.testedFactPaths = [`/additionalStandardDeductionItems`];

      const { factGraph } = setupFactGraph({
        ...singleFilerData,
        [`/filers/#${primaryFilerId}/isBlind`]: createBooleanWrapper(true),
      });
      expect(factGraph.get(`/additionalStandardDeductionItems` as ConcretePath).get).toBe(1);
    });
    it(`counts January 1 of the next year as 65 `, ({ task }) => {
      task.meta.testedFactPaths = [`/additionalStandardDeductionItems`];

      // Pub 501 defines a person's birthday as the day before their birthday.
      // so if you turn 65 on January 1 of the following tax year, you receive an additional item
      const yob = birthYearIfTurnedXInTaxYear(64);
      const { factGraph } = setupFactGraph({
        ...singleFilerData,
        [`/filers/#${primaryFilerId}/dateOfBirth`]: createDayWrapper(`${yob}-01-01`),
      });
      expect(factGraph.get(`/additionalStandardDeductionItems` as ConcretePath).get).toBe(1);
    });
    it(`Does not count January 2 of the next year as 65 `, ({ task }) => {
      task.meta.testedFactPaths = [`/additionalStandardDeductionItems`];

      // Pub 501 defines a person's birthday as the day before their birthday.
      // so if you turn 65 on January 1 of the following tax year, you receive an additional item
      const yob = birthYearIfTurnedXInTaxYear(64);
      const { factGraph } = setupFactGraph({
        ...singleFilerData,
        [`/filers/#${primaryFilerId}/dateOfBirth`]: createDayWrapper(`${yob}-01-02`),
      });
      expect(factGraph.get(`/additionalStandardDeductionItems` as ConcretePath).get).toBe(0);
    });
  });
  describe(`For HoH`, () => {
    it(`Ignores any spouse that has been entered`, ({ task }) => {
      task.meta.testedFactPaths = [`/additionalStandardDeductionItems`];

      const { factGraph } = setupFactGraph({
        ...singleFilerData,
        ...{
          [`/filingStatus`]: createEnumWrapper(`headOfHousehold`, `/filingStatusOptions`),
          [`/filers/#${spouseId}/isBlind`]: createBooleanWrapper(true),
        },
      });
      expect(factGraph.get(`/additionalStandardDeductionItems` as ConcretePath).get).toBe(0);
    });
  });
  describe(`For an MFJ filer`, () => {
    it(`additional items are zero if TP and Spouse are not blind or over 65`, ({ task }) => {
      task.meta.testedFactPaths = [`/additionalStandardDeductionItems`];

      const { factGraph } = setupFactGraph(mfjFilerData);
      expect(factGraph.get(`/additionalStandardDeductionItems` as ConcretePath).get).toBe(0);
    });
    it(`Provides a deduction item if MFJ spouse is blind`, ({ task }) => {
      task.meta.testedFactPaths = [`/additionalStandardDeductionItems`];

      const { factGraph } = setupFactGraph({
        ...mfjFilerData,
        [`/filers/#${spouseId}/isBlind`]: createBooleanWrapper(true),
      });
      expect(factGraph.get(`/additionalStandardDeductionItems` as ConcretePath).get).toBe(1);
    });
    it(`Provides a deduction item if MFJ spouse is over 65`, ({ task }) => {
      task.meta.testedFactPaths = [`/additionalStandardDeductionItems`];

      const yob = birthYearIfTurnedXInTaxYear(65);
      const { factGraph } = setupFactGraph({
        ...mfjFilerData,
        [`/filers/#${spouseId}/dateOfBirth`]: createDayWrapper(`${yob}-06-06`),
      });
      expect(factGraph.get(`/additionalStandardDeductionItems` as ConcretePath).get).toBe(1);
    });
    it(`Provides 4 deduction items if both the TP and Spouse are over 65 and blind`, ({ task }) => {
      task.meta.testedFactPaths = [`/additionalStandardDeductionItems`];

      const yob = birthYearIfTurnedXInTaxYear(65);
      const { factGraph } = setupFactGraph({
        ...mfjFilerData,
        ...{
          [`/filers/#${spouseId}/dateOfBirth`]: createDayWrapper(`${yob}-06-06`),
          [`/filers/#${primaryFilerId}/dateOfBirth`]: createDayWrapper(`${yob}-06-06`),
          [`/filers/#${primaryFilerId}/isBlind`]: createBooleanWrapper(true),
          [`/filers/#${spouseId}/isBlind`]: createBooleanWrapper(true),
        },
      });
      expect(factGraph.get(`/additionalStandardDeductionItems` as ConcretePath).get).toBe(4);
    });
    it(`Provides a deduction item if deceased MFJ spouse turned 65 in tax year before dying`, ({ task }) => {
      task.meta.testedFactPaths = [`/additionalStandardDeductionItems`];

      const yob = birthYearIfTurnedXInTaxYear(65);
      const { factGraph } = setupFactGraph({
        ...mfjFilerData,
        ...{
          [`/filingStatus`]: createEnumWrapper(`marriedFilingJointly`, `/filingStatusOptions`),
          [`/maritalStatus`]: createEnumWrapper(`widowed`, `/maritalStatusOptions`),
          [`/yearOfSpouseDeath`]: createEnumWrapper(`taxYear`, `/yearOfSpouseDeathOptions`),
          // The day before their birthday counts as 65
          [`/filers/#${spouseId}/dateOfBirth`]: createDayWrapper(`${yob}-06-06`),
          [`/secondaryFilerDateOfDeath`]: createDayWrapper(`${CURRENT_TAX_YEAR}-06-05`),
        },
      });
      expect(factGraph.get(`/additionalStandardDeductionItems` as ConcretePath).get).toBe(1);
    });

    it(`Provides a deduction item if deceased MFJ spouse was already over 65 before tax year`, ({ task }) => {
      task.meta.testedFactPaths = [`/additionalStandardDeductionItems`];

      const yob = birthYearIfTurnedXInTaxYear(66);
      const { factGraph } = setupFactGraph({
        ...mfjFilerData,
        ...{
          [`/filingStatus`]: createEnumWrapper(`marriedFilingJointly`, `/filingStatusOptions`),
          [`/maritalStatus`]: createEnumWrapper(`widowed`, `/maritalStatusOptions`),
          [`/yearOfSpouseDeath`]: createEnumWrapper(`taxYear`, `/yearOfSpouseDeathOptions`),
          [`/filers/#${spouseId}/dateOfBirth`]: createDayWrapper(`${yob}-06-06`),
          [`/secondaryFilerDateOfDeath`]: createDayWrapper(`${CURRENT_TAX_YEAR}-06-04`),
        },
      });
      expect(factGraph.get(`/additionalStandardDeductionItems` as ConcretePath).get).toBe(1);
    });
    it(`Does not provide a deduction item if deceased MFJ spouse died before turning 65`, ({ task }) => {
      task.meta.testedFactPaths = [`/additionalStandardDeductionItems`];

      const yob = birthYearIfTurnedXInTaxYear(65);
      const { factGraph } = setupFactGraph({
        ...mfjFilerData,
        ...{
          [`/filingStatus`]: createEnumWrapper(`marriedFilingJointly`, `/filingStatusOptions`),
          [`/maritalStatus`]: createEnumWrapper(`widowed`, `/maritalStatusOptions`),
          [`/yearOfSpouseDeath`]: createEnumWrapper(`taxYear`, `/yearOfSpouseDeathOptions`),
          [`/filers/#${spouseId}/dateOfBirth`]: createDayWrapper(`${yob}-06-06`),
          [`/secondaryFilerDateOfDeath`]: createDayWrapper(`${CURRENT_TAX_YEAR}-06-04`),
        },
      });
      expect(factGraph.get(`/additionalStandardDeductionItems` as ConcretePath).get).toBe(0);
    });
    it(`counts January 1 of the next year as 65 `, ({ task }) => {
      task.meta.testedFactPaths = [`/additionalStandardDeductionItems`];

      // Pub 501 defines a person's birthday as the day before their birthday.
      // so if you turn 65 on January 1 of the following tax year, you receive an additional item
      const yob = birthYearIfTurnedXInTaxYear(64);
      const { factGraph } = setupFactGraph({
        ...mfjFilerData,
        ...{
          [`/filers/#${spouseId}/dateOfBirth`]: createDayWrapper(`${yob}-01-01`),
        },
      });
      expect(factGraph.get(`/additionalStandardDeductionItems` as ConcretePath).get).toBe(1);
    });
    it(`Does not count January 2 of the next year as 65 `, ({ task }) => {
      task.meta.testedFactPaths = [`/additionalStandardDeductionItems`];

      // Pub 501 defines a person's birthday as the day before their birthday.
      // so if you turn 65 on January 1 of the following tax year, you receive an additional item
      const yob = birthYearIfTurnedXInTaxYear(64);
      const { factGraph } = setupFactGraph({
        ...mfjFilerData,
        ...{
          [`/filers/#${spouseId}/dateOfBirth`]: createDayWrapper(`${yob}-01-02`),
        },
      });
      expect(factGraph.get(`/additionalStandardDeductionItems` as ConcretePath).get).toBe(0);
    });
  });
  describe(`For an MFS filer`, () => {
    it(`Adds an additional item for blindness if the spouse is blind with no income,
        isn't filing, and can't be claimed as a dependent`, ({ task }) => {
      task.meta.testedFactPaths = [`/additionalStandardDeductionItems`];

      const { factGraph } = setupFactGraph({
        ...mfsFilerData,
        ...{
          [`/filers/#${spouseId}/isBlind`]: createBooleanWrapper(true),
          [`/MFSSpouse65OrOlder`]: createBooleanWrapper(false),
          [`/MFSSpouseHasGrossIncome`]: createBooleanWrapper(false),
          [`/MFSLivingSpouseFilingReturn`]: createBooleanWrapper(false),
          [`/filers/#${spouseId}/canBeClaimed`]: createBooleanWrapper(false),
        },
      });

      expect(factGraph.get(`/additionalStandardDeductionItems` as ConcretePath).get).toBe(1);
    });
    it(`Adds an additional item for age if the spouse is over 65 with no income,
    isn't filing, and can't be claimed as a dependent`, ({ task }) => {
      task.meta.testedFactPaths = [`/additionalStandardDeductionItems`];

      const { factGraph } = setupFactGraph({
        ...mfsFilerData,
        ...{
          [`/MFSSpouse65OrOlder`]: createBooleanWrapper(true),
          [`/MFSSpouseHasGrossIncome`]: createBooleanWrapper(false),
          [`/MFSLivingSpouseFilingReturn`]: createBooleanWrapper(false),
          [`/filers/#${spouseId}/canBeClaimed`]: createBooleanWrapper(false),
        },
      });
      expect(factGraph.get(`/additionalStandardDeductionItems` as ConcretePath).get).toBe(1);
    });
    it(`Does not add an additional item for blindness if the spouse is blind but has income`, ({ task }) => {
      task.meta.testedFactPaths = [`/additionalStandardDeductionItems`];

      const { factGraph } = setupFactGraph({
        ...mfsFilerData,
        ...{
          [`/filers/#${spouseId}/isBlind`]: createBooleanWrapper(true),
          [`/MFSSpouseHasGrossIncome`]: createBooleanWrapper(true),
          [`/MFSLivingSpouseFilingReturn`]: createBooleanWrapper(false),
          [`/filers/#${spouseId}/canBeClaimed`]: createBooleanWrapper(false),
        },
      });
      expect(factGraph.get(`/additionalStandardDeductionItems` as ConcretePath).get).toBe(0);
    });
    it(`Does not add an additional item for blindness if the spouse is blind but is filing`, ({ task }) => {
      task.meta.testedFactPaths = [`/additionalStandardDeductionItems`];

      const { factGraph } = setupFactGraph({
        ...mfsFilerData,
        ...{
          [`/filers/#${spouseId}/isBlind`]: createBooleanWrapper(true),
          [`/MFSSpouseHasGrossIncome`]: createBooleanWrapper(false),
          [`/MFSLivingSpouseFilingReturn`]: createBooleanWrapper(true),
          [`/filers/#${spouseId}/canBeClaimed`]: createBooleanWrapper(false),
        },
      });
      expect(factGraph.get(`/additionalStandardDeductionItems` as ConcretePath).get).toBe(0);
    });
    it(`Does not add an additional item for blindness if the spouse is blind but can be claimed`, ({ task }) => {
      task.meta.testedFactPaths = [`/additionalStandardDeductionItems`];
      const { factGraph } = setupFactGraph({
        ...mfsFilerData,
        ...{
          [`/filers/#${spouseId}/isBlind`]: createBooleanWrapper(true),
          [`/MFSSpouseHasGrossIncome`]: createBooleanWrapper(false),
          [`/MFSLivingSpouseFilingReturn`]: createBooleanWrapper(false),
          [`/filers/#${spouseId}/canBeClaimed`]: createBooleanWrapper(true),
        },
      });
      expect(factGraph.get(`/additionalStandardDeductionItems` as ConcretePath).get).toBe(0);
    });
  });
});
