import { describe, expect, it } from 'vitest';
import flowNodes from '../../flow/flow.js';
import { createFlowConfig } from '../../flow/flowConfig.js';
import en from '../../locales/en.yaml';
import {
  createBooleanWrapper,
  createDollarWrapper,
  createEnumWrapper,
  createStringWrapper,
  createTinWrapper,
  createEinWrapper,
  createCollectionItemWrapper,
  createCollectionWrapper,
} from '../persistenceWrappers.js';
import {
  baseFilerData,
  primaryFilerId,
  spouseId,
  basePrimaryFilerHSAFacts,
  mfjIncomeWithHSAs,
  mfsIncomeWithHSAs,
  baseIncomeWithHSAs,
  mfjIncomeWithNonW2HSAs,
  singleFilerWithHsaDeductions,
  mfjBothWithQualifiedHsaDeductions,
  mfjFilerData,
  baseHSAFactsSkipToTestingPeriod,
} from '../testData.js';
import makeGivenFacts from './functionalFlowUtils.js';
import { setupFactGraph } from '../setupFactGraph.js';
import { Path } from '../../flow/Path.js';

const flow = createFlowConfig(flowNodes);
const givenFacts = makeGivenFacts(flow);

describe(`The \`income\` subcategory`, () => {
  describe(`The Jobs loop`, () => {
    const w2Id = `0b1e355e-3d19-415d-8470-fbafd9f58361`;
    const baseIncomeData = {
      ...baseFilerData,
      '/formW2s': createCollectionWrapper([w2Id]),
    };

    const path = `/flow/income/jobs`;
    for (const tin of [
      { type: `SSN`, id: { area: `555`, group: `55`, serial: `5555` } },
      { type: `ITIN`, id: { area: `999`, group: `99`, serial: `9999` } },
      // { type: `ATIN`, id: { area: `???`, group: `??`, serial: `????` } },
    ]) {
      describe.skip(`When W-2 person has ${tin.type}`, () => {
        // This test should not have passed because we do not route from the hub screen
        // to the first available screen automatically.
        // https://git.irslabs.org/irslabs-prototypes/direct-file/-/issues/11530
        describe(`When filing status is ...`, () => {
          for (const key of Object.keys(en.fields[`/filingStatusOptions`])) {
            const { factGraph } = setupFactGraph({
              ...baseIncomeData,
              [`/formW2s/#${w2Id}/filer`]: {
                item: {
                  id: `${primaryFilerId}`,
                },
                $type: `gov.irs.factgraph.persisters.CollectionItemWrapper`,
              },
              [`/filers/#${primaryFilerId}/tin`]: createTinWrapper(tin.id),
              [`/filingStatus`]: createEnumWrapper(key, `/filingStatusOptions`),
            });
            const isMfj = key === `marriedFilingJointly`;
            const hasSsn = tin.type === `SSN`;
            it(`${key}, it ${isMfj ? `asks` : `does not ask`} whose W-2 is to be entered`, ({ task }) => {
              expect(givenFacts(factGraph).atPath(`${path}/jobs-imported-w2`, w2Id, task)).toRouteNextTo(
                isMfj ? `${path}/w2-add-whose-w2` : hasSsn ? `${path}/w2-add-box-a` : `${path}/w2-add-step2-has-itin`
              );
            });
          }
        });
      });
    }
    describe(`When W-2 address matches tax return`, () => {
      it(`navigates to employer info screen`, ({ task }) => {
        const { factGraph } = setupFactGraph({
          ...baseIncomeData,
          [`/formW2s/#${w2Id}/addressMatchesReturn`]: createBooleanWrapper(true),
        });
        expect(givenFacts(factGraph).atPath(`${path}/w2-add-box-f-choice`, w2Id, task)).toRouteNextTo(
          `${path}/w2-add-box-bc`
        );
      });
    });
    describe(`When W-2 address does not match tax return`, () => {
      it(`navigates to address entry screen, then employer info screen`, ({ task }) => {
        const { factGraph } = setupFactGraph({
          ...baseIncomeData,
          [`/formW2s/#${w2Id}/addressMatchesReturn`]: createBooleanWrapper(false),
        });
        expect(givenFacts(factGraph).atPath(`${path}/w2-add-box-f-choice`, w2Id, task)).toRouteNextTo(
          `${path}/w2-add-box-f-different-address`
        );
        expect(givenFacts(factGraph).atPath(`${path}/w2-add-box-f-different-address`, w2Id, task)).toRouteNextTo(
          `${path}/w2-add-box-bc`
        );
      });
    });
    describe(`When the user enters zero in Box 8`, () => {
      it(`navigates to Boxes 10-11 screen`, ({ task }) => {
        const { factGraph } = setupFactGraph({
          ...baseIncomeData,
          [`/formW2s/#${w2Id}/writableAllocatedTips`]: createDollarWrapper(`0.00`),
        });
        expect(givenFacts(factGraph).atPath(`${path}/w2-add-boxes-1-8`, w2Id, task)).toRouteNextTo(
          `${path}/w2-add-boxes-10-11`
        );
      });
    });
    describe(`When the user enters non-zero in Box 8`, () => {
      it(`navigates to knockout screen`, ({ task }) => {
        const { factGraph } = setupFactGraph({
          ...baseIncomeData,
          [`/formW2s/#${w2Id}/writableAllocatedTips`]: createDollarWrapper(`1.00`),
        });
        expect(givenFacts(factGraph).atPath(`${path}/w2-add-boxes-1-8`, w2Id, task)).toRouteNextTo(
          `${path}/w2-allocated-tips-ko`
        );
      });
    });
    // Medicare wages knockout tests
    for (const incomeFilingStatusCombo of [
      {
        filingStatus: `single`,
        writableMedicareWages: `190000`,
        knockout: false,
        isCredit: false,
      },
      {
        filingStatus: `single`,
        writableMedicareWages: `200001`,
        knockout: true,
        isCredit: false,
      },
      {
        filingStatus: `marriedFilingJointly`,
        writableMedicareWages: `200000`,
        spouseWritableMedicareWages: `50000`,
        knockout: false,
        isCredit: false,
      },
      {
        filingStatus: `marriedFilingJointly`,
        writableMedicareWages: `200000`,
        spouseWritableMedicareWages: `50001`,
        knockout: true,
        isCredit: false,
      },
      {
        filingStatus: `marriedFilingJointly`,
        writableMedicareWages: `200001`,
        spouseWritableMedicareWages: `10000`,
        knockout: true,
        isCredit: true,
      },
      {
        filingStatus: `headOfHousehold`,
        writableMedicareWages: `190000`,
        knockout: false,
        isCredit: false,
      },
      {
        filingStatus: `headOfHousehold`,
        writableMedicareWages: `200001`,
        knockout: true,
        isCredit: false,
      },
      {
        filingStatus: `qualifiedSurvivingSpouse`,
        writableMedicareWages: `190000`,
        knockout: false,
        isCredit: false,
      },
      {
        filingStatus: `qualifiedSurvivingSpouse`,
        writableMedicareWages: `200001`,
        knockout: true,
        isCredit: false,
      },
      {
        filingStatus: `marriedFilingSeparately`,
        writableMedicareWages: `125000`,
        knockout: false,
        isCredit: false,
      },
      {
        filingStatus: `marriedFilingSeparately`,
        writableMedicareWages: `1250001`,
        knockout: true,
        isCredit: false,
      },
    ]) {
      // eslint-disable-next-line max-len
      const description =
        incomeFilingStatusCombo.spouseWritableMedicareWages === undefined
          ? `primary filer has an income of ${incomeFilingStatusCombo.writableMedicareWages}`
          : `primary filer has an income of ${incomeFilingStatusCombo.writableMedicareWages} and secondary ` +
            `filer has income of ${incomeFilingStatusCombo.spouseWritableMedicareWages}`;
      describe(`The medicare knockout, when a ${incomeFilingStatusCombo.filingStatus} ${description}`, () => {
        const factData = {
          ...baseIncomeData,
          [`/filingStatus`]: createEnumWrapper(incomeFilingStatusCombo.filingStatus, `/filingStatusOptions`),
          [`/formW2s/#${w2Id}/writableWages`]: createDollarWrapper(incomeFilingStatusCombo.writableMedicareWages),
          [`/formW2s/#${w2Id}/writableMedicareWages`]: createDollarWrapper(
            incomeFilingStatusCombo.writableMedicareWages
          ),
          [`/formW2s/#${w2Id}/filer`]: {
            item: {
              id: `${primaryFilerId}`,
            },
            $type: `gov.irs.factgraph.persisters.CollectionItemWrapper`,
          },
        };
        if (incomeFilingStatusCombo.spouseWritableMedicareWages !== undefined) {
          const spouseW2Id = `8cb0e117-70c7-4199-a3cb-cc290c96a473`;
          const spouseWages =
            incomeFilingStatusCombo.spouseWritableMedicareWages !== undefined
              ? incomeFilingStatusCombo.spouseWritableMedicareWages
              : `0`;
          factData[`/formW2s`] = {
            $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
            item: { items: [w2Id, spouseW2Id] },
          };
          factData[`/formW2s/#${spouseW2Id}/writableMedicareWages`] = createDollarWrapper(spouseWages);
          factData[Path.concretePath(`/formW2s/*/filer`, spouseW2Id)] = createCollectionItemWrapper(spouseId);
        }
        const { factGraph } = setupFactGraph(factData);
        if (incomeFilingStatusCombo.knockout) {
          it(`navigates to knockout screen`, ({ task }) => {
            if (incomeFilingStatusCombo.isCredit) {
              expect(givenFacts(factGraph).atPath(`${path}/w2-add-boxes-1-8`, w2Id, task)).toRouteNextTo(
                `${path}/medicare-wages-ko-credit`
              );
            } else {
              expect(givenFacts(factGraph).atPath(`${path}/w2-add-boxes-1-8`, w2Id, task)).toRouteNextTo(
                `${path}/medicare-wages-ko`
              );
            }
          });
        } else {
          it(`navigates to box 10-11`, ({ task }) => {
            expect(givenFacts(factGraph).atPath(`${path}/w2-add-boxes-1-8`, w2Id, task)).toRouteNextTo(
              `${path}/w2-add-boxes-10-11`
            );
          });
        }
      });
    }
    describe(`When the user enters zero in Box 10`, () => {
      it(`navigates to Box 12 screen`, ({ task }) => {
        const { factGraph } = setupFactGraph({
          ...baseIncomeData,
          [`/formW2s/#${w2Id}/writableDependentCareBenefits`]: createDollarWrapper(`0.00`),
        });
        expect(givenFacts(factGraph).atPath(`${path}/w2-add-boxes-10-11`, w2Id, task)).toRouteNextTo(
          `${path}/w2-has-box-12`
        );
      });
    });
    describe(`When the user enters non-zero in Box 10`, () => {
      it(`navigates to Box 12 screen`, ({ task }) => {
        const { factGraph } = setupFactGraph({
          ...baseIncomeData,
          [`/formW2s/#${w2Id}/writableDependentCareBenefits`]: createDollarWrapper(`1.00`),
        });
        expect(givenFacts(factGraph).atPath(`${path}/w2-add-boxes-10-11`, w2Id, task)).toRouteNextTo(
          `${path}/w2-has-box-12`
        );
      });
    });
    describe(`When a user enters a positive value for box 12 code`, () => {
      for (const box12Config of [
        {
          field: `uncollectedOasdiTaxOnTips`,
          knockout: true,
        },
        {
          field: `uncollectedMedicareTaxOnTips`,
          knockout: true,
        },
        {
          field: `taxableLifeInsuranceOver50k`,
          knockout: false,
        },
        {
          field: `401kDeferrals`,
          knockout: false,
        },
        {
          field: `403bDeferrals`,
          knockout: false,
        },
        {
          field: `sarsepDeferrals`,
          knockout: true,
        },
        {
          field: `457bDeferrals`,
          knockout: false,
        },
        {
          field: `501c18Deferrals`,
          knockout: false,
        },
        {
          field: `nontaxableSickPay`,
          knockout: true,
        },
        {
          field: `goldenParachuteExciseTax`,
          knockout: true,
        },
        {
          field: `expenseReimbursements`,
          knockout: true,
        },
        {
          field: `uncollectedOasdiTaxOnLifeInsuranceOver50k`,
          knockout: true,
        },
        {
          field: `uncollectedMedicareTaxOnLifeInsuranceOver50k`,
          knockout: true,
        },
        {
          field: `armedForcesMovingExpenses`,
          knockout: true,
        },
        {
          field: `writableCombatPay`,
          knockout: false,
        },
        {
          field: `archerMsaContributions`,
          knockout: true,
        },
        {
          field: `simpleContributions`,
          knockout: false,
        },
        {
          field: `adoptionBenefits`,
          knockout: true,
        },
        {
          field: `nsoIncome`,
          knockout: false,
        },
        {
          field: `employerHsaContributions`,
          knockout: false,
        },
        {
          field: `409aDeferrals`,
          knockout: false,
        },
        {
          field: `nqdcDeferrals`,
          knockout: true,
        },
        {
          field: `roth401kContributions`,
          knockout: false,
        },
        {
          field: `roth403bContributions`,
          knockout: false,
        },
        {
          field: `healthCoverageCost`,
          knockout: false,
        },
        {
          field: `roth457bContributions`,
          knockout: false,
        },
        {
          field: `qsehraBenefits`,
          knockout: false,
        },
        {
          field: `83iIncome`,
          knockout: false,
        },
        {
          field: `83iDeferrals`,
          knockout: false,
        },
        {
          field: `nonTaxableMedicaidWaiverPayments`,
          knockout: true,
        },
      ]) {
        const { factGraph } = setupFactGraph({
          ...baseIncomeData,
          [`/formW2s/#${w2Id}/${box12Config.field}`]: createDollarWrapper(`10.00`),
        });
        if (box12Config.knockout) {
          it(`${box12Config.field} knocks them out`, ({ task }) => {
            expect(givenFacts(factGraph).atPath(`${path}/w2-add-box-12`, w2Id, task)).toRouteNextTo(
              `${path}/w2-box-12-ko`
            );
          });
        } else if (box12Config.field === `457bDeferrals`) {
          it(`${box12Config.field} asks a follow-up question`, ({ task }) => {
            expect(givenFacts(factGraph).atPath(`${path}/w2-add-box-12`, w2Id, task)).toRouteNextTo(
              `/flow/income/jobs/w2-governmental-457b`
            );
          });
        } else {
          it(`${box12Config.field} allows them to continue`, ({ task }) => {
            expect(givenFacts(factGraph).atPath(`${path}/w2-add-box-12`, w2Id, task)).toRouteNextTo(
              `/flow/income/jobs/w2-add-box-13-options`
            );
          });
        }
      }
    });
    describe(`The social security wages knockout`, () => {
      // Threshold for 2024 is 168600
      // Always have one W-2
      const oasdiWagesThreshold = 168600;
      const w2Id2 = `5c154be1-ea2d-4afa-aae4-29d412bca27e`;
      const baseIncomeDataForKnockout = {
        ...baseFilerData,
        ...baseIncomeData,
        [`/filingStatus`]: createEnumWrapper(`marriedFilingJointly`, `/filingStatusOptions`),
        [`/formW2s/#${w2Id}/writableWages`]: createDollarWrapper((oasdiWagesThreshold + 1).toString()),
        [`/formW2s/#${w2Id}/writableOasdiWages`]: createDollarWrapper((oasdiWagesThreshold + 1).toString()),
        [`/formW2s/#${w2Id}/filer`]: {
          item: {
            id: `${primaryFilerId}`,
          },
          $type: `gov.irs.factgraph.persisters.CollectionItemWrapper`,
        },
      };
      it(`does not knock out the filer if they're over the limit with a single W-2`, ({ task }) => {
        // The base case above is over the limit
        const { factGraph } = setupFactGraph(baseIncomeDataForKnockout);
        expect(givenFacts(factGraph).atPath(`${path}/w2-add-boxes-1-8`, w2Id, task)).toRouteNextTo(
          `${path}/w2-add-boxes-10-11`
        );
      });
      it(`does not knock out the filer if they have a second W-2 without social security income`, ({ task }) => {
        const { factGraph } = setupFactGraph({
          ...baseIncomeDataForKnockout,
          '/formW2s': { $type: `gov.irs.factgraph.persisters.CollectionWrapper`, item: { items: [w2Id, w2Id2] } },
          [`/formW2s/#${w2Id2}/writableCombatPay`]: createDollarWrapper(`5000`),
          [`/formW2s/#${w2Id2}/filer`]: {
            item: {
              id: `${primaryFilerId}`,
            },
            $type: `gov.irs.factgraph.persisters.CollectionItemWrapper`,
          },
        });
        expect(givenFacts(factGraph).atPath(`${path}/w2-add-boxes-1-8`, w2Id, task)).toRouteNextTo(
          `${path}/w2-add-boxes-10-11`
        );
      });
      it(
        `does not knock out MFJ filers if they each have a single W-2 ` +
          `and each taxpayer's OASDI wages exceed the oasdiWagesThreshold`,
        ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...baseIncomeDataForKnockout,
            '/formW2s': { $type: `gov.irs.factgraph.persisters.CollectionWrapper`, item: { items: [w2Id, w2Id2] } },
            [`/formW2s/#${w2Id2}/writableWages`]: createDollarWrapper((oasdiWagesThreshold + 1).toString()),
            [`/formW2s/#${w2Id2}/writableOasdiWages`]: createDollarWrapper((oasdiWagesThreshold + 1).toString()),
            [`/formW2s/#${w2Id2}/filer`]: {
              item: {
                id: `${spouseId}`,
              },
              $type: `gov.irs.factgraph.persisters.CollectionItemWrapper`,
            },
          });
          expect(givenFacts(factGraph).atPath(`${path}/w2-add-boxes-1-8`, w2Id, task)).toRouteNextTo(
            `${path}/w2-add-boxes-10-11`
          );
        }
      );
      it(`does knock out the filer if they have two W-2s with social security wages over the limit`, ({ task }) => {
        const { factGraph } = setupFactGraph({
          ...baseIncomeDataForKnockout,
          '/formW2s': { $type: `gov.irs.factgraph.persisters.CollectionWrapper`, item: { items: [w2Id, w2Id2] } },
          [`/formW2s/#${w2Id2}/writableWages`]: createDollarWrapper(`16000`),
          [`/formW2s/#${w2Id2}/writableOasdiWages`]: createDollarWrapper(`1`),
          [`/formW2s/#${w2Id2}/filer`]: {
            item: {
              id: `${primaryFilerId}`,
            },
            $type: `gov.irs.factgraph.persisters.CollectionItemWrapper`,
          },
        });
        expect(givenFacts(factGraph).atPath(`${path}/w2-add-boxes-1-8`, w2Id, task)).toRouteNextTo(
          `${path}/w2-add-boxes-10-11`
        );
      });
    });

    describe(`When a user enters a positive value for box 14 code in NY`, () => {
      for (const box14Config of [
        { field: `414_H`, knockout: false },
        { field: `414_H_CU`, knockout: false },
        { field: `414H`, knockout: false },
        { field: `414HCU`, knockout: false },
        { field: `414HSUB`, knockout: false },
        { field: `ADDITIONAL_MEDICARE_TAX`, knockout: true, koScreen: `w2-box-14-rrta-ny-ko` },
        { field: `ERS`, knockout: false },
        { field: `ERSNYSRE`, knockout: false },
        { field: `ERSRETCO`, knockout: false },
        { field: `IRC125S`, knockout: false },
        { field: `MEDICARE_TAX`, knockout: true, koScreen: `w2-box-14-rrta-ny-ko` },
        { field: `NYRET`, knockout: false },
        { field: `NYSERS`, knockout: false },
        { field: `NYSRETCO`, knockout: false },
        { field: `PUBRET`, knockout: false },
        { field: `RET`, knockout: false },
        { field: `RETDEF`, knockout: false },
        { field: `RETMT`, knockout: false },
        { field: `RETSH`, knockout: false },
        { field: `RETSM`, knockout: false },
        { field: `RETSUM`, knockout: false },
        { field: `RRTA_COMPENSATION`, knockout: true, koScreen: `w2-box-14-rrta-ny-ko` },
        { field: `TIER_1_TAX`, knockout: true, koScreen: `w2-box-14-rrta-ny-ko` },
        { field: `TIER_2_TAX`, knockout: true, koScreen: `w2-box-14-rrta-ny-ko` },
        { field: `TIER3RET`, knockout: false },
        { field: `TIER4`, knockout: false },
        { field: `TIER4RET`, knockout: false },
      ]) {
        const { factGraph } = setupFactGraph({
          ...baseIncomeData,
          [`/filerResidenceAndIncomeState`]: createEnumWrapper(`ny`, `/scopedStateOptions`),
          [`/formW2s/#${w2Id}/${box14Config.field}`]: createDollarWrapper(`10.00`),
        });
        if (box14Config.knockout) {
          it(`${box14Config.field} it knocks them out`, ({ task }) => {
            expect(givenFacts(factGraph).atPath(`${path}/w2-add-box-14-ny`, w2Id, task)).toRouteNextTo(
              `${path}/${box14Config.koScreen}`
            );
          });
        } else {
          it(`${box14Config.field} it allows them to continue`, ({ task }) => {
            expect(givenFacts(factGraph).atPath(`${path}/w2-add-box-14-ny`, w2Id, task)).toRouteNextTo(
              `/flow/income/jobs/w2-add-boxes-15-20`
            );
          });
        }
      }
    });

    describe(`When a user enters a positive value for box 14 code in MD`, () => {
      for (const box14Config of [
        { field: `ADDITIONAL_MEDICARE_TAX`, knockout: true, koScreen: `w2-box-14-rrta-ny-ko` },
        { field: `MEDICARE_TAX`, knockout: true, koScreen: `w2-box-14-rrta-ny-ko` },
        { field: `RRTA_COMPENSATION`, knockout: true, koScreen: `w2-box-14-rrta-ny-ko` },
        { field: `TIER_1_TAX`, knockout: true, koScreen: `w2-box-14-rrta-ny-ko` },
        { field: `TIER_2_TAX`, knockout: true, koScreen: `w2-box-14-rrta-ny-ko` },
        { field: `BOX14_MD_STPICKUP`, knockout: false },
      ]) {
        const { factGraph } = setupFactGraph({
          ...baseIncomeData,
          [`/filerResidenceAndIncomeState`]: createEnumWrapper(`md`, `/scopedStateOptions`),
          [`/formW2s/#${w2Id}/${box14Config.field}`]: createDollarWrapper(`10.00`),
        });
        if (box14Config.knockout) {
          it(`${box14Config.field} it knocks them out`, ({ task }) => {
            expect(givenFacts(factGraph).atPath(`${path}/w2-add-box-14-ny`, w2Id, task)).toRouteNextTo(
              `${path}/${box14Config.koScreen}`
            );
          });
        } else {
          it(`${box14Config.field} it allows them to continue`, ({ task }) => {
            expect(givenFacts(factGraph).atPath(`${path}/w2-add-box-14-ny`, w2Id, task)).toRouteNextTo(
              `/flow/income/jobs/w2-add-boxes-15-20`
            );
          });
        }
      }
    });

    describe(`When a user enters a positive value for box 14 code in NJ`, () => {
      for (const box14Config of [
        { field: `ADDITIONAL_MEDICARE_TAX`, knockout: true, koScreen: `w2-box-14-rrta-ny-ko` },
        { field: `MEDICARE_TAX`, knockout: true, koScreen: `w2-box-14-rrta-ny-ko` },
        { field: `RRTA_COMPENSATION`, knockout: true, koScreen: `w2-box-14-rrta-ny-ko` },
        { field: `TIER_1_TAX`, knockout: true, koScreen: `w2-box-14-rrta-ny-ko` },
        { field: `TIER_2_TAX`, knockout: true, koScreen: `w2-box-14-rrta-ny-ko` },
        { field: `BOX14_NJ_FLI`, knockout: false },
        { field: `BOX14_NJ_UIHCWD`, knockout: false },
        { field: `BOX14_NJ_UIWFSWF`, knockout: false },
      ]) {
        const { factGraph } = setupFactGraph({
          ...baseIncomeData,
          [`/filerResidenceAndIncomeState`]: createEnumWrapper(`nj`, `/scopedStateOptions`),
          [`/formW2s/#${w2Id}/${box14Config.field}`]: createDollarWrapper(`10.00`),
        });
        if (box14Config.knockout) {
          it(`${box14Config.field} it knocks them out`, ({ task }) => {
            expect(givenFacts(factGraph).atPath(`${path}/w2-add-box-14-ny`, w2Id, task)).toRouteNextTo(
              `${path}/${box14Config.koScreen}`
            );
          });
        } else {
          it(`${box14Config.field} it allows them to continue`, ({ task }) => {
            expect(givenFacts(factGraph).atPath(`${path}/w2-add-box-14-ny`, w2Id, task)).toRouteNextTo(
              `/flow/income/jobs/w2-add-boxes-15-20`
            );
          });
        }
      }
    });

    describe(`When the user chooses Another State in Box 15`, () => {
      it(`navigates to knockout screen`, ({ task }) => {
        const { factGraph } = setupFactGraph({
          ...baseIncomeData,
          [`/formW2s/#${w2Id}/writableState`]: createEnumWrapper(`differentState`, `/incomeFormStateOptions`),
        });
        expect(givenFacts(factGraph).atPath(`${path}/w2-add-boxes-15-20`, w2Id, task)).toRouteNextTo(
          `${path}/w2-other-state-ko`
        );
      });
    });

    describe(`When a user has a Yonkers code in box 20`, () => {
      for (const testCases of [
        // expected knockouts
        { field: `YONKERS`, knockout: true },
        { field: `YK`, knockout: true },
        { field: `YON`, knockout: true },
        { field: `YNK`, knockout: true },
        { field: `CITYOFYK`, knockout: true },
        { field: `CTYOFYKR`, knockout: true },
        { field: `CITYOF YK`, knockout: true },
        { field: `CITY OFYK`, knockout: true },
        { field: `CTY OF YK`, knockout: true },

        // test `ToUpper`
        { field: `ynk`, knockout: true },
        { field: `cty of yk`, knockout: true },

        // negative cases
        { field: ``, knockout: false },
        { field: `ANYTHING`, knockout: false },
      ]) {
        const { factGraph } = setupFactGraph({
          ...baseIncomeData,
          [`/formW2s/#${w2Id}/writableStateWages`]: createDollarWrapper(`40000`),
          [`/formW2s/#${w2Id}/writableLocality`]: createStringWrapper(testCases.field),
          [`/filerResidenceAndIncomeState`]: createEnumWrapper(`ny`, `/scopedStateOptions`),
          [`/partYearYonkersResident`]: createBooleanWrapper(true),
        });

        let expectedResult = `does not knock them out`,
          expectedRouteNext = `w2-nonstandard-corrected`;

        if (testCases.knockout) {
          expectedResult = `asks about part year residency`;
          expectedRouteNext = `w2-part-year-yonkers`;
        }

        it(`${testCases.field}: ${expectedResult} based on box 20 Yonkers codes`, ({ task }) => {
          expect(givenFacts(factGraph).atPath(`${path}/w2-add-boxes-15-20`, w2Id, task)).toRouteNextTo(
            `${path}/${expectedRouteNext}`
          );
        });

        if (testCases.knockout) {
          it(`${testCases.field}: knocks out if part-year Yonkers resident`, ({ task }) => {
            expect(givenFacts(factGraph).atPath(`${path}/w2-part-year-yonkers`, w2Id, task)).toRouteNextTo(
              `${path}/w2-part-year-yonkers-ko`
            );
          });
        }
      }
    });

    // Enable this test once Data import is initialized on setting up these tests.
    describe(`When a user imports their W-2 with knockouts`, () => {
      it.skip(`navigates to condensed knockout screen`, ({ task }) => {
        const { factGraph } = setupFactGraph({
          ...baseIncomeData,
          [`/formW2s/#${w2Id}/writableAllocatedTips`]: createDollarWrapper(`40000`),
        });
        expect(givenFacts(factGraph).atPath(`${path}/jobs-data-import`, null, task)).toRouteNextTo(
          `${path}/jobs-data-import-ko`
        );
      });
    });
  });

  describe(`The interest income loop`, () => {
    const path = `/flow/income/interest`;
    const interestReportId = `0b1e355e-3d19-415d-8470-fbafd9f58361`;
    const interestReportId2 = `1a1e355e-3d19-415d-8470-fbafd9f58361`;
    const baseIncomeData = {
      ...baseFilerData,
      '/interestReports': {
        $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
        item: { items: [`${interestReportId}`] },
      },
    };

    const two1099IntIncomeData = {
      ...baseFilerData,
      '/interestReports': {
        $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
        item: { items: [interestReportId, interestReportId2] },
      },
    };

    for (const has1099 of [true, false]) {
      describe(`When there is ${has1099 ? `` : `not`} a 1099-INT ...`, () => {
        describe(`When filing status is ...`, () => {
          for (const key of Object.keys(en.fields[`/filingStatusOptions`])) {
            const { factGraph } = setupFactGraph({
              ...baseIncomeData,
              [`/interestReports/#${interestReportId}/has1099`]: createBooleanWrapper(has1099),
              [`/filingStatus`]: createEnumWrapper(key, `/filingStatusOptions`),
            });
            const isMfj = key === `marriedFilingJointly`;
            it(`${key}, it ${isMfj ? `asks` : `does not ask`} whose interest is to be entered`, ({ task }) => {
              expect(givenFacts(factGraph).atPath(`${path}/add-int-income`, interestReportId, task)).toRouteNextTo(
                isMfj
                  ? `${path}/${has1099 ? `` : `no-`}1099-int-add-whose?%2FinterestReports=${interestReportId}`
                  : `${path}/${has1099 ? `` : `no-`}1099-int-add-payer-name?%2FinterestReports=${interestReportId}`
              );
            });
          }
        });
        if (has1099) {
          describe(`Flows through the box screens`, () => {
            it(`moves from box 1 to box 2`, ({ task }) => {
              const { factGraph } = setupFactGraph({
                ...baseIncomeData,
                [`/interestReports/#${interestReportId}/has1099`]: createBooleanWrapper(has1099),
                [`/interestReports/#${interestReportId}/${has1099 ? `writable1099Amount` : `no1099Amount`}`]:
                  createDollarWrapper(`100`),
              });
              expect(givenFacts(factGraph).atPath(`${path}/1099-int-add-box-1`, interestReportId, task)).toRouteNextTo(
                `${path}/1099-int-add-box-2?%2FinterestReports=${interestReportId}`
              );
            });

            it(`moves from box 2 to box 3`, ({ task }) => {
              const { factGraph } = setupFactGraph({
                ...baseIncomeData,
                [`/interestReports/#${interestReportId}/has1099`]: createBooleanWrapper(has1099),
                [`/interestReports/#${interestReportId}/${has1099 ? `writable1099Amount` : `no1099Amount`}`]:
                  createDollarWrapper(`100`),
                [`/interestReports/#${interestReportId}/${
                  has1099 ? `writableEarlyWithdrawlPenaltyAmount` : `no1099Amount`
                }`]: createDollarWrapper(`0`),
              });
              expect(givenFacts(factGraph).atPath(`${path}/1099-int-add-box-2`, interestReportId, task)).toRouteNextTo(
                `${path}/1099-int-add-box-3?%2FinterestReports=${interestReportId}`
              );
            });

            it(`moves from box 3 to box 4`, ({ task }) => {
              const { factGraph } = setupFactGraph({
                ...baseIncomeData,
                [`/interestReports/#${interestReportId}/has1099`]: createBooleanWrapper(has1099),
                [`/interestReports/#${interestReportId}/${has1099 ? `writable1099Amount` : `no1099Amount`}`]:
                  createDollarWrapper(`100`),
                [`/interestReports/#${interestReportId}/${
                  has1099 ? `writableEarlyWithdrawlPenaltyAmount` : `no1099Amount`
                }`]: createDollarWrapper(`0`),
                [`/interestReports/#${interestReportId}/${
                  has1099 ? `writableInterestOnGovernmentBonds` : `no1099Amount`
                }`]: createDollarWrapper(`10`),
              });
              expect(givenFacts(factGraph).atPath(`${path}/1099-int-add-box-3`, interestReportId, task)).toRouteNextTo(
                `${path}/1099-int-add-box-4?%2FinterestReports=${interestReportId}`
              );
            });

            it(`moves from box 4 to enter payer tin if the value in box 4 is greater than 0`, ({ task }) => {
              const { factGraph } = setupFactGraph({
                ...baseIncomeData,
                [`/interestReports/#${interestReportId}/has1099`]: createBooleanWrapper(has1099),
                [`/interestReports/#${interestReportId}/${has1099 ? `writable1099Amount` : `no1099Amount`}`]:
                  createDollarWrapper(`100`),
                [`/interestReports/#${interestReportId}/${
                  has1099 ? `writableEarlyWithdrawlPenaltyAmount` : `no1099Amount`
                }`]: createDollarWrapper(`0`),
                [`/interestReports/#${interestReportId}/${
                  has1099 ? `writableInterestOnGovernmentBonds` : `no1099Amount`
                }`]: createDollarWrapper(`10`),
                [`/interestReports/#${interestReportId}/${has1099 ? `writableTaxWithheld` : `no1099Amount`}`]:
                  createDollarWrapper(`10`),
              });
              expect(givenFacts(factGraph).atPath(`${path}/1099-int-add-box-4`, interestReportId, task)).toRouteNextTo(
                `${path}/1099-int-add-payer-tin?%2FinterestReports=${interestReportId}`
              );
            });

            it(`moves from box 4 to box 6 if the value in box 4 is 0`, ({ task }) => {
              const { factGraph } = setupFactGraph({
                ...baseIncomeData,
                [`/interestReports/#${interestReportId}/has1099`]: createBooleanWrapper(has1099),
                [`/interestReports/#${interestReportId}/${has1099 ? `writable1099Amount` : `no1099Amount`}`]:
                  createDollarWrapper(`100`),
                [`/interestReports/#${interestReportId}/${
                  has1099 ? `writableEarlyWithdrawlPenaltyAmount` : `no1099Amount`
                }`]: createDollarWrapper(`0`),
                [`/interestReports/#${interestReportId}/${
                  has1099 ? `writableInterestOnGovernmentBonds` : `no1099Amount`
                }`]: createDollarWrapper(`10`),
                [`/interestReports/#${interestReportId}/${has1099 ? `writableTaxWithheld` : `no1099Amount`}`]:
                  createDollarWrapper(`0`),
              });
              expect(givenFacts(factGraph).atPath(`${path}/1099-int-add-box-4`, interestReportId, task)).toRouteNextTo(
                `${path}/1099-int-add-box-6?%2FinterestReports=${interestReportId}`
              );
            });

            it(`moves from enter payer tin to box 6`, ({ task }) => {
              const { factGraph } = setupFactGraph({
                ...baseIncomeData,
                [`/interestReports/#${interestReportId}/has1099`]: createBooleanWrapper(has1099),
                [`/interestReports/#${interestReportId}/${has1099 ? `writable1099Amount` : `no1099Amount`}`]:
                  createDollarWrapper(`100`),
                [`/interestReports/#${interestReportId}/${
                  has1099 ? `writableEarlyWithdrawlPenaltyAmount` : `no1099Amount`
                }`]: createDollarWrapper(`0`),
                [`/interestReports/#${interestReportId}/${
                  has1099 ? `writableInterestOnGovernmentBonds` : `no1099Amount`
                }`]: createDollarWrapper(`10`),
                [`/interestReports/#${interestReportId}/${has1099 ? `writableTaxWithheld` : `no1099Amount`}`]:
                  createDollarWrapper(`10`),
                [`/interestReports/#${interestReportId}/${has1099 ? `payer/tin` : `no1099Amount`}`]: createEinWrapper(
                  `00`,
                  `1234567`
                ),
              });
              expect(
                givenFacts(factGraph).atPath(`${path}/1099-int-add-payer-tin`, interestReportId, task)
              ).toRouteNextTo(`${path}/1099-int-add-box-6?%2FinterestReports=${interestReportId}`);
            });

            it(`moves from box 6 to box 8 if the value in box 6 is 0`, ({ task }) => {
              const { factGraph } = setupFactGraph({
                ...baseIncomeData,
                [`/interestReports/#${interestReportId}/has1099`]: createBooleanWrapper(has1099),
                [`/interestReports/#${interestReportId}/${has1099 ? `writable1099Amount` : `no1099Amount`}`]:
                  createDollarWrapper(`100`),
                [`/interestReports/#${interestReportId}/${
                  has1099 ? `writableEarlyWithdrawlPenaltyAmount` : `no1099Amount`
                }`]: createDollarWrapper(`0`),
                [`/interestReports/#${interestReportId}/${
                  has1099 ? `writableInterestOnGovernmentBonds` : `no1099Amount`
                }`]: createDollarWrapper(`10`),
                [`/interestReports/#${interestReportId}/${has1099 ? `writableTaxWithheld` : `no1099Amount`}`]:
                  createDollarWrapper(`0`),
                [`/interestReports/#${interestReportId}/${has1099 ? `writableForeignTaxPaid` : `no1099Amount`}`]:
                  createDollarWrapper(`0`),
              });
              expect(givenFacts(factGraph).atPath(`${path}/1099-int-add-box-6`, interestReportId, task)).toRouteNextTo(
                `${path}/1099-int-add-box-8?%2FinterestReports=${interestReportId}`
              );
            });

            it(`moves from box 8 to boxes 9 - 14`, ({ task }) => {
              const { factGraph } = setupFactGraph({
                ...baseIncomeData,
                [`/interestReports/#${interestReportId}/has1099`]: createBooleanWrapper(has1099),
                [`/interestReports/#${interestReportId}/${has1099 ? `writable1099Amount` : `no1099Amount`}`]:
                  createDollarWrapper(`100`),
                [`/interestReports/#${interestReportId}/${
                  has1099 ? `writableEarlyWithdrawlPenaltyAmount` : `no1099Amount`
                }`]: createDollarWrapper(`0`),
                [`/interestReports/#${interestReportId}/${
                  has1099 ? `writableInterestOnGovernmentBonds` : `no1099Amount`
                }`]: createDollarWrapper(`10`),
                [`/interestReports/#${interestReportId}/${has1099 ? `writableTaxWithheld` : `no1099Amount`}`]:
                  createDollarWrapper(`0`),
                [`/interestReports/#${interestReportId}/${has1099 ? `writableTaxExemptInterest` : `no1099Amount`}`]:
                  createDollarWrapper(`0`),
              });
              expect(givenFacts(factGraph).atPath(`${path}/1099-int-add-box-8`, interestReportId, task)).toRouteNextTo(
                `${path}/1099-int-add-boxes-9-14?%2FinterestReports=${interestReportId}`
              );
            });

            it(`moves from boxes 9 - 14 to boxes 15 - 17`, ({ task }) => {
              const { factGraph } = setupFactGraph({
                ...baseIncomeData,
                [`/interestReports/#${interestReportId}/has1099`]: createBooleanWrapper(has1099),
                [`/interestReports/#${interestReportId}/${has1099 ? `writable1099Amount` : `no1099Amount`}`]:
                  createDollarWrapper(`100`),
                [`/interestReports/#${interestReportId}/${
                  has1099 ? `writableEarlyWithdrawlPenaltyAmount` : `no1099Amount`
                }`]: createDollarWrapper(`0`),
                [`/interestReports/#${interestReportId}/${
                  has1099 ? `writableInterestOnGovernmentBonds` : `no1099Amount`
                }`]: createDollarWrapper(`10`),
                [`/interestReports/#${interestReportId}/${has1099 ? `writableTaxWithheld` : `no1099Amount`}`]:
                  createDollarWrapper(`0`),
                [`/interestReports/#${interestReportId}/${has1099 ? `writableTaxExemptInterest` : `no1099Amount`}`]:
                  createDollarWrapper(`20`),
                [`/interestReports/#${interestReportId}/${
                  has1099 ? `writableSpecifiedPrivateActivityBondInterest` : `no1099Amount`
                }`]: createDollarWrapper(`0`),
                [`/interestReports/#${interestReportId}/${has1099 ? `writableMarketDiscount` : `no1099Amount`}`]:
                  createDollarWrapper(`0`),
                [`/interestReports/#${interestReportId}/${has1099 ? `writableBondPremium` : `no1099Amount`}`]:
                  createDollarWrapper(`0`),
                [`/interestReports/#${interestReportId}/${
                  has1099 ? `writableBondPremiumOnTreasuryObligations` : `no1099Amount`
                }`]: createDollarWrapper(`0`),
                [`/interestReports/#${interestReportId}/${
                  has1099 ? `writableBondPremiumOnTaxExemptBond` : `no1099Amount`
                }`]: createDollarWrapper(`0`),
              });
              expect(
                givenFacts(factGraph).atPath(`${path}/1099-int-add-boxes-9-14`, interestReportId, task)
              ).toRouteNextTo(`${path}/1099-int-add-boxes-15-17?%2FinterestReports=${interestReportId}`);
            });
          });

          describe(`Knocks out the filer`, () => {
            it(`for having an early withdrawl penalty amount`, ({ task }) => {
              const { factGraph } = setupFactGraph({
                ...baseIncomeData,
                [`/interestReports/#${interestReportId}/has1099`]: createBooleanWrapper(has1099),
                [`/interestReports/#${interestReportId}/${has1099 ? `writable1099Amount` : `no1099Amount`}`]:
                  createDollarWrapper(`100`),
                [`/interestReports/#${interestReportId}/${
                  has1099 ? `writableEarlyWithdrawlPenaltyAmount` : `no1099Amount`
                }`]: createDollarWrapper(`10`),
              });
              expect(givenFacts(factGraph).atPath(`${path}/1099-int-add-box-2`, interestReportId, task)).toRouteNextTo(
                `${path}/1099-int-box-2-knockout`
              );
            });

            it(`for having a foreign tax paid amount`, ({ task }) => {
              const { factGraph } = setupFactGraph({
                ...baseIncomeData,
                [`/interestReports/#${interestReportId}/has1099`]: createBooleanWrapper(has1099),
                [`/interestReports/#${interestReportId}/${has1099 ? `writable1099Amount` : `no1099Amount`}`]:
                  createDollarWrapper(`100`),
                [`/interestReports/#${interestReportId}/${
                  has1099 ? `writableEarlyWithdrawlPenaltyAmount` : `no1099Amount`
                }`]: createDollarWrapper(`0`),
                [`/interestReports/#${interestReportId}/${
                  has1099 ? `writableInterestOnGovernmentBonds` : `no1099Amount`
                }`]: createDollarWrapper(`10`),
                [`/interestReports/#${interestReportId}/${has1099 ? `writableTaxWithheld` : `no1099Amount`}`]:
                  createDollarWrapper(`0`),
                [`/interestReports/#${interestReportId}/${has1099 ? `writableForeignTaxPaid` : `no1099Amount`}`]:
                  createDollarWrapper(`1`),
              });
              expect(givenFacts(factGraph).atPath(`${path}/1099-int-add-box-6`, interestReportId, task)).toRouteNextTo(
                `${path}/1099-int-box-6-knockout`
              );
            });

            it(`for having a tax exempt interest amount`, ({ task }) => {
              const { factGraph } = setupFactGraph({
                ...baseIncomeData,
                [`/interestReports/#${interestReportId}/has1099`]: createBooleanWrapper(has1099),
                [`/interestReports/#${interestReportId}/${has1099 ? `writable1099Amount` : `no1099Amount`}`]:
                  createDollarWrapper(`100`),
                [`/interestReports/#${interestReportId}/${
                  has1099 ? `writableEarlyWithdrawlPenaltyAmount` : `no1099Amount`
                }`]: createDollarWrapper(`0`),
                [`/interestReports/#${interestReportId}/${
                  has1099 ? `writableInterestOnGovernmentBonds` : `no1099Amount`
                }`]: createDollarWrapper(`10`),
                [`/interestReports/#${interestReportId}/${has1099 ? `writableTaxWithheld` : `no1099Amount`}`]:
                  createDollarWrapper(`0`),
                [`/interestReports/#${interestReportId}/${has1099 ? `writableForeignTaxPaid` : `no1099Amount`}`]:
                  createDollarWrapper(`0`),
                [`/interestReports/#${interestReportId}/${has1099 ? `writableTaxExemptInterest` : `no1099Amount`}`]:
                  createDollarWrapper(`1`),
              });
              expect(givenFacts(factGraph).atPath(`${path}/1099-int-add-box-8`, interestReportId, task)).toRouteNextTo(
                `${path}/1099-int-box-8-ko`
              );
            });

            describe(`for having a value in`, () => {
              it(`Box 9 - Specified private activity bond interest`, ({ task }) => {
                const { factGraph } = setupFactGraph({
                  ...baseIncomeData,
                  [`/interestReports/#${interestReportId}/has1099`]: createBooleanWrapper(has1099),
                  [`/interestReports/#${interestReportId}/${has1099 ? `writable1099Amount` : `no1099Amount`}`]:
                    createDollarWrapper(`100`),
                  [`/interestReports/#${interestReportId}/${
                    has1099 ? `writableEarlyWithdrawlPenaltyAmount` : `no1099Amount`
                  }`]: createDollarWrapper(`0`),
                  [`/interestReports/#${interestReportId}/${
                    has1099 ? `writableInterestOnGovernmentBonds` : `no1099Amount`
                  }`]: createDollarWrapper(`10`),
                  [`/interestReports/#${interestReportId}/${
                    has1099 ? `writableSpecifiedPrivateActivityBondInterest` : `no1099Amount`
                  }`]: createDollarWrapper(`1`),
                });
                expect(
                  givenFacts(factGraph).atPath(`${path}/1099-int-add-boxes-9-14`, interestReportId, task)
                ).toRouteNextTo(`${path}/1099-int-boxes-9-13-knockout`);
              });

              it(`Box 10 - Market discount`, ({ task }) => {
                const { factGraph } = setupFactGraph({
                  ...baseIncomeData,
                  [`/interestReports/#${interestReportId}/has1099`]: createBooleanWrapper(has1099),
                  [`/interestReports/#${interestReportId}/${has1099 ? `writable1099Amount` : `no1099Amount`}`]:
                    createDollarWrapper(`100`),
                  [`/interestReports/#${interestReportId}/${
                    has1099 ? `writableEarlyWithdrawlPenaltyAmount` : `no1099Amount`
                  }`]: createDollarWrapper(`0`),
                  [`/interestReports/#${interestReportId}/${
                    has1099 ? `writableInterestOnGovernmentBonds` : `no1099Amount`
                  }`]: createDollarWrapper(`10`),
                  [`/interestReports/#${interestReportId}/${
                    has1099 ? `writableSpecifiedPrivateActivityBondInterest` : `no1099Amount`
                  }`]: createDollarWrapper(`0`),
                  [`/interestReports/#${interestReportId}/${has1099 ? `writableMarketDiscount` : `no1099Amount`}`]:
                    createDollarWrapper(`1`),
                });
                expect(
                  givenFacts(factGraph).atPath(`${path}/1099-int-add-boxes-9-14`, interestReportId, task)
                ).toRouteNextTo(`${path}/1099-int-boxes-9-13-knockout`);
              });

              it(`Box 11 - Bond premium`, ({ task }) => {
                const { factGraph } = setupFactGraph({
                  ...baseIncomeData,
                  [`/interestReports/#${interestReportId}/has1099`]: createBooleanWrapper(has1099),
                  [`/interestReports/#${interestReportId}/${has1099 ? `writable1099Amount` : `no1099Amount`}`]:
                    createDollarWrapper(`100`),
                  [`/interestReports/#${interestReportId}/${
                    has1099 ? `writableEarlyWithdrawlPenaltyAmount` : `no1099Amount`
                  }`]: createDollarWrapper(`0`),
                  [`/interestReports/#${interestReportId}/${
                    has1099 ? `writableInterestOnGovernmentBonds` : `no1099Amount`
                  }`]: createDollarWrapper(`10`),
                  [`/interestReports/#${interestReportId}/${
                    has1099 ? `writableSpecifiedPrivateActivityBondInterest` : `no1099Amount`
                  }`]: createDollarWrapper(`0`),
                  [`/interestReports/#${interestReportId}/${has1099 ? `writableMarketDiscount` : `no1099Amount`}`]:
                    createDollarWrapper(`0`),
                  [`/interestReports/#${interestReportId}/${has1099 ? `writableBondPremium` : `no1099Amount`}`]:
                    createDollarWrapper(`1`),
                });
                expect(
                  givenFacts(factGraph).atPath(`${path}/1099-int-add-boxes-9-14`, interestReportId, task)
                ).toRouteNextTo(`${path}/1099-int-boxes-9-13-knockout`);
              });

              it(`Box 12 - Bond premium on Treasury obligations`, ({ task }) => {
                const { factGraph } = setupFactGraph({
                  ...baseIncomeData,
                  [`/interestReports/#${interestReportId}/has1099`]: createBooleanWrapper(has1099),
                  [`/interestReports/#${interestReportId}/${has1099 ? `writable1099Amount` : `no1099Amount`}`]:
                    createDollarWrapper(`100`),
                  [`/interestReports/#${interestReportId}/${
                    has1099 ? `writableEarlyWithdrawlPenaltyAmount` : `no1099Amount`
                  }`]: createDollarWrapper(`0`),
                  [`/interestReports/#${interestReportId}/${
                    has1099 ? `writableInterestOnGovernmentBonds` : `no1099Amount`
                  }`]: createDollarWrapper(`10`),
                  [`/interestReports/#${interestReportId}/${
                    has1099 ? `writableSpecifiedPrivateActivityBondInterest` : `no1099Amount`
                  }`]: createDollarWrapper(`0`),
                  [`/interestReports/#${interestReportId}/${has1099 ? `writableMarketDiscount` : `no1099Amount`}`]:
                    createDollarWrapper(`0`),
                  [`/interestReports/#${interestReportId}/${has1099 ? `writableBondPremium` : `no1099Amount`}`]:
                    createDollarWrapper(`0`),
                  [`/interestReports/#${interestReportId}/${
                    has1099 ? `writableBondPremiumOnTreasuryObligations` : `no1099Amount`
                  }`]: createDollarWrapper(`1`),
                });
                expect(
                  givenFacts(factGraph).atPath(`${path}/1099-int-add-boxes-9-14`, interestReportId, task)
                ).toRouteNextTo(`${path}/1099-int-boxes-9-13-knockout`);
              });

              it(`Box 13 - Bond premium on tax-exempt bond`, ({ task }) => {
                const { factGraph } = setupFactGraph({
                  ...baseIncomeData,
                  [`/interestReports/#${interestReportId}/has1099`]: createBooleanWrapper(has1099),
                  [`/interestReports/#${interestReportId}/${has1099 ? `writable1099Amount` : `no1099Amount`}`]:
                    createDollarWrapper(`100`),
                  [`/interestReports/#${interestReportId}/${
                    has1099 ? `writableEarlyWithdrawlPenaltyAmount` : `no1099Amount`
                  }`]: createDollarWrapper(`0`),
                  [`/interestReports/#${interestReportId}/${
                    has1099 ? `writableInterestOnGovernmentBonds` : `no1099Amount`
                  }`]: createDollarWrapper(`10`),
                  [`/interestReports/#${interestReportId}/${
                    has1099 ? `writableSpecifiedPrivateActivityBondInterest` : `no1099Amount`
                  }`]: createDollarWrapper(`0`),
                  [`/interestReports/#${interestReportId}/${has1099 ? `writableMarketDiscount` : `no1099Amount`}`]:
                    createDollarWrapper(`0`),
                  [`/interestReports/#${interestReportId}/${has1099 ? `writableBondPremium` : `no1099Amount`}`]:
                    createDollarWrapper(`0`),
                  [`/interestReports/#${interestReportId}/${
                    has1099 ? `writableBondPremiumOnTreasuryObligations` : `no1099Amount`
                  }`]: createDollarWrapper(`0`),
                  [`/interestReports/#${interestReportId}/${
                    has1099 ? `writableBondPremiumOnTaxExemptBond` : `no1099Amount`
                  }`]: createDollarWrapper(`1`),
                });
                expect(
                  givenFacts(factGraph).atPath(`${path}/1099-int-add-boxes-9-14`, interestReportId, task)
                ).toRouteNextTo(`${path}/1099-int-boxes-9-13-knockout`);
              });
            });

            it(`for having selected a different state`, ({ task }) => {
              const { factGraph } = setupFactGraph({
                ...baseIncomeData,
                [`/interestReports/#${interestReportId}/has1099`]: createBooleanWrapper(has1099),
                [`/interestReports/#${interestReportId}/${has1099 ? `writable1099Amount` : `no1099Amount`}`]:
                  createDollarWrapper(`100`),
                [`/interestReports/#${interestReportId}/${
                  has1099 ? `writableEarlyWithdrawlPenaltyAmount` : `no1099Amount`
                }`]: createDollarWrapper(`0`),
                [`/interestReports/#${interestReportId}/${
                  has1099 ? `writableInterestOnGovernmentBonds` : `no1099Amount`
                }`]: createDollarWrapper(`10`),
                [`/interestReports/#${interestReportId}/${has1099 ? `writableTaxWithheld` : `no1099Amount`}`]:
                  createDollarWrapper(`0`),
                [`/interestReports/#${interestReportId}/${has1099 ? `writableTaxExemptInterest` : `no1099Amount`}`]:
                  createDollarWrapper(`20`),
                [`/interestReports/#${interestReportId}/${
                  has1099 ? `writableSpecifiedPrivateActivityBondInterest` : `no1099Amount`
                }`]: createDollarWrapper(`0`),
                [`/interestReports/#${interestReportId}/${has1099 ? `writableMarketDiscount` : `no1099Amount`}`]:
                  createDollarWrapper(`0`),
                [`/interestReports/#${interestReportId}/${has1099 ? `writableBondPremium` : `no1099Amount`}`]:
                  createDollarWrapper(`0`),
                [`/interestReports/#${interestReportId}/${
                  has1099 ? `writableBondPremiumOnTreasuryObligations` : `no1099Amount`
                }`]: createDollarWrapper(`0`),
                [`/interestReports/#${interestReportId}/${
                  has1099 ? `writableBondPremiumOnTaxExemptBond` : `no1099Amount`
                }`]: createDollarWrapper(`0`),
                [`/interestReports/#${interestReportId}/${has1099 ? `writableState` : `no1099Amount`}`]:
                  createEnumWrapper(`differentState`, `/incomeFormStateOptions`),
              });
              expect(
                givenFacts(factGraph).atPath(`${path}/1099-int-add-boxes-15-17`, interestReportId, task)
              ).toRouteNextTo(`${path}/1099-int-other-state-knockout`);
            });

            it(`for having state tax withheld more than $0`, ({ task }) => {
              const { factGraph } = setupFactGraph({
                ...baseIncomeData,
                [`/interestReports/#${interestReportId}/has1099`]: createBooleanWrapper(has1099),
                [`/interestReports/#${interestReportId}/${has1099 ? `writable1099Amount` : `no1099Amount`}`]:
                  createDollarWrapper(`100`),
                [`/interestReports/#${interestReportId}/${
                  has1099 ? `writableEarlyWithdrawlPenaltyAmount` : `no1099Amount`
                }`]: createDollarWrapper(`0`),
                [`/interestReports/#${interestReportId}/${
                  has1099 ? `writableInterestOnGovernmentBonds` : `no1099Amount`
                }`]: createDollarWrapper(`10`),
                [`/interestReports/#${interestReportId}/${has1099 ? `writableTaxWithheld` : `no1099Amount`}`]:
                  createDollarWrapper(`0`),
                [`/interestReports/#${interestReportId}/${has1099 ? `writableTaxExemptInterest` : `no1099Amount`}`]:
                  createDollarWrapper(`20`),
                [`/interestReports/#${interestReportId}/${
                  has1099 ? `writableSpecifiedPrivateActivityBondInterest` : `no1099Amount`
                }`]: createDollarWrapper(`0`),
                [`/interestReports/#${interestReportId}/${has1099 ? `writableMarketDiscount` : `no1099Amount`}`]:
                  createDollarWrapper(`0`),
                [`/interestReports/#${interestReportId}/${has1099 ? `writableBondPremium` : `no1099Amount`}`]:
                  createDollarWrapper(`0`),
                [`/interestReports/#${interestReportId}/${
                  has1099 ? `writableBondPremiumOnTreasuryObligations` : `no1099Amount`
                }`]: createDollarWrapper(`0`),
                [`/interestReports/#${interestReportId}/${
                  has1099 ? `writableBondPremiumOnTaxExemptBond` : `no1099Amount`
                }`]: createDollarWrapper(`0`),
                [`/interestReports/#${interestReportId}/${has1099 ? `writableStateTaxWithheld` : `no1099Amount`}`]:
                  createDollarWrapper(`5.00`),
              });
              expect(
                givenFacts(factGraph).atPath(`${path}/1099-int-add-boxes-15-17`, interestReportId, task)
              ).toRouteNextTo(`${path}/1099-int-box-17-ko`);
            });
          });

          // Originally, the tests were written as if flow should KO for any interest > $1500-- not just on 1099.
          // But we don't (yet?) implement that, so the condition just above limits test to 1099 scenario.
          // The knockout conditions were updated to test that any interest over 1500 is now allowed for 1099s.
          describe(`When the amount of taxable interest is ...`, () => {
            it(`... $1500, it continues with interest inputs`, ({ task }) => {
              const { factGraph } = setupFactGraph({
                ...baseIncomeData,
                [`/interestReports/#${interestReportId}/has1099`]: createBooleanWrapper(has1099),
                [`/interestReports/#${interestReportId}/${has1099 ? `writable1099Amount` : `no1099Amount`}`]:
                  createDollarWrapper(`1500`),
              });
              if (has1099) {
                expect(
                  givenFacts(factGraph).atPath(`${path}/1099-int-add-box-1`, interestReportId, task)
                ).toRouteNextTo(`${path}/1099-int-add-box-2?%2FinterestReports=${interestReportId}`);
              } else {
                expect(
                  givenFacts(factGraph).atPath(`${path}/int-add-taxable-int`, interestReportId, task)
                ).toRouteNextTo(`${path}/int-breather`);
              }
            });
            it(`... $1501, it does not knock out user`, ({ task }) => {
              const { factGraph } = setupFactGraph({
                ...baseIncomeData,
                [`/interestReports/#${interestReportId}/has1099`]: createBooleanWrapper(true),
                [`/interestReports/#${interestReportId}/writableInterestOnGovernmentBonds`]: createDollarWrapper(`0`),
                [`/interestReports/#${interestReportId}/${has1099 ? `writable1099Amount` : `no1099Amount`}`]:
                  createDollarWrapper(`1501`),
              });
              if (has1099) {
                expect(
                  givenFacts(factGraph).atPath(`${path}/1099-int-add-box-1`, interestReportId, task)
                ).toRouteNextTo(`${path}/1099-int-add-box-2?%2FinterestReports=${interestReportId}`);
              } else {
                expect(
                  givenFacts(factGraph).atPath(`${path}/int-add-taxable-int`, interestReportId, task)
                ).toRouteNextTo(`${path}/1099-int-knockout`);
              }
            });

            it(`... $1501 with box 3, it does not knocks out user`, ({ task }) => {
              const { factGraph } = setupFactGraph({
                ...baseIncomeData,
                [`/interestReports/#${interestReportId}/has1099`]: createBooleanWrapper(true),
                [`/interestReports/#${interestReportId}/writableInterestOnGovernmentBonds`]: createDollarWrapper(`0`),
                [`/interestReports/#${interestReportId}/${has1099 ? `writable1099Amount` : `no1099Amount`}`]:
                  createDollarWrapper(`1500`),
                [`/interestReports/#${interestReportId}/${
                  has1099 ? `writableEarlyWithdrawlPenaltyAmount` : `no1099Amount`
                }`]: createDollarWrapper(`0`),
                [`/interestReports/#${interestReportId}/${
                  has1099 ? `writableInterestOnGovernmentBonds` : `no1099Amount`
                }`]: createDollarWrapper(`1`),
              });
              if (has1099) {
                expect(
                  givenFacts(factGraph).atPath(`${path}/1099-int-add-box-1`, interestReportId, task)
                ).toRouteNextTo(`${path}/1099-int-add-box-2?%2FinterestReports=${interestReportId}`);
              } else {
                expect(
                  givenFacts(factGraph).atPath(`${path}/int-add-taxable-int`, interestReportId, task)
                ).toRouteNextTo(`${path}/1099-int-knockout`);
              }
            });

            it(`Counts both government bond interest and box 1, and enables amount over 1500`, ({ task }) => {
              const { factGraph } = setupFactGraph({
                ...baseIncomeData,
                [`/interestReports/#${interestReportId}/has1099`]: createBooleanWrapper(true),
                [`/interestReports/#${interestReportId}/writableInterestOnGovernmentBonds`]: createDollarWrapper(`200`),
                [`/interestReports/#${interestReportId}/${has1099 ? `writable1099Amount` : `no1099Amount`}`]:
                  createDollarWrapper(`1400`),
              });
              expect(givenFacts(factGraph).atPath(`${path}/1099-int-add-box-1`, interestReportId, task)).toRouteNextTo(
                `${path}/1099-int-add-box-2?%2FinterestReports=${interestReportId}`
              );
            });
          });
          describe(`With two 1099-INTs`, () => {
            it(`Does not knock out if the sum of taxable interest is higher than $1500`, ({ task }) => {
              const { factGraph } = setupFactGraph({
                ...two1099IntIncomeData,
                [`/interestReports/#${interestReportId}/has1099`]: createBooleanWrapper(true),
                [`/interestReports/#${interestReportId}/writable1099Amount`]: createDollarWrapper(`700`),
                [`/interestReports/#${interestReportId}/writableInterestOnGovernmentBonds`]: createDollarWrapper(`100`),
                [`/interestReports/#${interestReportId2}/has1099`]: createBooleanWrapper(true),
                [`/interestReports/#${interestReportId2}/writable1099Amount`]: createDollarWrapper(`800`),
                [`/interestReports/#${interestReportId2}/writableInterestOnGovernmentBonds`]: createDollarWrapper(`0`),
              });
              expect(givenFacts(factGraph).atPath(`${path}/1099-int-add-box-1`, interestReportId, task)).toRouteNextTo(
                `${path}/1099-int-add-box-2?%2FinterestReports=${interestReportId}`
              );
            });
            it(`Does not knock you out if the sum of taxable interest is below $1500`, ({ task }) => {
              const { factGraph } = setupFactGraph({
                ...two1099IntIncomeData,
                [`/interestReports/#${interestReportId}/has1099`]: createBooleanWrapper(true),
                [`/interestReports/#${interestReportId}/writable1099Amount`]: createDollarWrapper(`500`),
                [`/interestReports/#${interestReportId}/writableInterestOnGovernmentBonds`]: createDollarWrapper(`125`),
                [`/interestReports/#${interestReportId2}/has1099`]: createBooleanWrapper(true),
                [`/interestReports/#${interestReportId2}/writable1099Amount`]: createDollarWrapper(`500`),
                [`/interestReports/#${interestReportId2}/writableInterestOnGovernmentBonds`]:
                  createDollarWrapper(`126`),
              });
              expect(givenFacts(factGraph).atPath(`${path}/1099-int-add-box-1`, interestReportId, task)).toRouteNextTo(
                `${path}/1099-int-add-box-2?%2FinterestReports=${interestReportId}`
              );
            });
          });
        }
      });
    }
  });

  describe(`The Alaska Permanent Fund loop`, () => {
    const formId = `0b1e355e-3d19-415d-8470-fbafd9f58361`;
    const baseIncomeData = {
      ...baseFilerData,
      '/form1099Miscs': {
        $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
        item: { items: [formId] },
      },
    };

    const path = `/flow/income/alaska-pfd`;
    describe(`When filing status is ...`, () => {
      // Note: Tests for knockouts for spouse with full or partial non-Alaska residency are in spouse.test.ts
      for (const key of Object.keys(en.fields[`/filingStatusOptions`])) {
        const { factGraph } = setupFactGraph({
          ...baseIncomeData,
          [`/form1099Miscs/#${formId}/filer`]: {
            item: {
              id: `${primaryFilerId}`,
            },
            $type: `gov.irs.factgraph.persisters.CollectionItemWrapper`,
          },
          [`/filingStatus`]: createEnumWrapper(key, `/filingStatusOptions`),
        });
        const isMfj = key === `marriedFilingJointly`;
        it(`${key}, it ${isMfj ? `asks` : `does not ask`} whose Alaska Permanent Fund is to be entered`, ({ task }) => {
          expect(givenFacts(factGraph).atPath(`${path}/pfd-loop-intro`, formId, task)).toRouteNextTo(
            isMfj ? `${path}/pfd-add-whose-1099` : `${path}/pfd-add-box-3`
          );
        });
      }
    });
    describe(`Flows through the box screens`, () => {
      it(`moves from box 3 to box 4 with placeholder value`, ({ task }) => {
        const { factGraph } = setupFactGraph({
          ...baseIncomeData,
        });
        expect(givenFacts(factGraph).atPath(`${path}/pfd-add-box-3`, formId, task)).toRouteNextTo(
          `${path}/pfd-add-box-4?%2Fform1099Miscs=${formId}`
        );
      });
      it(`moves from box 4 to form review when federal withholding is blank`, ({ task }) => {
        const { factGraph } = setupFactGraph({
          ...baseIncomeData,
        });
        expect(givenFacts(factGraph).atPath(`${path}/pfd-add-box-4`, formId, task)).toRouteNextTo(
          `/data-view/loop/%2Fform1099Miscs/${formId}`
        );
      });
      it(`moves from box 4 to form review when federal withholding is 0`, ({ task }) => {
        const { factGraph } = setupFactGraph({
          ...baseIncomeData,
          [`/form1099Miscs/#${formId}/writableFederalWithholding`]: createDollarWrapper(`0`),
        });
        expect(givenFacts(factGraph).atPath(`${path}/pfd-add-box-4`, formId, task)).toRouteNextTo(
          `/data-view/loop/%2Fform1099Miscs/${formId}`
        );
      });
      it(`moves from box 4 to form review when federal withholding is greater than 0`, ({ task }) => {
        const { factGraph } = setupFactGraph({
          ...baseIncomeData,
          [`/form1099Miscs/#${formId}/writableFederalWithholding`]: createDollarWrapper(`562`),
        });
        expect(givenFacts(factGraph).atPath(`${path}/pfd-add-box-4`, formId, task)).toRouteNextTo(
          `/data-view/loop/%2Fform1099Miscs/${formId}`
        );
      });
    });
  });

  describe(`The HSA subcategory`, () => {
    const basePath = `/flow/income/hsa`;
    const formId = `0b1e355e-3d19-415d-8470-fbafd9f58361`;
    const formId2 = `ab1e355e-3d19-415d-8470-fbafd9f58362`;

    // Distribution collections.
    const distributionCollections = {
      [`/hsaDistributions/#${formId}/filer`]: createCollectionItemWrapper(primaryFilerId),
      [`/hsaDistributions/#${formId2}/filer`]: createCollectionItemWrapper(spouseId),
    };

    describe(`The intro screen`, () => {
      const introScreen = `${basePath}/hsa-intro`;
      const w2ActivityScreen = `${basePath}/hsa-already-reported-w2-contributions`;
      const askIfHaveHsasScreen = `${basePath}/hsa-y-n`;
      const askIfHaveHsaContributionScreen = `${basePath}/hsa-contributions-additional-y-n-primary`;
      const hsaContributionCheckScreen = `${basePath}/hsa-testing-period-contribution-check`;
      const askAboutMsasScreen = `${basePath}/hsa-add-account-type`;
      const w2Id = `0b1e355e-3d19-415d-8470-fbafd9f58361`;
      const anotherW2Id = `001e355e-3d19-415d-8470-fbafd9f58361`;
      const primaryFilerW2Activity = {
        [`/formW2s/#${w2Id}/filer`]: {
          $type: `gov.irs.factgraph.persisters.CollectionItemWrapper`,
          item: { id: `${primaryFilerId}` },
        },
        [`/formW2s/#${w2Id}/employerHsaContributions`]: {
          $type: `gov.irs.factgraph.persisters.DollarWrapper`,
          item: `260.00`,
        },
      };
      const secondaryFilerW2Activity = {
        [`/formW2s/#${anotherW2Id}/filer`]: {
          $type: `gov.irs.factgraph.persisters.CollectionItemWrapper`,
          item: { id: `${spouseId}` },
        },
        [`/formW2s/#${anotherW2Id}/employerHsaContributions`]: {
          $type: `gov.irs.factgraph.persisters.DollarWrapper`,
          item: `60.00`,
        },
      };
      describe(`when single filer has W2 activity`, () => {
        const { factGraph } = setupFactGraph({
          ...baseFilerData,
          ...basePrimaryFilerHSAFacts,
          '/formW2s': createCollectionWrapper([w2Id]),
          ...primaryFilerW2Activity,
        });
        it(`shows that activity`, ({ task }) => {
          expect(givenFacts(factGraph).atPath(introScreen, null, task)).toRouteNextTo(w2ActivityScreen);
        });
        it(`then asks about MSAs`, ({ task }) => {
          expect(givenFacts(factGraph).atPath(w2ActivityScreen, null, task)).toRouteNextTo(askAboutMsasScreen);
        });
      });
      describe(`when single filer has no W2 activity`, () => {
        it(`asks if filer has HSAs ...`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...baseFilerData,
            ...basePrimaryFilerHSAFacts,
          });
          expect(givenFacts(factGraph).atPath(introScreen, null, task)).toRouteNextTo(askIfHaveHsasScreen);
          expect(factGraph.get(Path.concretePath(`/hasPrimaryFilerHsaContributionsFromW2s`, null)).get).toBe(false);
          expect(factGraph.get(Path.concretePath(`/hasSecondaryFilerHsaContributionsFromW2s`, null)).get).toBe(false);
        });
        it(`... if Yes, asks them about activity to report`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...baseFilerData,
            ...basePrimaryFilerHSAFacts,
            [`/someFilerHadNonW2HsaActivity`]: createBooleanWrapper(true),
          });
          expect(givenFacts(factGraph).atPath(askIfHaveHsasScreen, null, task)).toRouteNextTo(
            `${basePath}/hsa-activity-primary-y-n`
          );
        });
        it(`... if No, take them to data view`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...baseFilerData,
            ...basePrimaryFilerHSAFacts,
            [`/someFilerHadNonW2HsaActivity`]: createBooleanWrapper(false),
          });
          expect(givenFacts(factGraph).atPath(askIfHaveHsasScreen, null, task)).toRouteNextTo(
            `/data-view/flow/income/hsa`
          );
        });
      });
      describe(`when both MFJ filers have W2 activity`, () => {
        const { factGraph } = setupFactGraph({
          ...mfjIncomeWithHSAs,
          '/formW2s': createCollectionWrapper([w2Id, anotherW2Id]),
          ...primaryFilerW2Activity,
          ...secondaryFilerW2Activity,
        });
        it(`shows that activity`, ({ task }) => {
          expect(givenFacts(factGraph).atPath(introScreen, null, task)).toRouteNextTo(w2ActivityScreen);
        });
        it(`then asks about MSAs`, ({ task }) => {
          expect(givenFacts(factGraph).atPath(w2ActivityScreen, null, task)).toRouteNextTo(askAboutMsasScreen);
        });
      });
      describe(`when primary MFJ filer has W2 activity`, () => {
        const initialFacts = {
          ...mfjIncomeWithHSAs,
          '/formW2s': createCollectionWrapper([w2Id]),
          ...primaryFilerW2Activity,
        };
        const { factGraph } = setupFactGraph(initialFacts);
        it(`shows that activity`, ({ task }) => {
          expect(givenFacts(factGraph).atPath(introScreen, null, task)).toRouteNextTo(w2ActivityScreen);
        });
        it(`then asks if secondary filer has HSAs ...`, ({ task }) => {
          expect(givenFacts(factGraph).atPath(w2ActivityScreen, null, task)).toRouteNextTo(askIfHaveHsasScreen);
          expect(factGraph.get(Path.concretePath(`/hasSecondaryFilerHsaContributionsFromW2s`, null)).get).toBe(false);
        });
        it(`... if Yes, asks them about activity to report`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...initialFacts,
            [`/someFilerHadNonW2HsaActivity`]: createBooleanWrapper(true),
          });
          expect(givenFacts(factGraph).atPath(askIfHaveHsasScreen, null, task)).toRouteNextTo(
            `${basePath}/hsa-activity-secondary-y-n`
          );
        });
        it(`... if No, asks them about MSAs`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...initialFacts,
            [`/someFilerHadNonW2HsaActivity`]: createBooleanWrapper(false),
          });
          expect(givenFacts(factGraph).atPath(askIfHaveHsasScreen, null, task)).toRouteNextTo(askAboutMsasScreen);
        });
      });
      describe(`when both filers have non W2 activity`, () => {
        const initialFacts = {
          ...mfjIncomeWithNonW2HSAs,
        };

        it(`... if No, skip filer to the Testing Period Contribution Check`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...initialFacts,
            [`/someFilerHadNonW2HsaActivity`]: createBooleanWrapper(true),
            [`/writablePrimaryFilerHadNonW2HsaActivity`]: createBooleanWrapper(false),
            [`/writableSecondaryFilerHadNonW2HsaActivity`]: createBooleanWrapper(false),
          });
          expect(givenFacts(factGraph).atPath(askIfHaveHsaContributionScreen, null, task)).toRouteNextTo(
            hsaContributionCheckScreen
          );
        });
      });
      describe(`when secondary MFJ filer has W2 activity`, () => {
        const initialFacts = {
          ...mfjIncomeWithHSAs,
          '/formW2s': createCollectionWrapper([anotherW2Id]),
          ...secondaryFilerW2Activity,
        };
        const { factGraph } = setupFactGraph(initialFacts);

        it(`shows that activity`, ({ task }) => {
          expect(givenFacts(factGraph).atPath(introScreen, null, task)).toRouteNextTo(w2ActivityScreen);
        });
        it(`then asks if primary filer has HSAs ...`, ({ task }) => {
          expect(givenFacts(factGraph).atPath(w2ActivityScreen, null, task)).toRouteNextTo(askIfHaveHsasScreen);
          expect(factGraph.get(Path.concretePath(`/hasPrimaryFilerHsaContributionsFromW2s`, null)).get).toBe(false);
        });
        it(`... if Yes, asks them about activity to report`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...initialFacts,
            [`/someFilerHadNonW2HsaActivity`]: createBooleanWrapper(true),
          });
          expect(givenFacts(factGraph).atPath(askIfHaveHsasScreen, null, task)).toRouteNextTo(
            `${basePath}/hsa-activity-primary-y-n`
          );
        });
        it(`... if No, asks them about MSAs`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...initialFacts,
            [`/someFilerHadNonW2HsaActivity`]: createBooleanWrapper(false),
          });
          expect(givenFacts(factGraph).atPath(askIfHaveHsasScreen, null, task)).toRouteNextTo(askAboutMsasScreen);
        });
      });
      describe(`when neither MFJ filer has W2 activity`, () => {
        it(`asks if any filer has HSAs ...`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjIncomeWithHSAs,
          });
          expect(givenFacts(factGraph).atPath(introScreen, null, task)).toRouteNextTo(askIfHaveHsasScreen);
          expect(factGraph.get(Path.concretePath(`/hasPrimaryFilerHsaContributionsFromW2s`, null)).get).toBe(false);
          expect(factGraph.get(Path.concretePath(`/hasSecondaryFilerHsaContributionsFromW2s`, null)).get).toBe(false);
        });
        it(`... if Yes, asks them each about activity to report`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjIncomeWithHSAs,
            [`/someFilerHadNonW2HsaActivity`]: createBooleanWrapper(true),
          });
          expect(givenFacts(factGraph).atPath(askIfHaveHsasScreen, null, task)).toRouteNextTo(
            `${basePath}/hsa-activity-primary-y-n`
          );
          expect(givenFacts(factGraph).atPath(`${basePath}/hsa-activity-primary-y-n`, null, task)).toRouteNextTo(
            `${basePath}/hsa-activity-secondary-y-n`
          );
        });
        it(`... if No, take them to data view`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjIncomeWithHSAs,
            [`/someFilerHadNonW2HsaActivity`]: createBooleanWrapper(false),
          });
          expect(givenFacts(factGraph).atPath(askIfHaveHsasScreen, null, task)).toRouteNextTo(
            `/data-view/flow/income/hsa`
          );
        });
      });
    });

    describe(`In the coverage and contributions sub sub section`, () => {
      const koScreen = `${basePath}/hsa-contributions-additional-summary-none-allowed-ko`;
      const breatherScreen = `${basePath}/hsa-coverage-breather`;
      const testingPeriodCheckScreen = `${basePath}/hsa-testing-period-contribution-check`;
      describe(`when single filer has no W2 activity, ask if there were contributions ...`, () => {
        it(`... if Yes, and they are a dependent, knock them out`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...baseFilerData,
            ...basePrimaryFilerHSAFacts,
            [`/filers/#${primaryFilerId}/canBeClaimed`]: createBooleanWrapper(true),
          });
          expect(
            givenFacts(factGraph).atPath(`${basePath}/hsa-contributions-additional-y-n-primary`, null, task)
          ).toRouteNextTo(koScreen);
        });
        it(`... if Yes, go to coverage breather screen`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...baseFilerData,
            ...basePrimaryFilerHSAFacts,
          });
          expect(
            givenFacts(factGraph).atPath(`${basePath}/hsa-contributions-additional-y-n-primary`, null, task)
          ).toRouteNextTo(breatherScreen);
        });
        it(`... if No, skip to testing period check'`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...baseFilerData,
            ...basePrimaryFilerHSAFacts,
            [`/filers/#${primaryFilerId}/writablePrimaryFilerHasMadeContributionsToHsa`]: createBooleanWrapper(false),
          });
          expect(
            givenFacts(factGraph).atPath(`${basePath}/hsa-contributions-additional-y-n-primary`, null, task)
          ).toRouteNextTo(testingPeriodCheckScreen);
        });
      });

      describe(`when MFJ spouse has no W2 activity, ask if there were contributions ...`, () => {
        const initialData = {
          ...mfjFilerData,
          [`/someFilerHadNonW2HsaActivity`]: createBooleanWrapper(true),
          [`/writablePrimaryFilerHadNonW2HsaActivity`]: createBooleanWrapper(true),
          [`/writableSecondaryFilerHadNonW2HsaActivity`]: createBooleanWrapper(true),
          [`/hasHsaMedicalSavingsAccountType`]: createBooleanWrapper(false),
          [`/writableHasHsaExcessContributionsPreviousYear`]: createBooleanWrapper(false),
          [`/writableHasHsaWithdrawnExcessContributionsYesNo`]: createBooleanWrapper(false),
          [`/filers/#${primaryFilerId}/writablePrimaryFilerHasMadeContributionsToHsa`]: createBooleanWrapper(false),
          [`/filers/#${spouseId}/writableSecondaryFilerHasMadeContributionsToHsa`]: createBooleanWrapper(true),
          '/formW2s': {
            $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
            item: { items: [] },
          },
        };
        it(`... if Yes, and they are a dependent, knock them out`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...initialData,
            [`/filers/#${spouseId}/canBeClaimed`]: createBooleanWrapper(true),
          });
          expect(
            givenFacts(factGraph).atPath(`${basePath}/hsa-contributions-additional-y-n-secondary`, null, task)
          ).toRouteNextTo(koScreen);
        });
        it(`... if Yes, skip to testing period check`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...initialData,
          });
          expect(
            givenFacts(factGraph).atPath(`${basePath}/hsa-contributions-additional-y-n-secondary`, null, task)
          ).toRouteNextTo(testingPeriodCheckScreen);
        });
        it(`... if No, skip to testing period check'`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...initialData,
            [`/filers/#${spouseId}/writableSecondaryFilerHasMadeContributionsToHsa`]: createBooleanWrapper(false),
          });
          expect(
            givenFacts(factGraph).atPath(`${basePath}/hsa-contributions-additional-y-n-secondary`, null, task)
          ).toRouteNextTo(testingPeriodCheckScreen);
        });
      });

      // hsa-contributions-additional-summary-none-allowed-ko
      describe(`When the TP is single and has any HSA contributions`, () => {
        it(`it knocks the user out when they can be claimed as a dependent`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...singleFilerWithHsaDeductions,
            [`/filers/#${primaryFilerId}/canBeClaimed`]: createBooleanWrapper(true),
          });
          expect(
            givenFacts(factGraph).atPath(`${basePath}/hsa-contributions-additional-y-n-primary`, primaryFilerId, task)
          ).toRouteNextTo(`${basePath}/hsa-contributions-additional-summary-none-allowed-ko`);
        });
        it(`routes the primary filer to the breather screen when they cannot be claimed as a dependent`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...singleFilerWithHsaDeductions,
          });
          expect(
            givenFacts(factGraph).atPath(`${basePath}/hsa-contributions-additional-y-n-primary`, primaryFilerId, task)
          ).toRouteNextTo(`${basePath}/hsa-coverage-breather`);
        });
        it(`still routes the primary filer to the breather screen if there was a secondary filer
          with HSA contributions who was claimed as a dependent`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjBothWithQualifiedHsaDeductions,
            [`/filers/#${spouseId}/canBeClaimed`]: createBooleanWrapper(true),
            [`/filingStatus`]: createEnumWrapper(`single`, `/filingStatusOptions`),
            [`/maritalStatus`]: createEnumWrapper(`single`, `/maritalStatusOptions`),
          });
          expect(
            givenFacts(factGraph).atPath(`${basePath}/hsa-contributions-additional-y-n-primary`, primaryFilerId, task)
          ).toRouteNextTo(`${basePath}/hsa-coverage-breather`);
        });
      });

      describe(`When the TP is MFJ and has any HSA contributions`, () => {
        it(`it knocks the primary filer out when they can be claimed as a dependent`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjBothWithQualifiedHsaDeductions,
            [`/filers/#${primaryFilerId}/canBeClaimed`]: createBooleanWrapper(true),
          });
          expect(
            givenFacts(factGraph).atPath(`${basePath}/hsa-contributions-additional-y-n-primary`, primaryFilerId, task)
          ).toRouteNextTo(`${basePath}/hsa-contributions-additional-summary-none-allowed-ko`);
        });
        it(`it knocks the secondary filer out when they can be claimed as a dependent`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjBothWithQualifiedHsaDeductions,
            [`/filers/#${spouseId}/canBeClaimed`]: createBooleanWrapper(true),
          });
          expect(
            givenFacts(factGraph).atPath(`${basePath}/hsa-contributions-additional-y-n-secondary`, spouseId, task)
          ).toRouteNextTo(`${basePath}/hsa-contributions-additional-summary-none-allowed-ko`);
        });
        it(`routes the secondary filer to the breather screen when
          they cannot be claimed as a dependent`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjBothWithQualifiedHsaDeductions,
          });
          expect(
            givenFacts(factGraph).atPath(`${basePath}/hsa-contributions-additional-y-n-secondary`, spouseId, task)
          ).toRouteNextTo(`${basePath}/hsa-coverage-breather`);
        });

        it(`it knocks the primary filer out if the secondary filer
          has HSA contributions and can be claimed as a dependent`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjBothWithQualifiedHsaDeductions,
            [`/filers/#${spouseId}/canBeClaimed`]: createBooleanWrapper(true),
          });
          expect(
            givenFacts(factGraph).atPath(`${basePath}/hsa-contributions-additional-y-n-primary`, primaryFilerId, task)
          ).toRouteNextTo(`${basePath}/hsa-contributions-additional-summary-none-allowed-ko`);
        });
      });

      // hsa-coverage-medicare-status
      describe(`When asking about being enrolled in Medicare in the tax year`, () => {
        it(`knocks the Primary Filer out when they respond 'Yes, ... was enrolled for part of the year'`, ({
          task,
        }) => {
          const { factGraph } = setupFactGraph({
            ...mfjIncomeWithHSAs,
            [`/filers/#${primaryFilerId}/enrolledInMedicare`]: createEnumWrapper(
              `partOfYear`,
              `/enrolledInMedicareOptions`
            ),
          });
          expect(
            givenFacts(factGraph).atPath(`${basePath}/hsa-coverage-medicare-status`, primaryFilerId, task)
          ).toRouteNextTo(`${basePath}/hsa-coverage-ko`);
        });
        it(`knocks the Secondary Filer out when they respond 'Yes, ... was enrolled for part of the year'`, ({
          task,
        }) => {
          const { factGraph } = setupFactGraph({
            ...mfjIncomeWithHSAs,
            [`/filers/#${primaryFilerId}/enrolledInMedicare`]: createEnumWrapper(
              `noneOfYear`,
              `/enrolledInMedicareOptions`
            ),
            [`/filers/#${spouseId}/enrolledInMedicare`]: createEnumWrapper(`partOfYear`, `/enrolledInMedicareOptions`),
          });
          expect(
            givenFacts(factGraph).atPath(`${basePath}/hsa-coverage-medicare-status`, spouseId, task)
          ).toRouteNextTo(`${basePath}/hsa-coverage-ko`);
        });
        it(`knocks the Primary Filer out when they respond 'Yes, ... was enrolled for the whole year'`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjIncomeWithHSAs,
            [`/filers/#${primaryFilerId}/enrolledInMedicare`]: createEnumWrapper(
              `allYear`,
              `/enrolledInMedicareOptions`
            ),
          });
          expect(
            givenFacts(factGraph).atPath(`${basePath}/hsa-coverage-medicare-status`, primaryFilerId, task)
          ).toRouteNextTo(`${basePath}/hsa-contributions-summary-none-allowed-ko`);
        });
        it(`knocks the Secondary Filer out when they respond 'Yes, ... was enrolled for the whole year'`, ({
          task,
        }) => {
          const { factGraph } = setupFactGraph({
            ...mfjIncomeWithHSAs,
            [`/filers/#${primaryFilerId}/enrolledInMedicare`]: createEnumWrapper(
              `noneOfYear`,
              `/enrolledInMedicareOptions`
            ),
            [`/filers/#${spouseId}/enrolledInMedicare`]: createEnumWrapper(`allYear`, `/enrolledInMedicareOptions`),
          });
          expect(
            givenFacts(factGraph).atPath(`${basePath}/hsa-coverage-medicare-status`, spouseId, task)
          ).toRouteNextTo(`${basePath}/hsa-contributions-summary-none-allowed-ko`);
        });
      });

      // hsa-coverage-status
      describe(`When asking about HDHP coverage status`, () => {
        it(`knocks the Primary Filer out when they respond 'Yes, for part of the year'`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjIncomeWithHSAs,
            [`/filers/#${primaryFilerId}/hsaHdhpCoverageStatus`]: createEnumWrapper(
              `partOfYear`,
              `/hsaHdhpCoverageStatusOptions`
            ),
          });
          expect(givenFacts(factGraph).atPath(`${basePath}/hsa-coverage-status`, primaryFilerId, task)).toRouteNextTo(
            `${basePath}/hsa-coverage-ko`
          );
        });
        it(`knocks the Secondary Filer out when they respond 'Yes, for part of the year'`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjIncomeWithHSAs,
            [`/filers/#${primaryFilerId}/hsaHdhpCoverageStatus`]: createEnumWrapper(
              `allYear`,
              `/hsaHdhpCoverageStatusOptions`
            ),
            [`/filers/#${spouseId}/hsaHdhpCoverageStatus`]: createEnumWrapper(
              `partOfYear`,
              `/hsaHdhpCoverageStatusOptions`
            ),
          });
          expect(givenFacts(factGraph).atPath(`${basePath}/hsa-coverage-status`, spouseId, task)).toRouteNextTo(
            `${basePath}/hsa-coverage-ko`
          );
        });
        it(`knocks the Primary Filer out when they respond 'No'`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjIncomeWithHSAs,
            [`/filers/#${primaryFilerId}/hsaHdhpCoverageStatus`]: createEnumWrapper(
              `noneOfYear`,
              `/hsaHdhpCoverageStatusOptions`
            ),
          });
          expect(givenFacts(factGraph).atPath(`${basePath}/hsa-coverage-status`, primaryFilerId, task)).toRouteNextTo(
            `${basePath}/hsa-contributions-summary-none-allowed-ko`
          );
        });
        it(`knocks the Secondary Filer out when they respond 'No'`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjIncomeWithHSAs,
            [`/filers/#${primaryFilerId}/hsaHdhpCoverageStatus`]: createEnumWrapper(
              `allYear`,
              `/hsaHdhpCoverageStatusOptions`
            ),
            [`/filers/#${spouseId}/hsaHdhpCoverageStatus`]: createEnumWrapper(
              `noneOfYear`,
              `/hsaHdhpCoverageStatusOptions`
            ),
          });
          expect(givenFacts(factGraph).atPath(`${basePath}/hsa-coverage-status`, spouseId, task)).toRouteNextTo(
            `${basePath}/hsa-contributions-summary-none-allowed-ko`
          );
        });
      });

      // hsa-coverage-add-type
      describe(`When asked what type of HDHP coverage they have`, () => {
        it(`knocks the Primary Filer out when they respond 'Both self-only and family'`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjIncomeWithHSAs,
            [`/filers/#${primaryFilerId}/enrolledInMedicare`]: createEnumWrapper(
              `noneOfYear`,
              `/enrolledInMedicareOptions`
            ),
            [`/filers/#${primaryFilerId}/hsaHdhpCoverageStatus`]: createEnumWrapper(
              `allYear`,
              `/hsaHdhpCoverageStatusOptions`
            ),
            [`/filers/#${primaryFilerId}/typeOfHdhp`]: createEnumWrapper(`both`, `/typeOfHdhpOptions`),
          });
          expect(givenFacts(factGraph).atPath(`${basePath}/hsa-coverage-add-type`, primaryFilerId, task)).toRouteNextTo(
            `${basePath}/hsa-coverage-ko`
          );
        });
        it(`knocks the Secondary Filer out when they respond 'Both self-only and family'`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjIncomeWithHSAs,
            [`/filers/#${primaryFilerId}/typeOfHdhp`]: createEnumWrapper(`family`, `/typeOfHdhpOptions`),
            [`/filers/#${primaryFilerId}/hsaHdhpCoverageStatus`]: createEnumWrapper(
              `allYear`,
              `/hsaHdhpCoverageStatusOptions`
            ),
            [`/filers/#${spouseId}/typeOfHdhp`]: createEnumWrapper(`both`, `/typeOfHdhpOptions`),
            [`/filers/#${spouseId}/hsaHdhpCoverageStatus`]: createEnumWrapper(
              `allYear`,
              `/hsaHdhpCoverageStatusOptions`
            ),
          });
          expect(givenFacts(factGraph).atPath(`${basePath}/hsa-coverage-add-type`, spouseId, task)).toRouteNextTo(
            `${basePath}/hsa-coverage-ko`
          );
        });
        it(`proceeds to 'hsa-coverage-other-y-n', if the Primary Filer responds 'Self-only'`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjIncomeWithHSAs,
            [`/filers/#${primaryFilerId}/typeOfHdhp`]: createEnumWrapper(`selfOnly`, `/typeOfHdhpOptions`),
            [`/filers/#${primaryFilerId}/hsaHdhpCoverageStatus`]: createEnumWrapper(
              `allYear`,
              `/hsaHdhpCoverageStatusOptions`
            ),
          });
          expect(givenFacts(factGraph).atPath(`${basePath}/hsa-coverage-add-type`, primaryFilerId, task)).toRouteNextTo(
            `${basePath}/hsa-coverage-other-y-n`
          );
        });
        it(`proceeds to 'hsa-coverage-other-y-n', if the Secondary Filer responds 'Self-only'`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjIncomeWithHSAs,
            [`/filers/#${primaryFilerId}/typeOfHdhp`]: createEnumWrapper(`family`, `/typeOfHdhpOptions`),
            [`/filers/#${primaryFilerId}/hsaHdhpCoverageStatus`]: createEnumWrapper(
              `allYear`,
              `/hsaHdhpCoverageStatusOptions`
            ),
            [`/filers/#${spouseId}/typeOfHdhp`]: createEnumWrapper(`selfOnly`, `/typeOfHdhpOptions`),
            [`/filers/#${spouseId}/hsaHdhpCoverageStatus`]: createEnumWrapper(
              `allYear`,
              `/hsaHdhpCoverageStatusOptions`
            ),
          });
          expect(givenFacts(factGraph).atPath(`${basePath}/hsa-coverage-add-type`, spouseId, task)).toRouteNextTo(
            `${basePath}/hsa-coverage-other-y-n`
          );
        });
        it(`proceeds to 'hsa-coverage-other-y-n', if the Primary Filer responds 'Family'`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjIncomeWithHSAs,
            [`/filers/#${primaryFilerId}/typeOfHdhp`]: createEnumWrapper(`selfOnly`, `/typeOfHdhpOptions`),
            [`/filers/#${primaryFilerId}/hsaHdhpCoverageStatus`]: createEnumWrapper(
              `allYear`,
              `/hsaHdhpCoverageStatusOptions`
            ),
          });
          expect(givenFacts(factGraph).atPath(`${basePath}/hsa-coverage-add-type`, primaryFilerId, task)).toRouteNextTo(
            `${basePath}/hsa-coverage-other-y-n`
          );
        });
        it(`proceeds to 'hsa-coverage-other-y-n', if the Secondary Filer responds 'Family'`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjIncomeWithHSAs,
            [`/filers/#${primaryFilerId}/typeOfHdhp`]: createEnumWrapper(`family`, `/typeOfHdhpOptions`),
            [`/filers/#${primaryFilerId}/hsaHdhpCoverageStatus`]: createEnumWrapper(
              `allYear`,
              `/hsaHdhpCoverageStatusOptions`
            ),
            [`/filers/#${spouseId}/typeOfHdhp`]: createEnumWrapper(`family`, `/typeOfHdhpOptions`),
            [`/filers/#${spouseId}/hsaHdhpCoverageStatus`]: createEnumWrapper(
              `allYear`,
              `/hsaHdhpCoverageStatusOptions`
            ),
          });
          expect(givenFacts(factGraph).atPath(`${basePath}/hsa-coverage-add-type`, spouseId, task)).toRouteNextTo(
            `${basePath}/hsa-coverage-other-y-n`
          );
        });
      });

      // hsa-coverage-other-y-n
      describe(`When asked about any other HSA-disqualifying health coverage`, () => {
        const fullPath = `${basePath}/hsa-coverage-other-y-n`;

        it(`knocks the Primary Filer out when they respond 'Yes, for the whole year'`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjIncomeWithHSAs,
            [`/filers/#${primaryFilerId}/enrolledInMedicare`]: createEnumWrapper(
              `noneOfYear`,
              `/enrolledInMedicareOptions`
            ),
            [`/filers/#${primaryFilerId}/hsaHdhpCoverageStatus`]: createEnumWrapper(
              `allYear`,
              `/hsaHdhpCoverageStatusOptions`
            ),
            [`/filers/#${primaryFilerId}/typeOfHdhp`]: createEnumWrapper(`family`, `/typeOfHdhpOptions`),
            [`/filers/#${primaryFilerId}/hadOtherCoverageIneligibleForHSA`]: createEnumWrapper(
              `wholeYear`,
              `/hadOtherCoverageIneligibleForHSAOptions`
            ),
          });
          expect(givenFacts(factGraph).atPath(fullPath, primaryFilerId, task)).toRouteNextTo(
            `${basePath}/hsa-contributions-summary-none-allowed-ko`
          );
        });
        it(`knocks the Secondary Filer out when they respond 'Yes, for the whole year'`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjIncomeWithHSAs,
            [`/filers/#${primaryFilerId}/enrolledInMedicare`]: createEnumWrapper(
              `noneOfYear`,
              `/enrolledInMedicareOptions`
            ),
            [`/filers/#${primaryFilerId}/hsaHdhpCoverageStatus`]: createEnumWrapper(
              `allYear`,
              `/hsaHdhpCoverageStatusOptions`
            ),
            [`/filers/#${primaryFilerId}/typeOfHdhp`]: createEnumWrapper(`selfOnly`, `/typeOfHdhpOptions`),
            [`/filers/#${primaryFilerId}/hadOtherCoverageIneligibleForHSA`]: createEnumWrapper(
              `noneOfYear`,
              `/hadOtherCoverageIneligibleForHSAOptions`
            ),
            [`/filers/#${spouseId}/enrolledInMedicare`]: createEnumWrapper(`noneOfYear`, `/enrolledInMedicareOptions`),
            [`/filers/#${spouseId}/hsaHdhpCoverageStatus`]: createEnumWrapper(
              `allYear`,
              `/hsaHdhpCoverageStatusOptions`
            ),
            [`/filers/#${spouseId}/typeOfHdhp`]: createEnumWrapper(`selfOnly`, `/typeOfHdhpOptions`),
            [`/filers/#${spouseId}/hadOtherCoverageIneligibleForHSA`]: createEnumWrapper(
              `wholeYear`,
              `/hadOtherCoverageIneligibleForHSAOptions`
            ),
          });
          expect(givenFacts(factGraph).atPath(fullPath, spouseId, task)).toRouteNextTo(
            `${basePath}/hsa-contributions-summary-none-allowed-ko`
          );
        });
        it(`knocks the Primary Filer out when they respond 'Yes, for part of the year'`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjIncomeWithHSAs,
            [`/filers/#${primaryFilerId}/enrolledInMedicare`]: createEnumWrapper(
              `noneOfYear`,
              `/enrolledInMedicareOptions`
            ),
            [`/filers/#${primaryFilerId}/hsaHdhpCoverageStatus`]: createEnumWrapper(
              `allYear`,
              `/hsaHdhpCoverageStatusOptions`
            ),
            [`/filers/#${primaryFilerId}/typeOfHdhp`]: createEnumWrapper(`selfOnly`, `/typeOfHdhpOptions`),
            [`/filers/#${primaryFilerId}/hadOtherCoverageIneligibleForHSA`]: createEnumWrapper(
              `partOfYear`,
              `/hadOtherCoverageIneligibleForHSAOptions`
            ),
          });
          expect(givenFacts(factGraph).atPath(fullPath, primaryFilerId, task)).toRouteNextTo(
            `${basePath}/hsa-coverage-ko`
          );
        });
        it(`knocks the Secondary Filer out when they respond 'Yes, for part of the year'`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjIncomeWithHSAs,
            [`/filers/#${primaryFilerId}/enrolledInMedicare`]: createEnumWrapper(
              `noneOfYear`,
              `/enrolledInMedicareOptions`
            ),
            [`/filers/#${primaryFilerId}/hsaHdhpCoverageStatus`]: createEnumWrapper(
              `allYear`,
              `/hsaHdhpCoverageStatusOptions`
            ),
            [`/filers/#${primaryFilerId}/typeOfHdhp`]: createEnumWrapper(`family`, `/typeOfHdhpOptions`),
            [`/filers/#${spouseId}/enrolledInMedicare`]: createEnumWrapper(`noneOfYear`, `/enrolledInMedicareOptions`),
            [`/filers/#${spouseId}/hsaHdhpCoverageStatus`]: createEnumWrapper(
              `allYear`,
              `/hsaHdhpCoverageStatusOptions`
            ),
            [`/filers/#${spouseId}/typeOfHdhp`]: createEnumWrapper(`selfOnly`, `/typeOfHdhpOptions`),
            [`/filers/#${spouseId}/hadOtherCoverageIneligibleForHSA`]: createEnumWrapper(
              `partOfYear`,
              `/hadOtherCoverageIneligibleForHSAOptions`
            ),
          });
          expect(givenFacts(factGraph).atPath(fullPath, spouseId, task)).toRouteNextTo(`${basePath}/hsa-coverage-ko`);
        });

        describe(
          `When primary filer is filing MFS ` +
            `and TP has W2 reported HSA contributions ` +
            `and had a 'Family' HDHP plan for the whole year`,
          () => {
            it(`proceeds to 'hsa-coverage-married-not-mfj-line-6-check', if the Primary Filer says 'No'`, ({
              task,
            }) => {
              const { factGraph } = setupFactGraph({
                ...mfsIncomeWithHSAs,
                [`/maritalStatus`]: createEnumWrapper(`married`, `/maritalStatusOptions`),
                [`/filers/#${primaryFilerId}/typeOfHdhp`]: createEnumWrapper(`family`, `/typeOfHdhpOptions`),
                [`/filers/#${primaryFilerId}/hsaHdhpCoverageStatus`]: createEnumWrapper(
                  `allYear`,
                  `/hsaHdhpCoverageStatusOptions`
                ),
                [`/filers/#${primaryFilerId}/hadOtherCoverageIneligibleForHSA`]: createEnumWrapper(
                  `noneOfYear`,
                  `/hadOtherCoverageIneligibleForHSAOptions`
                ),
                [`/formW2s`]: createCollectionWrapper([formId]),
                [`/formW2s/#${formId}/filer`]: {
                  $type: `gov.irs.factgraph.persisters.CollectionItemWrapper`,
                  item: { id: `${primaryFilerId}` },
                },
                [`/formW2s/#${formId}/employerHsaContributions`]: {
                  $type: `gov.irs.factgraph.persisters.DollarWrapper`,
                  item: `1240.00`,
                },
                [`/filers/#${primaryFilerId}/writablePrimaryFilerHasMadeContributionsToHsa`]:
                  createBooleanWrapper(true),
              });

              expect(givenFacts(factGraph).atPath(fullPath, primaryFilerId, task)).toRouteNextTo(
                `${basePath}/hsa-coverage-married-not-mfj-line-6-check`
              );
            });
          }
        );
        describe(
          `When primary filer is filing MFS ` +
            `and TP has non-W2 HSA contributions ` +
            `and had a 'Family' HDHP plan for the whole year`,
          () => {
            it(`proceeds to 'hsa-coverage-married-not-mfj-line-6-check', if the Primary Filer says 'No'`, ({
              task,
            }) => {
              const { factGraph } = setupFactGraph({
                ...mfsIncomeWithHSAs,
                [`/maritalStatus`]: createEnumWrapper(`married`, `/maritalStatusOptions`),
                [`/filers/#${primaryFilerId}/typeOfHdhp`]: createEnumWrapper(`family`, `/typeOfHdhpOptions`),
                [`/filers/#${primaryFilerId}/hsaHdhpCoverageStatus`]: createEnumWrapper(
                  `allYear`,
                  `/hsaHdhpCoverageStatusOptions`
                ),
                [`/filers/#${primaryFilerId}/hadOtherCoverageIneligibleForHSA`]: createEnumWrapper(
                  `noneOfYear`,
                  `/hadOtherCoverageIneligibleForHSAOptions`
                ),
                [`/filers/#${primaryFilerId}/writablePrimaryFilerHasMadeContributionsToHsa`]:
                  createBooleanWrapper(true),
              });

              expect(givenFacts(factGraph).atPath(fullPath, primaryFilerId, task)).toRouteNextTo(
                `${basePath}/hsa-coverage-married-not-mfj-line-6-check`
              );
            });
          }
        );

        describe(`When married with 'Self-Only' HDHP plan...`, () => {
          it(`proceeds to 'hsa-coverage-marital-change', if the Primary Filer says 'No'`, ({ task }) => {
            const { factGraph } = setupFactGraph({
              ...mfjIncomeWithHSAs,
              [`/maritalStatus`]: createEnumWrapper(`married`, `/maritalStatusOptions`),
              [`/filers/#${primaryFilerId}/typeOfHdhp`]: createEnumWrapper(`selfOnly`, `/typeOfHdhpOptions`),
              [`/filers/#${primaryFilerId}/hsaHdhpCoverageStatus`]: createEnumWrapper(
                `allYear`,
                `/hsaHdhpCoverageStatusOptions`
              ),
              [`/filers/#${primaryFilerId}/hadOtherCoverageIneligibleForHSA`]: createEnumWrapper(
                `noneOfYear`,
                `/hadOtherCoverageIneligibleForHSAOptions`
              ),
            });

            expect(givenFacts(factGraph).atPath(fullPath, primaryFilerId, task)).toRouteNextTo(
              `${basePath}/hsa-coverage-marital-change`
            );
          });
          it(`proceeds to 'hsa-coverage-marital-change', if the Secondary Filer says 'No'`, ({ task }) => {
            const { factGraph } = setupFactGraph({
              ...mfjIncomeWithHSAs,
              [`/maritalStatus`]: createEnumWrapper(`married`, `/maritalStatusOptions`),
              [`/filers/#${primaryFilerId}/typeOfHdhp`]: createEnumWrapper(`selfOnly`, `/typeOfHdhpOptions`),
              [`/filers/#${primaryFilerId}/hadOtherCoverageIneligibleForHSA`]: createEnumWrapper(
                `noneOfYear`,
                `/hadOtherCoverageIneligibleForHSAOptions`
              ),
              [`/filers/#${spouseId}/typeOfHdhp`]: createEnumWrapper(`selfOnly`, `/typeOfHdhpOptions`),
              [`/filers/#${spouseId}/hsaHdhpCoverageStatus`]: createEnumWrapper(
                `allYear`,
                `/hsaHdhpCoverageStatusOptions`
              ),
              [`/filers/#${spouseId}/hadOtherCoverageIneligibleForHSA`]: createEnumWrapper(
                `noneOfYear`,
                `/hadOtherCoverageIneligibleForHSAOptions`
              ),
            });

            expect(givenFacts(factGraph).atPath(fullPath, spouseId, task)).toRouteNextTo(
              `${basePath}/hsa-coverage-marital-change`
            );
          });
        });

        describe(`When divorced...`, () => {
          it(`proceeds to 'hsa-coverage-marital-change', if the Primary Filer responds 'No'`, ({ task }) => {
            const { factGraph } = setupFactGraph({
              ...baseIncomeWithHSAs,
              [`/maritalStatus`]: createEnumWrapper(`divorced`, `/maritalStatusOptions`),
              [`/filers/#${primaryFilerId}/typeOfHdhp`]: createEnumWrapper(`family`, `/typeOfHdhpOptions`),
              [`/filers/#${primaryFilerId}/hsaHdhpCoverageStatus`]: createEnumWrapper(
                `allYear`,
                `/hsaHdhpCoverageStatusOptions`
              ),
              [`/filers/#${primaryFilerId}/hadOtherCoverageIneligibleForHSA`]: createEnumWrapper(
                `noneOfYear`,
                `/hadOtherCoverageIneligibleForHSAOptions`
              ),
            });

            expect(givenFacts(factGraph).atPath(fullPath, primaryFilerId, task)).toRouteNextTo(
              `${basePath}/hsa-coverage-marital-change`
            );
          });
        });

        describe(`When single (never married)...`, () => {
          it(`proceeds to 'hsa-contributions-breather, if the Primary Filer responds 'No'`, ({ task }) => {
            const { factGraph } = setupFactGraph({
              ...baseIncomeWithHSAs,
              [`/maritalStatus`]: createEnumWrapper(`single`, `/maritalStatusOptions`),
              [`/filers/#${primaryFilerId}/hadOtherCoverageIneligibleForHSA`]: createEnumWrapper(
                `noneOfYear`,
                `/hadOtherCoverageIneligibleForHSAOptions`
              ),
            });

            expect(givenFacts(factGraph).atPath(fullPath, primaryFilerId, task)).toRouteNextTo(
              `${basePath}/hsa-contributions-breather`
            );
          });
        });
      });

      // hsa-coverage-married-not-mfj-line-6-check
      describe(`When qualifying MFS TP is asked if Secondary Filer had HSA contributions`, () => {
        it(`knocks the Primary Filer out when they respond 'Yes'`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfsIncomeWithHSAs,
            [`/maritalStatus`]: createEnumWrapper(`married`, `/maritalStatusOptions`),
            [`/filers/#${primaryFilerId}/typeOfHdhp`]: createEnumWrapper(`family`, `/typeOfHdhpOptions`),
            [`/filers/#${primaryFilerId}/hsaHdhpCoverageStatus`]: createEnumWrapper(
              `allYear`,
              `/hsaHdhpCoverageStatusOptions`
            ),
            [`/filers/#${primaryFilerId}/hadOtherCoverageIneligibleForHSA`]: createEnumWrapper(
              `noneOfYear`,
              `/hadOtherCoverageIneligibleForHSAOptions`
            ),
            [`/filers/#${primaryFilerId}/writablePrimaryFilerHasMadeContributionsToHsa`]: createBooleanWrapper(true),
            [`/filers/#${primaryFilerId}/writableMfsLine6Check`]: createBooleanWrapper(true),
          });

          expect(
            givenFacts(factGraph).atPath(`${basePath}/hsa-coverage-married-not-mfj-line-6-check`, primaryFilerId, task)
          ).toRouteNextTo(`${basePath}/hsa-coverage-married-not-mfj-line-6-ko`);
        });
        it(`proceeds to 'hsa-coverage-marital-change', if the Primary Filer responds 'No'`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfsIncomeWithHSAs,
            [`/maritalStatus`]: createEnumWrapper(`married`, `/maritalStatusOptions`),
            [`/filers/#${primaryFilerId}/typeOfHdhp`]: createEnumWrapper(`selfOnly`, `/typeOfHdhpOptions`),
            [`/filers/#${primaryFilerId}/hsaHdhpCoverageStatus`]: createEnumWrapper(
              `allYear`,
              `/hsaHdhpCoverageStatusOptions`
            ),
            [`/filers/#${primaryFilerId}/hadOtherCoverageIneligibleForHSA`]: createEnumWrapper(
              `noneOfYear`,
              `/hadOtherCoverageIneligibleForHSAOptions`
            ),
            [`/filers/#${primaryFilerId}/writablePrimaryFilerHasMadeContributionsToHsa`]: createBooleanWrapper(true),
            [`/filers/#${primaryFilerId}/writableMfsLine6Check`]: createBooleanWrapper(false),
          });

          expect(
            givenFacts(factGraph).atPath(`${basePath}/hsa-coverage-married-not-mfj-line-6-check`, primaryFilerId, task)
          ).toRouteNextTo(`${basePath}/hsa-coverage-marital-change`);
        });
      });

      // hsa-coverage-marital-change
      describe(`When asked about a change in marital status during the tax year`, () => {
        const fullPath = `${basePath}/hsa-coverage-marital-change`;

        it(`proceeds to 'hsa-coverage-line-6', if the Primary Filer responds 'Yes'`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjIncomeWithHSAs,
            [`/filers/#${primaryFilerId}/typeOfHdhp`]: createEnumWrapper(`family`, `/typeOfHdhpOptions`),
            [`/filers/#${primaryFilerId}/writableChangeInMaritalStatusDuringTaxYear`]: createEnumWrapper(
              `wasMarriedOrDivorcedThisYear`,
              `/changeInMaritalStatusDuringTaxYearOptions`
            ),
            [`/filers/#${primaryFilerId}/hsaHdhpCoverageStatus`]: createEnumWrapper(
              `allYear`,
              `/hsaHdhpCoverageStatusOptions`
            ),
            [`/filers/#${primaryFilerId}/hadOtherCoverageIneligibleForHSA`]: createEnumWrapper(
              `noneOfYear`,
              `/hadOtherCoverageIneligibleForHSAOptions`
            ),
          });

          expect(givenFacts(factGraph).atPath(fullPath, primaryFilerId, task)).toRouteNextTo(
            `${basePath}/hsa-coverage-line-6`
          );
        });
        it(`proceeds to 'hsa-coverage-line-6', if the Secondary Filer responds 'Yes'`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjIncomeWithHSAs,
            [`/filers/#${primaryFilerId}/typeOfHdhp`]: createEnumWrapper(`family`, `/typeOfHdhpOptions`),
            [`/filers/#${primaryFilerId}/writableChangeInMaritalStatusDuringTaxYear`]: createEnumWrapper(
              `wasMarriedOrDivorcedThisYear`,
              `/changeInMaritalStatusDuringTaxYearOptions`
            ),
            [`/filers/#${spouseId}/typeOfHdhp`]: createEnumWrapper(`family`, `/typeOfHdhpOptions`),
            [`/filers/#${spouseId}/writableChangeInMaritalStatusDuringTaxYear`]: createEnumWrapper(
              `wasMarriedOrDivorcedThisYear`,
              `/changeInMaritalStatusDuringTaxYearOptions`
            ),
            [`/filers/#${spouseId}/hsaHdhpCoverageStatus`]: createEnumWrapper(
              `allYear`,
              `/hsaHdhpCoverageStatusOptions`
            ),
            [`/filers/#${spouseId}/hadOtherCoverageIneligibleForHSA`]: createEnumWrapper(
              `noneOfYear`,
              `/hadOtherCoverageIneligibleForHSAOptions`
            ),
          });

          expect(givenFacts(factGraph).atPath(fullPath, spouseId, task)).toRouteNextTo(
            `${basePath}/hsa-coverage-line-6`
          );
        });
        it(`proceeds to 'hsa-contributions-breather', if the Primary Filer responds 'No'`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjIncomeWithHSAs,
            [`/filers/#${primaryFilerId}/writableChangeInMaritalStatusDuringTaxYear`]: createEnumWrapper(
              `wasNotMarriedNorDivorcedThisYear`,
              `/changeInMaritalStatusDuringTaxYearOptions`
            ),
          });

          expect(givenFacts(factGraph).atPath(fullPath, primaryFilerId, task)).toRouteNextTo(
            `${basePath}/hsa-contributions-breather`
          );
        });
        it(`proceeds to 'hsa-contributions-breather', if the Secondary Filer responds 'No'`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjIncomeWithHSAs,
            [`/filers/#${primaryFilerId}/writableChangeInMaritalStatusDuringTaxYear`]: createEnumWrapper(
              `wasNotMarriedNorDivorcedThisYear`,
              `/changeInMaritalStatusDuringTaxYearOptions`
            ),
            [`/filers/#${spouseId}/writableChangeInMaritalStatusDuringTaxYear`]: createEnumWrapper(
              `wasNotMarriedNorDivorcedThisYear`,
              `/changeInMaritalStatusDuringTaxYearOptions`
            ),
          });

          expect(givenFacts(factGraph).atPath(fullPath, spouseId, task)).toRouteNextTo(
            `${basePath}/hsa-contributions-breather`
          );
        });
      });

      // hsa-coverage-line-6 (Unrelated to hsa-coverage-married-not-mfj-line-6-check).
      describe(`When asked if a change in marital status affects contribution limits (line 6)`, () => {
        it(`knocks the Primary Filer out when they respond 'Yes'`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...baseIncomeWithHSAs,
            [`/maritalStatus`]: createEnumWrapper(`divorced`, `/maritalStatusOptions`),
            [`/filers/#${primaryFilerId}/typeOfHdhp`]: createEnumWrapper(`family`, `/typeOfHdhpOptions`),
            [`/filers/#${primaryFilerId}/writableChangeInMaritalStatusDuringTaxYear`]: createEnumWrapper(
              `wasMarriedOrDivorcedThisYear`,
              `/changeInMaritalStatusDuringTaxYearOptions`
            ),
            [`/filers/#${primaryFilerId}/hsaHdhpCoverageStatus`]: createEnumWrapper(
              `allYear`,
              `/hsaHdhpCoverageStatusOptions`
            ),
            [`/filers/#${primaryFilerId}/hadOtherCoverageIneligibleForHSA`]: createEnumWrapper(
              `noneOfYear`,
              `/hadOtherCoverageIneligibleForHSAOptions`
            ),
            [`/filers/#${primaryFilerId}/writableMaritalChangeAffectContributionLimitBool`]: createBooleanWrapper(true),
          });
          expect(givenFacts(factGraph).atPath(`${basePath}/hsa-coverage-line-6`, primaryFilerId, task)).toRouteNextTo(
            `${basePath}/hsa-coverage-line-6-ko`
          );
        });
        it(`proceeds to 'hsa-contributions-breather', if the Primary Filer responds 'No'`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...baseIncomeWithHSAs,
            [`/filers/#${primaryFilerId}/writableMaritalChangeAffectContributionLimitBool`]:
              createBooleanWrapper(false),
          });
          expect(givenFacts(factGraph).atPath(`${basePath}/hsa-coverage-line-6`, primaryFilerId, task)).toRouteNextTo(
            `${basePath}/hsa-contributions-breather`
          );
        });
        it(`proceeds to 'hsa-contributions-breather', if the Secondary Filer responds 'No'`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...mfjIncomeWithHSAs,
            [`/filers/#${primaryFilerId}/writableMaritalChangeAffectContributionLimitBool`]:
              createBooleanWrapper(false),
            [`/filers/#${spouseId}/writableMaritalChangeAffectContributionLimitBool`]: createBooleanWrapper(false),
          });
          expect(givenFacts(factGraph).atPath(`${basePath}/hsa-coverage-line-6`, spouseId, task)).toRouteNextTo(
            `${basePath}/hsa-contributions-breather`
          );
        });
      });

      describe(`When asked if they made a qualified HSA funding distribution`, () => {
        const screenUnderTest = `${basePath}/hsa-contributions-qualified-funding-distribution`;
        describe(`Yes`, () => {
          const koScreen = `${basePath}/hsa-ko-qualified-hsa-funding-distribution`;
          for (const filingStatus of Object.keys(en.fields[`/filingStatusOptions`])) {
            it(`knocks out ${filingStatus} filer`, ({ task }) => {
              const { factGraph } = setupFactGraph({
                ...baseIncomeWithHSAs,
                [`/filers/#${primaryFilerId}/hasMadeQualifiedHsaFundingDistribution`]: createBooleanWrapper(true),
                [`/filingStatus`]: createEnumWrapper(filingStatus, `/filingStatusOptions`),
              });
              expect(givenFacts(factGraph).atPath(screenUnderTest, primaryFilerId, task)).toRouteNextTo(koScreen);
            });
            if (filingStatus === `marriedFilingJointly`) {
              it(`knocks out MFJ spouse`, ({ task }) => {
                const { factGraph } = setupFactGraph({
                  ...mfjIncomeWithHSAs,
                  [`/filers/#${primaryFilerId}/hasMadeQualifiedHsaFundingDistribution`]: createBooleanWrapper(false),
                  [`/filers/#${spouseId}/hasMadeQualifiedHsaFundingDistribution`]: createBooleanWrapper(true),
                });
                expect(givenFacts(factGraph).atPath(screenUnderTest, spouseId, task)).toRouteNextTo(koScreen);
              });
            }
          }
        });
        describe(`No`, () => {
          const coverageLoopFirstScreen = `${basePath}/hsa-breather-about-you`;
          //const contributionsSummaryScreen = `${basePath}/hsa-contributions-summary-under`; //temporary fix VY
          const distributionStartScreen = `${basePath}/hsa-distributions-loop`;
          // NOTE: at the time of writing this test, screen `hsa-testing-period-contribution-check` does not exist.
          // Adding the screen should cause some test failures due to changes in the flow.
          // Fix them by replacing the following value (which reflects current behavior) with the new screen's name.
          const testingPeriodScreen = `${basePath}/hsa-testing-period-contribution-check`;

          for (const filingStatus of Object.keys(en.fields[`/filingStatusOptions`])) {
            // MFJ gets special logic later.
            if (filingStatus === `marriedFilingJointly`) continue;

            it(`${filingStatus} filer: exit contributions loop`, ({ task }) => {
              const { factGraph } = setupFactGraph({
                ...baseIncomeWithHSAs,
                [`/filers/#${primaryFilerId}/hasMadeQualifiedHsaFundingDistribution`]: createBooleanWrapper(false),
                [`/filingStatus`]: createEnumWrapper(filingStatus, `/filingStatusOptions`),
              });
              expect(givenFacts(factGraph).atPath(screenUnderTest, primaryFilerId, task)).toRouteNextTo(
                // contributionsSummaryScreen //temporary fix VY
                distributionStartScreen
              );
            });
          }
          it(`MFJ primary filer and spouse has activity: start contributions loop for spouse`, ({ task }) => {
            const { factGraph } = setupFactGraph({
              ...mfjIncomeWithHSAs,
              [`/filers/#${primaryFilerId}/hasMadeQualifiedHsaFundingDistribution`]: createBooleanWrapper(false),
            });
            expect(givenFacts(factGraph).atPath(screenUnderTest, primaryFilerId, task)).toRouteNextTo(
              coverageLoopFirstScreen
            );
          });
          it(`MFJ primary filer and spouse has no activity: go to test period check`, ({ task }) => {
            const { factGraph } = setupFactGraph({
              ...mfjIncomeWithHSAs,
              [`/filers/#${primaryFilerId}/hasMadeQualifiedHsaFundingDistribution`]: createBooleanWrapper(false),
              [`/writableSecondaryFilerHadNonW2HsaActivity`]: createBooleanWrapper(false),
            });
            expect(givenFacts(factGraph).atPath(screenUnderTest, primaryFilerId, task)).toRouteNextTo(
              testingPeriodScreen
            );
          });
          it(`MFJ spouse, when primary had activity: exit contributions loop`, ({ task }) => {
            const { factGraph } = setupFactGraph({
              ...mfjIncomeWithHSAs,
              [`/filers/#${primaryFilerId}/hasMadeQualifiedHsaFundingDistribution`]: createBooleanWrapper(false),
              [`/filers/#${spouseId}/hasMadeQualifiedHsaFundingDistribution`]: createBooleanWrapper(false),
            });
            expect(givenFacts(factGraph).atPath(screenUnderTest, spouseId, task)).toRouteNextTo(
              // contributionsSummaryScreen  //temporary fix VY
              distributionStartScreen
            );
          });
          it(`MFJ spouse, when primary had no activity: go to test period check`, ({ task }) => {
            const { factGraph } = setupFactGraph({
              ...mfjIncomeWithHSAs,
              [`/writablePrimaryFilerHadNonW2HsaActivity`]: createBooleanWrapper(false),
              [`/filers/#${spouseId}/hasMadeQualifiedHsaFundingDistribution`]: createBooleanWrapper(false),
            });
            expect(givenFacts(factGraph).atPath(screenUnderTest, spouseId, task)).toRouteNextTo(testingPeriodScreen);
          });
        });
      });

      describe(`routing tests`, () => {
        // These tests cover the test conditions listed in
        // https://git.irslabs.org/irslabs-prototypes/direct-file/-/issues/13604
        const screens = {
          otherCoverage: `${basePath}/hsa-coverage-other-y-n`,
          maritalChange: `${basePath}/hsa-coverage-marital-change`,
          breather: `${basePath}/hsa-contributions-breather`,
          line6Check: `${basePath}/hsa-coverage-married-not-mfj-line-6-check`,
          line6Ko: `${basePath}/hsa-coverage-married-not-mfj-line-6-ko`,
        };

        const routingPrimaryFilerId = `58b44bfc-c935-40eb-9eda-dbae4469ba82`;
        const routingSecondaryFilerId = `9ac9bd50-7d7e-40b9-8e93-d220e85cf8dd`;
        const plans = {
          family: {
            [`/filers/#${routingPrimaryFilerId}/typeOfHdhp`]: createEnumWrapper(`family`, `/typeOfHdhpOptions`),
          },
          selfOnly: {
            [`/filers/#${routingPrimaryFilerId}/typeOfHdhp`]: createEnumWrapper(`selfOnly`, `/typeOfHdhpOptions`),
          },
        };
        // This set of facts is probably much larger than necessary,
        // but in the interest of speed it was created with the app and used as is.
        const initialFacts = {
          '/filers/#9ac9bd50-7d7e-40b9-8e93-d220e85cf8dd/dateOfBirth': {
            $type: `gov.irs.factgraph.persisters.DayWrapper`,
            item: { date: `1970-01-02` },
          },
          '/filers/#9ac9bd50-7d7e-40b9-8e93-d220e85cf8dd/writableMiddleInitial': {
            $type: `gov.irs.factgraph.persisters.StringWrapper`,
            item: `m`,
          },
          '/familyAndHousehold/#ccaefe14-e170-4a4f-82a1-2084416d2836/firstName': {
            $type: `gov.irs.factgraph.persisters.StringWrapper`,
            item: `kid`,
          },
          '/filers/#9ac9bd50-7d7e-40b9-8e93-d220e85cf8dd/isPrimaryFiler': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: false,
          },
          '/formW2s/#3b81f512-e871-4634-81ed-e32befd72eda/ein': {
            $type: `gov.irs.factgraph.persisters.EinWrapper`,
            item: { prefix: `00`, serial: `2222222` },
          },
          '/familyAndHousehold/#ccaefe14-e170-4a4f-82a1-2084416d2836/married': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: false,
          },
          '/importedPrimaryFilerLastName': { $type: `gov.irs.factgraph.persisters.StringWrapper`, item: `Simpson` },
          '/hasForeignAccounts': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: false },
          '/filers/#9ac9bd50-7d7e-40b9-8e93-d220e85cf8dd/tin': {
            $type: `gov.irs.factgraph.persisters.TinWrapper`,
            item: { area: `555`, group: `00`, serial: `5555` },
          },
          '/familyAndHousehold/#ccaefe14-e170-4a4f-82a1-2084416d2836/tpPaidMostOfHomeUpkeep': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: true,
          },
          '/wantsCustomLanguage': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: false },
          '/filers/#58b44bfc-c935-40eb-9eda-dbae4469ba82/writableMiddleInitial': {
            $type: `gov.irs.factgraph.persisters.StringWrapper`,
            item: `O`,
          },
          '/filers/#58b44bfc-c935-40eb-9eda-dbae4469ba82/hadOtherCoverageIneligibleForHSA': {
            $type: `gov.irs.factgraph.persisters.EnumWrapper`,
            item: { value: [`noneOfYear`], enumOptionsPath: `/hadOtherCoverageIneligibleForHSAOptions` },
          },
          '/filers/#58b44bfc-c935-40eb-9eda-dbae4469ba82/isBlind': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: false,
          },
          '/incomeSourcesSupported': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: true },
          '/familyAndHousehold/#ccaefe14-e170-4a4f-82a1-2084416d2836/tpClaims': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: true,
          },
          '/filers/#9ac9bd50-7d7e-40b9-8e93-d220e85cf8dd/canBeClaimed': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: false,
          },
          '/filers/#58b44bfc-c935-40eb-9eda-dbae4469ba82/isDisabled': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: false,
          },
          '/selfSelectPin': { $type: `gov.irs.factgraph.persisters.PinWrapper`, item: { pin: `11111` } },
          '/filers/#58b44bfc-c935-40eb-9eda-dbae4469ba82/writablePrimaryFilerHasMadeContributionsToHsa': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: true,
          },
          '/formW2s/#3b81f512-e871-4634-81ed-e32befd72eda/retirementPlan': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: false,
          },
          '/interestReports': { $type: `gov.irs.factgraph.persisters.CollectionWrapper`, item: { items: [] } },
          '/isForeignTrustsGrantor': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: false },
          '/spouseLivesInTPState': {
            $type: `gov.irs.factgraph.persisters.EnumWrapper`,
            item: { value: [`sameState`], enumOptionsPath: `/spouseScopedStateOptions` },
          },
          '/filers/#58b44bfc-c935-40eb-9eda-dbae4469ba82/identityPin': {
            $type: `gov.irs.factgraph.persisters.IpPinWrapper`,
            item: { pin: `123456` },
          },
          '/flowHasSeenAmount': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: true },
          '/familyAndHousehold/#ccaefe14-e170-4a4f-82a1-2084416d2836/residencyDuration': {
            $type: `gov.irs.factgraph.persisters.EnumWrapper`,
            item: { value: [`allYear`], enumOptionsPath: `/residencyDurationOptions` },
          },
          '/wantsThirdPartyDesignee': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: false },
          '/formW2s/#3b81f512-e871-4634-81ed-e32befd72eda/writableHasBox14Codes': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: false,
          },
          '/spouseSelfSelectPin': { $type: `gov.irs.factgraph.persisters.PinWrapper`, item: { pin: `22222` } },
          '/hasSeenIncomeNotSupportedIntro': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: true },
          '/socialSecurityReports': { $type: `gov.irs.factgraph.persisters.CollectionWrapper`, item: { items: [] } },
          '/receivedAlaskaPfd': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: false },
          '/formW2s': {
            $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
            item: { items: [`3b81f512-e871-4634-81ed-e32befd72eda`] },
          },
          '/filerResidenceAndIncomeState': {
            $type: `gov.irs.factgraph.persisters.EnumWrapper`,
            item: { value: [`il`], enumOptionsPath: `/scopedStateOptions` },
          },
          '/filers/#9ac9bd50-7d7e-40b9-8e93-d220e85cf8dd/isBlind': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: false,
          },
          '/filers/#58b44bfc-c935-40eb-9eda-dbae4469ba82/canBeClaimed': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: false,
          },
          '/paidEstimatedTaxesWithFormerSpouse': {
            $type: `gov.irs.factgraph.persisters.EnumWrapper`,
            item: { value: [`neither`], enumOptionsPath: `/paidEstimatedTaxesWithFormerSpouseOptions` },
          },
          '/writablePrimaryFilerHadNonW2HsaActivity': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: true,
          },
          '/familyAndHousehold/#ccaefe14-e170-4a4f-82a1-2084416d2836/unableToCareForSelf': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: false,
          },
          '/hasCdccCarryoverAmountFromPriorTaxYear': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: false,
          },
          '/formW2s/#3b81f512-e871-4634-81ed-e32befd72eda/writableWages': {
            $type: `gov.irs.factgraph.persisters.DollarWrapper`,
            item: `10000.00`,
          },
          '/familyAndHousehold/#ccaefe14-e170-4a4f-82a1-2084416d2836/monthsLivedWithTPInUS': {
            $type: `gov.irs.factgraph.persisters.EnumWrapper`,
            item: { value: [`twelve`], enumOptionsPath: `/monthsLivedWithTPInUSOptions` },
          },
          '/flowHasSeenDeductions': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: true },
          '/socialSecurityReportsIsDone': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: true },
          '/familyAndHousehold/#ccaefe14-e170-4a4f-82a1-2084416d2836/ssnEmploymentValidity': {
            $type: `gov.irs.factgraph.persisters.EnumWrapper`,
            item: { value: [`neither`], enumOptionsPath: `/familyAndHouseholdSsnEmploymentValidityOptions` },
          },
          '/importedPrimaryFilerDateOfBirth': {
            $type: `gov.irs.factgraph.persisters.DayWrapper`,
            item: { date: `1955-03-09` },
          },
          '/flowHasSeenTotalIncomeSummary': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: true },
          '/importedPrimaryFilerFirstName': { $type: `gov.irs.factgraph.persisters.StringWrapper`, item: `Marjorie` },
          '/writableSecondaryFilerHadNonW2HsaActivity': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: true,
          },
          '/filers/#9ac9bd50-7d7e-40b9-8e93-d220e85cf8dd/isDisabled': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: false,
          },
          '/filers/#9ac9bd50-7d7e-40b9-8e93-d220e85cf8dd/hasIpPin': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: false,
          },
          '/MFSSpouse65OrOlder': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: false },
          '/phone': {
            $type: `gov.irs.factgraph.persisters.E164Wrapper`,
            item: {
              $type: `gov.irs.factgraph.types.UsPhoneNumber`,
              areaCode: `222`,
              officeCode: `333`,
              lineNumber: `4444`,
            },
          },
          '/filers/#58b44bfc-c935-40eb-9eda-dbae4469ba82/isStudent': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: false,
          },
          '/is1099RFeatureFlagEnabled': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: false },
          '/familyAndHousehold': {
            $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
            item: { items: [`ccaefe14-e170-4a4f-82a1-2084416d2836`] },
          },
          '/filers/#58b44bfc-c935-40eb-9eda-dbae4469ba82/isPrimaryFiler': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: true,
          },
          '/formW2s/#3b81f512-e871-4634-81ed-e32befd72eda/filer': {
            $type: `gov.irs.factgraph.persisters.CollectionItemWrapper`,
            item: { id: `58b44bfc-c935-40eb-9eda-dbae4469ba82` },
          },
          '/familyAndHousehold/#ccaefe14-e170-4a4f-82a1-2084416d2836/tinType': {
            $type: `gov.irs.factgraph.persisters.EnumWrapper`,
            item: { value: [`ssn`], enumOptionsPath: `/tinTypeOptions` },
          },
          '/paidEstimatedTaxesOrFromLastYearUnderDifferentName': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: false,
          },
          '/filers/#58b44bfc-c935-40eb-9eda-dbae4469ba82/firstName': {
            $type: `gov.irs.factgraph.persisters.StringWrapper`,
            item: `Filer`,
          },
          '/formW2s/#3b81f512-e871-4634-81ed-e32befd72eda/hasSeenLastAvailableScreen': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: true,
          },
          '/disposedDigitalAssets': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: false },
          '/formW2s/#3b81f512-e871-4634-81ed-e32befd72eda/thirdPartySickPay': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: false,
          },
          '/madeIraContributions': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: false },
          '/spouseLivedTogetherMonths': {
            $type: `gov.irs.factgraph.persisters.EnumWrapper`,
            item: { value: [`livedApartAllYear`], enumOptionsPath: `/spouseLivedTogetherMonthsOptions` },
          },
          '/filers/#58b44bfc-c935-40eb-9eda-dbae4469ba82/lastName': {
            $type: `gov.irs.factgraph.persisters.StringWrapper`,
            item: `Tax`,
          },
          '/familyAndHousehold/#ccaefe14-e170-4a4f-82a1-2084416d2836/isUsCitizenFullYear': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: true,
          },
          '/familyAndHousehold/#ccaefe14-e170-4a4f-82a1-2084416d2836/hasIpPin': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: false,
          },
          '/flowKnockoutHouseholdEmployee': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: false },
          '/writableHasHsaWithdrawnExcessContributionsYesNo': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: false,
          },
          '/familyAndHousehold/#ccaefe14-e170-4a4f-82a1-2084416d2836/lastName': {
            $type: `gov.irs.factgraph.persisters.StringWrapper`,
            item: `kiddo`,
          },
          '/spouseFiledLastYear': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: false },
          '/writableLivedApartLastSixMonths': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: true },
          '/refundViaAch': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: false },
          '/filers/#58b44bfc-c935-40eb-9eda-dbae4469ba82/isUsCitizenFullYear': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: true,
          },
          '/filers/#58b44bfc-c935-40eb-9eda-dbae4469ba82/tin': {
            $type: `gov.irs.factgraph.persisters.TinWrapper`,
            item: { area: `123`, group: `00`, serial: `1674` },
          },
          '/isEssarFeatureFlag': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: true },
          '/someFilersMadeTestingPeriodContribution': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: false,
          },
          '/familyAndHouseholdIsDone': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: true },
          '/importedPrimaryFilerAddress': {
            $type: `gov.irs.factgraph.persisters.AddressWrapper`,
            item: {
              streetAddress: `742 Evergreen Terrace`,
              city: `Springfield`,
              postalCode: `62701`,
              stateOrProvence: `IL`,
              country: `USA`,
            },
          },
          '/receivedDigitalAssets': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: false },
          '/filers/#58b44bfc-c935-40eb-9eda-dbae4469ba82/enrolledInMedicare': {
            $type: `gov.irs.factgraph.persisters.EnumWrapper`,
            item: { value: [`noneOfYear`], enumOptionsPath: `/enrolledInMedicareOptions` },
          },
          '/formW2s/#3b81f512-e871-4634-81ed-e32befd72eda/statutoryEmployee': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: false,
          },
          '/formW2s/#3b81f512-e871-4634-81ed-e32befd72eda/nonstandardOrCorrectedChoice': {
            $type: `gov.irs.factgraph.persisters.EnumWrapper`,
            item: { value: [`neither`], enumOptionsPath: `/w2NonstandardCorrectedOptions` },
          },
          '/hasSeenReviewScreen': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: false },
          '/form1099Gs': { $type: `gov.irs.factgraph.persisters.CollectionWrapper`, item: { items: [] } },
          '/hasSome1099rFormsBeforeSectionEnabled': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: false,
          },
          '/formW2s/#3b81f512-e871-4634-81ed-e32befd72eda/employerName': {
            $type: `gov.irs.factgraph.persisters.StringWrapper`,
            item: `emp 2`,
          },
          '/familyAndHousehold/#ccaefe14-e170-4a4f-82a1-2084416d2836/dateOfBirth': {
            $type: `gov.irs.factgraph.persisters.DayWrapper`,
            item: { date: `2022-01-02` },
          },
          '/familyAndHousehold/#ccaefe14-e170-4a4f-82a1-2084416d2836/relationshipCategory': {
            $type: `gov.irs.factgraph.persisters.EnumWrapper`,
            item: { value: [`childOrDescendants`], enumOptionsPath: `/relationshipCategoryOptions` },
          },
          '/writableHasHsaExcessContributionsPreviousYear': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: false,
          },
          '/interestReportsIsDone': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: true },
          '/importedPrimaryFilerPhone': {
            $type: `gov.irs.factgraph.persisters.E164Wrapper`,
            item: {
              $type: `gov.irs.factgraph.types.UsPhoneNumber`,
              areaCode: `222`,
              officeCode: `333`,
              lineNumber: `4444`,
            },
          },
          '/filers/#58b44bfc-c935-40eb-9eda-dbae4469ba82/hsaHdhpCoverageStatus': {
            $type: `gov.irs.factgraph.persisters.EnumWrapper`,
            item: { value: [`allYear`], enumOptionsPath: `/hsaHdhpCoverageStatusOptions` },
          },
          '/filers/#58b44bfc-c935-40eb-9eda-dbae4469ba82/hasIpPin': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: true,
          },
          '/MFSSpouseHasGrossIncome': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: false },
          '/aboutYouDataWasSaved': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: true },
          '/email': { $type: `gov.irs.factgraph.persisters.EmailAddressWrapper`, item: { email: `temp@example.com` } },
          '/formW2s/#3b81f512-e871-4634-81ed-e32befd72eda/employerAddress': {
            $type: `gov.irs.factgraph.persisters.AddressWrapper`,
            item: {
              streetAddress: `1 Elm`,
              city: `Columbus`,
              postalCode: `60002`,
              stateOrProvence: `IL`,
              streetAddressLine2: `Apt 2`,
              country: ``,
            },
          },
          '/familyAndHousehold/#ccaefe14-e170-4a4f-82a1-2084416d2836/childRelationship': {
            $type: `gov.irs.factgraph.persisters.EnumWrapper`,
            item: { value: [`biologicalChild`], enumOptionsPath: `/childRelationshipOptions` },
          },
          '/formW2sIsDone': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: true },
          '/formW2s/#3b81f512-e871-4634-81ed-e32befd72eda/addressMatchesReturn': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: true,
          },
          '/filers/#9ac9bd50-7d7e-40b9-8e93-d220e85cf8dd/isStudent': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: false,
          },
          '/familyAndHousehold/#ccaefe14-e170-4a4f-82a1-2084416d2836/hasOtherBiologicalOrAdoptiveParent': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: false,
          },
          '/someFilerHadNonW2HsaActivity': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: true },
          '/MFSLivingSpouseFilingReturn': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: false },
          '/formW2s/#3b81f512-e871-4634-81ed-e32befd72eda/writableHasBox12Codes': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: false,
          },
          '/spouseReceivedAlaskaPfd': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: false },
          '/flowHasAmountChanged': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: false },
          '/filingStatusChoice': {
            $type: `gov.irs.factgraph.persisters.EnumWrapper`,
            item: { value: [`wantsToSeeIfTheyQualifyHeadOfHousehold`], enumOptionsPath: `/filingStatusInitialOptions` },
          },
          '/familyAndHousehold/#ccaefe14-e170-4a4f-82a1-2084416d2836/writableCouldBeQualifyingChildOfAnother': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: false,
          },
          '/familyAndHousehold/#ccaefe14-e170-4a4f-82a1-2084416d2836/deceased': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: false,
          },
          '/address': {
            $type: `gov.irs.factgraph.persisters.AddressWrapper`,
            item: {
              streetAddress: `742 Evergreen Terrace`,
              city: `Springfield`,
              postalCode: `62701`,
              stateOrProvence: `IL`,
              country: `USA`,
            },
          },
          '/filers': {
            $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
            item: { items: [`58b44bfc-c935-40eb-9eda-dbae4469ba82`, `9ac9bd50-7d7e-40b9-8e93-d220e85cf8dd`] },
          },
          '/spouseW2And1099IntInScopedState': {
            $type: `gov.irs.factgraph.persisters.EnumWrapper`,
            item: { value: [`noForms`], enumOptionsPath: `/spouseW2And1099IntStateOptions` },
          },
          '/form1099GsIsDone': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: true },
          '/familyAndHousehold/#ccaefe14-e170-4a4f-82a1-2084416d2836/tin': {
            $type: `gov.irs.factgraph.persisters.TinWrapper`,
            item: { area: `222`, group: `00`, serial: `8888` },
          },
          '/hasForeignTrustsTransactions': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: false },
          '/directFileLanguagePreference': { $type: `gov.irs.factgraph.persisters.StringWrapper`, item: `en` },
          '/wantsCommsFormat': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: false },
          '/livedTogetherAllYearWithSpouse': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: false },
          '/filers/#9ac9bd50-7d7e-40b9-8e93-d220e85cf8dd/firstName': {
            $type: `gov.irs.factgraph.persisters.StringWrapper`,
            item: `first`,
          },
          '/hasFailedMaxElectronicSigningAttempts': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: false,
          },
          '/filers/#58b44bfc-c935-40eb-9eda-dbae4469ba82/occupation': {
            $type: `gov.irs.factgraph.persisters.StringWrapper`,
            item: `Tester`,
          },
          '/filers/#9ac9bd50-7d7e-40b9-8e93-d220e85cf8dd/occupation': {
            $type: `gov.irs.factgraph.persisters.StringWrapper`,
            item: `taxpayer`,
          },
          '/hohQualifyingPerson': {
            $type: `gov.irs.factgraph.persisters.CollectionItemWrapper`,
            item: { id: `ccaefe14-e170-4a4f-82a1-2084416d2836` },
          },
          '/filers/#58b44bfc-c935-40eb-9eda-dbae4469ba82/dateOfBirth': {
            $type: `gov.irs.factgraph.persisters.DayWrapper`,
            item: { date: `1955-03-09` },
          },
          '/primaryFilerW2And1099IntInScopedState': {
            $type: `gov.irs.factgraph.persisters.EnumWrapper`,
            item: { value: [`onlySame`], enumOptionsPath: `/primaryFilerW2And1099IntStateOptions` },
          },
          '/filers/#9ac9bd50-7d7e-40b9-8e93-d220e85cf8dd/lastName': {
            $type: `gov.irs.factgraph.persisters.StringWrapper`,
            item: `last`,
          },
          '/familyAndHousehold/#ccaefe14-e170-4a4f-82a1-2084416d2836/ownSupport': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: false,
          },
          '/hasHsaMedicalSavingsAccountType': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: false },
          '/estimatedTaxPaymentWritable': { $type: `gov.irs.factgraph.persisters.DollarWrapper`, item: `1.00` },
          '/paidEstimatedTaxesOrFromLastYear': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: true },
          '/filers/#9ac9bd50-7d7e-40b9-8e93-d220e85cf8dd/isUsCitizenFullYear': {
            $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
            item: true,
          },
        };
        describe(`HoH filing status, married`, () => {
          it(`family plan routes from other coverage screen to line 6 check screen`, ({ task }) => {
            const { factGraph } = setupFactGraph({
              ...initialFacts,
              [`/filingStatus`]: createEnumWrapper(`headOfHousehold`, `/filingStatusOptions`),
              [`/maritalStatus`]: createEnumWrapper(`married`, `/maritalStatusOptions`),
              ...plans.family,
            });
            expect(givenFacts(factGraph).atPath(screens.otherCoverage, null, task)).toRouteNextTo(screens.line6Check);
          });
          it(`self-only plan routes from other coverage screen to marital change screen`, ({ task }) => {
            const { factGraph } = setupFactGraph({
              ...initialFacts,
              [`/filingStatus`]: createEnumWrapper(`headOfHousehold`, `/filingStatusOptions`),
              [`/maritalStatus`]: createEnumWrapper(`married`, `/maritalStatusOptions`),
              ...plans.selfOnly,
            });
            expect(givenFacts(factGraph).atPath(screens.otherCoverage, null, task)).toRouteNextTo(
              screens.maritalChange
            );
          });
        });
        describe(`HoH filing status, unmarried`, () => {
          it(`single with family plan routes from other coverage screen to breather screen`, ({ task }) => {
            const { factGraph } = setupFactGraph({
              ...initialFacts,
              [`/filingStatus`]: createEnumWrapper(`headOfHousehold`, `/filingStatusOptions`),
              [`/maritalStatus`]: createEnumWrapper(`single`, `/maritalStatusOptions`),
              ...plans.family,
            });
            expect(givenFacts(factGraph).atPath(screens.otherCoverage, null, task)).toRouteNextTo(screens.breather);
          });
          it(`single with self-only plan routes from other coverage screen to breather screen`, ({ task }) => {
            const { factGraph } = setupFactGraph({
              ...initialFacts,
              [`/filingStatus`]: createEnumWrapper(`headOfHousehold`, `/filingStatusOptions`),
              [`/maritalStatus`]: createEnumWrapper(`single`, `/maritalStatusOptions`),
              ...plans.selfOnly,
            });
            expect(givenFacts(factGraph).atPath(screens.otherCoverage, null, task)).toRouteNextTo(screens.breather);
          });
          it(`divorced with family plan routes from other coverage screen to marital change screen`, ({ task }) => {
            const { factGraph } = setupFactGraph({
              ...initialFacts,
              [`/filingStatus`]: createEnumWrapper(`headOfHousehold`, `/filingStatusOptions`),
              [`/maritalStatus`]: createEnumWrapper(`divorced`, `/maritalStatusOptions`),
              ...plans.family,
            });
            expect(givenFacts(factGraph).atPath(screens.otherCoverage, null, task)).toRouteNextTo(
              screens.maritalChange
            );
          });
          it(`divorced with self-only plan routes from other coverage screen to marital change screen`, ({ task }) => {
            const { factGraph } = setupFactGraph({
              ...initialFacts,
              [`/filingStatus`]: createEnumWrapper(`headOfHousehold`, `/filingStatusOptions`),
              [`/maritalStatus`]: createEnumWrapper(`divorced`, `/maritalStatusOptions`),
              ...plans.selfOnly,
            });
            expect(givenFacts(factGraph).atPath(screens.otherCoverage, null, task)).toRouteNextTo(
              screens.maritalChange
            );
          });
        });
        describe(`MFS filing status`, () => {
          it(`family plan routes from other coverage screen to line 6 check screen`, ({ task }) => {
            const { factGraph } = setupFactGraph({
              ...initialFacts,
              [`/filingStatus`]: createEnumWrapper(`marriedFilingSeparately`, `/filingStatusOptions`),
              [`/maritalStatus`]: createEnumWrapper(`married`, `/maritalStatusOptions`),
              ...plans.family,
            });
            expect(givenFacts(factGraph).atPath(screens.otherCoverage, null, task)).toRouteNextTo(screens.line6Check);
          });
          it(`self-only plan routes from other coverage screen to marital change screen`, ({ task }) => {
            const { factGraph } = setupFactGraph({
              ...initialFacts,
              [`/filingStatus`]: createEnumWrapper(`marriedFilingSeparately`, `/filingStatusOptions`),
              [`/maritalStatus`]: createEnumWrapper(`married`, `/maritalStatusOptions`),
              ...plans.selfOnly,
            });
            expect(givenFacts(factGraph).atPath(screens.otherCoverage, null, task)).toRouteNextTo(
              screens.maritalChange
            );
          });
        });
        describe(`single filing status`, () => {
          it(`single with family plan routes from other coverage screen to breather screen`, ({ task }) => {
            const { factGraph } = setupFactGraph({
              ...initialFacts,
              [`/filingStatus`]: createEnumWrapper(`single`, `/filingStatusOptions`),
              [`/maritalStatus`]: createEnumWrapper(`single`, `/maritalStatusOptions`),
              ...plans.family,
            });
            expect(givenFacts(factGraph).atPath(screens.otherCoverage, null, task)).toRouteNextTo(screens.breather);
          });
          it(`divorced with family plan routes from other coverage screen to marital change screen`, ({ task }) => {
            const { factGraph } = setupFactGraph({
              ...initialFacts,
              [`/filingStatus`]: createEnumWrapper(`single`, `/filingStatusOptions`),
              [`/maritalStatus`]: createEnumWrapper(`divorced`, `/maritalStatusOptions`),
              ...plans.family,
            });
            expect(givenFacts(factGraph).atPath(screens.otherCoverage, null, task)).toRouteNextTo(
              screens.maritalChange
            );
          });
        });
        describe(`MFJ filing status`, () => {
          it(`family plan routes from other coverage screen to marital change screen`, ({ task }) => {
            const { factGraph } = setupFactGraph({
              ...initialFacts,
              [`/filingStatus`]: createEnumWrapper(`marriedFilingJointly`, `/filingStatusOptions`),
              [`/maritalStatus`]: createEnumWrapper(`married`, `/maritalStatusOptions`),
              ...plans.family,
            });
            expect(givenFacts(factGraph).atPath(screens.otherCoverage, null, task)).toRouteNextTo(
              screens.maritalChange
            );
          });
          it(`primary with self-only plan routes from other coverage screen to marital change screen`, ({ task }) => {
            const { factGraph } = setupFactGraph({
              ...initialFacts,
              [`/filingStatus`]: createEnumWrapper(`marriedFilingJointly`, `/filingStatusOptions`),
              [`/maritalStatus`]: createEnumWrapper(`married`, `/maritalStatusOptions`),
              ...plans.selfOnly,
              // no coverage for secondary
              [`/writableSecondaryFilerHadNonW2HsaActivity`]: createBooleanWrapper(false),
              [`/filers/#${routingSecondaryFilerId}/hsaHdhpCoverageStatus`]: createEnumWrapper(
                `noneOfYear`,
                `/hsaHdhpCoverageStatusOptions`
              ),
            });
            expect(givenFacts(factGraph).atPath(screens.otherCoverage, routingPrimaryFilerId, task)).toRouteNextTo(
              screens.maritalChange
            );
          });
          it(`secondary with self-only plan routes from other coverage screen to marital change screen`, ({ task }) => {
            const { factGraph } = setupFactGraph({
              ...initialFacts,
              [`/filingStatus`]: createEnumWrapper(`marriedFilingJointly`, `/filingStatusOptions`),
              [`/maritalStatus`]: createEnumWrapper(`married`, `/maritalStatusOptions`),
              ...plans.selfOnly,
              [`/filers/#${routingSecondaryFilerId}/writableSecondaryFilerHasMadeContributionsToHsa`]:
                createBooleanWrapper(true),
              [`/filers/#${routingSecondaryFilerId}/typeOfHdhp`]: createEnumWrapper(`selfOnly`, `/typeOfHdhpOptions`),
              [`/filers/#${routingSecondaryFilerId}/hadOtherCoverageIneligibleForHSA`]: createEnumWrapper(
                `noneOfYear`,
                `/hadOtherCoverageIneligibleForHSAOptions`
              ),
              // no coverage for primary
              [`/writablePrimaryFilerHadNonW2HsaActivity`]: createBooleanWrapper(false),
              [`/filers/#${routingPrimaryFilerId}/hsaHdhpCoverageStatus`]: createEnumWrapper(
                `noneOfYear`,
                `/hsaHdhpCoverageStatusOptions`
              ),
            });
            expect(givenFacts(factGraph).atPath(screens.otherCoverage, routingSecondaryFilerId, task)).toRouteNextTo(
              screens.maritalChange
            );
          });
          it(`primary self-only, spouse family plans routes from other coverage screen to marital change screen`, ({
            task,
          }) => {
            const { factGraph } = setupFactGraph({
              ...initialFacts,
              [`/filingStatus`]: createEnumWrapper(`marriedFilingJointly`, `/filingStatusOptions`),
              [`/maritalStatus`]: createEnumWrapper(`married`, `/maritalStatusOptions`),
              ...plans.selfOnly,
              [`/filers/#${routingSecondaryFilerId}/writableSecondaryFilerHasMadeContributionsToHsa`]:
                createBooleanWrapper(true),
              [`/filers/#${routingSecondaryFilerId}/typeOfHdhp`]: createEnumWrapper(`family`, `/typeOfHdhpOptions`),
              [`/filers/#${routingSecondaryFilerId}/hadOtherCoverageIneligibleForHSA`]: createEnumWrapper(
                `noneOfYear`,
                `/hadOtherCoverageIneligibleForHSAOptions`
              ),
            });
            expect(givenFacts(factGraph).atPath(screens.otherCoverage, routingPrimaryFilerId, task)).toRouteNextTo(
              screens.maritalChange
            );
            expect(givenFacts(factGraph).atPath(screens.otherCoverage, routingSecondaryFilerId, task)).toRouteNextTo(
              screens.maritalChange
            );
          });
          it(`both with self-only plans routes from other coverage screen to marital change screen`, ({ task }) => {
            const { factGraph } = setupFactGraph({
              ...initialFacts,
              [`/filingStatus`]: createEnumWrapper(`marriedFilingJointly`, `/filingStatusOptions`),
              [`/maritalStatus`]: createEnumWrapper(`married`, `/maritalStatusOptions`),
              ...plans.selfOnly,
              [`/filers/#${routingSecondaryFilerId}/writableSecondaryFilerHasMadeContributionsToHsa`]:
                createBooleanWrapper(true),
              [`/filers/#${routingSecondaryFilerId}/typeOfHdhp`]: createEnumWrapper(`selfOnly`, `/typeOfHdhpOptions`),
              [`/filers/#${routingSecondaryFilerId}/hadOtherCoverageIneligibleForHSA`]: createEnumWrapper(
                `noneOfYear`,
                `/hadOtherCoverageIneligibleForHSAOptions`
              ),
            });
            expect(givenFacts(factGraph).atPath(screens.otherCoverage, routingPrimaryFilerId, task)).toRouteNextTo(
              screens.maritalChange
            );
            expect(givenFacts(factGraph).atPath(screens.otherCoverage, routingSecondaryFilerId, task)).toRouteNextTo(
              screens.maritalChange
            );
          });
          it(`widowed with family plan routes from other coverage screen to marital change screen`, ({ task }) => {
            const { factGraph } = setupFactGraph({
              ...initialFacts,
              [`/filingStatus`]: createEnumWrapper(`marriedFilingJointly`, `/filingStatusOptions`),
              [`/maritalStatus`]: createEnumWrapper(`widowed`, `/maritalStatusOptions`),
              ...plans.family,
            });
            expect(givenFacts(factGraph).atPath(screens.otherCoverage, null, task)).toRouteNextTo(
              screens.maritalChange
            );
          });
          it(`widowed with self-only plan routes from other coverage screen to marital change screen`, ({ task }) => {
            const { factGraph } = setupFactGraph({
              ...initialFacts,
              [`/filingStatus`]: createEnumWrapper(`marriedFilingJointly`, `/filingStatusOptions`),
              [`/maritalStatus`]: createEnumWrapper(`widowed`, `/maritalStatusOptions`),
              ...plans.selfOnly,
            });
            expect(givenFacts(factGraph).atPath(screens.otherCoverage, null, task)).toRouteNextTo(
              screens.maritalChange
            );
          });
        });
        describe(`from ${screens.line6Check.substring(screens.line6Check.lastIndexOf(`/`) + 1)} ...`, () => {
          describe(`... HoH married filer with family coverage ...`, () => {
            const hmfFacts = {
              ...initialFacts,
              [`/filingStatus`]: createEnumWrapper(`headOfHousehold`, `/filingStatusOptions`),
              [`/maritalStatus`]: createEnumWrapper(`married`, `/maritalStatusOptions`),
              ...plans.family,
            };
            it(`... is KO'd when answering 'Yes'.`, ({ task }) => {
              const { factGraph } = setupFactGraph({
                ...hmfFacts,
                [`/filers/#${routingPrimaryFilerId}/writableMfsLine6Check`]: createBooleanWrapper(true),
              });
              expect(givenFacts(factGraph).atPath(screens.line6Check, null, task)).toRouteNextTo(screens.line6Ko);
            });
            it(`... is asked about marital change when answering 'No'.`, ({ task }) => {
              const { factGraph } = setupFactGraph({
                ...hmfFacts,
                [`/filers/#${routingPrimaryFilerId}/writableMfsLine6Check`]: createBooleanWrapper(false),
              });
              expect(givenFacts(factGraph).atPath(screens.line6Check, null, task)).toRouteNextTo(screens.maritalChange);
            });
          });
          describe(`... MFS filer with family coverage ...`, () => {
            const mfsFacts = {
              ...initialFacts,
              [`/filingStatus`]: createEnumWrapper(`marriedFilingSeparately`, `/filingStatusOptions`),
              [`/maritalStatus`]: createEnumWrapper(`married`, `/maritalStatusOptions`),
              ...plans.family,
            };
            it(`... is KO'd when answering 'Yes'.`, ({ task }) => {
              const { factGraph } = setupFactGraph({
                ...mfsFacts,
                [`/filers/#${routingPrimaryFilerId}/writableMfsLine6Check`]: createBooleanWrapper(true),
              });
              expect(givenFacts(factGraph).atPath(screens.line6Check, null, task)).toRouteNextTo(screens.line6Ko);
            });
            it(`... is asked about marital change when answering 'No'.`, ({ task }) => {
              const { factGraph } = setupFactGraph({
                ...mfsFacts,
                [`/filers/#${routingPrimaryFilerId}/writableMfsLine6Check`]: createBooleanWrapper(false),
              });
              expect(givenFacts(factGraph).atPath(screens.line6Check, null, task)).toRouteNextTo(screens.maritalChange);
            });
          });
        });
      });

      // TODO: The contribution screen tests need to be updated and further tests implemented.
      // describe(`Contributions summary screen`, () => {
      //   describe(`The TP sees the expected contributions summary based on their W2 employer contributions`, () => {
      //     const w2Id = `0b1e355e-3d19-415d-8470-fbafd9f58361`;
      //     it(`TP sees under summary screen when the W2 contributions are under the limit`, ({ task }) => {
      //       const { factGraph } = setupFactGraph({
      //         ...baseIncomeWithHSAs,
      //       });

      //       expect(
      //         givenFacts(factGraph).atPath(
      //           `${basePath}/hsa-contributions-add-contributions-made-ty+1`,
      //           primaryFilerId,
      //           task
      //         )
      //       ).toRouteNextTo(`${basePath}/hsa-contributions-summary-under`);
      //     });
      //     it(`TP sees summary screen knockout when the W2 contributions are over the limit`, ({ task }) => {
      //       const { factGraph } = setupFactGraph({
      //         ...baseIncomeWithHSAs,
      //         ...makeW2Data(50000, w2Id, primaryFilerId),
      //         [`/formW2s/#${w2Id}/employerHsaContributions`]: createDollarWrapper(`50000.00`),
      //         [`/filers/#${primaryFilerId}/enrolledInMedicare`]: createEnumWrapper(
      //           `noneOfYear`,
      //           `/enrolledInMedicareOptions`
      //         ),
      //         [`/filers/#${primaryFilerId}/typeOfHdhp`]: createEnumWrapper(`selfOnly`, `/typeOfHdhpOptions`),
      //         [`/filers/#${primaryFilerId}/hsaHdhpCoverageStatus`]: createEnumWrapper(
      //           `allYear`,
      //           `/hsaHdhpCoverageStatusOptions`
      //         ),
      //       });

      //       expect(
      //         givenFacts(factGraph).atPath(
      //           `${basePath}/hsa-contributions-add-contributions-made-ty+1`,
      //           primaryFilerId,
      //           task
      //         )
      //       ).toRouteNextTo(`${basePath}/hsa-contributions-summary-excess-KO`);
      //     });
      //   });

      //   describe(`The TP sees the expected contributions summary based on their non-employer contributions`, () => {
      //     const w2Id = `0b1e355e-3d19-415d-8470-fbafd9f58361`;
      //   it(`TP sees under summary screen when current TY non-employer contributions are under limit`, ({ task }) => {
      //       const { factGraph } = setupFactGraph({
      //         ...baseIncomeWithHSAs,
      //         ...makeW2Data(50000, w2Id, primaryFilerId),
      //         [`/formW2s/#${w2Id}/employerHsaContributions`]: createDollarWrapper(`500.00`),

      //         [`/hasHsaMedicalSavingsAccountType`]: createBooleanWrapper(false),
      //         [`/filers/#${primaryFilerId}/enrolledInMedicare`]: createEnumWrapper(
      //           `noneOfYear`,
      //           `/enrolledInMedicareOptions`
      //         ),
      //         [`/filers/#${primaryFilerId}/typeOfHdhp`]: createEnumWrapper(`selfOnly`, `/typeOfHdhpOptions`),
      //         [`/filers/#${primaryFilerId}/hadOtherCoverageIneligibleForHSA`]: createEnumWrapper(
      //           `noneOfYear`,
      //           `/hadOtherCoverageIneligibleForHSAOptions`
      //         ),
      //         [`/filers/#${primaryFilerId}/hsaHdhpCoverageStatus`]: createEnumWrapper(
      //           `allYear`,
      //           `/hsaHdhpCoverageStatusOptions`
      //         ),
      //       [`/filers/#${primaryFilerId}/writableHsaNonemployerContributionsTaxYear`]: createDollarWrapper(`300.00`),
      //       });

      //       expect(
      //         givenFacts(factGraph).atPath(
      //           `${basePath}/hsa-contributions-add-contributions-made-ty+1`,
      //           primaryFilerId,
      //           task
      //         )
      //       ).toRouteNextTo(`${basePath}/hsa-contributions-summary-under`);
      //     });
      //     it(`TP sees summary screen KO when current TY non-employer contributions are over limit`, ({ task }) => {
      //       const { factGraph } = setupFactGraph({
      //         ...baseIncomeWithHSAs,
      //         ...makeW2Data(50000, w2Id, primaryFilerId),
      //         [`/formW2s/#${w2Id}/employerHsaContributions`]: createDollarWrapper(`500.00`),

      //         [`/hasHsaMedicalSavingsAccountType`]: createBooleanWrapper(false),
      //         [`/filers/#${primaryFilerId}/enrolledInMedicare`]: createEnumWrapper(
      //           `noneOfYear`,
      //           `/enrolledInMedicareOptions`
      //         ),
      //         [`/filers/#${primaryFilerId}/typeOfHdhp`]: createEnumWrapper(`selfOnly`, `/typeOfHdhpOptions`),
      //         [`/filers/#${primaryFilerId}/hadOtherCoverageIneligibleForHSA`]: createEnumWrapper(
      //           `noneOfYear`,
      //           `/hadOtherCoverageIneligibleForHSAOptions`
      //         ),
      //         [`/filers/#${primaryFilerId}/hsaHdhpCoverageStatus`]: createEnumWrapper(
      //           `allYear`,
      //           `/hsaHdhpCoverageStatusOptions`
      //         ),
      //       [`/filers/#${primaryFilerId}/writableHsaNonemployerContributionsTaxYear`]: createDollarWrapper(`300.00`),
      //       });

      //       expect(
      //         givenFacts(factGraph).atPath(
      //           `${basePath}/hsa-contributions-add-contributions-made-ty+1`,
      //           primaryFilerId,
      //           task
      //         )
      //       ).toRouteNextTo(`${basePath}/hsa-contributions-summary-excess-KO`);
      //     });
      //   });
      // });
    });

    describe(`In the distributions loop when filer has distributions`, () => {
      const formId = `0b1e355e-3d19-415d-8470-fbafd9f58361`;
      const baseIncomeWithDistributions = {
        ...mfjFilerData,
        ...basePrimaryFilerHSAFacts,
        [`/someFilerHadNonW2HsaActivity`]: createBooleanWrapper(true),
        [`/writablePrimaryFilerHadNonW2HsaActivity`]: createBooleanWrapper(true),
        [`/hsaDistributions`]: { $type: `gov.irs.factgraph.persisters.CollectionWrapper`, item: { items: [formId] } },
      };

      describe(`When on the excess contributions withdrawn page`, () => {
        const fullPath = `${basePath}/hsa-distributions-excess-withdrawn`;
        it(`navigates to the box 2 screen when no excess distributions were withdrawn`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...baseIncomeWithDistributions,
            [`/hsaDistributions/#${formId}/hasWithdrawnExcessContributions`]: createBooleanWrapper(false),
          });
          expect(givenFacts(factGraph).atPath(fullPath, formId, task)).toRouteNextTo(
            `${basePath}/hsa-distributions-add-box2`
          );
        });

        it(`navigates to the to the page asking the amount of excess contributions withdrawn`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...baseIncomeWithDistributions,
            [`/hsaDistributions/#${formId}/hasWithdrawnExcessContributions`]: createBooleanWrapper(true),
          });
          expect(givenFacts(factGraph).atPath(fullPath, formId, task)).toRouteNextTo(
            `${basePath}/hsa-distributions-excess-withdrawn-amount`
          );
        });
        describe(`When on the earnings from excess contribution (box 2) page`, () => {
          it(`knocks the Primary Filer when amount is more than zero`, ({ task }) => {
            const { factGraph } = setupFactGraph({
              ...baseIncomeWithDistributions,
              [`/hsaDistributions/#${formId}/writableEarningsOnExcessContributions`]: createDollarWrapper(`1.00`),
            });
            expect(givenFacts(factGraph).atPath(`${basePath}/hsa-distributions-add-box2`, formId, task)).toRouteNextTo(
              `${basePath}/hsa-distributions-box2-ko`
            );
          });
          it(`knocks the Secondary Filer when amount is more than zero`, ({ task }) => {
            const { factGraph } = setupFactGraph({
              ...baseIncomeWithDistributions,
              ...distributionCollections,
              '/hsaDistributions': {
                $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
                item: { items: [formId, formId2] },
              },
              [`/hsaDistributions/#${formId}/writableEarningsOnExcessContributions`]: createDollarWrapper(`0.00`),
              [`/hsaDistributions/#${formId2}/writableEarningsOnExcessContributions`]: createDollarWrapper(`1.00`),
            });
            expect(givenFacts(factGraph).atPath(`${basePath}/hsa-distributions-add-box2`, formId2, task)).toRouteNextTo(
              `${basePath}/hsa-distributions-box2-ko`
            );
          });
          it(`allows the Primary Filer to proceed when amount is zero`, ({ task }) => {
            const { factGraph } = setupFactGraph({
              ...baseIncomeWithDistributions,
              [`/hsaDistributions/#${formId}/writableEarningsOnExcessContributions`]: createDollarWrapper(`0.00`),
            });
            expect(givenFacts(factGraph).atPath(`${basePath}/hsa-distributions-add-box2`, formId, task)).toRouteNextTo(
              `${basePath}/hsa-distributions-add-box3`
            );
          });
          it(`allows the Secondary Filer to proceed when amount is zero`, ({ task }) => {
            const { factGraph } = setupFactGraph({
              ...baseIncomeWithDistributions,
              ...distributionCollections,
              '/hsaDistributions': {
                $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
                item: { items: [formId, formId2] },
              },
              [`/hsaDistributions/#${formId}/writableEarningsOnExcessContributions`]: createDollarWrapper(`0.00`),
              [`/hsaDistributions/#${formId2}/writableEarningsOnExcessContributions`]: createDollarWrapper(`0.00`),
            });
            expect(givenFacts(factGraph).atPath(`${basePath}/hsa-distributions-add-box2`, formId2, task)).toRouteNextTo(
              `${basePath}/hsa-distributions-add-box3`
            );
          });
          it(`allows the Primary Filer to proceed when amount is blank`, ({ task }) => {
            const { factGraph } = setupFactGraph({
              ...baseIncomeWithDistributions,
            });
            expect(givenFacts(factGraph).atPath(`${basePath}/hsa-distributions-add-box2`, formId, task)).toRouteNextTo(
              `${basePath}/hsa-distributions-add-box3`
            );
          });
          it(`allows the Secondary Filer to proceed when amount is blank`, ({ task }) => {
            const { factGraph } = setupFactGraph({
              ...baseIncomeWithDistributions,
              '/hsaDistributions': {
                $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
                item: { items: [formId, formId2] },
              },
              [`/hsaDistributions/#${formId}/writableEarningsOnExcessContributions`]: createDollarWrapper(`0.00`),
            });
            expect(givenFacts(factGraph).atPath(`${basePath}/hsa-distributions-add-box2`, formId2, task)).toRouteNextTo(
              `${basePath}/hsa-distributions-add-box3`
            );
          });
        });
      });
      describe(`When on the fair market value on date of death (box 4) page`, () => {
        it(`knocks the Primary Filer when amount is more than zero`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...baseIncomeWithDistributions,
            [`/hsaDistributions/#${formId}/writableFmvOnDateOfDeath`]: createDollarWrapper(`1.00`),
          });
          expect(givenFacts(factGraph).atPath(`${basePath}/hsa-distributions-add-box4`, formId, task)).toRouteNextTo(
            `${basePath}/hsa-ko-fmv`
          );
        });
        it(`knocks the Secondary Filer when amount is more than zero`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...baseIncomeWithDistributions,
            [`/hsaDistributions`]: {
              $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
              item: { items: [formId, formId2] },
            },
            [`/hsaDistributions/#${formId}/writableFmvOnDateOfDeath`]: createDollarWrapper(`0.00`),
            [`/hsaDistributions/#${formId2}/writableFmvOnDateOfDeath`]: createDollarWrapper(`1.00`),
          });
          expect(givenFacts(factGraph).atPath(`${basePath}/hsa-distributions-add-box4`, formId2, task)).toRouteNextTo(
            `${basePath}/hsa-ko-fmv`
          );
        });
        it(`allows the Primary Filer to proceed when amount is zero`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...baseIncomeWithDistributions,
            [`/hsaDistributions/#${formId}/writableFmvOnDateOfDeath`]: createDollarWrapper(`0.00`),
          });
          expect(givenFacts(factGraph).atPath(`${basePath}/hsa-distributions-add-box4`, formId, task)).toRouteNextTo(
            `${basePath}/hsa-distributions-add-medical-expenses`
          );
        });
        it(`allows the Secondary Filer to proceed when amount is zero`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...baseIncomeWithDistributions,
            '/hsaDistributions': {
              $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
              item: { items: [formId, formId2] },
            },
            [`/hsaDistributions/#${formId}/writableFmvOnDateOfDeath`]: createDollarWrapper(`0.00`),
            [`/hsaDistributions/#${formId2}/writableFmvOnDateOfDeath`]: createDollarWrapper(`0.00`),
          });
          expect(givenFacts(factGraph).atPath(`${basePath}/hsa-distributions-add-box4`, formId2, task)).toRouteNextTo(
            `${basePath}/hsa-distributions-add-medical-expenses`
          );
        });
        it(`allows the Primary Filer to proceed when amount is blank`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...baseIncomeWithDistributions,
          });
          expect(givenFacts(factGraph).atPath(`${basePath}/hsa-distributions-add-box4`, formId, task)).toRouteNextTo(
            `${basePath}/hsa-distributions-add-medical-expenses`
          );
        });
        it(`allows the Secondary Filer to proceed when amount is blank`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...baseIncomeWithDistributions,
            '/hsaDistributions': {
              $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
              item: { items: [formId, formId2] },
            },
            [`/hsaDistributions/#${formId}/writableFmvOnDateOfDeath`]: createDollarWrapper(`0.00`),
          });
          expect(givenFacts(factGraph).atPath(`${basePath}/hsa-distributions-add-box4`, formId2, task)).toRouteNextTo(
            `${basePath}/hsa-distributions-add-medical-expenses`
          );
        });
      });
    });
    describe(`When on the qualified medical expenses page`, () => {
      const formId = `0b1e355e-3d19-415d-8470-fbafd9f58361`;
      const baseIncomeWithDistributions = {
        ...baseFilerData,
        ...baseHSAFactsSkipToTestingPeriod,
        '/hsaDistributions': { $type: `gov.irs.factgraph.persisters.CollectionWrapper`, item: { items: [formId] } },
      };
      it(`knocks the Primary Filer when modifiedDistribution is greater than qualifiedMedExpenses`, ({ task }) => {
        const { factGraph } = setupFactGraph({
          ...baseIncomeWithDistributions,
          [`/hsaDistributions/#${formId}/writableQualifiedMedExpenses`]: createDollarWrapper(`25.00`),
          [`/hsaDistributions/#${formId}/writableGrossDistribution`]: createDollarWrapper(`55.00`),
          [`/hsaDistributions/#${formId}/writableDistributionsRolloverAmount`]: createDollarWrapper(`10.00`),
          [`/hsaDistributions/#${formId}/hasWithdrawnExcessContributions`]: createBooleanWrapper(true),
          [`/hsaDistributions/#${formId}/writableDistributionsRolloverBool`]: createBooleanWrapper(true),
          [`/hsaDistributions/#${formId}/writableWithdrawnExcessContributionsAmount`]: createDollarWrapper(`15.00`),
        });

        expect(
          givenFacts(factGraph).atPath(`${basePath}/hsa-distributions-add-medical-expenses`, formId, task)
        ).toRouteNextTo(`${basePath}/hsa-ko-unqualified-distributions`);
      });
      it(`knocks the Secondary Filer when modifiedDistribution is larger than qualifiedMedExpenses`, ({ task }) => {
        const { factGraph } = setupFactGraph({
          ...baseIncomeWithDistributions,
          '/hsaDistributions': {
            $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
            item: { items: [formId, formId2] },
          },
          [`/hsaDistributions/#${formId2}/writableQualifiedMedExpenses`]: createDollarWrapper(`25.00`),
          [`/hsaDistributions/#${formId2}/writableGrossDistribution`]: createDollarWrapper(`55.00`),
          [`/hsaDistributions/#${formId2}/writableDistributionsRolloverAmount`]: createDollarWrapper(`10.00`),
          [`/hsaDistributions/#${formId2}/writableDistributionsRolloverBool`]: createBooleanWrapper(true),
          [`/hsaDistributions/#${formId2}/hasWithdrawnExcessContributions`]: createBooleanWrapper(true),
          [`/hsaDistributions/#${formId2}/writableWithdrawnExcessContributionsAmount`]: createDollarWrapper(`15.00`),
        });
        expect(
          givenFacts(factGraph).atPath(`${basePath}/hsa-distributions-add-medical-expenses`, formId2, task)
        ).toRouteNextTo(`${basePath}/hsa-ko-unqualified-distributions`);
      });
      it(`allows the Primary Filer to proceed when modifiedDistribution amount is equal to the qualifiedMedExpenses`, ({
        task,
      }) => {
        const { factGraph } = setupFactGraph({
          ...baseIncomeWithDistributions,
          [`/hsaDistributions/#${formId}/writableQualifiedMedExpenses`]: createDollarWrapper(`30.00`),
          [`/hsaDistributions/#${formId}/writableGrossDistribution`]: createDollarWrapper(`55.00`),
          [`/hsaDistributions/#${formId}/writableDistributionsRolloverAmount`]: createDollarWrapper(`10.00`),
          [`/hsaDistributions/#${formId}/writableDistributionsRolloverBool`]: createBooleanWrapper(true),
          [`/hsaDistributions/#${formId}/hasWithdrawnExcessContributions`]: createBooleanWrapper(true),
          [`/hsaDistributions/#${formId}/writableWithdrawnExcessContributionsAmount`]: createDollarWrapper(`15.00`),
        });
        expect(
          givenFacts(factGraph).atPath(`${basePath}/hsa-distributions-add-medical-expenses`, formId, task)
        ).toRouteNextTo(`/data-view/loop/%2FhsaDistributions/${formId}`);
      });
      it(`allows the Secondary Filer to proceed when modifiedDistribution amount is equal to the grossDistribution`, ({
        task,
      }) => {
        const { factGraph } = setupFactGraph({
          ...baseIncomeWithDistributions,
          '/hsaDistributions': {
            $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
            item: { items: [formId, formId2] },
          },
          [`/hsaDistributions/#${formId2}/writableQualifiedMedExpenses`]: createDollarWrapper(`30.00`),
          [`/hsaDistributions/#${formId2}/writableGrossDistribution`]: createDollarWrapper(`55.00`),
          [`/hsaDistributions/#${formId2}/writableDistributionsRolloverAmount`]: createDollarWrapper(`10.00`),
          [`/hsaDistributions/#${formId2}/writableDistributionsRolloverBool`]: createBooleanWrapper(true),
          [`/hsaDistributions/#${formId2}/hasWithdrawnExcessContributions`]: createBooleanWrapper(true),
          [`/hsaDistributions/#${formId2}/writableWithdrawnExcessContributionsAmount`]: createDollarWrapper(`15.00`),
        });
        expect(
          givenFacts(factGraph).atPath(`${basePath}/hsa-distributions-add-medical-expenses`, formId2, task)
        ).toRouteNextTo(`/data-view/loop/%2FhsaDistributions/${formId2}`);
      });
      it(`allows the Primary Filer to proceed when modifiedDistribution is less than the qualifiedMedExpenses`, ({
        task,
      }) => {
        const { factGraph } = setupFactGraph({
          ...baseIncomeWithDistributions,
          [`/hsaDistributions/#${formId}/writableQualifiedMedExpenses`]: createDollarWrapper(`30.00`),
          [`/hsaDistributions/#${formId}/writableGrossDistribution`]: createDollarWrapper(`54.00`),
          [`/hsaDistributions/#${formId}/writableDistributionsRolloverAmount`]: createDollarWrapper(`10.00`),
          [`/hsaDistributions/#${formId}/writableDistributionsRolloverBool`]: createBooleanWrapper(true),
          [`/hsaDistributions/#${formId}/hasWithdrawnExcessContributions`]: createBooleanWrapper(true),
          [`/hsaDistributions/#${formId}/writableWithdrawnExcessContributionsAmount`]: createDollarWrapper(`15.00`),
        });
        expect(
          givenFacts(factGraph).atPath(`${basePath}/hsa-distributions-add-medical-expenses`, formId, task)
        ).toRouteNextTo(`/data-view/loop/%2FhsaDistributions/${formId}`);
      });
      it(`allows the Secondary Filer to proceed when modifiedDistribution is less than qualifiedMedExpenses`, ({
        task,
      }) => {
        const { factGraph } = setupFactGraph({
          ...baseIncomeWithDistributions,
          '/hsaDistributions': {
            $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
            item: { items: [formId, formId2] },
          },
          [`/hsaDistributions/#${formId2}/writableQualifiedMedExpenses`]: createDollarWrapper(`30.00`),
          [`/hsaDistributions/#${formId2}/writableGrossDistribution`]: createDollarWrapper(`54.00`),
          [`/hsaDistributions/#${formId2}/writableDistributionsRolloverAmount`]: createDollarWrapper(`10.00`),
          [`/hsaDistributions/#${formId2}/writableDistributionsRolloverBool`]: createBooleanWrapper(true),
          [`/hsaDistributions/#${formId2}/hasWithdrawnExcessContributions`]: createBooleanWrapper(true),
          [`/hsaDistributions/#${formId2}/writableWithdrawnExcessContributionsAmount`]: createDollarWrapper(`15.00`),
        });
        expect(
          givenFacts(factGraph).atPath(`${basePath}/hsa-distributions-add-medical-expenses`, formId2, task)
        ).toRouteNextTo(`/data-view/loop/%2FhsaDistributions/${formId2}`);
      });
    });

    describe(`When on the testing period section`, () => {
      const testingPeriodAdditionalIncomeScreen = `${basePath}/hsa-testing-period-additional-income`;
      const testingPeriodKoScreen = `${basePath}/hsa-testing-period-income-ko`;
      const nextScreen = `${basePath}/hsa-contributions-summary-under`;
      const distributionScreen = `${basePath}/hsa-distributions-loop`;
      const anotherW2Id = `001e355e-3d19-415d-8470-fbafd9f58361`;

      const secondaryFilerW2Activity = {
        [`/formW2s/#${anotherW2Id}/filer`]: {
          $type: `gov.irs.factgraph.persisters.CollectionItemWrapper`,
          item: { id: `${spouseId}` },
        },
        [`/formW2s/#${anotherW2Id}/employerHsaContributions`]: {
          $type: `gov.irs.factgraph.persisters.DollarWrapper`,
          item: `60.00`,
        },
      };

      describe(`when both filers have non W2 activity`, () => {
        const initialFacts = {
          ...mfjIncomeWithNonW2HSAs,
        };

        it(`... if Yes, skips filer to the testing period income ko`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...initialFacts,
            [`/someFilerHadNonW2HsaActivity`]: createBooleanWrapper(true),
            // to force showing testing period
            [`/writablePrimaryFilerHadNonW2HsaActivity`]: createBooleanWrapper(false),
            // because previous page must be true for this page to be valid
            [`/someFilersMadeTestingPeriodContribution`]: createBooleanWrapper(true),
            [`/someFilersHaveTestingPeriodAdditionalIncome`]: createBooleanWrapper(true),
          });
          expect(givenFacts(factGraph).atPath(testingPeriodAdditionalIncomeScreen, null, task)).toRouteNextTo(
            testingPeriodKoScreen
          );
        });
        it(`... if No, and one of the filers has contributions, skips to contribution summary screen`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...initialFacts,
            '/formW2s': createCollectionWrapper([anotherW2Id]),
            ...secondaryFilerW2Activity,
            [`/someFilerHadNonW2HsaActivity`]: createBooleanWrapper(true),
            //to force showing testing period
            [`/writablePrimaryFilerHadNonW2HsaActivity`]: createBooleanWrapper(false),
            // because previous page must be true for this page to be valid
            [`/someFilersMadeTestingPeriodContribution`]: createBooleanWrapper(true),
            [`/someFilersHaveTestingPeriodAdditionalIncome`]: createBooleanWrapper(false),
          });
          expect(givenFacts(factGraph).atPath(testingPeriodAdditionalIncomeScreen, null, task)).toRouteNextTo(
            nextScreen
          );
        });
        it(`... if No, and none of the filers has contributions, skip to distributions screen`, ({ task }) => {
          const { factGraph } = setupFactGraph({
            ...initialFacts,
            [`/someFilerHadNonW2HsaActivity`]: createBooleanWrapper(true),
            //to force showing testing period
            [`/writablePrimaryFilerHadNonW2HsaActivity`]: createBooleanWrapper(false),
            // because previous page must be true for this page to be valid
            [`/someFilersMadeTestingPeriodContribution`]: createBooleanWrapper(true),
            [`/someFilersHaveTestingPeriodAdditionalIncome`]: createBooleanWrapper(false),
          });
          expect(givenFacts(factGraph).atPath(testingPeriodAdditionalIncomeScreen, null, task)).toRouteNextTo(
            distributionScreen
          );
        });
      });
    });
  });
});
