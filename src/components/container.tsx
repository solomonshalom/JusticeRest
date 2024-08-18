/** @jsxImportSource @emotion/react */
import React from 'react';
import { css } from '@emotion/react';

interface ContainerProps {
  maxWidth?: string;
  children: React.ReactNode;
  [key: string]: any; // For other props
}

const Container: React.FC<ContainerProps> = ({ maxWidth, children, ...otherProps }) => {
  return (
    <main
      css={css`
        max-width: ${maxWidth};
        margin: 10rem auto 0 auto;

        @media (max-width: 720px) {
          margin: 5rem auto 0 auto;
          width: 85%;
        }

        @media (max-width: 325px) {
          width: 90%;
        }
      `}
      {...otherProps}
    >
      {children}
    </main>
  );
};

export default Container;
