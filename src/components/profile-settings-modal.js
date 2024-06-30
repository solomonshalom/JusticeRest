import { useState, useEffect } from 'react';
import { css } from '@emotion/react';
import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { getData } from 'country-list';

import { firestore } from '../lib/firebase';
import { userWithNameExists } from '../lib/db';

import Spinner from './spinner';
import Input, { Textarea } from './input';
import ModalOverlay from './modal-overlay';
import Button, { IconButton } from './button';

const StyledLabel = props => (
  <label
    css={css`
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      color: var(--grey-3);
    `}
    {...props}
  >
    {props.children}
  </label>
);

const Dropdown = ({ id, value, onChange, options }) => (
  <select
    id={id}
    value={value}
    onChange={onChange}
    css={css`
      width: 100%;
      max-width: 20em;
      padding: 0.5rem;
      margin-top: 0.5rem;
      font-size: 0.9rem;
      color: var(--grey-3);
      background: var(--grey-1);
      border: 1px solid var(--grey-3);
      border-radius: 0.25rem;
      appearance: none;
    `}
  >
    <option value="">Select a country</option>
    {options.map(option => (
      <option key={option.code} value={option.code}>
        {option.name}
      </option>
    ))}
  </select>
);

function Editor({ user }) {
  const [clientUser, setClientUser] = useState({
    name: '',
    displayName: '',
    about: '',
    country: '',
    posts: [],
    photo: '',
    readingList: [],
  });
  const [usernameErr, setUsernameErr] = useState(null);
  const countries = getData();

  useEffect(() => {
    setClientUser(user);
  }, [user]);

  return (
    <>
      <div
        css={css`
          margin: 1.5rem 0 2.5rem 0;
          font-size: 0.9rem;
          input,
          textarea {
            width: 100%;
            max-width: 20em;
          }
          textarea {
            min-height: 8em;
            resize: none;
          }
          div {
            margin-bottom: 1.5rem;
          }
        `}
      >
        <div>
          <StyledLabel htmlFor="profile-display-name">Display Name</StyledLabel>
          <Input
            id="profile-display-name"
            type="text"
            value={clientUser.displayName}
            onChange={e =>
              setClientUser(prevUser => ({
                ...prevUser,
                displayName: e.target.value,
              }))
            }
          />
        </div>

        <div>
          <StyledLabel htmlFor="profile-username">Name</StyledLabel>
          <Input
            id="profile-username"
            type="text"
            value={clientUser.name}
            onChange={e => {
              const lowercaseName = e.target.value.toLowerCase();
              setUsernameErr(false);
              setClientUser(prevUser => ({
                ...prevUser,
                name: lowercaseName,
              }));
            }}
          />
          {usernameErr !== null && (
            <p
              css={css`
                font-size: 0.9rem;
                color: var(--grey-3);
                width: 20rem;
                margin-top: 1rem;
              `}
            >
              {usernameErr}
            </p>
          )}
        </div>

        <div>
          <StyledLabel htmlFor="profile-country">Country of Origin</StyledLabel>
          <Dropdown
            id="profile-country"
            value={clientUser.country}
            onChange={e =>
              setClientUser(prevUser => ({
                ...prevUser,
                country: e.target.value,
              }))
            }
            options={countries}
          />
        </div>

        <div>
          <StyledLabel htmlFor="profile-about">About</StyledLabel>
          <Textarea
            id="profile-about"
            value={clientUser.about}
            onChange={e =>
              setClientUser(prevUser => ({
                ...prevUser,
                about: e.target.value,
              }))
            }
          />
        </div>
      </div>

      <p
        css={css`
          font-size: 0.9rem;
          max-width: 20rem;
          margin-bottom: 1.5rem;
          margin-top: -1rem;
          word-wrap: break-word;
          a {
            text-decoration: none;
            color: inherit;
            font-style: italic;
            border-bottom: 1px dotted var(--grey-3);
          }
        `}
      >
        See your profile live at:{' '}
        <a target="_blank" rel="noreferrer" href={`/${user.name}`}>
          justice.rest/{user.name}
        </a>
        <br />
        <br />
        <p>Made w/ ❤️ near a 🌴</p>
      </p>

      <Button
        css={css`
          margin-left: auto;
          font-size: 0.9rem;
        `}
        outline
        disabled={
          user.name === clientUser.name &&
          user.displayName === clientUser.displayName &&
          user.about === clientUser.about &&
          user.country === clientUser.country &&
          !usernameErr
        }
        onClick={async () => {
          if (clientUser.name !== user.name) {
            let nameClashing = await userWithNameExists(clientUser.name);
            if (nameClashing) {
              setUsernameErr('That username is in use already.');
              return;
            } else if (clientUser.name === '') {
              setUsernameErr('Username cannot be empty.');
              return;
            } else if (!clientUser.name.match(/^[a-z0-9-]+$/i)) {
              setUsernameErr(
                'Username can only consist of letters (a-z,A-Z), numbers (0-9) and dashes (-).'
              );
              return;
            } else if (clientUser.name === 'dashboard 🕹️') {
              setUsernameErr('That username is reserved.');
              return;
            }
          }

          let toSave = { ...clientUser };
          delete toSave.id;
          await firestore.collection('users').doc(user.id).set(toSave);
          setUsernameErr(null);
        }}
      >
        Save changes
      </Button>
    </>
  );
}

function ProfileEditor({ uid }) {
  const [user, userLoading, userError] = useDocumentData(
    firestore.doc(`users/${uid}`),
    {
      idField: 'id',
    },
  );

  if (userError) {
    return (
      <>
        <p>Oop, we&apos;ve had an error:</p>
        <pre>{JSON.stringify(userError)}</pre>
      </>
    );
  } else if (user) {
    return <Editor user={user} />;
  }

  return <Spinner />;
}

export default function ProfileSettingsModal(props) {
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <props.Trigger />
      </Dialog.Trigger>

      <ModalOverlay />

      <Dialog.Content
        css={css`
          background: var(--grey-1);
          border-radius: 0.5rem;
          padding: 1.5rem;
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        `}
      >
        <Dialog.Title>Profile Settings</Dialog.Title>
        <Dialog.Description
          css={css`
            margin: 1rem 0 0.5rem 0;
            max-width: 20rem;
            color: var(--grey-3);
            font-size: 0.9rem;
          `}
        >
          Change your profile details and make sure to hit save when you&apos;re
          done.
        </Dialog.Description>
        <Dialog.Description
          css={css`
            margin: 1rem 0 0.5rem 0;
            max-width: 20rem;
            color: var(--grey-3);
            font-size: 0.9rem;
          `}
        >
          If logged in anonymous, make sure not to sign out as you will lose your access to the account
        </Dialog.Description>
        <ProfileEditor uid={props.uid} />

        <Dialog.Close
          as={IconButton}
          css={css`
            position: absolute;
            top: 1rem;
            right: 1rem;
          `}
        >
          <Cross2Icon />
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Root>
  );
}
