import { it, describe, expect } from 'vitest';
import { Path } from '../../flow/Path.js';
import {
  createBooleanWrapper,
  createCollectionItemWrapper,
  createDollarWrapper,
  createEnumWrapper,
} from '../persistenceWrappers.js';
import { baseFilerData, mfjBothWithQualifiedHsaDeductions, primaryFilerId } from '../testData.js';
import { setupFactGraph } from '../setupFactGraph.js';

const w2Id = `0b1e355e-3d19-415d-8470-fbafd9f58361`;
const baseIncomeData = {
  '/formW2s': {
    $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
    item: { items: [`${w2Id}`] },
  },
  [`/formW2s/#${w2Id}/filer`]: createCollectionItemWrapper(primaryFilerId),
};

const made10kIncomeData = {
  ...baseIncomeData,
  [`/formW2s/#${w2Id}/writableWages`]: createDollarWrapper(`10000.00`),
};

const made83kIncomeData = {
  ...baseIncomeData,
  [`/formW2s/#${w2Id}/writableWages`]: createDollarWrapper(`83000.00`),
};
const made88kIncomeData = {
  ...baseIncomeData,
  [`/formW2s/#${w2Id}/writableWages`]: createDollarWrapper(`88000.00`),
};

const made168kIncomeData = {
  ...baseIncomeData,
  [`/formW2s/#${w2Id}/writableWages`]: createDollarWrapper(`168000.00`),
};
const made173kIncomeData = {
  ...baseIncomeData,
  [`/formW2s/#${w2Id}/writableWages`]: createDollarWrapper(`173000.00`),
};

const made190kIncomeData = {
  ...baseIncomeData,
  [`/formW2s/#${w2Id}/writableWages`]: createDollarWrapper(`190000.00`),
};

const made200kIncomeData = {
  ...baseIncomeData,
  [`/formW2s/#${w2Id}/writableWages`]: createDollarWrapper(`200000.00`),
};
const made210kIncomeData = {
  ...baseIncomeData,
  [`/formW2s/#${w2Id}/writableWages`]: createDollarWrapper(`210000.00`),
};

const studentLoanEligibleData = {
  [`/hadStudentLoanInterestPayments`]: createBooleanWrapper(true),
  [`/studentLoansQualify`]: createBooleanWrapper(true),
};

const singleFilerData = {
  ...baseFilerData,
  [`/filers/#${primaryFilerId}/canBeClaimed`]: createBooleanWrapper(false),
  [`/filingStatus`]: createEnumWrapper(`single`, `/filingStatusOptions`),
};

const mfjFilerData = {
  ...baseFilerData,
  [`/filers/#${primaryFilerId}/canBeClaimed`]: createBooleanWrapper(false),
  [`/filingStatus`]: createEnumWrapper(`marriedFilingJointly`, `/filingStatusOptions`),
};

describe(`student loan deduction related facts`, () => {
  describe(`When MFJ`, () => {
    it(`Returns 0 if over the income limit`, ({ task }) => {
      task.meta.testedFactPaths = [`/studentLoanInterestAdjustmentAmount`];

      const { factGraph } = setupFactGraph({
        ...mfjFilerData,
        ...studentLoanEligibleData,
        ...made200kIncomeData,
        [`/studentLoanInterestAmount`]: createDollarWrapper(`500.00`),
      });
      expect(factGraph.get(Path.concretePath(`/studentLoanInterestAdjustmentAmount`, null)).get.toString()).toBe(
        `0.00`
      );
    });
    it(`Phases out in the phase out category`, ({ task }) => {
      task.meta.testedFactPaths = [`/studentLoanInterestAdjustmentAmount`];

      const { factGraph } = setupFactGraph({
        ...mfjFilerData,
        ...studentLoanEligibleData,
        ...made173kIncomeData,
        [`/studentLoanInterestAmount`]: createDollarWrapper(`500.00`),
      });

      // The /studentLoanPhaseOutStartMfj is $170,000 and /studentLoanPhaseOutCompleteMfj is $200,000.
      // The filer’s income of $173,000 is $3,000 above the $170,000 threshold.
      // The /studentLoanPhaseOutRange is $200,000 - $170,000 = $30,000.
      // Their /studentLoanInterestAmount is $500.00
      // $3000 / $30,000 * 500 = 50 is phased out
      // 500 - 50 = 450
      expect(factGraph.get(Path.concretePath(`/studentLoanInterestAdjustmentAmount`, null)).get.toString()).toBe(
        `450.00`
      );
    });
    it(`Returns the full amount if not phasing out and under 2500`, ({ task }) => {
      task.meta.testedFactPaths = [`/studentLoanInterestAdjustmentAmount`];

      const { factGraph } = setupFactGraph({
        ...mfjFilerData,
        ...studentLoanEligibleData,
        ...made83kIncomeData,
        [`/studentLoanInterestAmount`]: createDollarWrapper(`500.00`),
      });

      // The /studentLoanPhaseOutStartMfj is $165,000 and /studentLoanPhaseOutCompleteMfj is $195,000.
      // The filer’s income of $83,000 is below the threshold
      // Their /studentLoanInterestAmount is $500.00 and is below the $2500 limit
      // They get the full amount
      expect(factGraph.get(Path.concretePath(`/studentLoanInterestAdjustmentAmount`, null)).get.toString()).toBe(
        `500.00`
      );
    });
    it(`Returns 2500 if not phasing out and amount is above 2500`, ({ task }) => {
      task.meta.testedFactPaths = [`/studentLoanInterestAdjustmentAmount`];

      const { factGraph } = setupFactGraph({
        ...mfjFilerData,
        ...studentLoanEligibleData,
        ...made83kIncomeData,
        [`/studentLoanInterestAmount`]: createDollarWrapper(`3000.00`),
      });

      // The /studentLoanPhaseOutStartMfj is $165,000 and /studentLoanPhaseOutCompleteMfj is $195,000.
      // The filer’s income of $83,000 is below the threshold
      // Their /studentLoanInterestAmount is $3000 which is above the $2500 limit
      // They get the limit of $2500
      expect(factGraph.get(Path.concretePath(`/studentLoanInterestAdjustmentAmount`, null)).get.toString()).toBe(
        `2500.00`
      );
    });
    // MAGI is reduced by HSA deductions, so a filer who is slightly over the limit
    // could still qualify if they have HSA deductions.
    it(`when income is too high, HSA deductions can bring the filer under the limit`, ({ task }) => {
      task.meta.testedFactPaths = [`/studentLoanInterestAdjustmentAmount`];

      const { factGraph } = setupFactGraph({
        ...mfjFilerData,
        ...mfjBothWithQualifiedHsaDeductions,
        ...studentLoanEligibleData,
        ...made190kIncomeData,
        [`/studentLoanInterestAmount`]: createDollarWrapper(`2500.00`),
      });
      // Using the Student Loan Interest Deduction Worksheet
      // https://www.irs.gov/instructions/i1040gi#en_US_2023_publink10002127
      // 1. Student loan interest = $2500
      // 2. total income = /totalIncome = $190,000
      // 3. lines 11 through 20, and 23 and 25 = /adjustmentsToIncomeExcludingStudentLoanInterest = $6000
      // due to HSA contributions
      // 4. /magiForStudentLoanInterestDeduction = $184,000
      // 5. /studentLoanPhaseOutStartMfj = $170,000
      // 6. is 4 more than 5? Yes =  $184,000 - $170,000 = $14,000
      // 7. $14,000 / 30,000 = 0.4666...
      // 8. 0.4666... * $2500 = $1166.67
      // 9. $2500 - $1166.67 = $1333.33 (rounded to $1333)

      expect(factGraph.get(Path.concretePath(`/hsaTotalDeductibleAmount`, null)).get.toString()).toBe(`6000.00`);
      expect(
        factGraph.get(Path.concretePath(`/adjustmentsToIncomeExcludingStudentLoanInterest`, null)).get.toString()
      ).toBe(`6000.00`);
      expect(factGraph.get(Path.concretePath(`/studentLoanInterestAdjustmentAmount`, null)).get.toString()).toBe(
        `1333.00`
      );
    });

    it(`cannot deduct student loan interest when income is too high`, ({ task }) => {
      task.meta.testedFactPaths = [`/cannotDeductStudentLoanInterest`];

      const { factGraph } = setupFactGraph({
        ...mfjFilerData,
        ...made210kIncomeData,
        ...studentLoanEligibleData,
        [`/studentLoanInterestAmount`]: createDollarWrapper(`500.00`),
      });
      expect(factGraph.get(Path.concretePath(`/cannotDeductStudentLoanInterest`, null)).get).toBe(true);
    });
  });
  describe(`When Single`, () => {
    it(`Returns 0 if over the income limit`, ({ task }) => {
      task.meta.testedFactPaths = [`/studentLoanInterestAdjustmentAmount`];

      const { factGraph } = setupFactGraph({
        ...singleFilerData,
        ...studentLoanEligibleData,
        ...made168kIncomeData,
        [`/studentLoanInterestAmount`]: createDollarWrapper(`500.00`),
      });
      expect(factGraph.get(Path.concretePath(`/studentLoanInterestAdjustmentAmount`, null)).get.toString()).toBe(
        `0.00`
      );
    });
    it(`Phases out in the phase out category`, ({ task }) => {
      task.meta.testedFactPaths = [`/studentLoanInterestAdjustmentAmount`];

      const { factGraph } = setupFactGraph({
        ...singleFilerData,
        ...studentLoanEligibleData,
        ...made88kIncomeData,
        [`/studentLoanInterestAmount`]: createDollarWrapper(`500.00`),
      });
      expect(factGraph.get(Path.concretePath(`/studentLoanInterestAdjustmentAmount`, null)).get.toString()).toBe(
        `400.00`
      );
    });
    it(`Returns the full amount if not phasing out and under 2500`, ({ task }) => {
      task.meta.testedFactPaths = [`/studentLoanInterestAdjustmentAmount`];

      const { factGraph } = setupFactGraph({
        ...singleFilerData,
        ...studentLoanEligibleData,
        ...made10kIncomeData,
        [`/studentLoanInterestAmount`]: createDollarWrapper(`500.00`),
      });
      expect(factGraph.get(Path.concretePath(`/studentLoanInterestAdjustmentAmount`, null)).get.toString()).toBe(
        `500.00`
      );
    });
    it(`Returns 2500 if not phasing out and amount is above 2500`, ({ task }) => {
      task.meta.testedFactPaths = [`/studentLoanInterestAdjustmentAmount`];

      const { factGraph } = setupFactGraph({
        ...singleFilerData,
        ...studentLoanEligibleData,
        ...made10kIncomeData,
        [`/studentLoanInterestAmount`]: createDollarWrapper(`3000.00`),
      });
      expect(factGraph.get(Path.concretePath(`/studentLoanInterestAdjustmentAmount`, null)).get.toString()).toBe(
        `2500.00`
      );
    });

    it(`cannot deduct student loan interest when income is too high`, ({ task }) => {
      task.meta.testedFactPaths = [`/cannotDeductStudentLoanInterest`];

      const { factGraph } = setupFactGraph({
        ...singleFilerData,
        ...made168kIncomeData,
      });
      expect(factGraph.get(Path.concretePath(`/cannotDeductStudentLoanInterest`, null)).get).toBe(true);
    });
  });

  it(`cannot deduct student loan interest when filing status is MFS`, ({ task }) => {
    task.meta.testedFactPaths = [`/cannotDeductStudentLoanInterest`];

    const { factGraph } = setupFactGraph({
      ...baseFilerData,
      [`/filingStatus`]: createEnumWrapper(`marriedFilingSeparately`, `/filingStatusOptions`),
    });
    expect(factGraph.get(Path.concretePath(`/cannotDeductStudentLoanInterest`, null)).get).toBe(true);
  });

  it(`cannot deduct student loan interest when the TP or their spouse are being claimed as a dependent`, ({ task }) => {
    task.meta.testedFactPaths = [`/cannotDeductStudentLoanInterest`];

    const { factGraph } = setupFactGraph({
      ...singleFilerData,
      [`/hadStudentLoanInterestPayments`]: createBooleanWrapper(true),
      [`/filers/#${primaryFilerId}/canBeClaimed`]: createBooleanWrapper(true),
      [`/filers/#${primaryFilerId}/potentialClaimerMustFile`]: createBooleanWrapper(true),
      [`/filers/#${primaryFilerId}/willBeClaimed`]: createBooleanWrapper(true),
    });
    expect(factGraph.get(Path.concretePath(`/cannotDeductStudentLoanInterest`, null)).get).toBe(true);
  });

  it(`cannot deduct student loan interest when their loans do not qualify`, ({ task }) => {
    task.meta.testedFactPaths = [`/cannotDeductStudentLoanInterest`];

    const { factGraph } = setupFactGraph({
      ...singleFilerData,
      [`/hadStudentLoanInterestPayments`]: createBooleanWrapper(true),
      [`/studentLoansQualify`]: createBooleanWrapper(false),
    });
    expect(factGraph.get(Path.concretePath(`/cannotDeductStudentLoanInterest`, null)).get).toBe(true);
  });
});
