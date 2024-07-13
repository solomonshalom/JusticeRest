/** @jsxImportSource @emotion/react */
import Button from '../components/button';
import firebase, { auth } from '../lib/firebase';
import { setUser, userWithIDExists } from '../lib/db';

enum AvatarStyles {
  LORELEI_NEUTRAL = 'lorelei-neutral',
  LORELEI = 'lorelei',
  NOTIONISTS = 'notionists',
  NOTIONISTS_NEUTRAL = 'notionists-neutral'
}

interface User {
  name: string;
  displayName: string;
  about: string;
  posts: any[];
  readingList: any[];
  photo: string;
}

const AnonymousLoginButton: React.FC = () => {
  const avatarStyles = [
    AvatarStyles.LORELEI_NEUTRAL,
    AvatarStyles.LORELEI,
    AvatarStyles.NOTIONISTS,
    AvatarStyles.NOTIONISTS_NEUTRAL
  ];

  const generateRandomSeed = (): string => {
    return Math.floor(Math.random() * 1000000).toString();
  };

  const getRandomStyle = (): AvatarStyles => {
    const randomIndex = Math.floor(Math.random() * avatarStyles.length);
    return avatarStyles[randomIndex];
  };

  const handleAnonymousLogin = async (): Promise<void> => {
    const randomSeed = generateRandomSeed();
    const randomStyle = getRandomStyle();

    auth.signInAnonymously().then(async (cred) => {
      const userExists = await userWithIDExists(cred.user.uid);

      if (!userExists) {
        // Create a new user with the generated avatar seed and style
        const newUser: User = {
          name: cred.user.uid,
          displayName: 'Anonymous',
          about: 'Hii, change this text to add your very own little bio!',
          posts: [],
          readingList: [],
          // Everytime a new anonymous user creates an account, the below API will create a randomized PFP for them.
          photo: `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${randomSeed}`,
        };
        await setUser(cred.user.uid, newUser);
      }
    });
  };

  return (
    <Button onClick={handleAnonymousLogin}>Anonymous 🤿</Button>
  );
};

export default AnonymousLoginButton;
