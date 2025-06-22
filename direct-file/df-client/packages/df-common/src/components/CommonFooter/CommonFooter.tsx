import {
  Identifier,
  IdentifierLinkItem,
  IdentifierLinks,
  IdentifierLink,
  Link,
} from '@trussworks/react-uswds';
import { CommonFooterProps } from './CommonFooterProps.types.js';
import './CommonFooter.scss';
import { FC } from 'react';
import { Link as ReactLink } from 'react-router-dom';

const CommonFooter: FC<CommonFooterProps> = ({
  important_links,
  about,
  source_code
}) => {

  const sourceCodeUrl = 'https://github.com/openfiletax/openfile'

  return (
    <footer aria-label='direct file' className='footer'>
      <Identifier>
        <IdentifierLinks navProps={{ 'aria-label': important_links }}>
          <IdentifierLinkItem>
            <ReactLink to={`/about/`} className='usa-link usa-identifier__required-link'>
              {about}
            </ReactLink>
          </IdentifierLinkItem>
          <IdentifierLinkItem>
            <IdentifierLink href={sourceCodeUrl}>{source_code}</IdentifierLink>
          </IdentifierLinkItem>
        </IdentifierLinks>
      </Identifier>
    </footer>
  );
};

export default CommonFooter;
