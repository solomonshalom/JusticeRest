/** @jsxImportSource @emotion/react */
import Link from 'next/link';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { css } from '@emotion/react';
import { useRouter } from 'next/router';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';

import { createPostForUser, filterExplorePosts, getPostByID } from '../../lib/db';
import { firestore, auth } from '../../lib/firebase';

import Button from '../../components/button';
import Header from '../../components/header';
import Spinner from '../../components/spinner';
import Container from '../../components/container';
import Search from '../../components/search';
import ProfileSettingsModal from '../../components/profile-settings-modal';
import { truncate } from '../../lib/utils';

export default function Explore() {
  const router = useRouter();

  const [user, userLoading, userError] = useAuthState(auth);
  const [initPosts, initPostsLoading, initPostsError] = useCollectionData(
    query(
      collection(firestore, 'posts'),
      where('published', '==', true),
      where('title', '!=', ''),
      orderBy('title'),
      limit(15)
    ),
    { idField: 'id' }
  );
  const [explorePosts, setExplorePosts] = useState([]);

  useEffect(() => {
    console.log(user, userLoading, userError);
    if (!user && !userLoading && !userError) {
      router.push('/');
      return;
    }
  }, [router, user, userLoading, userError]);

  useEffect(() => {
    (async () => {
      let posts = await setPostAuthorProfilePics(initPosts);
      setExplorePosts(posts);
    })();
  }, [initPosts]);

  const setPostAuthorProfilePics = async (filteredExplorePosts) => {
    const postPromises = filteredExplorePosts?.map(async (p) => {
      const post = await getPostByID(p.id);
      const author = await firestore.collection('users').doc(post.author).get();
      post.author = author.data();
      return post;
    });
    const posts = postPromises ? await Promise.all(postPromises) : null;
    return posts;
  };

  const getFilteredExplorePosts = async (searchInput) => {
    let filteredExplorePosts = await filterExplorePosts(searchInput);
    filteredExplorePosts = await setPostAuthorProfilePics(filteredExplorePosts);
    setExplorePosts(filteredExplorePosts);
    return filteredExplorePosts;
  };

  return (
    <>
      <Header>
        <Link href="/dashboard/list">
          <svg
            width="21"
            height="21"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 2.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.765.424L7.5 11.59l-3.735 2.334A.5.5 0 0 1 3 13.5zM4 3v9.598l2.97-1.856a1 1 0 0 1 1.06 0L11 12.598V3z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            />
          </svg>
        </Link>

        <Link href="/dashboard">
          <svg
            width="21"
            height="21"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.8 1L2.74967 0.99997C2.52122 0.999752 2.32429 0.999564 2.14983 1.04145C1.60136 1.17312 1.17312 1.60136 1.04145 2.14983C0.999564 2.32429 0.999752 2.52122 0.99997 2.74967L1 2.8V5.2L0.99997 5.25033C0.999752 5.47878 0.999564 5.67572 1.04145 5.85017C1.17312 6.39864 1.60136 6.82688 2.14983 6.95856C2.32429 7.00044 2.52122 7.00025 2.74967 7.00003L2.8 7H5.2L5.25033 7.00003C5.47878 7.00025 5.67572 7.00044 5.85017 6.95856C6.39864 6.82688 6.82688 6.39864 6.95856 5.85017C7.00044 5.67572 7.00025 5.47878 7.00003 5.25033L7 5.2V2.8L7.00003 2.74967C7.00025 2.52122 7.00044 2.32429 6.95856 2.14983C6.82688 1.60136 6.39864 1.17312 5.85017 1.04145C5.67572 0.999564 5.47878 0.999752 5.25033 0.99997L5.2 1H2.8ZM2.38328 2.01382C2.42632 2.00348 2.49222 2 2.8 2H5.2C5.50779 2 5.57369 2.00348 5.61672 2.01382C5.79955 2.05771 5.94229 2.20045 5.98619 2.38328C5.99652 2.42632 6 2.49222 6 2.8V5.2C6 5.50779 5.99652 5.57369 5.98619 5.61672C5.94229 5.79955 5.79955 5.94229 5.61672 5.98619C5.57369 5.99652 5.50779 6 5.2 6H2.8C2.49222 6 2.42632 5.99652 2.38328 5.98619C2.20045 5.94229 2.05771 5.79955 2.01382 5.61672C2.00348 5.57369 2 5.50779 2 5.2V2.8C2 2.49222 2.00348 2.42632 2.01382 2.38328C2.05771 2.20045 2.20045 2.05771 2.38328 2.01382ZM9.8 1L9.74967 0.99997C9.52122 0.999752 9.32429 0.999564 9.14983 1.04145C8.60136 1.17312 8.17312 1.60136 8.04145 2.14983C7.99956 2.32429 7.99975 2.52122 7.99997 2.74967L8 2.8V5.2L7.99997 5.25033C7.99975 5.47878 7.99956 5.67572 8.04145 5.85017C8.17312 6.39864 8.60136 6.82688 9.14983 6.95856C9.32429 7.00044 9.52122 7.00025 9.74967 7.00003L9.8 7H12.2L12.2503 7.00003C12.4788 7.00025 12.6757 7.00044 12.8502 6.95856C13.3986 6.82688 13.8269 6.39864 13.9586 5.85017C14.0004 5.67572 14.0003 5.47878 14.0001 5.25033L14 5.2V2.8L14.0001 2.74967C14.0003 2.52122 14.0004 2.32429 13.9586 2.14983C13.8269 1.60136 13.3986 1.17312 12.8502 1.04145C12.6757 0.999564 12.4788 0.999752 12.2503 0.99997L12.2 1H9.8ZM9.38328 2.01382C9.42632 2.00348 9.49222 2 9.8 2H12.2C12.5078 2 12.5737 2.00348 12.6167 2.01382C12.7995 2.05771 12.9423 2.20045 12.9862 2.38328C12.9965 2.42632 13 2.49222 13 2.8V5.2C13 5.50779 12.9965 5.57369 12.9862 5.61672C12.9423 5.79955 12.7995 5.94229 12.6167 5.98619C12.5737 5.99652 12.5078 6 12.2 6H9.8C9.49222 6 9.42632 5.99652 9.38328 5.98619C9.20045 5.94229 9.05771 5.79955 9.01382 5.61672C9.00348 5.57369 9 5.50779 9 5.2V2.8C9 2.49222 9.00348 2.42632 9.01382 2.38328C9.05771 2.20045 9.20045 2.05771 9.38328 2.01382ZM6 8V14H1V8H6ZM2 10H5V13H2V10ZM14 14V8H9V14H14ZM10 13H13V10H10V13Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            />
          </svg>
        </Link>

        <Link href="/dashboard/bookmarks">
          <svg
            width="21"
            height="21"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 2.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.765.424L7.5 11.59l-3.735 2.334A.5.5 0 0 1 3 13.5zM4 3v9.598l2.97-1.856a1 1 0 0 1 1.06 0L11 12.598V3z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </Header>

      <Container
        css={css`
          margin: 4rem 0 0;
        `}
      >
        <Head>
          <title>Explore</title>
        </Head>

        <ProfileSettingsModal user={user} />

        <div
          css={css`
            margin-bottom: 1rem;
            display: flex;
            justify-content: center;
          `}
        >
          <Search getFilteredExplorePosts={getFilteredExplorePosts} />
        </div>

        {initPostsLoading ? (
          <Spinner />
        ) : initPostsError ? (
          <p>Error: {initPostsError.message}</p>
        ) : (
          explorePosts?.length ? (
            <ul>
              {explorePosts.map((post) => (
                <li key={post.id}>
                  <Link href={`/post/${post.slug}`}>
                    <a>
                      <h2>{post.title}</h2>
                      <p>{truncate(post.excerpt, 150)}</p>
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>No posts found</p>
          )
        )}
      </Container>
    </>
  );
}
