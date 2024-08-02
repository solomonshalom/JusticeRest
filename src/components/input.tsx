/** @jsxImportSource @emotion/react */
import React from 'react';
import { css } from '@emotion/react';

const inputStyles = css`
  display: block;
  width: 17em;
  padding: 0.75em 1.5em;
  background: none;
  border: 1px solid var(--grey-2);
  outline: none;
  border-radius: 0.5rem;

  color: var(--grey-4);
  &::placeholder {
    color: var(--grey-3);
  }
`;

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input: React.FC<InputProps> = (props) => (
  <input
    {...props}
    css={css`
      ${inputStyles}
    `}
  />
);

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea: React.FC<TextareaProps> = (props) => (
  <textarea
    {...props}
    css={css`
      ${inputStyles}
      min-height: 15em;
      resize: vertical;
      padding-top: 1em;
    `}
  />
);

export default Input;
