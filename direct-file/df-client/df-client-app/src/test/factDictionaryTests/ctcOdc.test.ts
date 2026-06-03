import { it, describe, expect } from 'vitest';
import { Path } from '../../flow/Path.js';
import { baseFilerData, makeChildData, makeW2Data, primaryFilerId } from '../testData.js';
import { createBooleanWrapper, createDayWrapper, createEnumWrapper } from '../persistenceWrappers.js';
import { CURRENT_TAX_YEAR } from '../../constants/taxConstants.js';
import { setupFactGraph } from '../setupFactGraph.js';

const childDependentId = `4fa3a5a7-a9d1-43a9-a0fb-277596e70d48`;
const childDependentId2 = `71c66f78-31b0-4a92-ab5b-c211784b16c7`;
const childDependentId3 = `8f4b5c65-2b14-46fa-bb8b-c449103c798a`;

const dob = {
  barelyFourteenAtStartOfYear: `${parseInt(CURRENT_TAX_YEAR) - 14}-01-01`,
  eighteen: `${parseInt(CURRENT_TAX_YEAR) - 18}-01-01`,
  adult: `1987-01-01`,
};
const childData = makeChildData(childDependentId, dob.barelyFourteenAtStartOfYear);
const child2Data = makeChildData(childDependentId2, dob.barelyFourteenAtStartOfYear);
const child3Data = makeChildData(childDependentId3, dob.eighteen);

const filerWithChild = {
  ...baseFilerData,
  [`/filers/#${primaryFilerId}/dateOfBirth`]: createDayWrapper(dob.adult),
  [`/filers/#${primaryFilerId}/canBeClaimed`]: createBooleanWrapper(false),
  [`/filingStatus`]: createEnumWrapper(`headOfHousehold`, `/filingStatusOptions`),
  '/familyAndHousehold': {
    $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
    item: { items: [`${childDependentId}`] },
  },
  ...childData,
};

describe(`CTC eligibility`, () => {
  it(`has credits available when the filer has a ctc qualifying child`, ({ task }) => {
    task.meta.testedFactPaths = [`/hasPotentialCredits`];

    const { factGraph } = setupFactGraph(filerWithChild);
    expect(factGraph.get(Path.concretePath(`/familyAndHousehold/*/qualifyingChild`, childDependentId)).get).toBe(true);
    expect(factGraph.get(Path.concretePath(`/familyAndHousehold/*/eligibleCtc`, childDependentId)).get).toBe(true);
    expect(factGraph.get(Path.concretePath(`/hasPotentialCredits`, null)).get).toBe(true);
  });
});

describe(`CTC and ODC amounts`, () => {
  const testCases = [
    {
      name: `HOH filer with 3 QC (2 under 17 and one older) and limited taxes because of wages`,
      filer: {
        ...filerWithChild,
        ...makeW2Data(56800),
        '/familyAndHousehold': {
          $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
          item: { items: [`${childDependentId}`, `${childDependentId2}`, `${childDependentId3}`] },
        },
        ...child2Data,
        ...child3Data,
      },
      // /tentativeTaxFromTaxableIncome is 3779 from the tax tables, this caps this credit
      // For the 2 QC under 17, we get 2000 * 2 = 4000
      // For the 1 QC over 17, we get 500, for a total potential creditof 4500
      // We are capped to 3779, from which we take 500 for ODC, leaving 3279 for CTC
      odcAmount: `500.00`,
      ctcAmount: `3279.00`,
      total: `3779.00`,
    },
    {
      name: `HOH filer with 3 QC (2 under 17 and one older) and partial phase out in wages`,
      filer: {
        ...filerWithChild,
        ...makeW2Data(201000),
        '/familyAndHousehold': {
          $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
          item: { items: [`${childDependentId}`, `${childDependentId2}`, `${childDependentId3}`] },
        },
        ...child2Data,
        ...child3Data,
      },
      // For the 2 QC under 17, we get 2000 * 2 = 4000
      // For the 1 QC over 17, we get 500, for a total potential creditof 4500
      // /dependentCreditPhaseoutThreshold is 200000, income is $1000 over that.
      // /dependentCreditPhaseout is .05 * 1000 = 50
      // So credit = 4500 - 50 = 4450
      // odc is phased out first and taken out first so odc = 450 leaving 4000 for ctc
      odcAmount: `450.00`,
      ctcAmount: `4000.00`,
      total: `4450.00`,
    },
    {
      name: `HOH filer with 3 QC (2 under 17 and one older) and partial phase out in wages with rounding`,
      filer: {
        ...filerWithChild,
        ...makeW2Data(222412),
        '/familyAndHousehold': {
          $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
          item: { items: [`${childDependentId}`, `${childDependentId2}`, `${childDependentId3}`] },
        },
        ...child2Data,
        ...child3Data,
      },
      // For the 2 QC under 17, we get 2000 * 2 = 4000
      // For the 1 QC over 17, we get 500, for a total potential creditof 4500
      // /dependentCreditPhaseoutThreshold is 200000
      // We round income to 223000, so this income is $23000 over threshold.
      // /dependentCreditPhaseout is .05 * 23000 = 1150
      // odc is phased out to zero
      // So credit = 4500 - 1150 = 3350
      // odc is phased out first and taken out first so odc = 0 leaving 3350 for ctc
      odcAmount: `0.00`,
      ctcAmount: `3350.00`,
      total: `3350.00`,
    },
    {
      name: `HOH filer with 2 QC (both under 17) and non limiting wages`,
      filer: {
        ...filerWithChild,
        ...makeW2Data(75000),
        '/familyAndHousehold': {
          $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
          item: { items: [`${childDependentId}`, `${childDependentId2}`] },
        },
        ...child2Data,
      },
      // For the 2 QC under 17, we get 2000 * 2 = 4000
      // /dependentCreditPhaseoutThreshold is 200000
      // Income is under the threshold so no phaseout
      // So ctc is 4000
      odcAmount: `0.00`,
      ctcAmount: `4000.00`,
      total: `4000.00`,
    },
  ];

  for (const c of testCases) {
    it(c.name, ({ task }) => {
      task.meta.testedFactPaths = [`/totalOdc`, `/totalCtc`, `/totalCtcAndOdc`];

      const { factGraph } = setupFactGraph(c.filer);
      expect(factGraph.get(Path.concretePath(`/totalOdc`, null)).get.toString()).toBe(c.odcAmount);
      expect(factGraph.get(Path.concretePath(`/totalCtc`, null)).get.toString()).toBe(c.ctcAmount);
      expect(factGraph.get(Path.concretePath(`/totalCtcAndOdc`, null)).get.toString()).toBe(c.total);
    });
  }
});
