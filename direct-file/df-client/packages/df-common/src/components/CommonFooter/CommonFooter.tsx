import {
  Identifier,
  IdentifierLinkItem,
  IdentifierLinks,
  Link,
} from '@trussworks/react-uswds';
import { CommonFooterProps } from './CommonFooterProps.types.js';
import './CommonFooter.scss';
import { FC } from 'react';
import { Link as ReactLink } from 'react-router-dom';

const CommonFooter: FC<CommonFooterProps> = ({
  important_links,
  about,
}) => {
  return (
    <footer aria-label='direct file' className='footer'>
      <Identifier>
        <IdentifierLinks navProps={{ 'aria-label': important_links }}>
          <IdentifierLinkItem>
            <ReactLink to={`/about/`} className='usa-link usa-identifier__required-link'>
              {about}
            </ReactLink>
          </IdentifierLinkItem>
        </IdentifierLinks>
      </Identifier>
    </footer>
  );
};

export default CommonFooter;
