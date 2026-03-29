import {
  createBooleanWrapper,
  createDollarWrapper,
  createEnumWrapper,
  createCollectionWrapper,
  createDayWrapper,
  createStringWrapper,
  createTinWrapper,
  createCollectionItemWrapper,
  createPinWrapper,
  createEinWrapper,
  PersistenceWrapper,
  createAddressWrapper,
} from './persistenceWrappers.js';
import { wrappedFacts } from '../fact-dictionary/generated/wrappedFacts.js';
import { Path } from '../flow/Path.js';
import { AbsolutePath } from '../fact-dictionary/Path.js';
import { CURRENT_TAX_YEAR } from '../constants/taxConstants.js';
import { setupFactGraph } from './setupFactGraph.js';
import { ConcretePath } from '@irs/js-factgraph-scala';
const CURRENT_TAX_YEAR_AS_NUMBER = Number.parseInt(CURRENT_TAX_YEAR);

export const uuid = `959c03d1-af4a-447f-96aa-d19397048a44`;
export const uuid2 = `959c03d1-af4a-447f-96aa-d19397048a45`;
export const spouseId = `859c03d1-af4a-447f-96aa-d19397048a48`;
export const primaryFilerId = uuid;
export const baseDependentId = `5d2b908c-29cf-4c16-9f1d-1cea87cb7603`;

export const baseFilerData = {
  // Prefill all collections with empty arrays; these are expected to be overriden downstream as needed
  // We have to do this manually because `setupFactGraph` won't initialize the collections if there are any
  // facts provided during initialization.
  ...Object.fromEntries(
    wrappedFacts
      .filter((f) => f.writable?.typeName === `Collection`)
      .map((fact) => [fact.path, createCollectionWrapper([])])
  ),
  // Actual data
  [`/filers/#${primaryFilerId}/firstName`]: createStringWrapper(`Test`),
  [`/filers/#${primaryFilerId}/isBlind`]: createBooleanWrapper(false),
  [`/filers/#${primaryFilerId}/isDisabled`]: createBooleanWrapper(false),
  [`/filers/#${primaryFilerId}/isStudent`]: createBooleanWrapper(false),
  [`/filers/#${primaryFilerId}/writableMiddleInitial`]: createStringWrapper(`E`),
  [`/filers/#${primaryFilerId}/tin`]: createTinWrapper({ area: `555`, group: `55`, serial: `5555` }),
  [`/primaryFilerSsnEmploymentValidity`]: createEnumWrapper(`neither`, `/primaryFilerSsnEmploymentValidityOptions`),
  [`/filers/#${primaryFilerId}/lastName`]: createStringWrapper(`Testerson`),
  [`/filers/#${primaryFilerId}/occupation`]: createStringWrapper(`cat`),
  [`/filers/#${primaryFilerId}/isUsCitizenFullYear`]: createBooleanWrapper(true),
  [`/filers/#${primaryFilerId}/dateOfBirth`]: createDayWrapper(`0001-01-01`),
  [`/primaryFilerW2And1099IntInScopedState`]: createEnumWrapper(`onlySame`, `/primaryFilerW2And1099IntStateOptions`),
  [`/receivedAlaskaPfd`]: createBooleanWrapper(false),
  '/email': {
    $type: `gov.irs.factgraph.persisters.EmailAddressWrapper`,
    item: { email: `user.0000@example.com` },
  },

  '/phone': {
    $type: `gov.irs.factgraph.persisters.E164Wrapper`,
    item: {
      $type: `gov.irs.factgraph.types.UsPhoneNumber`,
      areaCode: `444`,
      officeCode: `555`,
      lineNumber: `0100`,
    },
  },
  '/familyAndHousehold': { $type: `gov.irs.factgraph.persisters.CollectionWrapper`, item: { items: [] } },
  [`/filers/#${primaryFilerId}/isPrimaryFiler`]: createBooleanWrapper(true),
  [`/filers/#${spouseId}/isPrimaryFiler`]: createBooleanWrapper(false),
  '/address': {
    $type: `gov.irs.factgraph.persisters.AddressWrapper`,
    item: { streetAddress: `111 Addy`, city: `Washington`, postalCode: `20001`, stateOrProvence: `DC` },
  },
  '/filers': createCollectionWrapper([primaryFilerId, spouseId]),
  [`/filingStatus`]: createEnumWrapper(`single`, `/filingStatusOptions`),
  [`/wasK12Educators`]: createEnumWrapper(`neither`, `/k12EducatorOptions`),
  [`/hasForeignAccounts`]: createBooleanWrapper(false),
  [`/isForeignTrustsGrantor`]: createBooleanWrapper(false),
  [`/hasForeignTrustsTransactions`]: createBooleanWrapper(false),
  [`/hasCdccCarryoverAmountFromPriorTaxYear`]: createBooleanWrapper(false),
  [`/flowKnockoutHouseholdEmployee`]: createBooleanWrapper(false),
  [`/incomeSourcesSupported`]: createBooleanWrapper(true),
  [`/receivedDigitalAssets`]: createBooleanWrapper(false),
  [`/disposedDigitalAssets`]: createBooleanWrapper(false),
  [`/madeIraContributions`]: createBooleanWrapper(false),
};

export const singleFilerData = {
  [`/maritalStatus`]: createEnumWrapper(`single`, `/maritalStatusOptions`),
  [`/filingStatus`]: createEnumWrapper(`single`, `/filingStatusOptions`),
  [`/filers/#${primaryFilerId}/isBlind`]: createBooleanWrapper(false),
  [`/filers/#${primaryFilerId}/isDisabled`]: createBooleanWrapper(false),
  [`/filers/#${primaryFilerId}/isStudent`]: createBooleanWrapper(false),
  [`/filers/#${primaryFilerId}/dateOfBirth`]: createDayWrapper(`1987-06-06`),
  [`/filers/#${primaryFilerId}/isPrimaryFiler`]: createBooleanWrapper(true),
  [`/filers/#${spouseId}/isPrimaryFiler`]: createBooleanWrapper(false),
  '/filers': createCollectionWrapper([primaryFilerId, spouseId]),
  [`/hasCdccCarryoverAmountFromPriorTaxYear`]: createBooleanWrapper(false),
  [`/flowKnockoutHouseholdEmployee`]: createBooleanWrapper(false),
};

export const marriedFilerData = {
  [`/maritalStatus`]: createEnumWrapper(`married`, `/maritalStatusOptions`),
  [`/filers/#${primaryFilerId}/isBlind`]: createBooleanWrapper(false),
  [`/filers/#${primaryFilerId}/isDisabled`]: createBooleanWrapper(false),
  [`/filers/#${primaryFilerId}/isStudent`]: createBooleanWrapper(false),
  [`/filers/#${primaryFilerId}/dateOfBirth`]: createDayWrapper(`1987-06-06`),
  [`/filers/#${primaryFilerId}/isPrimaryFiler`]: createBooleanWrapper(true),
  [`/filers/#${spouseId}/firstName`]: createStringWrapper(`Testiest`),
  [`/filers/#${spouseId}/lastName`]: createStringWrapper(`Testerson`),
  [`/filers/#${spouseId}/occupation`]: createStringWrapper(`dog`),
  [`/filers/#${spouseId}/isPrimaryFiler`]: createBooleanWrapper(false),
  [`/filers/#${spouseId}/dateOfBirth`]: createDayWrapper(`1987-06-06`),
  [`/filers/#${spouseId}/isBlind`]: createBooleanWrapper(false),
  [`/filers/#${spouseId}/isDisabled`]: createBooleanWrapper(false),
  [`/filers/#${spouseId}/isStudent`]: createBooleanWrapper(false),
  [`/filers/#${spouseId}/isUsCitizenFullYear`]: createBooleanWrapper(true),
  [`/filers/#${spouseId}/tin`]: createTinWrapper({ area: `111`, group: `11`, serial: `1111` }),
  '/filers': createCollectionWrapper([primaryFilerId, spouseId]),
  [`/hasCdccCarryoverAmountFromPriorTaxYear`]: createBooleanWrapper(false),
  [`/flowKnockoutHouseholdEmployee`]: createBooleanWrapper(false),
};

export const mfjFilerData = {
  ...marriedFilerData,
  [`/filingStatus`]: createEnumWrapper(`marriedFilingJointly`, `/filingStatusOptions`),
};

export const mfsFilerData = {
  ...marriedFilerData,
  [`/filingStatus`]: createEnumWrapper(`marriedFilingSeparately`, `/filingStatusOptions`),
};

export const singleWithMfsEditCondition = {
  ...mfsFilerData,
  // Change the filing status back to single
  [`/filingStatus`]: createEnumWrapper(`single`, `/filingStatusOptions`),
  [`/maritalStatus`]: createEnumWrapper(`single`, `/maritalStatusOptions`),
};

/** Biological child dependent */
export const baseDependentData = {
  // Prefill all collections with empty arrays; these are expected to be overriden downstream as needed
  // We have to do this manually because `setupFactGraph` won't initialize the collections if there are any
  // facts provided during initialization.
  ...Object.fromEntries(
    wrappedFacts
      .filter((f) => f.writable?.typeName === `Collection`)
      .map((fact) => [fact.path, createCollectionWrapper([])])
  ),
  [`/familyAndHousehold/#${baseDependentId}/firstName`]: {
    $type: `gov.irs.factgraph.persisters.StringWrapper`,
    item: `Testy`,
  },
  [`/familyAndHousehold/#${baseDependentId}/writableMiddleInitial`]: {
    $type: `gov.irs.factgraph.persisters.StringWrapper`,
    item: `T`,
  },

  [`/familyAndHousehold/#${baseDependentId}/dateOfBirth`]: {
    $type: `gov.irs.factgraph.persisters.DayWrapper`,
    item: { date: `2018-01-01` },
  },
  [`/familyAndHousehold/#${baseDependentId}/relationshipCategory`]: createEnumWrapper(
    `childOrDescendants`,
    `/relationshipCategoryOptions`
  ),
  [`/familyAndHousehold/#${baseDependentId}/childRelationship`]: createEnumWrapper(
    `biologicalChild`,
    `/childRelationshipOptions`
  ),
  [`/familyAndHousehold/#${baseDependentId}/deceased`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  [`/flowKnockoutHouseholdEmployee`]: createBooleanWrapper(false),
  [`/hasCdccCarryoverAmountFromPriorTaxYear`]: createBooleanWrapper(false),
};

/* Primary filer head of household with one dependent*/
export const dependentTestData = {
  ...baseDependentData,
  [`/hohQualifyingPerson`]: {
    $type: `gov.irs.factgraph.persisters.CollectionItemWrapper`,
    item: { id: baseDependentId },
  },
  [`/filers/#${primaryFilerId}/dateOfBirth`]: {
    $type: `gov.irs.factgraph.persisters.DayWrapper`,
    item: { date: `1990-01-01` },
  },
  [`/filers/#${primaryFilerId}/lastName`]: {
    $type: `gov.irs.factgraph.persisters.StringWrapper`,
    item: `Testofferson`,
  },
  [`/familyAndHousehold/#${baseDependentId}/hasOtherBiologicalOrAdoptiveParent`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  [`/writableCdccHasQualifyingExpenses`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  [`/filers/#${primaryFilerId}/hasIpPin`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  [`/filers/#${primaryFilerId}/isUsCitizenFullYear`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  [`/familyAndHousehold/#${baseDependentId}/hasIpPin`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/phone': {
    $type: `gov.irs.factgraph.persisters.E164Wrapper`,
    item: {
      $type: `gov.irs.factgraph.types.UsPhoneNumber`,
      areaCode: `422`,
      officeCode: `244`,
      lineNumber: `4444`,
    },
  },
  '/maritalStatus': {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: { value: [`single`], enumOptionsPath: `/maritalStatusOptions` },
  },
  [`/familyAndHousehold/#${baseDependentId}/residencyDuration`]: {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: { value: [`allYear`], enumOptionsPath: `/residencyDurationOptions` },
  },
  [`/filers/#${primaryFilerId}/tin`]: {
    $type: `gov.irs.factgraph.persisters.TinWrapper`,
    item: { area: `344`, group: `44`, serial: `4444` },
  },
  [`/filers/#${primaryFilerId}/canBeClaimed`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/primaryFilerW2And1099IntInScopedState': {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: { value: [`onlySame`], enumOptionsPath: `/primaryFilerW2And1099IntStateOptions` },
  },
  '/filerResidenceAndIncomeState': {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: { value: [`al`], enumOptionsPath: `/scopedStateOptions` },
  },
  [`/familyAndHousehold/#${baseDependentId}/tin`]: {
    $type: `gov.irs.factgraph.persisters.TinWrapper`,
    item: { area: `333`, group: `33`, serial: `3333` },
  },
  [`/filers/#${primaryFilerId}/isBlind`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  [`/filers/#${primaryFilerId}/isDisabled`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  [`/filers/#${primaryFilerId}/isStudent`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  [`/filers/#${primaryFilerId}/occupation`]: {
    $type: `gov.irs.factgraph.persisters.StringWrapper`,
    item: `Tester`,
  },
  [`/familyAndHousehold/#${baseDependentId}/ssnEmploymentValidity`]: {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: { value: [`neither`], enumOptionsPath: `/ssnEmploymentValidityOptions` },
  },
  [`/familyAndHousehold/#${baseDependentId}/isUsCitizenFullYear`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  '/flowHasSeenSpouse': { $type: `gov.irs.factgraph.persisters.BooleanWrapper`, item: true },
  [`/familyAndHousehold/#${baseDependentId}/monthsLivedWithTPInUS`]: createEnumWrapper(
    `seven`,
    `/monthsLivedWithTPInUSOptions`
  ),
  [`/familyAndHousehold/#${baseDependentId}/ownSupport`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  [`/filers/#${primaryFilerId}/firstName`]: {
    $type: `gov.irs.factgraph.persisters.StringWrapper`,
    item: `Test`,
  },
  '/familyAndHousehold': {
    $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
    item: { items: [`${baseDependentId}`] },
  },
  [`/familyAndHousehold/#${baseDependentId}/married`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/email': {
    $type: `gov.irs.factgraph.persisters.EmailAddressWrapper`,
    item: { email: `user.0000@example.com` },
  },
  [`/familyAndHousehold/#${baseDependentId}/tpPaidMostOfHomeUpkeep`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  '/address': {
    $type: `gov.irs.factgraph.persisters.AddressWrapper`,
    item: {
      streetAddress: `Test`,
      city: `Test`,
      postalCode: `12345`,
      stateOrProvence: `AK`,
      country: ``,
    },
  },
  '/filers': createCollectionWrapper([primaryFilerId, spouseId]),
  [`/filers/#${primaryFilerId}/isPrimaryFiler`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  [`/filers/#${spouseId}/isSecondaryFiler`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  [`/familyAndHousehold/#${baseDependentId}/tinType`]: {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: { value: [`ssn`], enumOptionsPath: `/tinTypeOptions` },
  },
  '/socialSecurityReportsIsDone': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  '/form1099Gs': {
    $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
    item: { items: [] },
  },
  '/hasForeignAccounts': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  [`/isForeignTrustsGrantor`]: createBooleanWrapper(false),
  [`/hasForeignTrustsTransactions`]: createBooleanWrapper(false),
  [`/wasK12Educators`]: createEnumWrapper(`neither`, `/k12EducatorOptions`),
  [`/hadStudentLoanInterestPayments`]: createBooleanWrapper(false),
  [`/paidEstimatedTaxesOrFromLastYear`]: createBooleanWrapper(false),
};

export const dependentWhoIsNotEligibleButMayQualifyForTaxBenefitsTestData = {
  [`/hasCdccCarryoverAmountFromPriorTaxYear`]: createBooleanWrapper(false),
  [`/flowKnockoutHouseholdEmployee`]: createBooleanWrapper(false),
  [`/filers/#${primaryFilerId}/lastName`]: {
    $type: `gov.irs.factgraph.persisters.StringWrapper`,
    item: `adfs`,
  },
  '/maritalStatus': {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: {
      value: [`widowed`],
      enumOptionsPath: `/maritalStatusOptions`,
    },
  },
  [`/writableCdccHasQualifyingExpenses`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  [`/familyAndHousehold/#${baseDependentId}/tpPaidMostOfHomeUpkeep`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  [`/familyAndHousehold/#${baseDependentId}/monthsLivedWithTPInUS`]: {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: {
      value: [`seven`],
      enumOptionsPath: `/monthsLivedWithTPInUSOptions`,
    },
  },
  [`/familyAndHousehold/#${baseDependentId}/firstName`]: {
    $type: `gov.irs.factgraph.persisters.StringWrapper`,
    item: `Child`,
  },
  [`/familyAndHousehold/#${baseDependentId}/residencyDuration`]: {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: {
      value: [`allYear`],
      enumOptionsPath: `/residencyDurationOptions`,
    },
  },
  '/address': {
    $type: `gov.irs.factgraph.persisters.AddressWrapper`,
    item: {
      streetAddress: `234`,
      city: `fads`,
      postalCode: `12432`,
      stateOrProvence: `AZ`,
      country: ``,
    },
  },
  [`/familyAndHousehold/#${baseDependentId}/lastName`]: {
    $type: `gov.irs.factgraph.persisters.StringWrapper`,
    item: `dfsa`,
  },
  '/filerResidenceAndIncomeState': {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: {
      value: [`az`],
      enumOptionsPath: `/scopedStateOptions`,
    },
  },
  '/phone': {
    $type: `gov.irs.factgraph.persisters.E164Wrapper`,
    item: {
      $type: `gov.irs.factgraph.types.UsPhoneNumber`,
      areaCode: `212`,
      officeCode: `987`,
      lineNumber: `3429`,
    },
  },
  [`/filers/#${primaryFilerId}/tin`]: {
    $type: `gov.irs.factgraph.persisters.TinWrapper`,
    item: {
      area: `342`,
      group: `78`,
      serial: `3927`,
    },
  },
  '/familyAndHouseholdIsDone': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  [`/familyAndHousehold/#${baseDependentId}/married`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  [`/familyAndHousehold/#${baseDependentId}/ownSupport`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  [`/filers/#${spouseId}/isPrimaryFiler`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  [`/filers/#${primaryFilerId}/canBeClaimed`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  [`/familyAndHousehold/#${baseDependentId}/inParentsCustody`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  [`/filers/#${primaryFilerId}/writableMiddleInitial`]: {
    $type: `gov.irs.factgraph.persisters.StringWrapper`,
    item: `d`,
  },
  [`/familyAndHousehold/#${baseDependentId}/dateOfBirth`]: {
    $type: `gov.irs.factgraph.persisters.DayWrapper`,
    item: {
      date: `2020-01-10`,
    },
  },
  [`/familyAndHousehold/#${baseDependentId}/livedWithTpOrOtherBiologicalOrAdoptiveParentMoreThanSixMonths`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  [`/familyAndHousehold/#${baseDependentId}/parentalSituation`]: {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: {
      value: [`livedApartLastSixMonths`],
      enumOptionsPath: `/parentalSituationOptions`,
    },
  },
  [`/filers/#${primaryFilerId}/potentialClaimerMustFile`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  [`/familyAndHousehold/#${baseDependentId}/ssnEmploymentValidity`]: {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: {
      value: [`neither`],
      enumOptionsPath: `/familyAndHouseholdSsnEmploymentValidityOptions`,
    },
  },
  '/filers': {
    $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
    item: {
      items: [primaryFilerId, spouseId],
    },
  },
  [`/filers/#${primaryFilerId}/isPrimaryFiler`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  [`/familyAndHousehold/#${baseDependentId}/tinType`]: {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: {
      value: [`ssn`],
      enumOptionsPath: `/tinTypeOptions`,
    },
  },
  [`/familyAndHousehold/#${baseDependentId}/nightsWithTpVsOtherParent`]: {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: {
      value: [`more`],
      enumOptionsPath: `/moreLessEqualOptions`,
    },
  },
  [`/filers/#${primaryFilerId}/dateOfBirth`]: {
    $type: `gov.irs.factgraph.persisters.DayWrapper`,
    item: {
      date: `1990-01-01`,
    },
  },
  '/familyAndHousehold': {
    $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
    item: {
      items: [baseDependentId],
    },
  },
  [`/familyAndHousehold/#${baseDependentId}/relationshipCategory`]: {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: {
      value: [`childOrDescendants`],
      enumOptionsPath: `/relationshipCategoryOptions`,
    },
  },
  [`/familyAndHousehold/#${baseDependentId}/whichParentNotClaiming`]: {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: {
      value: [`iDid`],
      enumOptionsPath: `/writtenDeclarationOptions`,
    },
  },
  [`/familyAndHousehold/#${baseDependentId}/writableMiddleInitial`]: {
    $type: `gov.irs.factgraph.persisters.StringWrapper`,
    item: `a`,
  },
  [`/familyAndHousehold/#${baseDependentId}/hasOtherBiologicalOrAdoptiveParent`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  [`/familyAndHousehold/#${baseDependentId}/isUsCitizenFullYear`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  [`/filers/#${primaryFilerId}/occupation`]: {
    $type: `gov.irs.factgraph.persisters.StringWrapper`,
    item: `tester`,
  },
  [`/familyAndHousehold/#${baseDependentId}/parentalSupport`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  [`/filers/#${primaryFilerId}/isUsCitizenFullYear`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  '/yearOfSpouseDeath': {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: {
      value: [`taxYearMinusOne`],
      enumOptionsPath: `/yearOfSpouseDeathOptions`,
    },
  },
  [`/familyAndHousehold/#${baseDependentId}/deceased`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  [`/filers/#${primaryFilerId}/isBlind`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  [`/filers/#${primaryFilerId}/isDisabled`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  [`/filers/#${primaryFilerId}/isStudent`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/canFileJointlyYearOfSpouseDeath': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  [`/familyAndHousehold/#${baseDependentId}/childRelationship`]: {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: {
      value: [`adoptedChild`],
      enumOptionsPath: `/childRelationshipOptions`,
    },
  },
  [`/filers/#${primaryFilerId}/firstName`]: {
    $type: `gov.irs.factgraph.persisters.StringWrapper`,
    item: `Alice`,
  },
  [`/filers/#${primaryFilerId}/hasIpPin`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/email': {
    $type: `gov.irs.factgraph.persisters.EmailAddressWrapper`,
    item: {
      email: `user.0000@example.com`,
    },
  },
  '/primaryFilerW2And1099IntInScopedState': {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: {
      value: [`onlySame`],
      enumOptionsPath: `/primaryFilerW2And1099IntStateOptions`,
    },
  },
};

export const dependentWhoDoesNotQualifyForTaxBenefitsTestdata = {
  [`/hasCdccCarryoverAmountFromPriorTaxYear`]: createBooleanWrapper(false),
  [`/flowKnockoutHouseholdEmployee`]: createBooleanWrapper(false),
  '/filerResidenceAndIncomeState': {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: { value: [`al`], enumOptionsPath: `/scopedStateOptions` },
  },
  [`/hohQualifyingPerson`]: {
    $type: `gov.irs.factgraph.persisters.CollectionItemWrapper`,
    item: { id: uuid },
  },
  [`/familyAndHousehold/#${baseDependentId}/tin`]: {
    $type: `gov.irs.factgraph.persisters.TinWrapper`,
    item: { area: `333`, group: `33`, serial: `3333` },
  },
  [`/filers/#${primaryFilerId}/dateOfBirth`]: {
    $type: `gov.irs.factgraph.persisters.DayWrapper`,
    item: { date: `2000-01-11` },
  },
  '/interestReports': {
    $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
    item: { items: [] },
  },
  '/disposedDigitalAssets': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  [`/familyAndHousehold/#${baseDependentId}/tpPaidMostOfHomeUpkeep`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  [`/familyAndHousehold/#${baseDependentId}/writableQrSupportTest`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  [`/familyAndHousehold/#${baseDependentId}/monthsLivedWithTPInUS`]: createEnumWrapper(
    `seven`,
    `/monthsLivedWithTPInUSOptions`
  ),
  '/email': {
    $type: `gov.irs.factgraph.persisters.EmailAddressWrapper`,
    item: { email: `user.0000@example.com` },
  },
  [`/familyAndHousehold/#${baseDependentId}/ssnEmploymentValidity`]: {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: {
      value: [`neither`],
      enumOptionsPath: `/ssnEmploymentValidityOptions`,
    },
  },
  [`/familyAndHousehold/#${baseDependentId}/married`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  [`/familyAndHousehold/#${baseDependentId}/writableRequiredToFile`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  [`/filers/#${primaryFilerId}/firstName`]: {
    $type: `gov.irs.factgraph.persisters.StringWrapper`,
    item: `Test`,
  },
  [`/familyAndHousehold/#${baseDependentId}/permanentTotalDisability`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/primaryFilerW2And1099IntInScopedState': {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: { value: [`onlySame`], enumOptionsPath: `/primaryFilerW2And1099IntStateOptions` },
  },
  [`/filers/#${primaryFilerId}/tin`]: {
    $type: `gov.irs.factgraph.persisters.TinWrapper`,
    item: { area: `333`, group: `33`, serial: `3333` },
  },
  '/incomeSourcesSupported': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  [`/familyAndHousehold/#${baseDependentId}/ownSupport`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/wasK12Educators': {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: { value: [`neither`], enumOptionsPath: `/k12EducatorOptions` },
  },
  [`/familyAndHousehold/#${baseDependentId}/writableMiddleInitial`]: {
    $type: `gov.irs.factgraph.persisters.StringWrapper`,
    item: `D`,
  },
  [`/familyAndHousehold/#${baseDependentId}/tpClaims`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  [`/familyAndHousehold/#${baseDependentId}/residencyDuration`]: {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: {
      value: [`sixToElevenMonths`],
      enumOptionsPath: `/residencyDurationOptions`,
    },
  },
  [`/familyAndHousehold/#${baseDependentId}/firstName`]: {
    $type: `gov.irs.factgraph.persisters.StringWrapper`,
    item: `TESTY`,
  },
  [`/familyAndHousehold/#${baseDependentId}/relationshipCategory`]: createEnumWrapper(
    `childOrDescendants`,
    `/relationshipCategoryOptions`
  ),
  [`/familyAndHousehold/#${baseDependentId}/childRelationship`]: createEnumWrapper(
    `biologicalChild`,
    `/childRelationshipOptions`
  ),
  [`/familyAndHousehold/#${baseDependentId}/lastName`]: {
    $type: `gov.irs.factgraph.persisters.StringWrapper`,
    item: `Does NOT qualify`,
  },
  [`/familyAndHousehold/#${baseDependentId}/deceased`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/socialSecurityReports': {
    $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
    item: { items: [] },
  },
  [`/filers/#${primaryFilerId}/isUsCitizenFullYear`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  '/formW2s': {
    $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
    item: { items: [] },
  },
  [`/filers/#${primaryFilerId}/isPrimaryFiler`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  [`/familyAndHousehold/#${baseDependentId}/dateOfBirth`]: {
    $type: `gov.irs.factgraph.persisters.DayWrapper`,
    item: { date: `1976-01-01` },
  },
  '/flowHasSeenDeductions': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  '/socialSecurityReportsIsDone': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  '/phone': {
    $type: `gov.irs.factgraph.persisters.E164Wrapper`,
    item: {
      $type: `gov.irs.factgraph.types.UsPhoneNumber`,
      areaCode: `333`,
      officeCode: `333`,
      lineNumber: `3333`,
    },
  },
  [`/familyAndHousehold/#${baseDependentId}/writableJointReturn`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  '/flowHasSeenSpouse': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  [`/filers/#${primaryFilerId}/isBlind`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  [`/filers/#${primaryFilerId}/isDisabled`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  [`/filers/#${primaryFilerId}/isStudent`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  [`/filers/#${primaryFilerId}/occupation`]: {
    $type: `gov.irs.factgraph.persisters.StringWrapper`,
    item: `TESTER`,
  },
  '/receivedDigitalAssets': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/familyAndHousehold': {
    $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
    item: { items: [`${baseDependentId}`] },
  },
  '/form1099Gs': {
    $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
    item: { items: [] },
  },
  '/form1099Rs': {
    $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
    item: { items: [] },
  },
  '/hasCompleted1099RSection': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  '/cdccCareProviders': {
    $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
    item: { items: [] },
  },
  '/cdccCareProvidersIsDone': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  [`/filers/#${primaryFilerId}/hasIpPin`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/interestReportsIsDone': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  '/maritalStatus': {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: { value: [`single`], enumOptionsPath: `/maritalStatusOptions` },
  },
  [`/familyAndHousehold/#${baseDependentId}/tinType`]: {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: { value: [`ssn`], enumOptionsPath: `/tinTypeOptions` },
  },
  [`/familyAndHousehold/#${baseDependentId}/fullTimeStudent`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/flowHasSeenCredits': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  '/formW2sIsDone': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  [`/filers/#${primaryFilerId}/lastName`]: {
    $type: `gov.irs.factgraph.persisters.StringWrapper`,
    item: `Dependents`,
  },
  '/address': {
    $type: `gov.irs.factgraph.persisters.AddressWrapper`,
    item: {
      streetAddress: `TEST`,
      city: `TEST`,
      postalCode: `12345`,
      stateOrProvence: `AZ`,
      country: ``,
    },
  },
  '/filingStatus': {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: {
      value: [`headOfHousehold`],
      enumOptionsPath: `/filingStatusOptions`,
    },
  },
  '/filers': {
    $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
    item: { items: [`${primaryFilerId}`] },
  },
  '/familyAndHouseholdIsDone': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  '/form1099GsIsDone': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  [`/familyAndHousehold/#${baseDependentId}/hasOtherBiologicalOrAdoptiveParent`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  [`/familyAndHousehold/#${baseDependentId}/grossIncomeTest`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  [`/familyAndHousehold/#${baseDependentId}/isUsCitizenFullYear`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  [`/familyAndHousehold/#${baseDependentId}/writableFilingOnlyForRefund`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  [`/filers/#${primaryFilerId}/canBeClaimed`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/hadStudentLoanInterestPayments': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
};

export const filerWithW2NoDeductionsNoCreditsBaseData = {
  // This should be the minimal data, when combined with wage information, to get a complete `/totalTax` amount
  [`/hasCdccCarryoverAmountFromPriorTaxYear`]: createBooleanWrapper(false),
  [`/flowKnockoutHouseholdEmployee`]: createBooleanWrapper(false),
  '/formW2s': { $type: `gov.irs.factgraph.persisters.CollectionWrapper`, item: { items: [uuid] } },
  [Path.concretePath(`/formW2s/*/filer`, uuid)]: createCollectionItemWrapper(uuid),
  '/socialSecurityReports': { $type: `gov.irs.factgraph.persisters.CollectionWrapper`, item: { items: [] } },
  '/form1099Gs': { $type: `gov.irs.factgraph.persisters.CollectionWrapper`, item: { items: [] } },
  '/form1099Rs': { $type: `gov.irs.factgraph.persisters.CollectionWrapper`, item: { items: [] } },
  '/cdccCareProviders': { $type: `gov.irs.factgraph.persisters.CollectionWrapper`, item: { items: [] } },
  // '/hasCompleted1099RSection': {
  //   $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
  //   item: true,
  // },
  // '/cdccCareProvidersIsDone': {
  //   $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
  //   item: true,
  // },
  '/interestReports': { $type: `gov.irs.factgraph.persisters.CollectionWrapper`, item: { items: [] } },
  '/filers': { $type: `gov.irs.factgraph.persisters.CollectionWrapper`, item: { items: [primaryFilerId, spouseId] } },
  '/familyAndHousehold': { $type: `gov.irs.factgraph.persisters.CollectionWrapper`, item: { items: [] } },
  [`/filers/#${primaryFilerId}/isPrimaryFiler`]: createBooleanWrapper(true),
  [`/filers/#${spouseId}/isPrimaryFiler`]: createBooleanWrapper(false),
  [`/filers/#${primaryFilerId}/dateOfBirth`]: createDayWrapper(`1987-01-01`),
  [`/filers/#${primaryFilerId}/isBlind`]: createBooleanWrapper(false),
  [`/filers/#${primaryFilerId}/isDisabled`]: createBooleanWrapper(false),
  [`/filers/#${primaryFilerId}/isStudent`]: createBooleanWrapper(false),
  [`/filers/#${primaryFilerId}/firstName`]: createStringWrapper(`Test`),
  [`/filers/#${primaryFilerId}/writableMiddleInitial`]: createStringWrapper(`Test`),
  [`/filers/#${primaryFilerId}/lastName`]: createStringWrapper(`Test`),
  [`/filers/#${primaryFilerId}/tin`]: createTinWrapper({ area: `555`, group: `55`, serial: `5555` }),
  [`/filers/#${primaryFilerId}/canBeClaimed`]: createBooleanWrapper(false),
  [`/filingStatus`]: createEnumWrapper(`single`, `/filingStatusOptions`),
  [`/wasK12Educators`]: createEnumWrapper(`neither`, `/k12EducatorOptions`),
  [`/hadStudentLoanInterestPayments`]: createBooleanWrapper(false),
  [`/paidEstimatedTaxesOrFromLastYear`]: createBooleanWrapper(false),
  [`/hasForeignAccounts`]: createBooleanWrapper(false),
  [`/isForeignTrustsGrantor`]: createBooleanWrapper(false),
  [`/hasForeignTrustsTransactions`]: createBooleanWrapper(false),
  [`/selfSelectPin`]: createPinWrapper(`12349`),
};

export const filerWithZeroBalanceData = {
  ...filerWithW2NoDeductionsNoCreditsBaseData,
  [`/formW2s/#${uuid}/writableWages`]: createDollarWrapper(`200000`),
  [`/formW2s/#${uuid}/writableFederalWithholding`]: createDollarWrapper(`37247`),
};

export const filerWithRefundDueData = {
  ...filerWithW2NoDeductionsNoCreditsBaseData,
  [`/formW2s/#${uuid}/writableWages`]: createDollarWrapper(`200000`),
  [`/formW2s/#${uuid}/writableFederalWithholding`]: createDollarWrapper(`40000`),
};

export const filerWithRefundDueDataWhoWantsToReceiveDirectDeposit = {
  ...filerWithRefundDueData,
  [`/refundViaAch`]: createBooleanWrapper(true),
};

export const filerWithRefundDueDataWhoDoesNotWantToReceiveDirectDeposit = {
  ...filerWithRefundDueData,
  [`/refundViaAch`]: createBooleanWrapper(false),
};

export const filerWithPaymentDueData = {
  ...filerWithW2NoDeductionsNoCreditsBaseData,
  [`/formW2s/#${uuid}/writableWages`]: createDollarWrapper(`200000`),
  [`/formW2s/#${uuid}/writableFederalWithholding`]: createDollarWrapper(`0`),
};

export const basePrimaryFilerHSAFacts = {
  [`/someFilerHadNonW2HsaActivity`]: createBooleanWrapper(true),
  [`/writableHasHsaExcessContributionsPreviousYear`]: createBooleanWrapper(false),
  [`/writableHasHsaWithdrawnExcessContributionsYesNo`]: createBooleanWrapper(false),
  [`/hasHsaMedicalSavingsAccountType`]: createBooleanWrapper(false),
  [`/writablePrimaryFilerHadNonW2HsaActivity`]: createBooleanWrapper(true),
  [`/filers/#${primaryFilerId}/writablePrimaryFilerHasMadeContributionsToHsa`]: createBooleanWrapper(true),
  '/formW2s': {
    $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
    item: { items: [] },
  },
};

export const basePrimaryFilerHSAFactsWithoutContributionAmounts = {
  ...basePrimaryFilerHSAFacts,
  [`/filers/#${primaryFilerId}/canBeClaimed`]: createBooleanWrapper(false),
  [`/filers/#${primaryFilerId}/typeOfHdhp`]: createEnumWrapper(`selfOnly`, `/typeOfHdhpOptions`),
  [`/filers/#${primaryFilerId}/enrolledInMedicare`]: createEnumWrapper(`noneOfYear`, `/enrolledInMedicareOptions`),
  [`/filers/#${primaryFilerId}/hsaHdhpCoverageStatus`]: createEnumWrapper(`allYear`, `/hsaHdhpCoverageStatusOptions`),
  [`/filers/#${primaryFilerId}/hadOtherCoverageIneligibleForHSA`]: createEnumWrapper(
    `noneOfYear`,
    `/hadOtherCoverageIneligibleForHSAOptions`
  ),
  [`/filers/#${primaryFilerId}/writableChangeInMaritalStatusDuringTaxYear`]: createEnumWrapper(
    `wasNotMarriedNorDivorcedThisYear`,
    `/changeInMaritalStatusDuringTaxYearOptions`
  ),
  [`/filers/#${primaryFilerId}/hasMadeQualifiedHsaFundingDistribution`]: createBooleanWrapper(false),
};

export const primaryFilerHsaFactsForQualifiedDeduction = {
  ...basePrimaryFilerHSAFactsWithoutContributionAmounts,
  [`/filers/#${primaryFilerId}/writableHsaNonemployerContributionsTaxYear`]: createDollarWrapper(`1000`),
  [`/filers/#${primaryFilerId}/writableHsaNonemployerContributionsTaxYearPlusOne`]: createDollarWrapper(`2000`),
};

export const baseSecondaryFilerHSAFacts = {
  [`/someFilerHadNonW2HsaActivity`]: createBooleanWrapper(true),
  [`/writableSecondaryFilerHadNonW2HsaActivity`]: createBooleanWrapper(true),
  [`/writableHasHsaExcessContributionsPreviousYear`]: createBooleanWrapper(false),
  [`/writableHasHsaWithdrawnExcessContributionsYesNo`]: createBooleanWrapper(false),
  [`/filers/#${spouseId}/writableSecondaryFilerHasMadeContributionsToHsa`]: createBooleanWrapper(true),
};

const secondaryFilerHsaFactsWithoutContributionAmounts = {
  ...baseSecondaryFilerHSAFacts,
  [`/filers/#${spouseId}/canBeClaimed`]: createBooleanWrapper(false),
  [`/filers/#${spouseId}/typeOfHdhp`]: createEnumWrapper(`selfOnly`, `/typeOfHdhpOptions`),
  [`/filers/#${spouseId}/enrolledInMedicare`]: createEnumWrapper(`noneOfYear`, `/enrolledInMedicareOptions`),
  [`/filers/#${spouseId}/hsaHdhpCoverageStatus`]: createEnumWrapper(`allYear`, `/hsaHdhpCoverageStatusOptions`),
  [`/filers/#${spouseId}/hadOtherCoverageIneligibleForHSA`]: createEnumWrapper(
    `noneOfYear`,
    `/hadOtherCoverageIneligibleForHSAOptions`
  ),
  [`/filers/#${spouseId}/writableChangeInMaritalStatusDuringTaxYear`]: createEnumWrapper(
    `wasNotMarriedNorDivorcedThisYear`,
    `/changeInMaritalStatusDuringTaxYearOptions`
  ),
  [`/filers/#${spouseId}/hasMadeQualifiedHsaFundingDistribution`]: createBooleanWrapper(false),
  '/formW2s': {
    $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
    item: { items: [] },
  },
};

export const secondaryFilerHsaFactsForQualifiedDeduction = {
  ...secondaryFilerHsaFactsWithoutContributionAmounts,
  [`/filers/#${spouseId}/writableHsaNonemployerContributionsTaxYear`]: createDollarWrapper(`1000`),
  [`/filers/#${spouseId}/writableHsaNonemployerContributionsTaxYearPlusOne`]: createDollarWrapper(`2000`),
};

export const baseHSAFactsSkipToTestingPeriod = {
  [`/someFilerHadNonW2HsaActivity`]: createBooleanWrapper(true),
  [`/writablePrimaryFilerHadNonW2HsaActivity`]: createBooleanWrapper(true),
  [`/writableSecondaryFilerHadNonW2HsaActivity`]: createBooleanWrapper(true),
  [`/hasHsaMedicalSavingsAccountType`]: createBooleanWrapper(false),
  [`/writableHasHsaExcessContributionsPreviousYear`]: createBooleanWrapper(false),
  [`/writableHasHsaWithdrawnExcessContributionsYesNo`]: createBooleanWrapper(false),
  [`/filers/#${primaryFilerId}/writablePrimaryFilerHasMadeContributionsToHsa`]: createBooleanWrapper(false),
  [`/filers/#${spouseId}/writableSecondaryFilerHasMadeContributionsToHsa`]: createBooleanWrapper(false),
  '/formW2s': {
    $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
    item: { items: [] },
  },
};

// Represents base HSA facts.
export const baseHSAFacts = {
  ...basePrimaryFilerHSAFacts,
  ...baseSecondaryFilerHSAFacts,
  // Debug why collection isn't being initialized correctly
  '/formW2s': {
    $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
    item: { items: [] },
  },
};

export const baseNonW2HSAFacts = {
  ...baseHSAFactsSkipToTestingPeriod,
};

// Represents the base income scenario with Non W2 HSA contributions.
export const baseIncomeWithHSAs = {
  ...baseFilerData,
  ...baseHSAFacts,
};

// Represents the base MFJ income scenario with HSA contributions.
export const mfjIncomeWithHSAs = {
  ...mfjFilerData,
  ...baseHSAFacts,
};

export const mfjIncomeWithNonW2HSAs = {
  ...mfjFilerData,
  ...baseNonW2HSAFacts,
};

// Represents the base MFS income scenario with HSA contributions.
export const mfsIncomeWithHSAs = {
  ...mfsFilerData,
  ...baseHSAFacts,
};

export const singleFilerWithHsaDeductions = {
  ...baseFilerData,
  ...primaryFilerHsaFactsForQualifiedDeduction,
  [`/hasHsaMedicalSavingsAccountType`]: createBooleanWrapper(false),
  [`/hsaDistributionsIsDone`]: createBooleanWrapper(true),
  [`/writableHasHsaExcessContributionsPreviousYear`]: createBooleanWrapper(false),
  [`/writableHasHsaWithdrawnExcessContributionsYesNo`]: createBooleanWrapper(false),
};

export const mfjHsaContributionFactsWithoutContributionAmounts = {
  ...mfjFilerData,
  ...basePrimaryFilerHSAFactsWithoutContributionAmounts,
  ...secondaryFilerHsaFactsWithoutContributionAmounts,
  [`/hasHsaMedicalSavingsAccountType`]: createBooleanWrapper(false),
  [`/hsaDistributionsIsDone`]: createBooleanWrapper(true),
  [`/writableHasHsaExcessContributionsPreviousYear`]: createBooleanWrapper(false),
  [`/writableHasHsaWithdrawnExcessContributionsYesNo`]: createBooleanWrapper(false),
};

export const mfjBothWithQualifiedHsaDeductions = {
  ...mfjFilerData,
  ...primaryFilerHsaFactsForQualifiedDeduction,
  ...secondaryFilerHsaFactsForQualifiedDeduction,
  [`/hasHsaMedicalSavingsAccountType`]: createBooleanWrapper(false),
  [`/hsaDistributionsIsDone`]: createBooleanWrapper(true),
  [`/writableHasHsaExcessContributionsPreviousYear`]: createBooleanWrapper(false),
  [`/writableHasHsaWithdrawnExcessContributionsYesNo`]: createBooleanWrapper(false),
};

export const mfjPrimaryOnlyWithQualifiedHsaDeductions = {
  ...mfjFilerData,
  ...primaryFilerHsaFactsForQualifiedDeduction,
  [`/writableSecondaryFilerHadNonW2HsaActivity`]: createBooleanWrapper(false),
  [`/hasHsaMedicalSavingsAccountType`]: createBooleanWrapper(false),
  [`/hsaDistributionsIsDone`]: createBooleanWrapper(true),
};

export const mfjSecondaryOnlyWithQualifiedHsaDeductions = {
  ...mfjFilerData,
  ...secondaryFilerHsaFactsForQualifiedDeduction,
  [`/writablePrimaryFilerHadNonW2HsaActivity`]: createBooleanWrapper(false),
  [`/hasHsaMedicalSavingsAccountType`]: createBooleanWrapper(false),
  [`/hsaDistributionsIsDone`]: createBooleanWrapper(true),
};

export const hsaDistributionId = `ba2188e6-193a-4ad0-8014-dc5eae668a32`;
export const completedHsaDistributions = {
  [`/hsaDistributionsIsDone`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  [`/hsaDistributions/#${hsaDistributionId}/writableQualifiedMedExpenses`]: {
    $type: `gov.irs.factgraph.persisters.DollarWrapper`,
    item: `100.00`,
  },
  [`/hsaDistributions/#${hsaDistributionId}/hasWithdrawnExcessContributions`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  [`/hsaDistributions/${hsaDistributionId}/filer`]: createCollectionItemWrapper(primaryFilerId),
  [`/hsaDistributions/#${hsaDistributionId}/writableDistributionsRolloverBool`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  [`/hsaDistributions/#${hsaDistributionId}/hasSeenLastAvailableScreen`]: {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  [`/hsaDistributions/#${hsaDistributionId}/writableTrusteeName`]: {
    $type: `gov.irs.factgraph.persisters.StringWrapper`,
    item: `one`,
  },
  [`/hsaDistributions`]: {
    $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
    item: {
      items: [`${hsaDistributionId}`],
    },
  },
  [`/hsaDistributions/#${hsaDistributionId}/writableGrossDistribution`]: {
    $type: `gov.irs.factgraph.persisters.DollarWrapper`,
    item: `100.00`,
  },
  [`/hsaDistributions/#${hsaDistributionId}/hsaDistributionCode`]: {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: {
      value: [`normalDistribution`],
      enumOptionsPath: `/hsaDistributionCodeOptions`,
    },
  },
};

export const makeMultipleHsaDistributions = (
  distributions: { amount: number; distributionId: string; filerId?: string }[]
) => {
  // eslint-disable-next-line eqeqeq
  if (distributions.length == 0) {
    return completedHsaDistributions;
  } else {
    const ids = distributions.map((distributions) => {
      return distributions.distributionId;
    });
    const distributionData = Object.assign(
      {},
      ...distributions.map((distribution) =>
        makeSimpleHsaDistributionDataWithoutCollection(
          distribution.distributionId,
          distribution.amount,
          distribution.filerId ? distribution.filerId : primaryFilerId
        )
      )
    );
    return {
      '/hsaDistributions': {
        $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
        item: { items: ids },
      },
      [`/hsaDistributionsIsDone`]: createBooleanWrapper(true),
      ...distributionData,
    };
  }
};

export const makeSimpleHsaDistributionDataWithoutCollection = (
  id: string,
  amount: number,
  filerId: string = primaryFilerId
) => {
  return {
    [`/hsaDistributions/#${id}/writableQualifiedMedExpenses`]: createDollarWrapper(`${amount}`),
    [`/hsaDistributions/#${id}/hasWithdrawnExcessContributions`]: createBooleanWrapper(false),
    [`/hsaDistributions/#${id}/filer`]: createCollectionItemWrapper(filerId),
    [`/hsaDistributions/#${id}/writableDistributionsRolloverBool`]: createBooleanWrapper(false),
    [`/hsaDistributions/#${id}/hasSeenLastAvailableScreen`]: createBooleanWrapper(true),
    [`/hsaDistributions/#${id}/writableTrusteeName`]: createStringWrapper(`one`),
    [`/hsaDistributions/#${id}/writableGrossDistribution`]: createDollarWrapper(`${amount}`),
    [`/hsaDistributions/#${id}/hsaDistributionCode`]: createEnumWrapper(
      `normalDistribution`,
      `/hsaDistributionCodeOptions`
    ),
  };
};

// We need to use specific ages in tests due to many of the age-based calculations in the app.
// Most of the ages we use for calcs are defined as TP age by Jan 1 on the tax year + 1.
// So for tests we want a special function to calculate the DOB based on this definition when given the age.
// Example: If TY is 2024 and we want to and need someone to be 64 on Jan 1, 2025
// (regardless of whatever today is), we would pass in 64 to this function.
export const getDobFromAgeDefinedByTyPlusOne = (age: number) => {
  const { factGraph } = setupFactGraph();
  const taxYear = factGraph.get(Path.concretePath(`/taxYear`, null)).get;
  const year = taxYear + 1 - age;
  return createDayWrapper(`${year}-01-01`);
};

export const makeChildData = (childId: string, dob = `2012-01-01`) => {
  return {
    [`/familyAndHousehold/#${childId}/firstName`]: createStringWrapper(`Child`),
    [`/familyAndHousehold/#${childId}/writableMiddleInitial`]: createStringWrapper(`E`),
    [`/familyAndHousehold/#${childId}/lastName`]: createStringWrapper(`ChildFace`),
    [`/familyAndHousehold/#${childId}/relationshipCategory`]: createEnumWrapper(
      `childOrDescendants`,
      `/relationshipCategoryOptions`
    ),
    [`/familyAndHousehold/#${childId}/childRelationship`]: createEnumWrapper(
      `biologicalChild`,
      `/childRelationshipOptions`
    ),
    [`/familyAndHousehold/#${childId}/dateOfBirth`]: createDayWrapper(dob),
    [`/familyAndHousehold/#${childId}/hasOtherBiologicalOrAdoptiveParent`]: createBooleanWrapper(false),
    [`/familyAndHousehold/#${childId}/residencyDuration`]: createEnumWrapper(`allYear`, `/residencyDurationOptions`),
    [`/familyAndHousehold/#${childId}/monthsLivedWithTPInUS`]: createEnumWrapper(
      `seven`,
      `/monthsLivedWithTPInUSOptions`
    ),
    [`/familyAndHousehold/#${childId}/ssnEmploymentValidity`]: createEnumWrapper(
      `neither`,
      `/familyAndHouseholdSsnEmploymentValidityOptions`
    ),
    [`/familyAndHousehold/#${childId}/isUsCitizenFullYear`]: createBooleanWrapper(true),
    [`/familyAndHousehold/#${childId}/married`]: createBooleanWrapper(false),
    [`/familyAndHousehold/#${childId}/ownSupport`]: createBooleanWrapper(false),
    [`/familyAndHousehold/#${childId}/tpClaims`]: createBooleanWrapper(true),
    [`/familyAndHousehold/#${childId}/tin`]: createTinWrapper({ area: `444`, group: `00`, serial: `4444` }),
    [`/familyAndHousehold/#${childId}/tinType`]: createEnumWrapper(`ssn`, `/tinTypeOptions`),
    [`/familyAndHousehold/#${childId}/writableCouldBeQualifyingChildOfAnother`]: createBooleanWrapper(false),
  };
};

export const makeQualifyingPersonNonChild = (relativeId: string, dob = `2017-05-15`) => {
  return {
    [`/familyAndHousehold/#${relativeId}/firstName`]: createStringWrapper(`Parent`),
    [`/familyAndHousehold/#${relativeId}/writableMiddleInitial`]: createStringWrapper(`E`),
    [`/familyAndHousehold/#${relativeId}/lastName`]: createStringWrapper(`ParentFace`),
    [`/familyAndHousehold/#${relativeId}/relationshipCategory`]: createEnumWrapper(
      `notRelated`,
      `/relationshipCategoryOptions`
    ),
    [`/familyAndHousehold/#${relativeId}/dateOfBirth`]: createDayWrapper(dob),
    [`/familyAndHousehold/#${relativeId}/grossIncomeTest`]: createBooleanWrapper(true),
    [`/familyAndHousehold/#${relativeId}/deceased`]: createBooleanWrapper(false),
    [`/familyAndHousehold/#${relativeId}/residencyDuration`]: createEnumWrapper(`allYear`, `/residencyDurationOptions`),
    [`/familyAndHousehold/#${relativeId}/hasIpPin`]: createBooleanWrapper(false),
    [`/familyAndHousehold/#${relativeId}/isUsCitizenFullYear`]: createBooleanWrapper(true),
    [`/familyAndHousehold/#${relativeId}/married`]: createBooleanWrapper(false),
    [`/familyAndHousehold/#${relativeId}/tpClaims`]: createBooleanWrapper(true),
    [`/familyAndHousehold/#${relativeId}/tin`]: createTinWrapper({ area: `432`, group: `55`, serial: `3244` }),
    [`/familyAndHousehold/#${relativeId}/tinType`]: createEnumWrapper(`ssn`, `/tinTypeOptions`),
    [`/familyAndHousehold/#${relativeId}/writableQrSupportTest`]: createBooleanWrapper(true),
    [`/familyAndHousehold/#${relativeId}/writableCouldBeQualifyingChildOfAnother`]: createBooleanWrapper(false),
  };
};

/**
 * This function allows you to create multiple W2s without overwriting the collection like
 * consecutive calls to makeW2Data() would. If no parameters are passed in, a single W2 is created
 * using makeW2Data() default
 */
export const makeMultipleW2s = (w2s: { income: number; w2Id: string; filerId?: string }[]) => {
  // eslint-disable-next-line eqeqeq
  if (w2s.length == 0) {
    return makeW2Data();
  } else {
    const ids = w2s.map((w2) => {
      return w2.w2Id;
    });
    const w2Data = Object.assign(
      {},
      ...w2s.map((w2) => makeW2DataWithoutCollection(w2.income, w2.w2Id, w2.filerId ? w2.filerId : primaryFilerId))
    );
    return {
      '/formW2s': {
        $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
        item: { items: ids },
      },
      ...w2Data,
    };
  }
};

export const makeW2Data = (
  income = 0.0,
  w2Id = `4623aac9-6d6f-424e-9ba2-8cdf19d45b10`,
  filerId: string = primaryFilerId
) => {
  return {
    '/formW2s': {
      $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
      item: { items: [`${w2Id}`] },
    },
    ...makeW2DataWithoutCollection(income, w2Id, filerId),
  };
};

const makeW2DataWithoutCollection = (income: number, w2Id: string, filerId: string = primaryFilerId) => {
  return {
    [`/formW2s/#${w2Id}/employerAddress`]: createAddressWrapper(),
    [`/formW2s/#${w2Id}/addressMatchesReturn`]: createBooleanWrapper(true),
    [`/formW2s/#${w2Id}/employerName`]: createStringWrapper(`Foo Bar Inc`),
    [`/formW2s/#${w2Id}/ein`]: createEinWrapper(`00`, `9999999`),
    [`/formW2s/#${w2Id}/nonstandardOrCorrectedChoice`]: createEnumWrapper(
      `neither`,
      `/form1099RsNonstandardCorrectedOptions`
    ),
    [`/formW2s/#${w2Id}/filer`]: createCollectionItemWrapper(filerId),
    [`/formW2s/#${w2Id}/writableCombatPay`]: createDollarWrapper(`0.00`),
    [`/formW2s/#${w2Id}/writableDependentCareBenefits`]: createDollarWrapper(`0.00`),
    [`/formW2s/#${w2Id}/writableFederalWithholding`]: createDollarWrapper(`0.00`),
    [`/formW2s/#${w2Id}/writableWages`]: createDollarWrapper(`${income}`),
    '/hadStudentLoanInterestPayments': createBooleanWrapper(false),
    '/madeIraContributions': createBooleanWrapper(false),
  };
};

export const make1099IntData = (income = 0.0, intId = `7d4b70b2-5e80-46be-a387-24d22e6fad46`) => {
  return {
    '/interestReports': {
      $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
      item: { items: [`${intId}`] },
    },
    [`/interestReports/#${intId}/has1099`]: createBooleanWrapper(true),
    [`/interestReports/#${intId}/writable1099Amount`]: createDollarWrapper(`${income}`),
  };
};

export const makeInterestReportData = (
  income = 0.0,
  intId = `693d539c-6679-4264-b6b5-d7411e318395`,
  filerId: string
) => {
  return {
    '/interestReports': {
      $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
      item: { items: [`${intId}`] },
    },
    [`/interestReports/#${intId}/payer`]: createStringWrapper(`Banky Bank`),
    [`/interestReports/#${intId}/has1099`]: createBooleanWrapper(false),
    [`/interestReports/#${intId}/no1099Amount`]: createDollarWrapper(`${income}`),
    [`/interestReports/#${intId}/filer`]: createCollectionItemWrapper(filerId),
    [`/interestReports/#${intId}/hasSeenLastAvailableScreen`]: createBooleanWrapper(true),
  };
};

export const makeSocialSecurityReport = (
  amount = 0.0,
  ssId = `24cddabd-a37c-4195-803a-b90ba3de1ea2`,
  filerId: string
) => {
  return {
    '/socialSecurityReports': {
      $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
      item: { items: [`${ssId}`] },
    },
    [`/socialSecurityReports/#${ssId}/formType`]: createEnumWrapper(`SSA-1099`, `/socialSecurityIncomeFormTypeOptions`),
    [`/socialSecurityReports/#${ssId}/ssaNetBenefits`]: createDollarWrapper(`${amount}`),
    [`/socialSecurityReports/#${ssId}/federalTaxWithheld`]: createDollarWrapper(`0`),
    [`/socialSecurityReports/#${ssId}/filer`]: createCollectionItemWrapper(filerId),
    [`/socialSecurityReports/#${ssId}/hasSeenLastAvailableScreen`]: createBooleanWrapper(true),
  };
};

export const makeCombatPayData = (
  primaryWages: string,
  secondaryWages: string,
  primaryCombatPay: string,
  secondaryCombatPay: string
) => ({
  [`/hasCdccCarryoverAmountFromPriorTaxYear`]: createBooleanWrapper(false),
  [`/flowKnockoutHouseholdEmployee`]: createBooleanWrapper(false),
  '/filers/#514d33d2-9d1a-4f83-a46f-107322bfa246/writableMiddleInitial': {
    $type: `gov.irs.factgraph.persisters.StringWrapper`,
    item: `M`,
  },
  '/disposedDigitalAssets': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/formW2s/#bf555947-7879-414c-9db0-e0be6f966aae/employerAddress': {
    $type: `gov.irs.factgraph.persisters.AddressWrapper`,
    item: {
      streetAddress: `20852 SE Sunniberg Ln`,
      city: `Bend`,
      postalCode: `97702`,
      stateOrProvence: `OR`,
      country: ``,
    },
  },
  '/filingStatusChoice': {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: {
      value: [`wantsMarriedFilingSeparately`],
      enumOptionsPath: `filingStatusInitialOptions`,
    },
  },
  '/filers/#514d33d2-9d1a-4f83-a46f-107322bfa246/isPrimaryFiler': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/primaryFilerW2And1099IntInScopedState': {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: { value: [`onlySame`], enumOptionsPath: `/primaryFilerW2And1099IntStateOptions` },
  },
  '/filers/#fccf9286-7a9e-43ea-b0b4-4aebb3e5e662/isPrimaryFiler': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  '/formW2s/#e30fa16f-4fca-4535-bda9-5bed5a380bbb/thirdPartySickPay': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/filers/#fccf9286-7a9e-43ea-b0b4-4aebb3e5e662/hasIpPin': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/filers/#514d33d2-9d1a-4f83-a46f-107322bfa246/firstName': {
    $type: `gov.irs.factgraph.persisters.StringWrapper`,
    item: `Spouse`,
  },
  '/filerResidenceAndIncomeState': {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: { value: [`az`], enumOptionsPath: `/scopedStateOptions` },
  },
  '/filers/#514d33d2-9d1a-4f83-a46f-107322bfa246/hasIpPin': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/filers/#fccf9286-7a9e-43ea-b0b4-4aebb3e5e662/isBlind': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/filers/#fccf9286-7a9e-43ea-b0b4-4aebb3e5e662/isDisabled': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/filers/#fccf9286-7a9e-43ea-b0b4-4aebb3e5e662/isStudent': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/formW2s/#e30fa16f-4fca-4535-bda9-5bed5a380bbb/addressMatchesReturn': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  '/writableSeparationAgreement': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/eitcHadImproperClaims': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/formW2s/#e30fa16f-4fca-4535-bda9-5bed5a380bbb/hasSeenLastAvailableScreen': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  '/incomeSourcesSupported': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  '/formW2s/#bf555947-7879-414c-9db0-e0be6f966aae/writableCombatPay': {
    $type: `gov.irs.factgraph.persisters.DollarWrapper`,
    item: primaryCombatPay,
  },
  '/filers/#fccf9286-7a9e-43ea-b0b4-4aebb3e5e662/writableMiddleInitial': {
    $type: `gov.irs.factgraph.persisters.StringWrapper`,
    item: `M`,
  },
  '/wasK12Educators': {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: { value: [`neither`], enumOptionsPath: `/k12EducatorOptions` },
  },
  '/formW2s/#e30fa16f-4fca-4535-bda9-5bed5a380bbb/statutoryEmployee': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/maritalStatus': {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: { value: [`married`], enumOptionsPath: `/maritalStatusOptions` },
  },
  '/formW2s/#e30fa16f-4fca-4535-bda9-5bed5a380bbb/ein': {
    $type: `gov.irs.factgraph.persisters.EinWrapper`,
    item: { prefix: `77`, serial: `7777777` },
  },
  '/formW2s/#e30fa16f-4fca-4535-bda9-5bed5a380bbb/employerAddress': {
    $type: `gov.irs.factgraph.persisters.AddressWrapper`,
    item: {
      streetAddress: `200 Washington Ave`,
      city: `Scottsdale`,
      postalCode: `11658`,
      stateOrProvence: `AL`,
      country: ``,
    },
  },
  '/interestReports': {
    $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
    item: { items: [] },
  },
  '/filers/#514d33d2-9d1a-4f83-a46f-107322bfa246/lastName': {
    $type: `gov.irs.factgraph.persisters.StringWrapper`,
    item: `Tester`,
  },
  '/filers/#514d33d2-9d1a-4f83-a46f-107322bfa246/dateOfBirth': {
    $type: `gov.irs.factgraph.persisters.DayWrapper`,
    item: { date: `1980-01-11` },
  },
  '/formW2s/#bf555947-7879-414c-9db0-e0be6f966aae/employerName': {
    $type: `gov.irs.factgraph.persisters.StringWrapper`,
    item: `kd`,
  },
  '/filers/#fccf9286-7a9e-43ea-b0b4-4aebb3e5e662/firstName': {
    $type: `gov.irs.factgraph.persisters.StringWrapper`,
    item: `Tester`,
  },
  '/spouseLivesInTPState': {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: {
      value: [`sameState`],
      enumOptionsPath: `/spouseScopedStateOptions`,
    },
  },
  '/formW2s/#bf555947-7879-414c-9db0-e0be6f966aae/writableWages': {
    $type: `gov.irs.factgraph.persisters.DollarWrapper`,
    item: primaryWages,
  },
  '/formW2s/#e30fa16f-4fca-4535-bda9-5bed5a380bbb/filer': {
    $type: `gov.irs.factgraph.persisters.CollectionItemWrapper`,
    item: { id: `514d33d2-9d1a-4f83-a46f-107322bfa246` },
  },
  '/socialSecurityReports': {
    $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
    item: { items: [] },
  },
  '/formW2s': {
    $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
    item: {
      items: [`bf555947-7879-414c-9db0-e0be6f966aae`, `e30fa16f-4fca-4535-bda9-5bed5a380bbb`],
    },
  },
  '/filers/#fccf9286-7a9e-43ea-b0b4-4aebb3e5e662/dateOfBirth': {
    $type: `gov.irs.factgraph.persisters.DayWrapper`,
    item: { date: `1977-01-01` },
  },
  '/formW2s/#bf555947-7879-414c-9db0-e0be6f966aae/statutoryEmployee': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/flowHasSeenDeductions': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  '/socialSecurityReportsIsDone': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  '/formW2s/#bf555947-7879-414c-9db0-e0be6f966aae/thirdPartySickPay': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/phone': {
    $type: `gov.irs.factgraph.persisters.E164Wrapper`,
    item: {
      $type: `gov.irs.factgraph.types.UsPhoneNumber`,
      areaCode: `917`,
      officeCode: `456`,
      lineNumber: `9874`,
    },
  },
  '/formW2s/#e30fa16f-4fca-4535-bda9-5bed5a380bbb/writableCombatPay': {
    $type: `gov.irs.factgraph.persisters.DollarWrapper`,
    item: secondaryCombatPay,
  },
  '/eitcQcOfAnother': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/formW2s/#bf555947-7879-414c-9db0-e0be6f966aae/addressMatchesReturn': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  '/formW2s/#bf555947-7879-414c-9db0-e0be6f966aae/retirementPlan': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/filers/#514d33d2-9d1a-4f83-a46f-107322bfa246/tin': {
    $type: `gov.irs.factgraph.persisters.TinWrapper`,
    item: { area: `555`, group: `55`, serial: `5555` },
  },
  '/receivedDigitalAssets': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/familyAndHousehold': {
    $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
    item: { items: [] },
  },
  '/writableLivedApartLastSixMonths': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/form1099Gs': {
    $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
    item: { items: [] },
  },
  '/form1099Rs': {
    $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
    item: { items: [] },
  },
  '/hasCompleted1099RSection': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  '/cdccCareProviders': {
    $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
    item: { items: [] },
  },
  '/cdccCareProvidersIsDone': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  '/filers/#fccf9286-7a9e-43ea-b0b4-4aebb3e5e662/isUsCitizenFullYear': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  '/formW2s/#bf555947-7879-414c-9db0-e0be6f966aae/hasRRTACodes': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/MFSLivingSpouseFilingReturn': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/MFSDeceasedSpouseFilingReturn': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/interestReportsIsDone': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  '/filers/#fccf9286-7a9e-43ea-b0b4-4aebb3e5e662/canBeClaimed': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/filers/#fccf9286-7a9e-43ea-b0b4-4aebb3e5e662/occupation': {
    $type: `gov.irs.factgraph.persisters.StringWrapper`,
    item: `Eng`,
  },
  '/filers/#514d33d2-9d1a-4f83-a46f-107322bfa246/isBlind': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/filers/#514d33d2-9d1a-4f83-a46f-107322bfa246/isDisabled': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/filers/#514d33d2-9d1a-4f83-a46f-107322bfa246/isStudent': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/formW2s/#bf555947-7879-414c-9db0-e0be6f966aae/ein': {
    $type: `gov.irs.factgraph.persisters.EinWrapper`,
    item: { prefix: `66`, serial: `6666666` },
  },
  '/formW2s/#e30fa16f-4fca-4535-bda9-5bed5a380bbb/retirementPlan': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/spouseIncomeFormsInScopedState': {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: { value: [`onlySame`], enumOptionsPath: `/primaryFilerW2And1099IntStateOptions` },
  },
  '/MFSSpouseHasGrossIncome': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  '/filers/#fccf9286-7a9e-43ea-b0b4-4aebb3e5e662/tin': {
    $type: `gov.irs.factgraph.persisters.TinWrapper`,
    item: { area: `444`, group: `44`, serial: `4444` },
  },
  '/formW2s/#e30fa16f-4fca-4535-bda9-5bed5a380bbb/hasRRTACodes': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/email': {
    $type: `gov.irs.factgraph.persisters.EmailAddressWrapper`,
    item: { email: `user.0000@example.com` },
  },
  '/formW2sIsDone': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  '/formW2s/#e30fa16f-4fca-4535-bda9-5bed5a380bbb/employerName': {
    $type: `gov.irs.factgraph.persisters.StringWrapper`,
    item: `keidk`,
  },
  '/filers/#514d33d2-9d1a-4f83-a46f-107322bfa246/occupation': {
    $type: `gov.irs.factgraph.persisters.StringWrapper`,
    item: `asdf`,
  },
  '/formW2s/#e30fa16f-4fca-4535-bda9-5bed5a380bbb/nonstandardOrCorrectedChoice': {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: {
      value: [`neither`],
      enumOptionsPath: `/w2NonstandardCorrectedOptions`,
    },
  },
  '/formW2s/#bf555947-7879-414c-9db0-e0be6f966aae/hasSeenLastAvailableScreen': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  '/formW2s/#e30fa16f-4fca-4535-bda9-5bed5a380bbb/writableWages': {
    $type: `gov.irs.factgraph.persisters.DollarWrapper`,
    item: secondaryWages,
  },
  '/address': {
    $type: `gov.irs.factgraph.persisters.AddressWrapper`,
    item: {
      streetAddress: `200 E Cherry Ave`,
      city: `Denver`,
      postalCode: `87654`,
      stateOrProvence: `CO`,
      country: ``,
    },
  },
  '/filingStatus': {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: {
      value: [`marriedFilingJointly`],
      enumOptionsPath: `/filingStatusOptions`,
    },
  },
  '/familyAndHouseholdIsDone': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  '/filers/#514d33d2-9d1a-4f83-a46f-107322bfa246/canBeClaimed': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/filers': {
    $type: `gov.irs.factgraph.persisters.CollectionWrapper`,
    item: {
      items: [`fccf9286-7a9e-43ea-b0b4-4aebb3e5e662`, `514d33d2-9d1a-4f83-a46f-107322bfa246`],
    },
  },
  '/form1099GsIsDone': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  '/formW2s/#e30fa16f-4fca-4535-bda9-5bed5a380bbb/tin': {
    $type: `gov.irs.factgraph.persisters.TinWrapper`,
    item: { area: `555`, group: `55`, serial: `5555` },
  },
  '/filers/#fccf9286-7a9e-43ea-b0b4-4aebb3e5e662/lastName': {
    $type: `gov.irs.factgraph.persisters.StringWrapper`,
    item: `TesterLast`,
  },
  '/formW2s/#bf555947-7879-414c-9db0-e0be6f966aae/nonstandardOrCorrectedChoice': {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: {
      value: [`neither`],
      enumOptionsPath: `/w2NonstandardCorrectedOptions`,
    },
  },
  '/formW2s/#bf555947-7879-414c-9db0-e0be6f966aae/tin': {
    $type: `gov.irs.factgraph.persisters.TinWrapper`,
    item: { area: `444`, group: `44`, serial: `4444` },
  },
  '/hadStudentLoanInterestPayments': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/formW2s/#bf555947-7879-414c-9db0-e0be6f966aae/filer': {
    $type: `gov.irs.factgraph.persisters.CollectionItemWrapper`,
    item: { id: `fccf9286-7a9e-43ea-b0b4-4aebb3e5e662` },
  },
  '/filers/#514d33d2-9d1a-4f83-a46f-107322bfa246/isUsCitizenFullYear': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: true,
  },
  '/hasForeignAccounts': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/isForeignTrustsGrantor': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
  '/hasForeignTrustsTransactions': {
    $type: `gov.irs.factgraph.persisters.BooleanWrapper`,
    item: false,
  },
});

export enum FilingStatus {
  MFJ = `marriedFilingJointly`,
  MFS = `marriedFilingSeparately`,
  SINGLE = `single`,
  HOH = `headOfHousehold`,
  QSS = `qualifiedSurvivingSpouse`,
}

export type CollectionSubPath<Path extends AbsolutePath> = AbsolutePath &
  `${Path}/*/${string}` extends `${string}/*${infer SubPath}`
  ? SubPath
  : never;

export function makeCollectionItem<CollectionPath extends AbsolutePath>(
  uuid: string,
  collectionPath: CollectionPath,
  facts: Partial<Record<CollectionSubPath<CollectionPath>, PersistenceWrapper>>
): Record<ConcretePath, PersistenceWrapper> {
  return Object.fromEntries(
    Object.entries(facts).map(([subPath, fact]) => [
      Path.concretePath(`${collectionPath}/*${subPath}` as AbsolutePath, uuid),
      fact as PersistenceWrapper,
    ])
  );
}

export function makeFilerData(
  filerId: string,
  filerFacts: Partial<Record<CollectionSubPath<`/filers`>, PersistenceWrapper>>
) {
  return makeCollectionItem(filerId, `/filers`, {
    [`/firstName`]: createStringWrapper(`Test`),
    [`/dateOfBirth`]: createDayWrapper(`${CURRENT_TAX_YEAR_AS_NUMBER - 50}-01-01`),
    [`/isBlind`]: createBooleanWrapper(false),
    [`/isDisabled`]: createBooleanWrapper(false),
    [`/isStudent`]: createBooleanWrapper(false),
    [`/writableMiddleInitial`]: createStringWrapper(`E`),
    [`/tin`]: createTinWrapper({ area: `555`, group: `55`, serial: `5555` }),
    [`/lastName`]: createStringWrapper(`Testerson`),
    [`/occupation`]: createStringWrapper(`cat`),
    [`/isUsCitizenFullYear`]: createBooleanWrapper(true),
    ...filerFacts,
  });
}

export const baseFilerEdcData = {
  ...baseFilerData,
  [`/hasCdccCarryoverAmountFromPriorTaxYear`]: createBooleanWrapper(false),
  [`/flowKnockoutHouseholdEmployee`]: createBooleanWrapper(false),
  [`/filers/#${primaryFilerId}/canBeClaimed`]: createBooleanWrapper(false),
  [`/familyAndHousehold`]: { $type: `gov.irs.factgraph.persisters.CollectionWrapper`, item: { items: [] } },
  [`/wasK12Educators`]: createEnumWrapper(`neither`, `/k12EducatorOptions`),
  [`/paidEstimatedTaxesOrFromLastYear`]: createBooleanWrapper(false),
  [`/hasForeignAccounts`]: createBooleanWrapper(false),
  [`/isForeignTrustsGrantor`]: createBooleanWrapper(false),
  [`/hasForeignTrustsTransactions`]: createBooleanWrapper(false),
  [`/selfSelectPin`]: createPinWrapper(`12349`),
  [`/writableHasSelfReportedNonTaxablePayments`]: createBooleanWrapper(false),
  [`/writableEdcSelfReportedNonTaxablePaymentAmount`]: createDollarWrapper(`0.00`),
  [`/primaryFilerW2And1099IntInScopedState`]: {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: { value: [`onlySame`], enumOptionsPath: `/primaryFilerW2And1099IntStateOptions` },
  },
  '/filerResidenceAndIncomeState': {
    $type: `gov.irs.factgraph.persisters.EnumWrapper`,
    item: { value: [`fl`], enumOptionsPath: `/scopedStateOptions` },
  },
};

export const primaryFilerDisabilityEdcFacts = {
  [`/filers/#${primaryFilerId}/dateOfBirth`]: getDobFromAgeDefinedByTyPlusOne(35),
  [`/filers/#${primaryFilerId}/isRetOnPermOrTotalDisability`]: createBooleanWrapper(true),
  [`/filers/#${primaryFilerId}/employerHasMandatoryRetirementAge`]: createBooleanWrapper(false),
  [`/filers/#${primaryFilerId}/hasMetEmployerMandatoryRetirementAge`]: createBooleanWrapper(false),
  [`/filers/#${primaryFilerId}/arePaymentsTaxDisabilityIncome`]: createBooleanWrapper(true),
  [`/filers/#${primaryFilerId}/writableTotalTaxableDisabilityAmount`]: createDollarWrapper(`1.00`),
  // NOTE primary filer needs a source of income in addition to writableTotalTaxableDisabilityAmount
};

export const spouseDisabilityEdcFacts = {
  [`/filers/#${spouseId}/dateOfBirth`]: getDobFromAgeDefinedByTyPlusOne(35),
  [`/filers/#${spouseId}/isRetOnPermOrTotalDisability`]: createBooleanWrapper(true),
  [`/filers/#${spouseId}/employerHasMandatoryRetirementAge`]: createBooleanWrapper(false),
  [`/filers/#${spouseId}/hasMetEmployerMandatoryRetirementAge`]: createBooleanWrapper(false),
  [`/filers/#${spouseId}/arePaymentsTaxDisabilityIncome`]: createBooleanWrapper(true),
  [`/filers/#${spouseId}/writableTotalTaxableDisabilityAmount`]: createDollarWrapper(`1.00`),
  // NOTE spouse needs a source of income in addition to writableTotalTaxableDisabilityAmount
};

export const singleElderlyFilerEdcBase = {
  ...baseFilerEdcData,
  [`/filers/#${primaryFilerId}/dateOfBirth`]: getDobFromAgeDefinedByTyPlusOne(65),
};

export const singleDisabledFilerEdcBase = {
  ...baseFilerEdcData,
  ...primaryFilerDisabilityEdcFacts,
  [`/filers/#${primaryFilerId}/dateOfBirth`]: getDobFromAgeDefinedByTyPlusOne(35),
};

export const mfsElderlyFilerEdcBase = {
  ...baseFilerEdcData,
  ...mfsFilerData,
  [`/spouseLivedTogetherMonths`]: createEnumWrapper(
    `livedTogetherMoreThanSixMonths`,
    `/spouseLivedTogetherMonthsOptions`
  ),
  [`/livedTogetherAllYearWithSpouse`]: createBooleanWrapper(true),
  [`/filers/#${primaryFilerId}/dateOfBirth`]: getDobFromAgeDefinedByTyPlusOne(65),
  [`/filers/#${spouseId}/dateOfBirth`]: getDobFromAgeDefinedByTyPlusOne(35),
};

export const mfjEdcBase = {
  ...baseFilerEdcData,
  ...mfjFilerData,
  [`/filers/#${spouseId}/canBeClaimed`]: createBooleanWrapper(false),
};

export const incompleteInterestId = `690da9ac-aa9b-46e2-8623-ebf8ce84a1ce`;
export const incompleteInterestIncome = {
  [`/interestReports`]: createCollectionWrapper([incompleteInterestId]),
  [`/interestReports/#${incompleteInterestId}/has1099`]: createBooleanWrapper(true),
  [`/interestReports/#${incompleteInterestId}/factaFilingRequired`]: createBooleanWrapper(false),
  [`/interestReports/#${incompleteInterestId}/filer`]: createCollectionItemWrapper(primaryFilerId),
  [`/interestReportsIsDone`]: createBooleanWrapper(true),
  [`/interestReports/#${incompleteInterestId}/payer`]: createStringWrapper(`B-Bank`),
  [`/interestReports/#${incompleteInterestId}/writablePayerNameLine2`]: createStringWrapper(`B-Bank Line 2`),
};

export const incompleteHsaDistributionId1 = `650db369-bb12-480a-af5c-da0dfa9d63b2`;

export const someIncompleteHsaDistributions = {
  [`/writableHasHsaWithdrawnExcessContributionsYesNo`]: createBooleanWrapper(false),
  [`/someFilersMadeTestingPeriodContribution`]: createBooleanWrapper(false),
  [`/hasHsaMedicalSavingsAccountType`]: createBooleanWrapper(false),
  [`/writableHasHsaExcessContributionsPreviousYear`]: createBooleanWrapper(false),
  [`/someFilerHadNonW2HsaActivity`]: createBooleanWrapper(true),
  [`/writablePrimaryFilerHadNonW2HsaActivity`]: createBooleanWrapper(true),
  [`/writableSecondaryFilerHadNonW2HsaActivity`]: createBooleanWrapper(false),
  [`/filers/#${spouseId}/writableSecondaryFilerHasMadeContributionsToHsa`]: createBooleanWrapper(false),
  [`/filers/#${primaryFilerId}/writablePrimaryFilerHasMadeContributionsToHsa`]: createBooleanWrapper(false),
  [`/hsaDistributions`]: createCollectionWrapper([hsaDistributionId, incompleteHsaDistributionId1]),
  [`/hsaDistributionsIsDone`]: createBooleanWrapper(true),
  [`/hsaDistributions/#${incompleteHsaDistributionId1}/filer`]: createCollectionItemWrapper(primaryFilerId),
  [`/hsaDistributions/#${incompleteHsaDistributionId1}/writableTrusteeName`]: createStringWrapper(`Trusty Trustee`),
  [`/hsaDistributions/#${incompleteHsaDistributionId1}/writableGrossDistribution`]: createDollarWrapper(`900.00`),
  [`/hsaDistributions/#${incompleteHsaDistributionId1}/hasWithdrawnExcessContributions`]: createBooleanWrapper(false),

  [`/hsaDistributions/#${hsaDistributionId}/filer`]: createCollectionItemWrapper(primaryFilerId),
  [`/hsaDistributions/#${hsaDistributionId}/hasWithdrawnExcessContributions`]: createBooleanWrapper(false),
  [`/hsaDistributions/#${hsaDistributionId}/writableDistributionsRolloverBool`]: createBooleanWrapper(false),
  [`/hsaDistributions/#${hsaDistributionId}/hasSeenLastAvailableScreen`]: createBooleanWrapper(true),
  [`/hsaDistributions/#${hsaDistributionId}/writableTrusteeName`]: createStringWrapper(`Trustier Trustee`),
  [`/hsaDistributions/#${hsaDistributionId}/writableGrossDistribution`]: createDollarWrapper(`900.00`),
  [`/hsaDistributions/#${hsaDistributionId}/writableQualifiedMedExpenses`]: createDollarWrapper(`900.00`),
  [`/hsaDistributions/#${hsaDistributionId}/hsaDistributionCode`]: createEnumWrapper(
    `normalDistribution`,
    `/hsaDistributionCodeOptions`
  ),
};

export const makeCareProviderData = (providerId: string) => {
  return {
    [`/cdccCareProviders/#${providerId}/hasTinOrEin`]: createBooleanWrapper(true),
    [`/cdccCareProviders/#${providerId}/isEmployerFurnished`]: createBooleanWrapper(false),
    [`/cdccCareProviders/#${providerId}/writableAmountPaidForCare`]: createDollarWrapper(`7000`),
    [`/cdccCareProviders/#${providerId}/writableEin`]: createEinWrapper(`55`, `5555555`),
    [`/cdccCareProviders/#${providerId}/writableIsOrganization`]: createBooleanWrapper(true),
    [`/cdccCareProviders/#${providerId}/writableIsTaxExempt`]: createBooleanWrapper(false),
    [`/cdccCareProviders/#${providerId}/writableOrganizationName`]: createStringWrapper(`Care4You`),
    [`/cdccCareProviders/#${providerId}/writableAddress`]: {
      $type: `gov.irs.factgraph.persisters.AddressWrapper`,
      item: { streetAddress: `111 Addy`, city: `Washington`, postalCode: `20001`, stateOrProvence: `DC` },
    },
  };
};
