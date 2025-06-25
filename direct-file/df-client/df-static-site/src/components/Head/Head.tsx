import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const Head = () => {
  const { t } = useTranslation(`translation`);
  const titleBoilerplate = `${t(`components.pageTitle.product`)}`;
  return <Helmet defaultTitle={titleBoilerplate} titleTemplate={`%s | ${titleBoilerplate}`} />;
};

export default Head;
