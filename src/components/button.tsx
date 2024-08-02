/** @jsxImportSource @emotion/react */
import Link from 'next/link'
import { css } from '@emotion/react'
import React, { ReactNode } from 'react'

const buttonStyles = css`
  display: block;
  border: none;
  outline: none;
  cursor: pointer;

  padding: 0.75em 1.5em;
  background: var(--grey-5);
  color: var(--grey-1);
  border-radius: 0.33em;

  border: none;

  transition: all 200ms ease;

  &:hover {
    background: var(--grey-4);
  }

  &:disabled {
    cursor: not-allowed;
    background: var(--grey-4);
    color: var(--grey-2);
  }
`

const outlineButtonStyles = css`
  ${buttonStyles}

  background: var(--grey-1);
  color: var(--grey-4);
  border: 1px solid var(--grey-2);

  &:hover {
    background: var(--grey-1);
    border: 1px solid var(--grey-3);
  }

  &:disabled {
    background: var(--grey-1);
    color: var(--grey-2);

    &:hover {
      background: var(--grey-1);
      border: 1px solid var(--grey-2);
    }
  }
`

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  outline?: boolean;
  children: ReactNode;
}

export default function Button({ outline, children, ...rest }: ButtonProps) {
  if (outline) {
    return (
      <button css={outlineButtonStyles} {...rest}>
        {children}
      </button>
    )
  }
  return (
    <button css={buttonStyles} {...rest}>
      {children}
    </button>
  )
}

interface LinkButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  outline?: boolean;
  href: string;
  children: ReactNode;
}

export function LinkButton({ outline, href, children, ...rest }: LinkButtonProps) {
  if (outline) {
    return (
      <Link href={href}>
        <a
          css={css`
            ${outlineButtonStyles}
            display: inline-block;
          `}
          {...rest}
        >
          {children}
        </a>
      </Link>
    )
  }
  return (
    <Link href={href}>
      <a
        css={css`
          ${buttonStyles}
          display: inline-block;
        `}
        {...rest}
      >
        {children}
      </a>
    </Link>
  )
}

const iconButtonStyles = css`
  background: none;
  border: none;
  border-radius: 1rem;

  width: 2rem;
  height: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;

  font-family: 'Inter', sans-serif;
  font-size: 1.25rem;

  cursor: pointer;
  transition: all 200ms ease;

  &:hover {
    background: var(--grey-2);
    opacity: 0.4;
  }

  &:disabled {
    background: none;
    cursor: not-allowed;
    opacity: 0.4;
  }
`

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function IconButton({ children, ...props }: IconButtonProps) {
  return (
    <button
      css={css`
        ${iconButtonStyles}
      `}
      {...props}
    >
      {children}
    </button>
  )
}

interface LinkIconButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
}

export function LinkIconButton({ href, children, ...props }: LinkIconButtonProps) {
  return (
    <Link href={href}>
      <a
        css={css`
          ${iconButtonStyles}
          color: inherit;
        `}
        {...props}
      >
        {children}
      </a>
    </Link>
  )
}
