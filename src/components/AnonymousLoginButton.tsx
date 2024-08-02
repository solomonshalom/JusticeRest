/** @jsxImportSource @emotion/react */
import Button from '../components/button';
import firebase, { auth } from '../lib/firebase';
import { setUser, userWithIDExists, User } from '../lib/db';
import { css } from '@emotion/react';

const AnonymousLoginButton: React.FC = () => {
  const avatarStyles: string[] = ['lorelei-neutral', 'lorelei', 'notionists', 'notionists-neutral'];

  const generateRandomSeed = (): string => {
    return Math.floor(Math.random() * 1000000).toString();
  };

  const getRandomStyle = (): string => {
    const randomIndex = Math.floor(Math.random() * avatarStyles.length);
    return avatarStyles[randomIndex];
  };

  const handleAnonymousLogin = async (): Promise<void> => {
    const randomSeed = generateRandomSeed();
    const randomStyle = getRandomStyle();

    try {
      const cred = await auth.signInAnonymously();
      if (!cred.user) {
        throw new Error('User object is null after anonymous sign-in');
      }

      const userExists = await userWithIDExists(cred.user.uid);

      if (!userExists) {
        const userData: Partial<User> = {
          name: cred.user.uid,
          displayName: 'Anonymous',
          posts: [], // This is correct as User.posts is defined as string[]
          photo: `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${randomSeed}`,
          about: 'Hii, change this text to add your very own little bio!',
          readingList: [],
        };

        await setUser(cred.user.uid, userData);
      }
    } catch (error) {
      console.error('Error during anonymous sign-in:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <Button onClick={handleAnonymousLogin} css={css`
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

      /* Adding the shadow effect */
      box-shadow: 0px 4px 1px #a3a3a3;

      &:hover {
        background: var(--grey-4);
      }

      &:active {
        transform: translateY(2px);
        box-shadow: none;
      }

      &:disabled {
        cursor: not-allowed;
        background: var(--grey-4);
        color: var(--grey-2);
      }
  `}>
    Anonymous 🥷
    </Button>
  );
};

export default AnonymousLoginButton;
