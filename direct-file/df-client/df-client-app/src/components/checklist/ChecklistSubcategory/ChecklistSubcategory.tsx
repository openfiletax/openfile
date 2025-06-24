import { Alert, IconListContent, IconListItem } from '@trussworks/react-uswds';
import { Link } from 'react-router-dom';
import useTranslateWithFacts from '../../../hooks/useTranslateWithFacts.js';
import { useFactGraph } from '../../../factgraph/FactGraphContext.js';
import styles from './ChecklistSubcategory.module.scss';
import { forwardRef, useMemo, ComponentProps } from 'react';
import { AlertConfigs, MefAlertConfig } from '../../../misc/aggregatedAlertHelpers.js';
import { useTranslation } from 'react-i18next';
import Translation from '../../Translation/index.js';
import { useKnockoutCheck } from '../../../hooks/useKnockoutCheck.js';
import IconDisplay from '../../IconDisplay/IconDisplay.js';
import { Condition } from '../../../flow/Condition.js';
import DataReveal, { DataItemConfig } from './DataReveal.js';
export interface ChecklistSubcategoryProps {
  subcategoryRoute: string;
  navigationUrl: string | undefined;
  isNext: boolean;
  isComplete: boolean;
  isStartedButNotComplete: boolean;
  hasIncompletedCollectionItem: boolean;
  alertConfigs: AlertConfigs;
  mefAlertConfigs: AlertConfigs<MefAlertConfig>;
  dataItems?: DataItemConfig[];
}

const buildIncompletedCollectionItemAlertWarningId = (subcategoryRoute: string) =>
  `${subcategoryRoute}-incompleteCollectionItem-alert-warning`;
const buildSubcategoryAlertCountId = (
  subcategoryRoute: SubcategoryAlertCountProps[`subcategoryRoute`],
  type: SubcategoryAlertCountProps['type']
) => `${subcategoryRoute}-${type}-count-alert`;

type SubcategoryAlertCountProps = {
  subcategoryRoute: string;
  type: ComponentProps<typeof Alert>[`type`];
  count: number;
};
const SubcategoryAlertCount = ({ subcategoryRoute, type, count }: SubcategoryAlertCountProps) => {
  const { t } = useTranslation(`translation`);
  const id = buildSubcategoryAlertCountId(subcategoryRoute, type);
  return (
    <Alert id={id} headingLevel='h4' type={type} data-testid={id} slim>
      {t(`checklist.alerts.checklistSubcategory.${type}`, { count })}
    </Alert>
  );
};

const ChecklistSubcategory = forwardRef<HTMLAnchorElement, ChecklistSubcategoryProps>(
  (
    {
      isNext,
      isComplete,
      isStartedButNotComplete,
      subcategoryRoute,
      navigationUrl,
      alertConfigs,
      mefAlertConfigs,
      hasIncompletedCollectionItem,
      dataItems,
    },
    ref
  ) => {
    const { factGraph } = useFactGraph();
    const { t: tBasic } = useTranslation();
    const { t: tFact } = useTranslateWithFacts(factGraph);
    const { getIsKnockedOut } = useKnockoutCheck();
    const isKnockedOut = getIsKnockedOut();

    const getStatus = (isComplete: boolean, isNext: boolean, isStartedButNotComplete: boolean) => {
      if (isComplete) return tFact(`checklist.complete`);
      if (isStartedButNotComplete) return tFact(`checklist.incomplete`);
      if (isNext) return tFact(`checklist.start`);
      return ``;
    };

    const subcategoryErrorsCount =
      alertConfigs.errors.length + mefAlertConfigs.errors.length + (isStartedButNotComplete ? 1 : 0);
    const subcategoryWarningsCount = alertConfigs.warnings.length + mefAlertConfigs.warnings.length;

    /**
     * The first override takes priority. Overrides that break our pattern should be very rare.
     *  */
    const checklistSubcategoryWarningLabel = alertConfigs.warnings.find(
      (w) => w.checklistSubcategoryWarningLabel
    )?.checklistSubcategoryWarningLabel;

    const hasIncomplete = hasIncompletedCollectionItem || isStartedButNotComplete;

    const describedbyIds = useMemo(() => {
      const ids = [];
      if (hasIncomplete) {
        ids.push(buildIncompletedCollectionItemAlertWarningId(subcategoryRoute));
      }
      if (subcategoryErrorsCount > 0 && !hasIncomplete) {
        ids.push(buildSubcategoryAlertCountId(subcategoryRoute, `error`));
      }
      if (subcategoryWarningsCount > 0 && !hasIncomplete) {
        ids.push(buildSubcategoryAlertCountId(subcategoryRoute, `warning`));
      }
      return ids;
    }, [hasIncomplete, subcategoryErrorsCount, subcategoryWarningsCount, subcategoryRoute]);

    if (navigationUrl === undefined) return null;

    const showStartOrContinueButton = !isKnockedOut && (isNext || isStartedButNotComplete);

    const isEssarSigningPath = new Condition(`isEssarSigningPath`).evaluate(factGraph, null);
    const subcategoryHeading = isEssarSigningPath
      ? tBasic(`checklist.${subcategoryRoute}.heading`, { context: `essar` })
      : tFact(`checklist.${subcategoryRoute}.heading`);

    return (
      <IconListItem className={styles.checklistSubcategory}>
        <IconListContent className={styles.checklistContent}>
          <h3 className={styles.checklistContentHeading}>
            {isComplete || (isNext && !isKnockedOut) || isStartedButNotComplete ? (
              <>
                <Link
                  ref={ref}
                  to={navigationUrl}
                  aria-describedby={describedbyIds.length > 0 ? describedbyIds.join(` `) : undefined}
                  data-testid='heading-text-link'
                  className={`${styles.checklistLink} ${showStartOrContinueButton ? styles.withButton : ``}`}
                >
                  {subcategoryHeading}
                  {` `}
                  <span className='usa-sr-only sr-firefox-fix'>{`${getStatus(
                    isComplete,
                    isNext,
                    isStartedButNotComplete
                  )}`}</span>
                  {isComplete && <IconDisplay name='NavigateNext' size={4} aria-hidden={true} />}
                </Link>
                {` `}
                {showStartOrContinueButton && (
                  <Link to={navigationUrl} className='usa-button' data-testid='heading-button-link'>
                    {isStartedButNotComplete ? tFact(`button.continue`) : tFact(`button.start`)}
                  </Link>
                )}
              </>
            ) : (
              <>
                <span className={styles.checklistLocked}>{subcategoryHeading}</span>
                {` `}
                <span className='usa-sr-only sr-firefox-fix'>{tFact(`checklist.locked`)}</span>
              </>
            )}
          </h3>
          {isComplete && (
            <DataReveal
              i18nKey={`checklist.${subcategoryRoute}.dataItems`}
              dataItems={dataItems}
              factGraph={factGraph}
              subcategoryRoute={subcategoryRoute}
              collectionId={null}
            />
          )}
          {hasIncomplete && !isKnockedOut && (
            <Alert
              id={buildIncompletedCollectionItemAlertWarningId(subcategoryRoute)}
              type='error'
              headingLevel='h3'
              data-testid='warning-incomplete'
              slim
            >
              <Translation i18nKey={`checklist.alerts.checklistSubcategory.incompletion`} collectionId={null} />
            </Alert>
          )}
          {subcategoryErrorsCount > 0 && !isStartedButNotComplete && (
            <SubcategoryAlertCount subcategoryRoute={subcategoryRoute} type='error' count={subcategoryErrorsCount} />
          )}
          {subcategoryWarningsCount > 0 && !checklistSubcategoryWarningLabel && (
            <SubcategoryAlertCount
              subcategoryRoute={subcategoryRoute}
              type='warning'
              count={subcategoryWarningsCount}
            />
          )}
        </IconListContent>
      </IconListItem>
    );
  }
);

ChecklistSubcategory.displayName = `ChecklistSubcategory`;

export default ChecklistSubcategory;
