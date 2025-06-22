import { Header as DFHeader, NavMenuButton, PrimaryNav } from '@trussworks/react-uswds';
import { cloneElement, ReactElement, useState, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styles from './CommonHeader.module.scss';
import { CommonHeaderProps } from './CommonHeaderProps.types.js';

const CommonHeader: FC<CommonHeaderProps> = ({
  headerAriaLabel,
  dfPrefix = ``,
  navMenuLabel,
  menuItems,
  children,
  homeLink,
  homeLinkTitle,
}) => {
  const [expanded, setExpanded] = useState(false);

  const onMenuClick = (): void => setExpanded((expanded) => !expanded);

  const { t } = useTranslation();

  const menuItemsWithClickHandler = menuItems
    ? menuItems.map((item) =>
        cloneElement(item as ReactElement, {
          onClick: () => {
            // Close the menu if the item is clicked from the mobile menu.
            if (expanded) setExpanded(false);
          },
        })
      )
    : [];

  return (
    <>
      <div onClick={() => setExpanded(false)} className={`usa-overlay ${expanded ? `is-visible` : ``}`}></div>
      <div className={styles.dfHeader}>
        <DFHeader basic={true} aria-label={headerAriaLabel}>
          <div className='usa-nav-container'>
            <div className='usa-navbar'>
              <div className='usa-logo'>
                <div className='usa-logo__text'>
                  <Link to={homeLink} rel='home' title={t(homeLinkTitle)} className={styles.dfHomeLink}>
                    <img src={`${dfPrefix}/imgs/of-logo.svg`} alt={``} className={styles.irsLogo} />
                  </Link>
                </div>
              </div>
              {<NavMenuButton onClick={onMenuClick} label={navMenuLabel} />}
            </div>

            <PrimaryNav items={menuItemsWithClickHandler} mobileExpanded={expanded} onToggleMobileNav={onMenuClick}>
              {children}
            </PrimaryNav>
          </div>
        </DFHeader>
      </div>
    </>
  );
};

export default CommonHeader;
