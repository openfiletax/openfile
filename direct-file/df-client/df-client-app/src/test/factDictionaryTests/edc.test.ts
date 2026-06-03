import { Path } from '../../flow/Path.js';
import { createDollarWrapper } from '../persistenceWrappers.js';
import { setupFactGraph } from '../setupFactGraph.js';
import {
  getDobFromAgeDefinedByTyPlusOne,
  makeMultipleW2s,
  makeW2Data,
  mfjEdcBase,
  mfsElderlyFilerEdcBase,
  primaryFilerDisabilityEdcFacts,
  primaryFilerId,
  singleDisabledFilerEdcBase,
  singleElderlyFilerEdcBase,
  spouseDisabilityEdcFacts,
  spouseId,
  uuid,
} from '../testData.js';
import { describe, it, expect } from 'vitest';
const w2Id2 = `9ba9d216-81a8-4944-81ac-9410b2fad151`;

describe(`Credit for the Elderly or the Disabled`, () => {
  describe(`EDC qualification`, () => {
    const testCases = [
      {
        description: `Single, elderly under AGI limit`,
        data: {
          ...singleElderlyFilerEdcBase,
          ...makeW2Data(17000),
        },
        expectedQualification: false,
      },
      {
        description: `Single, elderly over AGI limit`,
        data: {
          ...singleElderlyFilerEdcBase,
          ...makeW2Data(17501),
        },
        expectedQualification: false,
      },
      {
        description: `Single, disabled under AGI limit`,
        data: {
          ...singleDisabledFilerEdcBase,
          [`/filers/#${primaryFilerId}/writableTotalTaxableDisabilityAmount`]: createDollarWrapper(`17000.00`),
          ...makeW2Data(17000),
        },
        expectedQualification: true,
      },
      {
        description: `MFS, elderly under AGI limit`,
        data: {
          ...mfsElderlyFilerEdcBase,
          ...makeW2Data(17000, uuid),
        },
        expectedQualification: false,
      },
      {
        description: `MFJ, both elderly under AGI limit`,
        data: {
          ...mfjEdcBase,
          ...makeW2Data(25000, uuid),
          [`/filers/#${primaryFilerId}/dateOfBirth`]: getDobFromAgeDefinedByTyPlusOne(65),
          [`/filers/#${spouseId}/dateOfBirth`]: getDobFromAgeDefinedByTyPlusOne(65),
        },
        expectedQualification: false,
      },
      {
        description: `MFJ, both disabled under AGI limit`,
        data: {
          ...mfjEdcBase,
          ...primaryFilerDisabilityEdcFacts,
          ...spouseDisabilityEdcFacts,
          ...makeMultipleW2s([
            { income: 12000, w2Id: uuid, filerId: primaryFilerId },
            { income: 12000, w2Id: w2Id2, filerId: spouseId },
          ]),
          [`/filers/#${primaryFilerId}/writableTotalTaxableDisabilityAmount`]: createDollarWrapper(`12000.00`),
          [`/filers/#${spouseId}/writableTotalTaxableDisabilityAmount`]: createDollarWrapper(`12000.00`),
          [`/filers/#${primaryFilerId}/dateOfBirth`]: getDobFromAgeDefinedByTyPlusOne(35),
          [`/filers/#${spouseId}/dateOfBirth`]: getDobFromAgeDefinedByTyPlusOne(35),
        },
        expectedQualification: false,
      },
    ];
    testCases.forEach((testCase) => {
      it(`${testCase.description} is ${
        testCase.expectedQualification ? `qualified for EDC` : `disqualified from EDC`
      }`, () => {
        const { factGraph } = setupFactGraph(testCase.data);
        const isQualifiedForEdc = factGraph.get(Path.concretePath(`/qualifiedForCreditForElderlyAndDisabled`, null));
        expect(isQualifiedForEdc.get.toString()).toBe(testCase.expectedQualification.toString());
      });
    });
  });
});
