import flowNodes from '../../flow/flow.js';
import { createFlowConfig } from '../../flow/flowConfig.js';
import { createBooleanWrapper } from '../persistenceWrappers.js';
import { setupFactGraph } from '../setupFactGraph.js';
import {
  getDobFromAgeDefinedByTyPlusOne,
  primaryFilerId,
  makeW2Data,
  spouseId,
  singleDisabledFilerEdcBase,
  primaryFilerDisabilityEdcFacts,
  spouseDisabilityEdcFacts,
  mfjEdcBase,
  makeMultipleW2s,
  uuid,
  uuid2,
} from '../testData.js';
import makeGivenFacts from './functionalFlowUtils.js';
import { it, describe, expect } from 'vitest';
const flow = createFlowConfig(flowNodes);
const givenFacts = makeGivenFacts(flow);

describe(`Elderly or disabled credit`, () => {
  describe(`The EDC sub-subcategory in the credits subcategory`, () => {
    const basePath = `/flow/credits-and-deductions/credits`;
    describe(`EDC breather`, () => {
      describe(`For single filers`, () => {
        it(`should navigate from edc-breather to to disability intro when filer is under 65 and has a W-2`, ({
          task,
        }) => {
          const { factGraph } = setupFactGraph({
            ...singleDisabledFilerEdcBase,
            ...makeW2Data(17000),
            [`/filers/#${primaryFilerId}/dateOfBirth`]: getDobFromAgeDefinedByTyPlusOne(64),
          });
          expect(givenFacts(factGraph).atPath(`${basePath}/edc-breather`, primaryFilerId, task)).toRouteNextTo(
            `${basePath}/edc-disability-intro-screen`
          );
        });
        it(`should navigate from edc-breather to nontaxable payments when filer is over 65`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...singleDisabledFilerEdcBase,
            ...makeW2Data(17000),
            [`/filers/#${primaryFilerId}/dateOfBirth`]: getDobFromAgeDefinedByTyPlusOne(66),
          });
          expect(givenFacts(factGraph).atPath(`${basePath}/edc-breather`, primaryFilerId, task)).toRouteNextTo(
            `/checklist`
          );
        });
      });
      // Given TY24 AGI limits and standard deduction amounts, it is not possible to claim EDC while filing MFJ
      describe.skip(`For MFJ filers`, () => {
        it(`should navigate from edc-breather to to disability intro when filer is under 65 and has a W-2`, ({
          task,
        }) => {
          const { factGraph } = setupFactGraph({
            ...mfjEdcBase,
            ...primaryFilerDisabilityEdcFacts,
            ...spouseDisabilityEdcFacts,
            ...makeMultipleW2s([
              { income: 12000, w2Id: uuid, filerId: primaryFilerId },
              { income: 12000, w2Id: uuid2, filerId: spouseId },
            ]),
          });
          expect(givenFacts(factGraph).atPath(`${basePath}/edc-breather`, primaryFilerId, task)).toRouteNextTo(
            `${basePath}/edc-disability-intro-screen`
          );
        });
        it(`should navigate from edc-breather to to disability intro when spouse is under 65 and has a W-2 
            and primary filer is over 65`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjEdcBase,
            ...primaryFilerDisabilityEdcFacts,
            ...spouseDisabilityEdcFacts,
            ...makeMultipleW2s([
              { income: 12000, w2Id: uuid, filerId: primaryFilerId },
              { income: 12000, w2Id: uuid2, filerId: spouseId },
            ]),
            // overwrite primary filer dob
            [`/filers/#${primaryFilerId}/dateOfBirth`]: getDobFromAgeDefinedByTyPlusOne(65),
          });
          expect(givenFacts(factGraph).atPath(`${basePath}/edc-breather`, spouseId, task)).toRouteNextTo(
            `${basePath}/edc-disability-intro-screen`
          );
        });
        it(`should navigate to nontaxable payments when neither spouse is under 65`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjEdcBase,
            ...makeMultipleW2s([
              { income: 12000, w2Id: uuid, filerId: primaryFilerId },
              { income: 12000, w2Id: uuid2, filerId: spouseId },
            ]),
            [`/filers/#${primaryFilerId}/dateOfBirth`]: getDobFromAgeDefinedByTyPlusOne(65),
            [`/filers/#${spouseId}/dateOfBirth`]: getDobFromAgeDefinedByTyPlusOne(65),
          });
          expect(givenFacts(factGraph).atPath(`${basePath}/edc-breather`, primaryFilerId, task)).toRouteNextTo(
            `${basePath}/edc-nontaxable-payments`
          );
        });
      });
    });
    describe(`EDC permanent total disability`, () => {
      describe(`For single filers`, () => {
        it(`should navigate to mandatory retirement age when yes`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...singleDisabledFilerEdcBase,
            [`/filers/#${primaryFilerId}/isRetOnPermOrTotalDisability`]: createBooleanWrapper(true),
            ...makeW2Data(17000),
          });
          expect(
            givenFacts(factGraph).atPath(`${basePath}/edc-permanent-total-disability`, primaryFilerId, task)
          ).toRouteNextTo(`${basePath}/edc-mandatory-retirement-age`);
        });
        it(`should navigate to not qualified when no`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...singleDisabledFilerEdcBase,
            [`/filers/#${primaryFilerId}/isRetOnPermOrTotalDisability`]: createBooleanWrapper(false),
            ...makeW2Data(17000),
          });
          expect(
            givenFacts(factGraph).atPath(`${basePath}/edc-permanent-total-disability`, primaryFilerId, task)
          ).toRouteNextTo(`${basePath}/edc-not-qualified`);
        });
      });
      // Given TY24 AGI limits and standard deduction amounts, it is not possible to claim EDC while filing MFJ
      describe.skip(`For MFJ filers`, () => {
        it(`should navigate to mandatory retirement age when primary filer selects yes`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjEdcBase,
            ...primaryFilerDisabilityEdcFacts,
            ...spouseDisabilityEdcFacts,
            [`/filers/#${primaryFilerId}/isRetOnPermOrTotalDisability`]: createBooleanWrapper(true),
            ...makeMultipleW2s([
              { income: 12000, w2Id: uuid, filerId: primaryFilerId },
              { income: 12000, w2Id: uuid2, filerId: spouseId },
            ]),
          });
          expect(
            givenFacts(factGraph).atPath(`${basePath}/edc-permanent-total-disability`, primaryFilerId, task)
          ).toRouteNextTo(`${basePath}/edc-mandatory-retirement-age`);
        });
        it(`should navigate to mandatory retirement age when spouse selects yes`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjEdcBase,
            ...primaryFilerDisabilityEdcFacts,
            ...spouseDisabilityEdcFacts,
            [`/filers/#${spouseId}/isRetOnPermOrTotalDisability`]: createBooleanWrapper(true),
            ...makeMultipleW2s([
              { income: 12000, w2Id: uuid, filerId: primaryFilerId },
              { income: 12000, w2Id: uuid2, filerId: spouseId },
            ]),
          });
          expect(
            givenFacts(factGraph).atPath(`${basePath}/edc-permanent-total-disability`, spouseId, task)
          ).toRouteNextTo(`${basePath}/edc-mandatory-retirement-age`);
        });
        it(`should navigate to disability intro for spouse when primary filer selects no and spouse is under 65`, ({
          task,
        }) => {
          const { factGraph } = setupFactGraph({
            ...mfjEdcBase,
            ...primaryFilerDisabilityEdcFacts,
            [`/filers/#${spouseId}/dateOfBirth`]: getDobFromAgeDefinedByTyPlusOne(35),
            [`/filers/#${primaryFilerId}/isRetOnPermOrTotalDisability`]: createBooleanWrapper(false),
            ...makeMultipleW2s([
              { income: 12000, w2Id: uuid, filerId: primaryFilerId },
              { income: 12000, w2Id: uuid2, filerId: spouseId },
            ]),
          });
          expect(
            givenFacts(factGraph).atPath(`${basePath}/edc-permanent-total-disability`, primaryFilerId, task)
          ).toRouteNextTo(`${basePath}/edc-disability-intro-screen`);
        });
        it(`should navigate to nontaxable payments when no and spouse is over 65`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjEdcBase,
            ...primaryFilerDisabilityEdcFacts,
            [`/filers/#${spouseId}/dateOfBirth`]: getDobFromAgeDefinedByTyPlusOne(66),
            [`/filers/#${primaryFilerId}/isRetOnPermOrTotalDisability`]: createBooleanWrapper(false),
            ...makeMultipleW2s([
              { income: 12000, w2Id: uuid, filerId: primaryFilerId },
              { income: 12000, w2Id: uuid2, filerId: spouseId },
            ]),
          });
          expect(
            givenFacts(factGraph).atPath(`${basePath}/edc-permanent-total-disability`, primaryFilerId, task)
          ).toRouteNextTo(`${basePath}/edc-nontaxable-payments`);
        });
        it(`should navigate to not qualified when spouse selects no and primary filer is not qualified`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjEdcBase,
            ...primaryFilerDisabilityEdcFacts,
            ...spouseDisabilityEdcFacts,
            [`/filers/#${primaryFilerId}/isRetOnPermOrTotalDisability`]: createBooleanWrapper(false),
            [`/filers/#${spouseId}/isRetOnPermOrTotalDisability`]: createBooleanWrapper(false),
            ...makeMultipleW2s([
              { income: 12000, w2Id: uuid, filerId: primaryFilerId },
              { income: 12000, w2Id: uuid2, filerId: spouseId },
            ]),
          });
          expect(
            givenFacts(factGraph).atPath(`${basePath}/edc-permanent-total-disability`, spouseId, task)
          ).toRouteNextTo(`${basePath}/edc-not-qualified`);
        });
      });
    });
    describe(`EDC mandatory retirement age reached`, () => {
      describe(`For single filers`, () => {
        it(`should navigate to disability income when no`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...singleDisabledFilerEdcBase,
            [`/filers/#${primaryFilerId}/employerHasMandatoryRetirementAge`]: createBooleanWrapper(true),
            [`/filers/#${primaryFilerId}/hasMetEmployerMandatoryRetirementAge`]: createBooleanWrapper(false),
            ...makeW2Data(17000),
          });
          expect(
            givenFacts(factGraph).atPath(`${basePath}/edc-mandatory-retirement-age-reached`, primaryFilerId, task)
          ).toRouteNextTo(`${basePath}/edc-disability-income`);
        });
        it(`should navigate to not qualified when yes`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...singleDisabledFilerEdcBase,
            [`/filers/#${primaryFilerId}/employerHasMandatoryRetirementAge`]: createBooleanWrapper(true),
            [`/filers/#${primaryFilerId}/hasMetEmployerMandatoryRetirementAge`]: createBooleanWrapper(true),
            ...makeW2Data(17000),
          });
          expect(
            givenFacts(factGraph).atPath(`${basePath}/edc-mandatory-retirement-age-reached`, primaryFilerId, task)
          ).toRouteNextTo(`${basePath}/edc-not-qualified`);
        });
      });
      // Given TY24 AGI limits and standard deduction amounts, it is not possible to claim EDC while filing MFJ
      describe.skip(`For MFJ filers`, () => {
        it(`should navigate to disability income when primary filer selects no`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjEdcBase,
            ...primaryFilerDisabilityEdcFacts,
            ...spouseDisabilityEdcFacts,
            [`/filers/#${primaryFilerId}/employerHasMandatoryRetirementAge`]: createBooleanWrapper(true),
            [`/filers/#${primaryFilerId}/hasMetEmployerMandatoryRetirementAge`]: createBooleanWrapper(false),
            ...makeMultipleW2s([
              { income: 12000, w2Id: uuid, filerId: primaryFilerId },
              { income: 12000, w2Id: uuid2, filerId: spouseId },
            ]),
          });
          expect(
            givenFacts(factGraph).atPath(`${basePath}/edc-mandatory-retirement-age-reached`, primaryFilerId, task)
          ).toRouteNextTo(`${basePath}/edc-disability-income`);
        });
        it(`should navigate to disability intro for spouse when primary filer selects yes and spouse is under 65`, ({
          task,
        }) => {
          const { factGraph } = setupFactGraph({
            ...mfjEdcBase,
            ...primaryFilerDisabilityEdcFacts,
            [`/filers/#${spouseId}/dateOfBirth`]: getDobFromAgeDefinedByTyPlusOne(35),
            [`/filers/#${primaryFilerId}/employerHasMandatoryRetirementAge`]: createBooleanWrapper(true),
            [`/filers/#${primaryFilerId}/hasMetEmployerMandatoryRetirementAge`]: createBooleanWrapper(true),
            ...makeMultipleW2s([
              { income: 12000, w2Id: uuid, filerId: primaryFilerId },
              { income: 12000, w2Id: uuid2, filerId: spouseId },
            ]),
          });
          expect(
            givenFacts(factGraph).atPath(`${basePath}/edc-mandatory-retirement-age-reached`, primaryFilerId, task)
          ).toRouteNextTo(`${basePath}/edc-disability-intro-screen`);
        });
        it(`should navigate to nontaxable payments when primary filer selects yes and spouse is over 65`, ({
          task,
        }) => {
          const { factGraph } = setupFactGraph({
            ...mfjEdcBase,
            ...primaryFilerDisabilityEdcFacts,
            [`/filers/#${spouseId}/dateOfBirth`]: getDobFromAgeDefinedByTyPlusOne(66),
            [`/filers/#${primaryFilerId}/employerHasMandatoryRetirementAge`]: createBooleanWrapper(true),
            [`/filers/#${primaryFilerId}/hasMetEmployerMandatoryRetirementAge`]: createBooleanWrapper(true),
            ...makeMultipleW2s([
              { income: 12000, w2Id: uuid, filerId: primaryFilerId },
              { income: 12000, w2Id: uuid2, filerId: spouseId },
            ]),
          });
          expect(
            givenFacts(factGraph).atPath(`${basePath}/edc-mandatory-retirement-age-reached`, primaryFilerId, task)
          ).toRouteNextTo(`${basePath}/edc-nontaxable-payments`);
        });
        it(`should navigate to not qualified when spouse selects yes and primary filer is not qualified`, ({
          task,
        }) => {
          const { factGraph } = setupFactGraph({
            ...mfjEdcBase,
            ...primaryFilerDisabilityEdcFacts,
            ...spouseDisabilityEdcFacts,
            [`/filers/#${primaryFilerId}/employerHasMandatoryRetirementAge`]: createBooleanWrapper(true),
            [`/filers/#${primaryFilerId}/hasMetEmployerMandatoryRetirementAge`]: createBooleanWrapper(true),
            [`/filers/#${spouseId}/employerHasMandatoryRetirementAge`]: createBooleanWrapper(true),
            [`/filers/#${spouseId}/hasMetEmployerMandatoryRetirementAge`]: createBooleanWrapper(true),
            ...makeMultipleW2s([
              { income: 12000, w2Id: uuid, filerId: primaryFilerId },
              { income: 12000, w2Id: uuid2, filerId: spouseId },
            ]),
          });
          expect(
            givenFacts(factGraph).atPath(`${basePath}/edc-mandatory-retirement-age-reached`, spouseId, task)
          ).toRouteNextTo(`${basePath}/edc-not-qualified`);
        });
      });
    });
    describe(`EDC disability income`, () => {
      describe(`For single filers`, () => {
        it(`should navigate to disability income amount when yes`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...singleDisabledFilerEdcBase,
            [`/filers/#${primaryFilerId}/arePaymentsTaxDisabilityIncome`]: createBooleanWrapper(true),
            ...makeW2Data(17000),
          });
          expect(givenFacts(factGraph).atPath(`${basePath}/edc-disability-income`, primaryFilerId, task)).toRouteNextTo(
            `${basePath}/edc-disability-income-amount`
          );
        });
        it(`should navigate to not qualified when no`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...singleDisabledFilerEdcBase,
            [`/filers/#${primaryFilerId}/arePaymentsTaxDisabilityIncome`]: createBooleanWrapper(false),
            ...makeW2Data(17000),
          });
          expect(givenFacts(factGraph).atPath(`${basePath}/edc-disability-income`, primaryFilerId, task)).toRouteNextTo(
            `${basePath}/edc-not-qualified`
          );
        });
      });
      // Given TY24 AGI limits and standard deduction amounts, it is not possible to claim EDC while filing MFJ
      describe.skip(`For MFJ filers`, () => {
        it(`should navigate to disability income amount when primary filer selects yes`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjEdcBase,
            ...primaryFilerDisabilityEdcFacts,
            ...spouseDisabilityEdcFacts,
            [`/filers/#${primaryFilerId}/arePaymentsTaxDisabilityIncome`]: createBooleanWrapper(true),
            ...makeMultipleW2s([
              { income: 12000, w2Id: uuid, filerId: primaryFilerId },
              { income: 12000, w2Id: uuid2, filerId: spouseId },
            ]),
          });
          expect(givenFacts(factGraph).atPath(`${basePath}/edc-disability-income`, primaryFilerId, task)).toRouteNextTo(
            `${basePath}/edc-disability-income-amount`
          );
        });
        it(`should navigate to disability intro for spouse when primary filer no and spouse is under 65`, ({
          task,
        }) => {
          const { factGraph } = setupFactGraph({
            ...mfjEdcBase,
            ...primaryFilerDisabilityEdcFacts,
            [`/filers/#${spouseId}/dateOfBirth`]: getDobFromAgeDefinedByTyPlusOne(35),
            [`/filers/#${primaryFilerId}/arePaymentsTaxDisabilityIncome`]: createBooleanWrapper(false),
            ...makeMultipleW2s([
              { income: 12000, w2Id: uuid, filerId: primaryFilerId },
              { income: 12000, w2Id: uuid2, filerId: spouseId },
            ]),
          });
          expect(givenFacts(factGraph).atPath(`${basePath}/edc-disability-income`, primaryFilerId, task)).toRouteNextTo(
            `${basePath}/edc-disability-intro-screen`
          );
        });
        it(`should navigate to nontaxable payments when no and spouse is over 65`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjEdcBase,
            ...primaryFilerDisabilityEdcFacts,
            [`/filers/#${spouseId}/dateOfBirth`]: getDobFromAgeDefinedByTyPlusOne(66),
            [`/filers/#${primaryFilerId}/arePaymentsTaxDisabilityIncome`]: createBooleanWrapper(false),
            ...makeMultipleW2s([
              { income: 12000, w2Id: uuid, filerId: primaryFilerId },
              { income: 12000, w2Id: uuid2, filerId: spouseId },
            ]),
          });
          expect(givenFacts(factGraph).atPath(`${basePath}/edc-disability-income`, primaryFilerId, task)).toRouteNextTo(
            `${basePath}/edc-nontaxable-payments`
          );
        });
        it(`should navigate to not qualified when spouse selects no and primary filer is not qualified`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjEdcBase,
            ...primaryFilerDisabilityEdcFacts,
            ...spouseDisabilityEdcFacts,
            [`/filers/#${primaryFilerId}/arePaymentsTaxDisabilityIncome`]: createBooleanWrapper(false),
            [`/filers/#${spouseId}/arePaymentsTaxDisabilityIncome`]: createBooleanWrapper(false),
            ...makeMultipleW2s([
              { income: 12000, w2Id: uuid, filerId: primaryFilerId },
              { income: 12000, w2Id: uuid2, filerId: spouseId },
            ]),
          });
          expect(givenFacts(factGraph).atPath(`${basePath}/edc-disability-income`, spouseId, task)).toRouteNextTo(
            `${basePath}/edc-not-qualified`
          );
        });
      });
    });
  });
});
