/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { firestore } from '../lib/firebase';
import { userWithNameExists } from '../lib/db';
import Spinner from './spinner';
import Input, { Textarea } from './input';
import ModalOverlay from './modal-overlay';
import Button, { IconButton } from './button';
import { default as countryList } from 'country-list'; // Import country-list as a whole

interface User {
  id?: string;
  name: string;
  displayName: string;
  about: string;
  posts: any[];
  photo: string;
  readingList: any[];
  country: string;
}

interface EditorProps {
  user: User;
}

interface ProfileEditorProps {
  uid: string;
}

interface ProfileSettingsModalProps {
  Trigger: React.ComponentType;
  uid: string;
}

const StyledLabel: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = (props) => (
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

const countries = countryList.getData(); // Fetch the data directly

const countryOptions = countries.map((country) => (
  <option key={country.code} value={country.name}>
    {country.name}
  </option>
));

const Editor: React.FC<EditorProps> = ({ user }) => {
  const [clientUser, setClientUser] = useState<User>({
    name: '',
    displayName: '',
    about: '',
    posts: [],
    photo: '',
    readingList: [],
    country: '', // New state for selected country
  });
  const [usernameErr, setUsernameErr] = useState<string | null>(null);

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
            width: 20em;
          }
          textarea {
            min-height: 10em;
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
            onChange={(e) =>
              setClientUser((prevUser) => ({
                ...prevUser,
                displayName: e.target.value,
              }))
            }
          />
        </div>
        <div>
          <StyledLabel htmlFor="profile-username">Username</StyledLabel>
          <Input
            id="profile-username"
            type="text"
            value={clientUser.name}
            onChange={(e) => {
              const lowercaseName = e.target.value.toLowerCase();
              setUsernameErr(null);
              setClientUser((prevUser) => ({
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
          <StyledLabel htmlFor="profile-country">Country</StyledLabel>
          <select
            css={css`
              text-transform: none;
              display: block;
              width: 17em;
              padding: 0.75em 1.5em;
              background: none;
              border: 1px solid var(--grey-2);
              outline: none;
              border-radius: 0.5rem;
              color: inherit;
              background-color: var(--grey-1);
            `}
            id="profile-country"
            value={clientUser.country}
            onChange={(e) =>
              setClientUser((prevUser) => ({
                ...prevUser,
                country: e.target.value,
              }))
            }
          >
            <option value="">Select Country</option>
            {countryOptions}
          </select>
        </div>
        <div>
          <StyledLabel htmlFor="profile-about">About</StyledLabel>
          <Textarea
            id="profile-about"
            value={clientUser.about}
            onChange={(e) =>
              setClientUser((prevUser) => ({
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
        {/*It's our Lord and Saviour, Jesus Christ who helped us make it! It's not out of our own wisdom but it was provided by God!*/}
        <p>Made w/ ❤️ (by COG) near a 🌴</p>
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
                'Username can only consist of letters (a-z,A-Z), numbers (0-9) and dashes (-).',
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

const ProfileEditor: React.FC<ProfileEditorProps> = ({ uid }) => {
  const [user, userLoading, userError] = useDocumentData<User>(
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

const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = (props) => {
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
          If logged in anonymous, make sure not to sign out as you will lose your access to the account.
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

export default ProfileSettingsModal;
