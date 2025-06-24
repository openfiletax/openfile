import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@trussworks/react-uswds';
import { useLocation, useNavigate } from 'react-router-dom';
import DFAlert from '../Alert/DFAlert.js';
import DFModal from '../HelperText/DFModal.js';
import PageTitle from '../PageTitle/PageTitle.js';
import useTranslatePIIRedacted from '../../hooks/useTranslatePIIRedacted.js';
import { BackButton } from '../../screens/ScreenHeader.js';

/**
 * Screen to display between Home and Checklist
 *
 * It is only displayed once, as a new user creates their tax return,
 * but the user can return to it via a link on the checklist.
 */
const TaxReturnIntro: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state } = useLocation();
  const redacted = useTranslatePIIRedacted(`preChecklist.header`, true);
  const isFirstVisit = state?.firstVisit === true;

  return (
    <>
      {!isFirstVisit && <BackButton />}
      <span className='screen__header'>
        <PageTitle redactedTitle={redacted} large>
          {t(`preChecklist.header`)}
        </PageTitle>
      </span>
      <div className='usa-prose'>
        <DFModal i18nKey='preChecklist' collectionId={null} />
        <DFAlert type='info' i18nKey='preChecklist' collectionId={null} headingLevel='h2' />
      </div>
      <div className='screen__actions'>
        <Button type='button' onClick={() => navigate(`/checklist`)}>
          {t(`button.continue`)}
        </Button>
      </div>
    </>
  );
};

export default TaxReturnIntro;
