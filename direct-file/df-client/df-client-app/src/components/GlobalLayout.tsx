import { Grid, GridContainer } from '@trussworks/react-uswds';
import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Routes, Route } from 'react-router-dom';
import ConnectivityBanner from './ConnectivityBanner/index.js';
import SurveyBanner from './SurveyBanner.js';
import Header from './Header/index.js';
import { CommonFooter } from '@irs/df-common';
import SessionManager from './SessionManager/index.js';
import PrivacyBanner from './PrivacyBanner/PrivacyBanner.js';
import KnockoutBanner from './KnockoutBanner.js';
import { AutoLanguageSelector } from './AutoLanguageSelector.js';
import EndOfFilingSeasonBanner from './EndOfFilingSeasonBanner/EndOfFilingSeasonBanner.js';
import { RenderIfTaxProfileLoadedGate } from '../screens/RenderIfTaxProfileLoadedGate.js';
import { isSpanishEnabled } from '../constants/pageConstants.js';

export type SwitchLangFunc = (lang: string, force?: boolean) => void;

function GlobalLayout({
  children,
  prevOnlineStatus,
  online,
}: {
  children: ReactNode | ReactNode[];
  prevOnlineStatus?: boolean;
  online?: boolean;
}) {
  const { t, i18n } = useTranslation(`translation`);

  const [locale, setLocale] = useState(i18n.language);
  const [autoSpanishModal, setAutoSpanishModal] = useState(false);

  // May be good to provide a context for language/locale in future
  const switchLang: SwitchLangFunc = (lang: string, force = false) => {
    // If spanish is disabled and we try to switch to it, show the modal
    if (lang === `es-US` && !(force || isSpanishEnabled())) {
      setAutoSpanishModal(true);
      return;
    }

    i18n.changeLanguage(lang);
    document.documentElement.setAttribute(`lang`, lang);
    localStorage.setItem(`irs_df_language`, lang);
    setLocale(i18n.language);
  };

  return (
    <>
      <a className='usa-skipnav' href='#main'>
        {t(`header.skip-to-main`)}
      </a>
      <SessionManager />
      <AutoLanguageSelector switchLang={switchLang} />

      {(prevOnlineStatus !== online || !online) && <ConnectivityBanner />}
      <Routes>
        <Route
          path='/checklist/'
          element={
            <RenderIfTaxProfileLoadedGate>
              <SurveyBanner />
            </RenderIfTaxProfileLoadedGate>
          }
        />
        {/* Intentionally rendering empty fallback, to prevent warnings */}
        <Route path='/*' element={<></>} />
      </Routes>
      <Header switchLang={switchLang} autoSpanishModal={autoSpanishModal} />
      <Routes>
        <Route
          path='/flow/*'
          element={
            <RenderIfTaxProfileLoadedGate>
              <KnockoutBanner />
            </RenderIfTaxProfileLoadedGate>
          }
        />
        <Route
          path='/data-view/*'
          element={
            <RenderIfTaxProfileLoadedGate>
              <KnockoutBanner />
            </RenderIfTaxProfileLoadedGate>
          }
        />
        <Route
          path='/checklist/'
          element={
            <RenderIfTaxProfileLoadedGate>
              <KnockoutBanner />
            </RenderIfTaxProfileLoadedGate>
          }
        />
        {/* Intentionally rendering empty fallback, to prevent warnings */}
        <Route path='/*' element={<EndOfFilingSeasonBanner />} />
      </Routes>
      <div className='main-content-wrapper'>
        <GridContainer className='screen'>
          <Grid row>
            <Grid col>{children}</Grid>
          </Grid>
        </GridContainer>
      </div>
      <Routes>
        <Route path='/home' element={<PrivacyBanner />} />
        <Route path='/about' element={<PrivacyBanner />} />
        {/* Intentionally rendering empty fallback, to prevent warnings */}
        <Route path='/*' element={<></>} />
      </Routes>
      <CommonFooter
        important_links={t(`footer.important_links`)}
        about={t(`footer.about`)}
      />
    </>
  );
}

export default GlobalLayout;
