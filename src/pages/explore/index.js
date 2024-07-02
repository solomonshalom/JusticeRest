/** @jsxImportSource @emotion/react */
import Link from 'next/link'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { css } from '@emotion/react'
import { useRouter } from 'next/router'
import { htmlToText } from 'html-to-text'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { collection, doc, query, where, getDocs } from 'firebase/firestore';
import { searchIndex, searchDocs } from 'j-firebase';

import { createPostForUser, filterExplorePosts } from '../../lib/db'
import { firestore, auth } from '../../lib/firebase'

import Button from '../../components/button'
import Header from '../../components/header'
import Spinner from '../../components/spinner'
import Container from '../../components/container'
import Search from '../../components/search'
import ProfileSettingsModal from '../../components/profile-settings-modal'
import { truncate } from '../../lib/utils'
import { getPostByID } from '../../lib/db'

export default function Explore() {
  const router = useRouter()

  const [user, userLoading, userError] = useAuthState(auth);
  const [initPosts, initPostsLoading, initPostsError] = useCollectionData(
    firestore.collection('posts')
      .where('published', '==', true)
      .where('title', '!=', '')
      .orderBy('title')
      .limit(15), { idField: 'id' },
  )
  const [explorePosts, setExplorePosts] = useState([]);

  useEffect(() => {
    console.log(user, userLoading, userError)
    if (!user && !userLoading && !userError) {
      router.push('/')
      return
    }
  }, [router, user, userLoading, userError]);

  // Set initial filteredPosts
  useEffect(() => {
    (async () => {
      let posts = await setPostAuthorProfilePics(initPosts);
      setExplorePosts(posts);
    })()
  }, [initPosts])

  // Set the profile pics for each author
  const setPostAuthorProfilePics = async (filteredExplorePosts) => {
    const postPromises = filteredExplorePosts?.map(async p => {
      const post = await getPostByID(p.id)
      const author = await firestore
        .collection('users')
        .doc(post.author)
        .get()
      post.author = author.data()
      return post;
    })
    const posts = postPromises ? await Promise.all(postPromises) : null
    return posts
  }

  // Create the search index when a document is added or updated
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
  }

  // Get the searchInput from Search component and do the global search on db
  const getFilteredExplorePosts = async (searchInput) => {
    const data = await searchDocs(
      collection(firestore, 'posts'),
      searchInput,
      {
        searchCol: '_search',
        allCol: '_all',
        termField: 'term',
        idField: 'id'
      }
    );

    const filteredExplorePosts = await setPostAuthorProfilePics(data);
    setExplorePosts(filteredExplorePosts)
    return filteredExplorePosts;
  }

  return (
    <>
      <Header>

        <Link href="/dashboard/list">
          Reading List
        </Link>

        <Link href="/explore">
          Explore
        </Link>

        {/* Profile settings */}
        <Link href="#" onClick={() => console.log('Profile clicked')}>
          <ProfileSettingsModal Trigger={() => 'Profile'} uid={user?.uid} />
        </Link>

        {/* Sign out */}
        <Link href="#" onClick={() => auth.signOut()}>
          Sign Out
        </Link>

      </Header>

      {userError ? (
        <>
          <p>Oop, we&apos;ve had an error:</p>
          <pre>{JSON.stringify(error)}</pre>
        </>
      ) : user ? (
        explorePosts && explorePosts.length > 0 ? (
          <>
            <Search
              posts={explorePosts}
              isGlobalSearch={true}
              getSearchInput={getFilteredExplorePosts}
              css={css`
                margin-left: 0em
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
              {explorePosts.map(post => (
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
          <p>Loading!</p>
        )
      ) : (
        <Spinner />
      )}
    </>
  )
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
  )
}
