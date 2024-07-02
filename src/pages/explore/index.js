/** @jsxImportSource @emotion/react */
import Link from 'next/link';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { css } from '@emotion/react';
import { useRouter } from 'next/router';
import { htmlToText } from 'html-to-text';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, doc, query, where, getDocs } from 'firebase/firestore';
import { searchDocs, searchIndex } from 'j-firebase'; // Import searchDocs and searchIndex

import { firestore, auth } from '../../lib/firebase';
import { getPostByID } from '../../lib/db';
import { truncate } from '../../lib/utils';

import Button from '../../components/button';
import Header from '../../components/header';
import Spinner from '../../components/spinner';
import Container from '../../components/container';
import Search from '../../components/search';
import ProfileSettingsModal from '../../components/profile-settings-modal';

export default function Explore() {
  const router = useRouter();

  const [user, userLoading, userError] = useAuthState(auth);
  const [initPosts, initPostsLoading, initPostsError] = useCollectionData(
    firestore.collection('posts')
      .where('published', '==', true)
      .where('title', '!=', '')
      .orderBy('title')
      .limit(15),
    { idField: 'id' }
  );
  const [explorePosts, setExplorePosts] = useState([]);

  useEffect(() => {
    if (!user && !userLoading && !userError) {
      router.push('/');
    }
  }, [router, user, userLoading, userError]);

  // Set initial filtered posts and their author profiles
  useEffect(() => {
    const fetchPosts = async () => {
      if (initPosts && initPosts.length > 0) {
        const postsWithAuthors = await setPostAuthorProfilePics(initPosts);
        setExplorePosts(postsWithAuthors);
      }
    };
    fetchPosts();
  }, [initPosts]);

  // Fetch post author profiles
  const setPostAuthorProfilePics = async (filteredPosts) => {
    const postsWithAuthors = await Promise.all(
      filteredPosts.map(async (p) => {
        const post = await getPostByID(p.id);
        const authorSnapshot = await firestore.collection('users').doc(post.author).get();
        const authorData = authorSnapshot.data();
        return { ...post, author: authorData };
      })
    );
    return postsWithAuthors;
  };

  // Create search index when a new document is added or updated
  const createSearchIndex = async (post) => {
    const data = {
      title: post.title,
      excerpt: post.excerpt,
      author: post.author,
    };
    await searchIndex({
      ref: doc(firestore, 'posts', post.id),
      data,
      indexFields: ['title', 'author', 'excerpt']
    });
  };

  // Handle search input from Search component
  const handleSearchInput = async (searchInput) => {
    try {
      const filteredPosts = await searchDocs(
        collection(firestore, 'posts'),
        searchInput,
        {
          searchCol: '_search',
          allCol: '_all',
          termField: 'term',
          idField: 'id'
        }
      );

      // Update explorePosts state with filtered posts
      const postsWithAuthors = await setPostAuthorProfilePics(filteredPosts);
      setExplorePosts(postsWithAuthors);

      return postsWithAuthors; // Optionally return filtered posts
    } catch (error) {
      console.error('Error searching posts:', error);
      return []; // Return empty array or handle error as needed
    }
  };

  return (
    <>
      <Header>
        <Link href="/dashboard/list">Reading List</Link>
        <Link href="/explore">Explore</Link>
        
        {/* Profile settings */}
        <Link href="#" onClick={() => console.log('Profile clicked')}>
          <ProfileSettingsModal Trigger={() => 'Profile'} uid={user?.uid} />
        </Link>

        {/* Sign out */}
        <Link href="#" onClick={() => auth.signOut()}>Sign Out</Link>
      </Header>

      {userError ? (
        <div>
          <p>Oop, we&apos;ve had an error:</p>
          <pre>{JSON.stringify(userError)}</pre>
        </div>
      ) : user ? (
        explorePosts && explorePosts.length > 0 ? (
          <>
            <Search
              posts={explorePosts}
              isGlobalSearch={true}
              getSearchInput={handleSearchInput} // Ensure getSearchInput is correctly assigned
              css={css`
                margin-left: 0em;
              `}
            ></Search>
            <ul
              css={css`
                list-style: none;

                li {
                  max-width: 25rem;
                  margin: 2.5rem 0;
                }
              `}
            >
              {explorePosts.map((post) => (
                <li key={post.id}>
                  <Link href={`/${post.author.name}/${post.slug}`}>
                    <a style={{ textDecoration: 'none', color: 'inherit' }}>
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
          </>
        ) : (
          <Spinner />
        )
      ) : (
        <Spinner />
      )}
    </>
  );
}

Explore.getLayout = function Explore(page) {
  return (
    <Container
      maxWidth="640px"
      css={css`
        margin-top: 5rem;
      `}
    >
      <Head>
        <title>Explore / JusticeRest</title>
      </Head>
      {page}
    </Container>
  );
};
