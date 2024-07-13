/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import React, { FC, ReactNode } from 'react';

interface ContainerProps {
  maxWidth: string;
  children: ReactNode;
  [key: string]: any;
}

const Container: FC<ContainerProps> = ({ maxWidth, children, ...otherProps }) => {
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
  )
}

export default Container;
