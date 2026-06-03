import { it, describe, expect } from 'vitest';
import {
  createBooleanWrapper,
  createDayWrapper,
  createStringWrapper,
  createEnumWrapper,
  createCollectionWrapper,
  createEinWrapper,
  createTinWrapper,
} from './persistenceWrappers.js';
import { Path } from '../flow/Path.js';
import { spouseId } from './testData.js';
import { setupFactGraph } from './setupFactGraph.js';

const primaryFilerId = `959c03d1-af4a-447f-96aa-d19397048a44`;
const w2Id = `417f68d8-e529-4e5f-9d66-fab7ec550218`;

const baseFacts = {
  [`/filers/#${primaryFilerId}/firstName`]: createStringWrapper(`Test`),
  [`/filers/#${primaryFilerId}/isBlind`]: createBooleanWrapper(false),
  [`/filers/#${primaryFilerId}/canBeClaimed`]: createBooleanWrapper(false),
  [`/filers/#${primaryFilerId}/writableMiddleInitial`]: createStringWrapper(`E`),
  [`/filers/#${primaryFilerId}/tin`]: createTinWrapper({ area: `222`, group: `12`, serial: `1234` }),
  [`/filers/#${primaryFilerId}/lastName`]: createStringWrapper(`Testerson`),
  [`/filers/#${primaryFilerId}/occupation`]: createStringWrapper(`cat`),
  '/maritalStatus': createEnumWrapper(`single`, `/maritalStatusOptions`),
  '/hadStudentLoanInterestPayments': createBooleanWrapper(false),
  '/phone': {
    $type: `gov.irs.factgraph.persisters.E164Wrapper`,
    item: {
      $type: `gov.irs.factgraph.types.UsPhoneNumber`,
      areaCode: `444`,
      officeCode: `555`,
      lineNumber: `0100`,
    },
  },
  [`/filingStatus`]: createEnumWrapper(`single`, `/filingStatusOptions`),
  [`/filers/#${primaryFilerId}/dateOfBirth`]: createDayWrapper(`2000-01-01`),
  '/familyAndHousehold': { $type: `gov.irs.factgraph.persisters.CollectionWrapper`, item: { items: [] } },
  [`/filers/#${primaryFilerId}/isPrimaryFiler`]: createBooleanWrapper(true),
  '/address': {
    $type: `gov.irs.factgraph.persisters.AddressWrapper`,
    item: { streetAddress: `111 Addy`, city: `Washington`, postalCode: `20001`, stateOrProvence: `DC` },
  },
  '/filers': createCollectionWrapper([primaryFilerId, spouseId]),
  [`/formW2s`]: {
    item: {
      items: [w2Id],
    },
    $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
  },
  [`/formW2s/#${w2Id}/ein`]: createEinWrapper(`99`, `9999999`),
  [`/formW2s/#${w2Id}/filer`]: {
    item: {
      id: `${primaryFilerId}`,
    },
    $type: `gov.irs.factgraph.persisters.CollectionItemWrapper`,
  },
};

describe(`Tax computation`, () => {
  // Filing status does not affect the logic under test.
  // Using single numbers here for simplicity.

  // These numbers are calculated using instructions from Interrnal Revenue Procedure Part III
  // and have been additionally verified against a 3rd party calculator
  // at https://www.nerdwallet.com/taxes/tax-calculator

  for (const scenario of [
    // Not over $11,925: 10% of the taxable income
    { wages: 0, rounded: 0, tax: 0 },
    { wages: 4.49, rounded: 2.5, tax: 0 },

    { wages: 5.0, rounded: 10.0, tax: 1.0 },
    { wages: 14.49, rounded: 10.0, tax: 1.0 },

    { wages: 15.0, rounded: 20.0, tax: 2.0 },
    { wages: 24.49, rounded: 20.0, tax: 2.0 },

    { wages: 25.0, rounded: 37.5, tax: 4.0 },
    { wages: 37.5, rounded: 37.5, tax: 4.0 },
    { wages: 49.49, rounded: 37.5, tax: 4.0 },

    { wages: 2975.0, rounded: 2987.5, tax: 299.0 },
    { wages: 2988.0, rounded: 2987.5, tax: 299.0 },
    { wages: 2999.49, rounded: 2987.5, tax: 299.0 },

    { wages: 3000.0, rounded: 3025.0, tax: 303.0 },
    { wages: 3025.0, rounded: 3025.0, tax: 303.0 },
    { wages: 3049.49, rounded: 3025.0, tax: 303.0 },

    // Over $11,925 but not over $48,475

    // Some 3rd party tools are incorrectly calculating this as `2180`
    // because they are not properly applying rounding.
    { wages: 20000.0, rounded: 20025.0, tax: 2132.0 },

    // Over $48,475 but not over $103,350

    { wages: 57050.0, rounded: 57075.0, tax: 7471.0 },
    { wages: 57075.0, rounded: 57075.0, tax: 7471.0 },
    { wages: 57099.49, rounded: 57075.0, tax: 7471.0 },

    // Over $48,475 but not over $103,350
    { wages: 100950.0, rounded: 100950.0, tax: 17123 },

    // Over $197,300 but not over $250,525
    { wages: 200000.0, rounded: 200000.0, tax: 41063.0 },

    // Over $197,300 but not over $250,525
    // Some 3rd party tools are calculating this as `59394`
    // because they are rounding differently than we are. We should verify
    // that we are rounding correctly against MeF or another tool.
    { wages: 250000.0, rounded: 250000.0, tax: 57063.0 },

    // Over $626,350
    { wages: 700000.0, rounded: 700000.0, tax: 216020.0 },
  ]) {
    it(`rounds wages of $${scenario.wages} to $${scenario.rounded} for tentative tax $${scenario.tax}`, () => {
      // This is the standard deduction for 2025
      const standardDeduction = 15000.0;
      const facts = {
        ...baseFacts,
        [`/formW2s/#${w2Id}/writableWages`]: {
          item: `${scenario.wages + standardDeduction}`,
          $type: `gov.irs.factgraph.persisters.DollarWrapper`,
        },
      };

      const { factGraph } = setupFactGraph(facts);

      expect(Number(factGraph.get(Path.concretePath(`/roundedTaxableIncome`, null)).get.toString())).toEqual(
        scenario.rounded
      );
      expect(Number(factGraph.get(Path.concretePath(`/tentativeTaxFromTaxableIncome`, null)).get.toString())).toEqual(
        scenario.tax
      );
    });
  }
});
