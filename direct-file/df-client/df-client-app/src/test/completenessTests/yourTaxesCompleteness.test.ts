import flowNodes from '../../flow/flow.js';
import { createFlowConfig } from '../../flow/flowConfig.js';
import { createDollarWrapper } from '../persistenceWrappers.js';
import { FlowSetFactInput, checkFlowSetsFacts } from './checkFlowSetsFacts.js';
import {
  filerWithPaymentDueData,
  filerWithRefundDueData,
  filerWithRefundDueDataWhoDoesNotWantToReceiveDirectDeposit,
  filerWithRefundDueDataWhoWantsToReceiveDirectDeposit,
  filerWithW2NoDeductionsNoCreditsBaseData,
  filerWithZeroBalanceData,
} from '../testData.js';

export const uuid = `959c03d1-af4a-447f-96aa-d19397048a44`;
const flow = createFlowConfig(flowNodes);

describe(`Other preferences is always completed...`, () => {
  const input: Omit<FlowSetFactInput, 'expectedStartingFactState'> = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    startingScreenRoute: flow.subcategoriesByRoute.get(`/flow/your-taxes/other-preferences`)!.screens[0].screenRoute,
    startingFactState: filerWithW2NoDeductionsNoCreditsBaseData,
    expectedCompleteFacts: [`/completedOtherPrefsSection`],
    collectionId: uuid,
    factValuesToSet: {
      // This facts cause massive branching so we dodge the branching screens.
      '/wantsCustomLanguage': [false],
    },
    leaveOptionalFieldsBlank: false,
  };
  it(`When the TP owes a massive amount of tax and will be able to make a presidential election designation`, () => {
    checkFlowSetsFacts({
      ...input,
      expectedStartingFactState: { '/totalTax': `37247.00` },
      startingFactState: {
        ...input.startingFactState,
        [`/formW2s/#${uuid}/writableWages`]: createDollarWrapper(`200000`),
      },
    });
  });
  it(`When the TP owes no tax and won't be able to make a presidential election designation`, () => {
    checkFlowSetsFacts({
      ...input,
      expectedStartingFactState: { '/totalTax': `0.00` },
      startingFactState: {
        ...input.startingFactState,
        [`/formW2s/#${uuid}/writableWages`]: createDollarWrapper(`1`),
      },
    });
  });
});

describe(`Payment method is always completed...`, () => {
  const input: Omit<FlowSetFactInput, 'expectedStartingFactState' | 'startingFactState'> = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    startingScreenRoute: flow.subcategoriesByRoute.get(`/flow/your-taxes/payment-method`)!.screens[0].screenRoute,
    expectedCompleteFacts: [`/paymentSectionComplete`],
    collectionId: uuid,
    factValuesToSet: {},
    leaveOptionalFieldsBlank: false,
  };
  it(`When the TP owes tax`, () => {
    checkFlowSetsFacts({
      ...input,
      expectedStartingFactState: { '/totalTax': `37247.00`, '/owesBalance': `true` },
      startingFactState: filerWithPaymentDueData,
    });
  });
  it(`When the TP is owed a refund`, () => {
    checkFlowSetsFacts({
      ...input,
      expectedStartingFactState: { '/totalTax': `37247.00`, '/dueRefund': `true` },
      startingFactState: filerWithRefundDueData,
    });
  });
  it(`When the TP has zero balance`, () => {
    checkFlowSetsFacts({
      ...input,
      expectedStartingFactState: { '/totalTax': `37247.00`, '/zeroBalance': `true` },
      startingFactState: filerWithZeroBalanceData,
    });
  });
});

describe(`Refund Disbursement Code is always set...`, () => {
  const input: Omit<FlowSetFactInput, 'expectedStartingFactState' | 'startingFactState'> = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    startingScreenRoute: flow.subcategoriesByRoute.get(`/flow/your-taxes/payment-method`)!.screens[0].screenRoute,
    expectedCompleteFacts: [`/paymentSectionComplete`],
    collectionId: uuid,
    factValuesToSet: {},
    leaveOptionalFieldsBlank: false,
  };
  it(`When the TP owes tax`, () => {
    checkFlowSetsFacts({
      ...input,
      expectedStartingFactState: { '/totalTax': `37247.00`, '/owesBalance': `true`, '/xmlRefundDisbursementCd': `0` },
      startingFactState: filerWithPaymentDueData,
    });
  });
  it(`When the TP has zero balance`, () => {
    checkFlowSetsFacts({
      ...input,
      expectedStartingFactState: { '/totalTax': `37247.00`, '/zeroBalance': `true`, '/xmlRefundDisbursementCd': `0` },
      startingFactState: filerWithZeroBalanceData,
    });
  });
  it(`When the TP is owed a refund and wants to receive direct deposit`, () => {
    checkFlowSetsFacts({
      ...input,
      expectedStartingFactState: { '/totalTax': `37247.00`, '/dueRefund': `true`, '/xmlRefundDisbursementCd': `2` },
      startingFactState: filerWithRefundDueDataWhoWantsToReceiveDirectDeposit,
    });
  });
  it(`When the TP is owed a refund and does not want to receive direct deposit`, () => {
    checkFlowSetsFacts({
      ...input,
      expectedStartingFactState: { '/totalTax': `37247.00`, '/dueRefund': `true`, '/xmlRefundDisbursementCd': `3` },
      startingFactState: filerWithRefundDueDataWhoDoesNotWantToReceiveDirectDeposit,
    });
  });
});
