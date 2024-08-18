/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import Link from 'next/link'
import Head from 'next/head'
import Script from 'next/script'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { htmlToText } from 'html-to-text'
import { useAuthState } from 'react-firebase-hooks/auth'
import firebase from 'firebase/app'
import 'firebase/firestore'

import Header from '../../components/header'
import Spinner from '../../components/spinner'
import Container from '../../components/container'
import ProfileSettingsModal from '../../components/profile-settings-modal'

import { truncate } from '../../lib/utils'
import { auth, firestore } from '../../lib/firebase'
import { getPostByID, getUserByID } from '../../lib/db'
import { NextPage } from 'next'

interface User {
  id: string;
  name: string;
  readingList: string[];
  displayName: string;
  photo: string;
}

interface Author {
  id: string;
  name: string;
  photo: string;
  displayName: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author: Author | string;
  lastEdited: firebase.firestore.Timestamp | number;
  published: boolean;
}

interface ListProps {
  uid: string;
}

interface ReadingListPost extends Omit<Post, 'author'> {
  author: Author;
}

function List({ uid }: ListProps) {
  const [list, setList] = useState<Post[]>([])

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const user = await getUserByID(uid);
        if (user && 'readingList' in user && Array.isArray(user.readingList)) {
          const postPromises = user.readingList.map(async (pid: string) => {
            try {
              const post = await getPostByID(pid);
              if (post) {
                let author: Author;
                if (typeof post.author === 'string') {
                  const authorDoc = await firestore
                    .collection('users')
                    .doc(post.author)
                    .get();
                  const authorData = authorDoc.data() as Author | undefined;
                  if (!authorData) {
                    console.error(`Author data not found for post ${pid}`);
                    return null;
                  }
                  author = authorData;
                } else {
                  author = post.author;
                }
                return {
                  ...post,
                  author,
                  lastEdited: post.lastEdited instanceof firebase.firestore.Timestamp
                    ? post.lastEdited.toDate().getTime()
                    : post.lastEdited,
                } as Post;
              }
              return null;
            } catch (postError) {
              console.error(`Error fetching post ${pid}:`, postError);
              return null;
            }
          });
          const posts = await Promise.all(postPromises);
          setList(posts.filter((post): post is Post => post !== null));
        } else {
          console.warn('User has no reading list or it is not an array');
          setList([]);
        }
      } catch (error) {
        console.error('Error fetching user or posts:', error);
        setList([]);
      }
    };

    fetchPosts();
  }, [uid]);

  if (list.length > 0)
    return (
      <ul
        css={css`
          list-style: none;

          li {
            max-width: 25rem;
            margin: 2.5rem 0;

            a {
              text-decoration: none !important;
              color: inherit;
            }
          }
        `}
      >
        {list.map(post => (
          <li key={post.id}>
            <Link href={`/${typeof post.author === 'string' ? post.author : post.author.name}/${post.slug}`}>
              <a>
                <h3
                  css={css`
                    font-size: 1rem;
                    font-weight: 400;
                    margin-bottom: 0.6rem;
                  `}
                >
                  {post.title ? htmlToText(post.title) : 'Untitled'}
                </h3>

                <div
                  css={css`
                    display: flex;
                    align-items: center;
                    color: var(--grey-3);
                    font-size: 0.9rem;
                  `}
                >
                  {typeof post.author !== 'string' && (
                    <>
                      <img
                        src={post.author.photo}
                        alt="Profile picture"
                        css={css`
                          width: 1.5rem;
                          border-radius: 1rem;
                          margin-right: 0.75rem;
                        `}
                      />
                      <p>{post.author.displayName}</p>
                    </>
                  )}
                </div>

                <p
                  css={css`
                    color: var(--grey-4);
                    font-family: 'Newsreader', serif;
                    line-height: 1.5em;
                    margin-top: 0.5rem;
                  `}
                >
                  {post.excerpt
                    ? htmlToText(post.excerpt)
                    : truncate(htmlToText(post.content), 25)}
                </p>
              </a>
            </Link>
          </li>
        ))}
      </ul>
    )

  return <p>You have no posts saved to read later 😔</p>
}

// These imports are already present at the top of the file, so we can remove them here.
// The List component is not imported separately, as it's defined in this file.

const ReadingList: NextPage = () => {
  const router = useRouter();
  const [user, userLoading, userError] = useAuthState(auth);

  useEffect(() => {
    if (!user && !userLoading && !userError) {
      router.push('/');
    }
  }, [user, userLoading, userError, router]);

  if (userLoading) return <Spinner />;

  if (userError) {
    return (
      <>
        <p>Oops, we&apos;ve had an error:</p>
        <pre>{JSON.stringify(userError)}</pre>
      </>
    );
  }

  return (
    <>
      <Header>
        <Link href="/dashboard">
          <a>
            <svg width="21" height="21" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.8 1L2.74967 0.99997C2.52122 0.999752 2.32429 0.999564 2.14983 1.04145C1.60136 1.17312 1.17312 1.60136 1.04145 2.14983C0.999564 2.32429 0.999752 2.52122 0.99997 2.74967L1 2.8V5.2L0.99997 5.25033C0.999752 5.47878 0.999564 5.67572 1.04145 5.85017C1.17312 6.39864 1.60136 6.82688 2.14983 6.95856C2.32429 7.00044 2.52122 7.00025 2.74967 7.00003L2.8 7H5.2L5.25033 7.00003C5.47878 7.00025 5.67572 7.00044 5.85017 6.95856C6.39864 6.82688 6.82688 6.39864 6.95856 5.85017C7.00044 5.67572 7.00025 5.47878 7.00003 5.25033L7 5.2V2.8L7.00003 2.74967C7.00025 2.52122 7.00044 2.32429 6.95856 2.14983C6.82688 1.60136 6.39864 1.17312 5.85017 1.04145C5.67572 0.999564 5.47878 0.999752 5.25033 0.99997L5.2 1H2.8ZM2.38328 2.01382C2.42632 2.00348 2.49222 2 2.8 2H5.2C5.50779 2 5.57369 2.00348 5.61672 2.01382C5.79955 2.05771 5.94229 2.20045 5.98619 2.38328C5.99652 2.42632 6 2.49222 6 2.8V5.2C6 5.50779 5.99652 5.57369 5.98619 5.61672C5.94229 5.79955 5.79955 5.94229 5.61672 5.98619C5.57369 5.99652 5.50779 6 5.2 6H2.8C2.49222 6 2.42632 5.99652 2.38328 5.98619C2.20045 5.94229 2.05771 5.79955 2.01382 5.61672C2.00348 5.57369 2 5.50779 2 5.2V2.8C2 2.49222 2.00348 2.42632 2.01382 2.38328C2.05771 2.20045 2.20045 2.05771 2.38328 2.01382Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
            </svg>
          </a>
        </Link>

        <Link href="/explore">
          <a>
            <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 9.1a4.9 4.9 0 1 1-9.8 0 4.9 4.9 0 0 1 9.8 0m-.967 4.922a6.3 6.3 0 1 1 .99-.99l3.973 3.972a.7.7 0 0 1-.991.991z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
            </svg>
          </a>
        </Link>

        <ProfileSettingsModal
          Trigger={() => (
            <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.5 1.225a5.075 5.075 0 0 0-1.408 9.953c-1.672.203-3.105.794-4.186 1.859-1.375 1.354-2.071 3.371-2.071 6.003a.665.665 0 1 0 1.33 0c0-2.408.634-4.032 1.674-5.057 1.042-1.026 2.598-1.558 4.661-1.558s3.619.532 4.662 1.558c1.039 1.026 1.673 2.649 1.673 5.057a.665.665 0 1 0 1.33 0c0-2.632-.696-4.648-2.072-6.003-1.078-1.064-2.513-1.656-4.185-1.859A5.078 5.078 0 0 0 10.5 1.225M6.755 6.3a3.745 3.745 0 1 1 7.49 0 3.745 3.745 0 0 1-7.49 0" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
            </svg>
          )}
          uid={user?.uid || ''}
        />
        <button onClick={() => auth.signOut()}>
          <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.2 1.4a1.4 1.4 0 0 0-1.4 1.4v15.4a1.4 1.4 0 0 0 1.4 1.4h10.5a.7.7 0 0 0 0-1.4H4.2V2.8h10.5a.7.7 0 0 0 0-1.4zm13.446 5.454a.7.7 0 0 0-.991.991L18.61 9.8H9.1a.7.7 0 0 0 0 1.4h9.51l-1.956 1.954a.7.7 0 0 0 .991.991l3.15-3.15a.7.7 0 0 0 0-.991z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
          </svg>
        </button>
      </Header>

      {user ? <List uid={user.uid} /> : null}
    </>
  );
};

const ReadingList: NextPage & { getLayout?: (page: React.ReactElement) => React.ReactNode } = () => {
  // ... (previous ReadingList component code)
};

ReadingList.getLayout = function ReadingListLayout(page: React.ReactElement) {
  return (
    <>
      <Head>
        <title>Reading List / JusticeRest</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,600;1,400;1,600&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="https://www.justice.rest/justicerest.webmanifest" />
        <meta name="mobile-web-app-capable" content="yes" />
      </Head>
      <Script
        src="https://cloud.umami.is/script.js"
        data-website-id="a0cdb368-20ae-4630-8949-ac57917e2ae3"
        strategy="afterInteractive"
      />
      <Container
        maxWidth="640px"
        css={css`
          margin-top: 5rem;
        `}
      >
        {page}
      </Container>
    </>
  )
};

export default ReadingList;
