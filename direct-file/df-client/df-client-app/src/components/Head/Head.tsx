import { FC } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const Head: FC = () => {
  const { t } = useTranslation(`translation`);
  const titleBoilerplate = `${t(`pageTitle.product`)}`;
  return <Helmet defaultTitle={titleBoilerplate} titleTemplate={`%s | ${titleBoilerplate}`} />;
};

export default Head;
