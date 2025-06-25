/* eslint-disable max-len */
import { CollectionLoop, Gate, Screen, Subcategory, SubSubcategory } from '../../flowDeclarations.js';
import {
  Address,
  Boolean,
  CollectionItemManager,
  CollectionItemReference,
  ContextHeading,
  DFModal,
  DFAlert,
  Dollar,
  Enum,
  Ein,
  FactSelect,
  GenericString,
  Heading,
  InfoDisplay,
  LimitingString,
  SaveAndOrContinueButton,
  SetFactAction,
  TaxReturnAlert,
  Tin,
  IconDisplay,
  KnockoutButton,
  MefAlert,
  CollectionDataPreview,
  DFAccordion,
} from '../../ContentDeclarations.js';

/**
 * Welcome to the flow!
 *
 * The flow, while currently existing as code, has an eventual goal of becoming configuration that
 * tax experts will be able to modify. This leads to a few design choices:
 *
 * 1. Everything in this file should remain serializable.
 * 2. While many of the below react components look like our fact components, they have separate
 *    definitions from the components that actually render.
 *      - The components here have type FC<ComponentNameDeclaration>.
 *      - The components that render have type FC<ComponentNameProps> - these props may have additional
 *        info and callbacks -- but their props always _extend_ the props that exist here.
 * 3. We have to maintain a mapping between the components we declare here in our config and the components
 *    that eventually render. Right now, the best place to understand some of that mapping is between this file,
 *    FlowDeclarations, ContentDeclarations, FlowConfig, getNextScreen and Screen.tsx.
 */
export const JobIncomeSubcategory = (
  <Subcategory
    route='jobs'
    completeIf='/formW2sIsDone'
    collectionContext='/formW2s'
    dataItems={[
      {
        itemKey: `jobsTaxable`,
        conditions: [`/hasW2s`],
      },
      {
        itemKey: `jobsNoneTaxable`,
        conditions: [{ operator: `isFalse`, condition: `/hasW2s` }],
      },
    ]}
  >
    <Screen route='jobs-loop-intro' condition={{ operator: `isFalse`, condition: `data-import`, section: `form-w2s` }}>
      <ContextHeading
        displayOnlyOn='edit'
        i18nKey='/heading/income/jobs'
        condition={{ operator: `isFalseOrIncomplete`, condition: `/hasW2s` }}
      />
      <Heading i18nKey='/heading/income/jobs' condition='/hasW2s' />

      <Heading
        i18nKey='/heading/income/jobs/intro'
        conditions={[
          { operator: `isFalse`, condition: `/isFilingStatusMFJ` },
          { operator: `isFalseOrIncomplete`, condition: `/hasW2s` },
        ]}
      />
      <Heading
        i18nKey='/heading/income/jobs/intro-mfj'
        conditions={[{ condition: `/isFilingStatusMFJ` }, { operator: `isFalseOrIncomplete`, condition: `/hasW2s` }]}
      />

      <DFModal i18nKey='/info/income/w2/add' condition={{ operator: `isFalse`, condition: `/isFilingStatusMFJ` }} />
      <DFModal i18nKey='/info/income/w2/add-mfj' condition='/isFilingStatusMFJ' />

      <DFAlert
        i18nKey='/info/income/w2/supported-income-alert'
        headingLevel='h3'
        type='info'
        condition={{ operator: `isFalseOrIncomplete`, condition: `/hasW2s` }}
      >
        <DFModal i18nKey='/info/income/w2/supported-income-alert-modal' />
      </DFAlert>

      <DFModal i18nKey='/info/income/w2/supported-income' condition='/hasW2s' />
      <DFModal i18nKey='/info/income/w2/wage-calculations' condition='/hasW2s' />
      <CollectionItemManager path='/formW2s' loopName='/formW2s' donePath='/formW2sIsDone' />
    </Screen>
    <Gate condition={{ condition: `data-import`, section: `form-w2s` }}>
      <Screen route='jobs-loop-intro-data-import'>
        <ContextHeading displayOnlyOn='edit' batches={[`data-import-w2`]} i18nKey='/heading/income/jobs' />
        <Heading
          batches={[`data-import-w2`]}
          i18nKey='/heading/income/jobs-data-import-intro'
          conditions={[{ operator: `isFalseOrIncomplete`, condition: `/isFilingStatusMFJ` }]}
        />
        <Heading
          batches={[`data-import-w2`]}
          i18nKey='/heading/income/jobs-data-import-intro-mfj'
          condition={`/isFilingStatusMFJ`}
        />
        <InfoDisplay i18nKey='/info/income/w2/jobs-data-import-you-need' />
        <DFModal
          i18nKey='/info/income/w2/jobs-data-import'
          condition={{ operator: `isFalseOrIncomplete`, condition: `/isFilingStatusMFJ` }}
        />
        <DFModal i18nKey='/info/income/w2/jobs-data-import-mfj' condition={`/isFilingStatusMFJ`} />
        <DFAlert
          batches={[`data-import-w2`]}
          type='info'
          i18nKey={`/info/income/w2/employee-income-info-alert`}
          headingLevel={`h3`}
        >
          <DFModal batches={[`data-import-w2`]} i18nKey={`/info/income/w2/employee-income-info-modal`} />
        </DFAlert>
        <SaveAndOrContinueButton />
      </Screen>
      <Screen route='jobs-data-import-breather-check'>
        <Heading
          condition={{ operator: `isFalseOrIncomplete`, condition: `/isFilingStatusMFJ` }}
          i18nKey='/heading/income/jobs-data-import-breather-check-single'
        />
        <Heading condition={`/isFilingStatusMFJ`} i18nKey='/heading/income/jobs-data-import-breather-check-mfj' />
        <InfoDisplay condition={`/isFilingStatusMFJ`} i18nKey='/info/income/jobs-data-import-breather-check' />
        <SaveAndOrContinueButton />
      </Screen>
      <Screen route='jobs-data-import'>
        <ContextHeading displayOnlyOn='edit' batches={[`data-import-w2`]} i18nKey='/heading/income/jobs' />
        <Heading
          conditions={[
            { condition: `data-import`, section: `has-one-form-w2` },
            { operator: `isFalseOrIncomplete`, condition: `/isFilingStatusMFJ` },
          ]}
          batches={[`data-import-w2`]}
          i18nKey='/heading/income/jobs-data-import-preview-one-w2'
        />
        <Heading
          conditions={[
            { condition: `data-import`, section: `has-one-form-w2`, operator: `isFalse` },
            { operator: `isFalseOrIncomplete`, condition: `/isFilingStatusMFJ` },
          ]}
          batches={[`data-import-w2`]}
          i18nKey='/heading/income/jobs-data-import-preview-multiple-w2s'
        />
        <Heading
          conditions={[{ condition: `data-import`, section: `has-one-form-w2` }, { condition: `/isFilingStatusMFJ` }]}
          i18nKey='/heading/income/jobs-data-import-preview-one-w2-mfj'
        />
        <Heading
          conditions={[
            { condition: `data-import`, section: `has-one-form-w2`, operator: `isFalse` },
            { condition: `/isFilingStatusMFJ` },
          ]}
          i18nKey='/heading/income/jobs-data-import-preview-multiple-w2s-mfj'
        />
        <InfoDisplay
          batches={[`data-import-w2`]}
          i18nKey='/info/income/jobs/data-preview-one-w2'
          condition={{ condition: `data-import`, section: `has-one-form-w2` }}
        />
        <InfoDisplay
          batches={[`data-import-w2`]}
          i18nKey='/info/income/jobs/data-preview-multiple-w2s'
          condition={{ condition: `data-import`, section: `has-one-form-w2`, operator: `isFalse` }}
        />
        <DFModal
          condition={{ condition: `/isFilingStatusMFJ`, operator: `isFalse` }}
          batches={[`data-import-w2`]}
          i18nKey='/info/income/w2/what-if-w2-missing'
        />
        <DFModal
          condition={`/isFilingStatusMFJ`}
          batches={[`data-import-w2`]}
          i18nKey='/info/income/w2/what-if-w2-missing-mfj'
        />
        <DFModal batches={[`data-import-w2`]} i18nKey='/info/income/w2/how-does-irs-know' />
        <CollectionDataPreview
          subsubcategories={[`w-2-basic-info`, `employer-info`]}
          nextRouteOverride='/flow/income/jobs/jobs-imported-w2'
        />
      </Screen>
      <Screen route='jobs-data-import-breather-done'>
        <Heading
          condition={{ operator: `isFalseOrIncomplete`, condition: `/isFilingStatusMFJ` }}
          batches={[`data-import-w2`]}
          i18nKey='/heading/income/jobs-data-import-breather-done'
        />
        <Heading
          condition={`/isFilingStatusMFJ`}
          batches={[`data-import-w2`]}
          i18nKey='/heading/income/jobs-data-import-breather-done-mfj'
        />
        <InfoDisplay
          batches={[`data-import-w2`]}
          i18nKey='/info/income/jobs/data-import-breather-done-single'
          condition={{ operator: `isFalse`, condition: `/isFilingStatusMFJ` }}
        />
        <InfoDisplay
          batches={[`data-import-w2`]}
          i18nKey='/info/income/jobs/data-import-breather-done-mfj'
          condition='/isFilingStatusMFJ'
        />
        <DFModal i18nKey='/info/income/jobs/data-import-why-manual' condition='/isFilingStatusMFJ' />
        <SaveAndOrContinueButton nextRouteOverride='/data-view/flow/income/jobs?reviewMode=true' />
      </Screen>
      <Screen route='jobs-imported-w2'>
        <Heading batches={[`data-import-w2`]} i18nKey='/heading/income/jobs' />
        <DFModal
          batches={[`data-import-w2`]}
          i18nKey='/info/income/w2/add'
          condition={{ operator: `isFalse`, condition: `/isFilingStatusMFJ` }}
        />
        <DFModal batches={[`data-import-w2`]} i18nKey='/info/income/w2/add-mfj' condition='/isFilingStatusMFJ' />
        <DFModal batches={[`data-import-w2`]} i18nKey='/info/income/w2/supported-income' />
        <DFModal batches={[`data-import-w2`]} i18nKey='/info/income/w2/wage-calculations' />
        <CollectionItemManager path='/formW2s' loopName='/formW2s' donePath='/formW2sIsDone' />
      </Screen>
    </Gate>
    <CollectionLoop
      loopName='/formW2s'
      collection='/formW2s'
      collectionItemCompletedCondition='/formW2s/*/isComplete'
      iconName='AttachMoney'
      donePath='/formW2sIsDone'
      isImportedFactPath='/formW2s/*/isImported'
      importedFlowStartRoute='/flow/income/jobs/jobs-data-import-refer-W2'
      importedFlowDonePath='/formW2s/*/hasSeenLastAvailableScreen'
      importedRouteOverride='/flow/income/jobs/jobs-data-import-breather-done'
      dataViewSections={[
        {
          i18nKey: `dataviews./flow/income/jobs.primaryFilerW2s`,
          condition: `/formW2s/*/filer/isPrimaryFiler`,
        },
        {
          i18nKey: `dataviews./flow/income/jobs.secondaryFilerW2s`,
          condition: `/formW2s/*/belongsToSecondaryFiler`,
        },
      ]}
    >
      <Gate condition={`/formW2s/*/isImported`}>
        <Screen route='jobs-data-import-ko' condition={`/knockoutFormW2s`} isKnockout={true}>
          <IconDisplay name='ErrorOutline' size={9} isCentered />
          <Heading batches={[`data-import-w2`]} i18nKey='/heading/income/jobs-data-import-ko' />
          <InfoDisplay
            i18nKey='/info/income/jobs/data-import-ko-one-w2'
            condition={{ condition: `data-import`, section: `has-one-form-w2` }}
            batches={[`data-import-w2`]}
          />
          <InfoDisplay
            i18nKey='/info/income/jobs/data-import-ko-multiple-w2s'
            condition={{ condition: `data-import`, section: `has-one-form-w2`, operator: `isFalse` }}
            batches={[`data-import-w2`]}
          />
          <DFAccordion
            i18nKey='/info/knockout/social-security-wages-accordion'
            condition={`/anyFilerExceedsMaxOasdiWages`}
            batches={[`data-import-w2`]}
          />
          <DFAccordion
            i18nKey='/info/knockout/medicare-wages-accordion-mfs'
            conditions={[{ condition: `/knockoutMedicareWages` }, { condition: `/isFilingStatusMFS` }]}
            batches={[`data-import-w2`]}
          />
          <DFAccordion
            i18nKey='/info/knockout/medicare-wages-accordion-mfj'
            conditions={[{ condition: `/knockoutMedicareWages` }, { condition: `/isFilingStatusMFJ` }]}
            batches={[`data-import-w2`]}
          />
          <DFAccordion
            i18nKey='/info/knockout/medicare-wages-accordion-single'
            conditions={[
              { condition: `/knockoutMedicareWages` },
              { operator: `isFalse`, condition: `/isFilingStatusMFJ` },
              { operator: `isFalse`, condition: `/isFilingStatusMFS` },
            ]}
            batches={[`data-import-w2`]}
          />
          <DFAccordion
            i18nKey='/info/knockout/allocated-tips-primary-filer-accordion'
            condition='/formW2WithAllocatedTips'
            batches={[`data-import-w2`]}
          />
          <DFAccordion
            i18nKey='/info/knockout/forms-missing/w2-nonqualified-plan-ko-accordion'
            condition='/flowKnockoutNonQualifiedPlans'
            batches={[`data-import-w2`]}
          />
          <DFAccordion
            i18nKey='/info/knockout/forms-missing/third-party-sick-pay-accordion'
            condition='/flowKnockoutThirdPartySickPay'
            batches={[`data-import-w2`]}
          />
          <DFAccordion
            i18nKey='/info/knockout/forms-missing/statutory-employee-accordion'
            condition='/flowKnockoutStatutoryEmployee'
            batches={[`data-import-w2`]}
          />
          <DFAlert
            className='margin-top-3'
            i18nKey='/info/knockout/data-import-file-using-another-tool'
            headingLevel='h2'
            type='warning'
            batches={[`data-import-w2`]}
          />
          <KnockoutButton i18nKey='button.knockout' />
          <SaveAndOrContinueButton
            isOutline={true}
            condition={{ condition: `data-import`, section: `has-one-form-w2` }}
            i18nKey='datapreviews./formW2s.button.reviewSingular'
            nextRouteOverride='/data-view/flow/income/jobs'
            batches={[`data-import-w2`]}
          />
          <SaveAndOrContinueButton
            isOutline={true}
            condition={{ condition: `data-import`, section: `has-one-form-w2`, operator: `isFalse` }}
            i18nKey='datapreviews./formW2s.button.reviewPlural'
            nextRouteOverride='/data-view/flow/income/jobs'
            batches={[`data-import-w2`]}
          />
        </Screen>
        <Screen route='jobs-data-import-breather'>
          <Heading batches={[`data-import-w2`]} i18nKey='/heading/income/jobs-data-import-breather' />
          <InfoDisplay batches={[`data-import-w2`]} i18nKey='/info/income/jobs/data-import-breather' />
          <SaveAndOrContinueButton />
        </Screen>
        <Screen route='jobs-data-import-refer-W2' condition={`/formW2s/*/isImported`}>
          <Heading i18nKey='/heading/income/jobs-data-import-refer-w2' />
          <InfoDisplay i18nKey='/info/income/jobs-data-import-refer-w2' />
          <DFModal i18nKey='/info/income/jobs-data-import-where-do-i-find-my-w2' />
          <SaveAndOrContinueButton nextRouteOverride='/flow/income/jobs/w2-has-box-12' />
        </Screen>
      </Gate>
      <SubSubcategory route='w-2-basic-info'>
        <Screen route='w2-add-whose-w2' condition='/formW2s/*/showWhoseW2Screen'>
          <TaxReturnAlert
            i18nKey='/info/income/w2/secondary-filer-income-without-mfj'
            headingLevel='h3'
            type='error'
            condition='/formW2s/*/secondaryFilerUsedWithoutMFJ'
          />
          <Heading i18nKey='/heading/income/jobs/w2-add-whose-w2' />
          <CollectionItemReference path='/formW2s/*/filer' displayOnlyOn='edit' />
          <GenericString path='/formW2s/*/filer/firstName' displayOnlyOn='data-view' />
          <SaveAndOrContinueButton />
        </Screen>
        <Screen route='w2-add-box-a' condition='/formW2s/*/flowFilerTinIsSsn'>
          {/* TODO: Add condition twhen SSN on W-2 does not match filer's SSN.
              https://git.irslabs.org/irslabs-prototypes/direct-file/-/issues/13776
          */}
          <TaxReturnAlert
            type='warning'
            batches={[`data-import-w2`]}
            i18nKey='/info/income/w2/ssn-does-not-match'
            conditions={[{ operator: `isFalse`, condition: `/flowTrue` }]}
          />
          <Heading i18nKey='/heading/income/jobs/w2-add-box-a' />
          <SetFactAction
            path='/formW2s/*/filer'
            source='/primaryFiler'
            conditions={[
              { operator: `isIncomplete`, condition: `/formW2s/*/filer` },
              { operator: `isFalseOrIncomplete`, condition: `/treatAsMFJ` },
            ]}
          />
          <SetFactAction
            path='/formW2s/*/filer'
            source='/primaryFiler'
            conditions={[
              // We can set the W2 filer as the primary filer's if they are importing the W2.
              { operator: `isIncomplete`, condition: `/formW2s/*/filer` },
              { operator: `isTrue`, condition: `/formW2s/*/isImported` },
            ]}
          />
          <DFModal
            batches={[`data-import-w2`]}
            condition={`/formW2s/*/filer/isPrimaryFiler`}
            i18nKey='/info/you-and-your-family/about-you/tin/cant-change'
          />
          <DFModal
            batches={[`data-import-w2`]}
            condition={`/formW2s/*/filer/isSecondaryFiler`}
            i18nKey='/info/you-and-your-family/about-you/tin/cant-change-spouse'
          />
          <DFModal batches={[`data-import-w2`]} i18nKey='/info/income/w2/what-if-w2-ssn-is-wrong' />
          {/* These TIN fields are messy --- if the primary filer isn't filing MFJ, we won't have a
              filer on THIS screen. If they are filing MFJ though, we will have a filer. So, we
              have to be a little hacky with that first TIN field and use the incompletion of
              /formW2s/STAR/filer to know if this W2 belongs to the primary filer, and hardcode
              that TIN. Everything should work fine AFTER this screen, thankfully.
          */}
          <Tin
            batches={[`data-import-w2`]}
            path='/formW2s/*/filer/tin'
            readOnly={true}
            condition={{ operator: `isTrueOrIncomplete`, condition: `/formW2s/*/filer/isPrimaryFiler` }}
            isSensitive={true}
          />
          <Tin
            path='/formW2s/*/filer/tin'
            readOnly={true}
            condition='/formW2s/*/filer/isSecondaryFiler'
            isSensitive={true}
          />
          <SaveAndOrContinueButton />
        </Screen>
        <Screen
          route='w2-add-step2-has-itin'
          condition={{ operator: `isFalseOrIncomplete`, condition: `/formW2s/*/flowFilerTinIsSsn` }}
        >
          <TaxReturnAlert
            type='error'
            i18nKey='/info/income/w2/invalid-ssn'
            conditions={[{ operator: `isFalse`, condition: `/formW2s/*/tin/isSSN` }]}
          />
          <Heading i18nKey='/heading/income/jobs/w2-add-step2-has-itin' />
          <SetFactAction
            path='/formW2s/*/filer'
            source='/primaryFiler'
            conditions={[
              { operator: `isIncomplete`, condition: `/formW2s/*/filer` },
              { operator: `isFalseOrIncomplete`, condition: `/treatAsMFJ` },
            ]}
          />
          <DFModal i18nKey='/info/income/w2/itin' />
          <DFModal batches={[`data-import-w2`]} i18nKey='/info/income/w2/what-if-w2-ssn-is-wrong' />
          <Tin path='/formW2s/*/tin' isSensitive={true} />
          <SaveAndOrContinueButton />
        </Screen>
        <Screen route='w2-add-box-e'>
          <Heading i18nKey='/heading/income/jobs/w2-add-box-e' />
          <DFModal
            batches={[`data-import-w2`]}
            i18nKey='/info/income/w2/why-change-name'
            condition='/formW2s/*/filer/isPrimaryFiler'
          />
          <DFModal
            batches={[`data-import-w2`]}
            i18nKey='/info/income/w2/why-change-name-mfj'
            condition='/formW2s/*/filer/isSecondaryFiler'
          />
          <DFModal batches={[`data-import-w2`]} i18nKey='/info/income/w2/what-if-w2-name-is-wrong' />
          <LimitingString
            path='/formW2s/*/filer/firstName'
            readOnly={true}
            displayOnlyOn='edit'
            condition='/formW2s/*/filer/isPrimaryFiler'
          />
          <LimitingString
            path='/formW2s/*/filer/firstName'
            readOnly={true}
            displayOnlyOn='edit'
            condition='/formW2s/*/filer/isSecondaryFiler'
          />
          <LimitingString
            path='/formW2s/*/filer/writableMiddleInitial'
            readOnly={true}
            displayOnlyOn='edit'
            condition='/formW2s/*/filer/isPrimaryFiler'
          />
          <LimitingString
            path='/formW2s/*/filer/writableMiddleInitial'
            readOnly={true}
            displayOnlyOn='edit'
            condition='/formW2s/*/filer/isSecondaryFiler'
          />
          <LimitingString
            path='/formW2s/*/filer/lastName'
            readOnly={true}
            displayOnlyOn='edit'
            condition='/formW2s/*/filer/isPrimaryFiler'
          />
          <LimitingString
            path='/formW2s/*/filer/lastName'
            readOnly={true}
            displayOnlyOn='edit'
            condition='/formW2s/*/filer/isSecondaryFiler'
          />
          <LimitingString path='/formW2s/*/filer/fullName' displayOnlyOn='data-view' />
          <SaveAndOrContinueButton />
        </Screen>
        <Screen route='w2-add-box-f-choice' condition={{ operator: `isFalse`, condition: `/formW2s/*/isImported` }}>
          <Heading i18nKey='/heading/income/jobs/w2-add-box-f-choice' />
          <Boolean path='/formW2s/*/addressMatchesReturn' importedPath='/formW2s/*/importedAddressMatchesReturn' />
          <DFModal i18nKey='/info/income/w2/what-if-w2-new-address' />
          <SaveAndOrContinueButton />
        </Screen>
        <Screen
          route='w2-add-box-f-different-address'
          condition={{ operator: `isFalse`, condition: `/formW2s/*/addressMatchesReturn` }}
        >
          <Heading i18nKey='/heading/income/jobs/w2-add-box-f-different-address' />
          <InfoDisplay i18nKey='/info/income/jobs/w2-add-box-f-different-address' />
          <DFModal i18nKey='/info/income/w2/what-if-w2-new-address' />
          <Address
            path='/formW2s/*/addressOverride'
            importedPath='/formW2s/*/importedEmployeeAddress'
            hintKey='/info/why-cant-i-change-country'
          />
          <SaveAndOrContinueButton />
        </Screen>
      </SubSubcategory>
      <SubSubcategory route='employer-info'>
        <Screen route='w2-add-box-bc'>
          <MefAlert
            i18nKey='w2'
            type='warning'
            mefErrorCode='FW2-502'
            factPaths={[`/formW2s/*/ein`, `/formW2s/*/employerName`]}
          />
          <ContextHeading
            displayOnlyOn='edit'
            i18nKey='/heading/income/jobs/w2-data-import-review'
            condition='/formW2s/*/isImported'
            batches={[`data-import-w2`]}
          />
          <Heading i18nKey='/heading/income/jobs/w2-add-box-bc' />
          <Ein path='/formW2s/*/ein' importedPath='/formW2s/*/importedEin' />
          <InfoDisplay i18nKey='/info/income/w2/box-c-group-label' />
          <LimitingString path='/formW2s/*/employerName' importedPath='/formW2s/*/importedEmployerName' />
          <LimitingString
            path='/formW2s/*/writableEmployerNameLine2'
            importedPath='/formW2s/*/importedWritableEmployerNameLine2'
            required={false}
          />
          <Address
            path='/formW2s/*/employerAddress'
            importedPath='/formW2s/*/importedEmployerAddress'
            hintKey='/info/why-cant-i-change-country'
          />
          <InfoDisplay i18nKey='/info/income/w2/skip-box-d' />
          <DFModal i18nKey='/info/income/w2/why-skipping-box-d' />
          <SaveAndOrContinueButton />
        </Screen>
      </SubSubcategory>
      <SubSubcategory route='wages-and-taxes-withheld'>
        <Screen route='w2-add-boxes-1-8'>
          <Heading i18nKey='/heading/income/jobs/w2-add-boxes-1-8' />
          <InfoDisplay i18nKey='/info/income/jobs/w2-add-blank-boxes' />
          <DFModal batches={[`data-import-w2`]} i18nKey='/info/income/w2/what-if-numbers-wrong' />
          <Dollar path='/formW2s/*/writableWages' importedPath='/formW2s/*/importedWritableWages' required={false} />
          <Dollar
            path='/formW2s/*/writableFederalWithholding'
            importedPath='/formW2s/*/importedWritableFederalWithholding'
            required={false}
          />
          <Dollar
            path='/formW2s/*/writableOasdiWages'
            importedPath='/formW2s/*/importedWritableOasdiWages'
            required={false}
          />
          <Dollar
            path='/formW2s/*/writableOasdiWithholding'
            importedPath='/formW2s/*/importedWritableOasdiWithholding'
            required={false}
          />
          <Dollar
            path='/formW2s/*/writableMedicareWages'
            importedPath='/formW2s/*/importedWritableMedicareWages'
            required={false}
          />
          <Dollar
            path='/formW2s/*/writableMedicareWithholding'
            importedPath='/formW2s/*/importedWritableMedicareWithholding'
            required={false}
          />
          <Dollar
            path='/formW2s/*/writableOasdiTips'
            importedPath='/formW2s/*/importedWritableOasdiTips'
            required={false}
          />
          <Dollar
            path='/formW2s/*/writableAllocatedTips'
            importedPath='/formW2s/*/importedWritableAllocatedTips'
            required={false}
          />
          <SaveAndOrContinueButton />
        </Screen>
        <Screen route='social-security-wages-limit-ko' condition='/anyFilerExceedsMaxOasdiWages' isKnockout={true}>
          <IconDisplay name='ErrorOutline' size={9} isCentered />
          <Heading
            i18nKey='/heading/knockout/social-security-wages-primary-filer'
            condition='/primaryFilerExceedsMaxOasdiWages'
          />
          <Heading
            i18nKey='/heading/knockout/social-security-wages-secondary-filer'
            condition={{ operator: `isFalseOrIncomplete`, condition: `/primaryFilerExceedsMaxOasdiWages` }}
          />
          <InfoDisplay
            i18nKey='/info/knockout/social-security-wages-primary-filer'
            condition='/primaryFilerExceedsMaxOasdiWages'
          />
          <InfoDisplay
            i18nKey='/info/knockout/social-security-wages-secondary-filer'
            condition={{ operator: `isFalseOrIncomplete`, condition: `/primaryFilerExceedsMaxOasdiWages` }}
          />
          <DFAlert i18nKey='/info/knockout/generic-other-ways-to-file' headingLevel='h2' type='warning' />
          <KnockoutButton i18nKey='button.knockout' />
        </Screen>
        <Gate condition='/knockoutMedicareWages'>
          <Screen route='medicare-wages-ko' condition='/anyFilerRequiredToPayExtraMedicareTax' isKnockout={true}>
            <IconDisplay name='ErrorOutline' size={9} isCentered />
            <Heading i18nKey='/heading/knockout/medicare-wages-mfj' condition='/isFilingStatusMFJ' />
            <Heading
              i18nKey='/heading/knockout/medicare-wages'
              condition={{ operator: `isFalseOrIncomplete`, condition: `/isFilingStatusMFJ` }}
            />
            <InfoDisplay
              i18nKey='/info/knockout/medicare-wages'
              condition={{ operator: `isFalseOrIncomplete`, condition: `/isFilingStatusMFJ` }}
            />
            <InfoDisplay i18nKey='/info/knockout/medicare-wages-mfj' condition='/isFilingStatusMFJ' />
            <DFAlert i18nKey='/info/knockout/generic-other-ways-to-file' headingLevel='h2' type='warning' />
            <KnockoutButton i18nKey='button.knockout' />
          </Screen>
          <Screen
            route='medicare-wages-ko-credit'
            condition='/anyFilerExceedsEligibleForMedicareWagesCredit'
            isKnockout={true}
          >
            <IconDisplay name='ErrorOutline' size={9} isCentered />
            <Heading i18nKey='/heading/knockout/medicare-wages-credit' />
            <InfoDisplay i18nKey='/info/knockout/medicare-wages-credit' />
            <DFAlert i18nKey='/info/knockout/generic-other-ways-to-file' headingLevel='h2' type='warning' />

            <KnockoutButton i18nKey='button.knockout' />
          </Screen>
        </Gate>
        <Screen route='w2-allocated-tips-ko' condition='/flowKnockoutAllocatedTips' isKnockout={true}>
          <IconDisplay name='ErrorOutline' size={9} isCentered />
          <Heading i18nKey='/heading/knockout/forms-missing/allocated-tips' />
          <InfoDisplay
            i18nKey='/info/knockout/allocated-tips-primary-filer'
            condition='/formW2WithAllocatedTips/filer/isPrimaryFiler'
          />
          <InfoDisplay
            i18nKey='/info/knockout/allocated-tips-secondary-filer'
            condition='/formW2WithAllocatedTips/filer/isSecondaryFiler'
          />
          <DFAlert i18nKey='/info/knockout/generic-other-ways-to-file' headingLevel='h3' type='warning' />
          <KnockoutButton i18nKey='button.knockout' />
        </Screen>
      </SubSubcategory>
      <SubSubcategory route='benefits-received'>
        <Screen route='w2-add-boxes-10-11'>
          <Heading i18nKey='/heading/income/jobs/w2-add-boxes-10-11' />
          <InfoDisplay i18nKey='/info/income/jobs/w2-add-blank-boxes' />
          <Dollar
            path='/formW2s/*/writableDependentCareBenefits'
            importedPath='/formW2s/*/importedWritableDependentCareBenefits'
            hintKey='/info/income/w2/what-are-dependent-care-benefits'
            required={false}
          />
          <Dollar
            path='/formW2s/*/writableNonQualifiedPlans'
            importedPath='/formW2s/*/importedWritableNonQualifiedPlans'
            hintKey='/info/income/w2/what-are-non-qualified-plans'
            required={false}
          />
          <SaveAndOrContinueButton />
        </Screen>
        <Screen route='w2-nonqualified-plan-ko' condition='/flowKnockoutNonQualifiedPlans' isKnockout={true}>
          <IconDisplay name='ErrorOutline' size={9} isCentered />
          <Heading i18nKey='/heading/knockout/forms-missing/w2-nonqualified-plan-ko' />
          <DFAlert i18nKey='/info/knockout/generic-other-ways-to-file' headingLevel='h3' type='warning' />
          <KnockoutButton i18nKey='button.knockout' />
        </Screen>
      </SubSubcategory>
      <SubSubcategory route='box-12-codes'>
        <Screen route='w2-has-box-12'>
          <Heading i18nKey='/heading/income/jobs/w2-has-box-12' />
          <ContextHeading
            displayOnlyOn='edit'
            i18nKey='/heading/income/jobs/w2-data-import-review'
            condition='/formW2s/*/isImported'
            batches={[`data-import-w2`]}
          />
          <DFModal i18nKey='/info/income/w2/whats-box-12-used-for' />
          <Boolean path='/formW2s/*/writableHasBox12Codes' displayOnlyOn='edit' />
          {/* If the filer says 'no', we want to show the "blank" copy for box 12 */}
          <FactSelect
            path='/formW2s/*/writableBox12Code'
            displayOnlyOn='data-view'
            condition={{ operator: `isFalse`, condition: `/formW2s/*/writableHasBox12Codes` }}
            required={false}
          />
          <SaveAndOrContinueButton />
        </Screen>
        <Screen route='w2-add-box-12' condition='/formW2s/*/hasBox12Codes'>
          <ContextHeading
            displayOnlyOn='edit'
            i18nKey='/heading/income/jobs/w2-data-import-review'
            condition='/formW2s/*/isImported'
            batches={[`data-import-w2`]}
          />
          <Heading i18nKey='/heading/income/jobs/w2-add-box-12' />
          <InfoDisplay i18nKey='/info/income/jobs/w2-add-blank-boxes-box-12' />
          <DFModal i18nKey='/info/income/w2/whats-box-12-used-for' />
          <FactSelect path='/formW2s/*/writableBox12Code' required={false} />
          <SaveAndOrContinueButton />
        </Screen>
        <Screen route='w2-governmental-457b' condition='/formW2s/*/457bDeferralsNeeded'>
          <ContextHeading
            displayOnlyOn='edit'
            i18nKey='/heading/income/jobs/w2-data-import-review'
            condition='/formW2s/*/isImported'
            batches={[`data-import-w2`]}
          />
          <Heading i18nKey='/heading/income/jobs/w2-governmental-457b' />
          <DFModal i18nKey='/info/income/w2/whats-governmental-457b' />
          <Boolean path='/formW2s/*/457bIsGovernmentalPlan' />
          <SaveAndOrContinueButton />
        </Screen>
      </SubSubcategory>
      <Screen route='w2-box-12-ko' condition='/knockoutForBox12Value' isKnockout={true}>
        <IconDisplay name='ErrorOutline' size={9} isCentered />
        <Heading i18nKey='/heading/knockout/forms-missing/w2-box-12-ko' />
        <DFAlert i18nKey='/info/knockout/generic-other-ways-to-file' headingLevel='h3' type='warning' />
        <KnockoutButton i18nKey='button.knockout' />
      </Screen>
      <Screen route='w2-box-12-dependent-ko' condition='/knockoutForBox12Dependency' isKnockout={true}>
        <IconDisplay name='ErrorOutline' size={9} isCentered />
        <Heading batches={[`income-assorted-kos-0`]} i18nKey='/heading/knockout/forms-missing/w2-box-12-dependent-ko' />
        <InfoDisplay
          batches={[`income-assorted-kos-0`]}
          i18nKey='/info/knockout/forms-missing/w2-box-12-ko-dependent-part1'
          condition={{ operator: `isFalse`, condition: `/isFilingStatusMFJ` }}
        />
        <InfoDisplay
          batches={[`income-assorted-kos-0`]}
          i18nKey='/info/knockout/forms-missing/w2-box-12-ko-dependent-part1-spouse'
          condition='/isFilingStatusMFJ'
        />
        <InfoDisplay
          batches={[`income-assorted-kos-0`]}
          i18nKey='/info/knockout/forms-missing/w2-box-12-ko-dependent-part2'
        />
        <DFAlert
          batches={[`income-assorted-kos-0`]}
          i18nKey='/info/knockout/generic-other-ways-to-file'
          headingLevel='h3'
          type='warning'
        />
        <KnockoutButton i18nKey='button.knockout' />
      </Screen>
      <SubSubcategory route='box-13-codes'>
        <Screen route='w2-add-box-13-options' condition={`/formW2s/*/showBox13CodesScreen`}>
          <Heading i18nKey='/heading/income/jobs/w2-add-box-13-options' />
          <InfoDisplay i18nKey='/info/income/w2-box-13-blank' />
          <DFModal i18nKey='/info/income/w2/whats-box-13-used-for' />
          <Boolean
            path='/formW2s/*/statutoryEmployee'
            inputType='checkbox'
            importedPath='/formW2s/*/importedStatutoryEmployee'
            required={false}
          />
          <Boolean
            path='/formW2s/*/retirementPlan'
            inputType='checkbox'
            importedPath='/formW2s/*/importedRetirementPlan'
            required={false}
          />
          <Boolean
            path='/formW2s/*/thirdPartySickPay'
            inputType='checkbox'
            importedPath='/formW2s/*/importedThirdPartySickPay'
            required={false}
          />
          <SaveAndOrContinueButton />
          {/* TODO:  Add condition for this content - https://git.irslabs.org/irslabs-prototypes/direct-file/-/issues/2616 */}
        </Screen>
        <Screen route='w2-box-13-statutory-ko' condition='/flowKnockoutStatutoryEmployee' isKnockout={true}>
          <IconDisplay name='ErrorOutline' size={9} isCentered />
          <Heading i18nKey='/heading/knockout/forms-missing/statutory-employee' />
          <DFAlert i18nKey='/info/knockout/generic-other-ways-to-file' headingLevel='h2' type='warning' />
          <KnockoutButton i18nKey='button.knockout' />
        </Screen>
        <Screen route='w2-box-13-sick-pay-ko' condition='/flowKnockoutThirdPartySickPay' isKnockout={true}>
          <IconDisplay name='ErrorOutline' size={9} isCentered />
          <Heading i18nKey='/heading/knockout/forms-missing/third-party-sick-pay' />
          <DFAlert i18nKey='/info/knockout/generic-other-ways-to-file' headingLevel='h2' type='warning' />
          <KnockoutButton i18nKey='button.knockout' />
        </Screen>
      </SubSubcategory>
      <SubSubcategory route='box-14-codes'>
        <Screen route='w2-has-box-14'>
          <ContextHeading
            displayOnlyOn='edit'
            i18nKey='/heading/income/jobs/w2-data-import-review'
            condition='/formW2s/*/isImported'
            batches={[`data-import-w2`]}
          />
          <Heading i18nKey='/heading/income/jobs/w2-has-box-14' />
          <DFModal i18nKey='/info/income/w2/whats-box-14-used-for' />
          <Boolean path='/formW2s/*/writableHasBox14Codes' displayOnlyOn='edit' />
          {/* If the filer says 'no', we want to show the "blank" copy for box 14 */}
          <FactSelect
            path='/formW2s/*/writableBox14Code'
            displayOnlyOn='data-view'
            condition={{ operator: `isFalse`, condition: `/formW2s/*/writableHasBox14Codes` }}
            required={false}
          />
          <SaveAndOrContinueButton />
        </Screen>
        <Gate condition='/formW2s/*/hasBox14Codes'>
          <Screen route='w2-add-box-14' condition={{ operator: `isFalse`, condition: `/flowStateToolNeedsBox14` }}>
            <ContextHeading
              displayOnlyOn='edit'
              i18nKey='/heading/income/jobs/w2-data-import-review'
              condition='/formW2s/*/isImported'
              batches={[`data-import-w2`]}
            />
            <Heading i18nKey='/heading/income/jobs/w2-add-box-14' />
            <InfoDisplay i18nKey='/info/income/w2-box-14' />
            <DFModal i18nKey='/info/income/w2-what-is-box-14' />
            <Boolean path='/formW2s/*/hasRRTACodes' />
            <SaveAndOrContinueButton />
          </Screen>
          <Screen route='rrta-codes-ko' condition='/flowKnockoutHasRRTACodesInBox14NotInNY' isKnockout={true}>
            <IconDisplay name='ErrorOutline' size={9} isCentered />
            <Heading i18nKey='/heading/knockout/forms-missing/w2-box-14-with-rrta-codes-not-in-ny-ko' />
            <DFAlert i18nKey='/info/knockout/generic-other-ways-to-file' headingLevel='h2' type='warning' />
            <KnockoutButton i18nKey='button.knockout' />
          </Screen>
          <Screen route='w2-add-box-14-ny' condition='/flowStateToolNeedsBox14'>
            <ContextHeading
              displayOnlyOn='edit'
              i18nKey='/heading/income/jobs/w2-data-import-review'
              condition='/formW2s/*/isImported'
              batches={[`data-import-w2`]}
            />
            <Heading i18nKey='/heading/income/jobs/w2-add-box-14-ny' />
            <InfoDisplay i18nKey='/info/income/jobs/w2-box-14-ny' />
            <DFModal
              i18nKey='/info/income/w2-what-is-box-14-ny'
              condition={{ operator: `isFalse`, condition: `/livedInMd` }}
              batches={[`updates-0`]}
            />
            <DFModal i18nKey='/info/income/w2-what-is-box-14-md' condition='/livedInMd' batches={[`updates-0`]} />
            <FactSelect
              path='/formW2s/*/writableBox14CodeMd'
              required={false}
              condition='/livedInMd'
              batches={[`updates-0`]}
            />
            <FactSelect path='/formW2s/*/writableBox14Code' required={false} condition='/livedInNy' />
            <FactSelect
              path='/formW2s/*/writableBox14CodeNj'
              required={false}
              condition='/livedInNj'
              batches={[`updates-0`]}
            />
            <SaveAndOrContinueButton />
          </Screen>
        </Gate>
        <Screen route='w2-box-14-rrta-ny-ko' condition='/hasABox14NYRRTAValueWeKnockout' isKnockout={true}>
          <IconDisplay name='ErrorOutline' size={9} isCentered />
          <Heading i18nKey='/heading/knockout/forms-missing/w2-box-14-rrta-ny-ko' />
          <InfoDisplay i18nKey='/info/knockout/forms-missing/w2-box-14-rrta-ny-ko' />
          <DFAlert i18nKey='/info/knockout/generic-other-ways-to-file' headingLevel='h3' type='warning' />
          <KnockoutButton i18nKey='button.knockout' />
        </Screen>
        <Gate condition='/formW2s/*/mdResidentHasOtherBox14Codes'>
          <Screen route='w2-box-14-md-union-dues'>
            <Heading i18nKey='/heading/income/jobs/w2-box-14-md-union-dues' batches={[`updates-0`]} />
            <DFModal i18nKey='/info/income/w2-which-box-14-codes-are-union-dues' batches={[`updates-0`]} />
            <Boolean path='/formW2s/*/paidUnionDues' />
            <SaveAndOrContinueButton />
          </Screen>
          <Screen route='w2-box-14-md-union-dues-amount' condition='/formW2s/*/paidUnionDues'>
            <Heading i18nKey='/heading/income/jobs/w2-box-14-md-union-dues-amount' batches={[`updates-0`]} />
            <DFModal i18nKey='/info/income/w2-box-14-union-dues-other-payments' batches={[`updates-0`]} />
            <Dollar path='/formW2s/*/writableUnionDuesAmount' batches={[`updates-0`]} />
            <SaveAndOrContinueButton />
          </Screen>
        </Gate>
      </SubSubcategory>
      <SubSubcategory route='state-and-local-tax-info'>
        <Screen route='w2-add-boxes-15-20'>
          <ContextHeading
            displayOnlyOn='edit'
            i18nKey='/heading/income/jobs/w2-data-import-review'
            condition='/formW2s/*/isImported'
            batches={[`data-import-w2`]}
          />
          <Heading i18nKey='/heading/income/jobs/w2-add-boxes-15-20' />
          <TaxReturnAlert
            i18nKey='/info/income/jobs/w2-box-16-without-state-code'
            type='error'
            condition='/formW2s/*/hasStateWagesWithoutStateCode'
            factPaths={[`/formW2s/*/writableStateWages`, `/formW2s/*/writableState`]}
          />
          <TaxReturnAlert
            i18nKey='/info/income/jobs/w2-box-17-greater-than-box-16'
            type='error'
            condition='/formW2s/*/box17GreaterThanBox16'
            factPaths={[`/formW2s/*/writableStateWages`, `/formW2s/*/writableStateWithholding`]}
          />
          <TaxReturnAlert
            i18nKey='/info/income/jobs/w2-box-19-greater-than-box-18'
            type='error'
            condition='/formW2s/*/box19GreaterThanBox18'
            factPaths={[`/formW2s/*/writableLocalWages`, `/formW2s/*/writableLocalWithholding`]}
          />
          <InfoDisplay i18nKey='/info/income/jobs/w2-add-blank-boxes' />
          <DFModal i18nKey='/info/income/w2-boxes-15-20' />
          <Enum path='/formW2s/*/writableState' required={false} renderAs='select' />
          <LimitingString path='/formW2s/*/writableStateEmployerId' required={false} />
          <Dollar path='/formW2s/*/writableStateWages' required={false} />
          <Dollar path='/formW2s/*/writableStateWithholding' required={false} />
          <Dollar path='/formW2s/*/writableLocalWages' required={false} />
          <Dollar path='/formW2s/*/writableLocalWithholding' required={false} />
          <LimitingString path='/formW2s/*/writableLocality' required={false} />
          <SaveAndOrContinueButton />
        </Screen>
        <Screen route='w2-missing-state-income' condition='/formW2s/*/missingStateIncome'>
          <ContextHeading
            displayOnlyOn='edit'
            i18nKey='/heading/income/jobs/w2-data-import-review'
            condition='/formW2s/*/isImported'
            batches={[`data-import-w2`]}
          />
          <Heading i18nKey='/heading/income/jobs/w2-missing-state-income' />
          <DFAlert i18nKey='/info/income/jobs/w2-missing-state-income-alert' headingLevel='h3' type='warning' />
          <DFModal i18nKey='/info/income/jobs/w2-missing-state-income' />
          <SaveAndOrContinueButton i18nKey='button.continueWoStateIncome' isOutline />
        </Screen>
        <Screen route='w2-part-year-yonkers' condition='/formW2s/*/paidYonkersTaxes'>
          <Heading i18nKey='/heading/income/jobs/w2-part-year-yonkers' batches={[`updates-0`]} />
          <InfoDisplay i18nKey='/info/income/jobs/w2-part-year-yonkers' batches={[`updates-0`]} />
          <Boolean path='/partYearYonkersResident' batches={[`updates-0`]} />
          <SaveAndOrContinueButton />
        </Screen>
        <Screen route='w2-part-year-yonkers-ko' condition='/knockoutYonkersPartYear' isKnockout={true}>
          <IconDisplay name='ErrorOutline' size={9} isCentered />
          <Heading i18nKey='/heading/knockout/income/jobs/w2-part-year-yonkers-ko' batches={[`updates-0`]} />
          <InfoDisplay i18nKey='/info/knockout/income/jobs/w2-part-year-yonkers-ko' batches={[`updates-0`]} />
          <DFAlert i18nKey='/info/knockout/generic-other-ways-to-file' headingLevel='h2' type='warning' />
          <KnockoutButton i18nKey='button.knockout' />
        </Screen>
      </SubSubcategory>
      <Screen route='w2-other-state-ko' condition='/flowKnockoutBox15IncomeFromDifferentState' isKnockout={true}>
        <IconDisplay name='ErrorOutline' size={9} isCentered />
        <Heading i18nKey='/heading/knockout/income/jobs/w2-other-state-ko' />
        <InfoDisplay i18nKey='/info/knockout/income/jobs/w2-other-state-ko' />
        <DFAlert i18nKey='/info/knockout/generic-other-ways-to-file' headingLevel='h2' type='warning' />
        <KnockoutButton i18nKey='button.knockout' />
      </Screen>
      <SubSubcategory route='corrected-or-non-standard-w2'>
        <Screen route='w2-nonstandard-corrected' condition={`/formW2s/*/showW2NonStandardOrCorrectedScreen`}>
          <Heading i18nKey='/heading/income/jobs/w2-nonstandard-corrected' />
          <InfoDisplay i18nKey='/info/income/jobs/w2-nonstandard-corrected' />
          <Enum
            path='/formW2s/*/nonstandardOrCorrectedChoice'
            importedPath='/formW2s/*/importedNonstandardOrCorrectedChoice'
          />
          <SetFactAction path='/formW2s/*/hasSeenLastAvailableScreen' source='/flowTrue' />
          <SaveAndOrContinueButton />
        </Screen>
      </SubSubcategory>
    </CollectionLoop>
  </Subcategory>
);
