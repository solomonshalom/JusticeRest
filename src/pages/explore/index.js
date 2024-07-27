/** @jsxImportSource @emotion/react */
import Link from 'next/link'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { css } from '@emotion/react'
import { useRouter } from 'next/router'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { firestore, auth } from '../../lib/firebase'
import { createPostForUser, filterExplorePosts, getPostByID } from '../../lib/db'
import Button from '../../components/button'
import Header from '../../components/header'
import Spinner from '../../components/spinner'
import Container from '../../components/container'
import Search from '../../components/search'

export default function Explore() {
  const router = useRouter()
  const [user, userLoading, userError] = useAuthState(auth)
  const [initPosts, initPostsLoading, initPostsError] = useCollectionData(
    firestore.collection('posts')
      .where('published', '==', true)
      .where('title', '!=', '')
      .orderBy('title')
      .limit(15),
    { idField: 'id' },
  )
  const [explorePosts, setExplorePosts] = useState([])

  useEffect(() => {
    if (!user && !userLoading && !userError) {
      router.push('/')
      return
    }
  }, [router, user, userLoading, userError])

  useEffect(() => {
    (async () => {
      let posts = await setPostAuthorProfilePics(initPosts)
      setExplorePosts(posts)
    })()
  }, [initPosts])

  const setPostAuthorProfilePics = async (filteredExplorePosts) => {
    const postPromises = filteredExplorePosts?.map(async p => {
      const post = await getPostByID(p.id)
      const author = await firestore
        .collection('users')
        .doc(post.author)
        .get()
      post.author = author.data()
      return post
    })
    const posts = postPromises ? await Promise.all(postPromises) : null
    return posts
  }

  const getFilteredExplorePosts = async (searchInput) => {
    let filteredExplorePosts = await filterExplorePosts(searchInput)
    filteredExplorePosts = await setPostAuthorProfilePics(filteredExplorePosts)
    setExplorePosts(filteredExplorePosts)
    return filteredExplorePosts
  }

  return (
    <>
      <Head>
        <title>Explore</title>
      </Head>
      <Header>
        <Link href="/dashboard/list">
          <svg width="21" height="21" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 2.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.765.424L7.5 11.59l-3.735 2.334A.5.5 0 0 1 3 13.5zM4 3v9.598l2.97-1.856a1 1 0 0 1 1.06 0L11 12.598V3z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"/>
          </svg>
        </Link>
        <Link href="/dashboard">
          <svg width="21" height="21" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.8 1L2.74967 0.99997C2.52122 0.999752 2.32429 0.999564 2.14983 1.04145C1.60136 1.17312 1.17312 1.60136 1.04145 2.14983C0.999564 2.32429 0.999752 2.52122 0.99997 2.74967L1 2.8V5.2L0.99997 5.25033C0.999752 5.47878 0.999564 5.67572 1.04145 5.85017C1.17312 6.39864 1.60136 6.82688 2.14983 6.95856C2.32429 7.00044 2.52122 7.00025 2.74967 7.00003L2.8 7H5.2L5.25033 7.00003C5.47878 7.00025 5.67572 7.00044 5.85017 6.95856C6.39864 6.82688 6.82688 6.39864 6.95856 5.85017C7.00044 5.67572 7.00025 5.47878 7.00003 5.25033L7 5.2V2.8L7.00003 2.74967C7.00025 2.52122 7.00044 2.32429 6.95856 2.14983C6.82688 1.60136 6.39864 1.17312 5.85017 1.04145C5.67572 0.999564 5.47878 0.999752 5.25033 0.99997L5.2 1H2.8zM2 5V3H6V5H2z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"/>
          </svg>
        </Link>
        <Link href="/dashboard/create">
          <Button color="primary" size="small">Create Post</Button>
        </Link>
      </Header>
      <Container size="large" css={css`padding-top: 20px;`}>
        <Search onSearch={getFilteredExplorePosts} placeholder="Search for a post..." />
        {userLoading || initPostsLoading ? (
          <div css={css`display: flex; justify-content: center;`}>
            <Spinner />
          </div>
        ) : explorePosts && explorePosts.length > 0 ? (
          <div css={css`
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            grid-gap: 20px;
            margin-top: 20px;
          `}>
            {explorePosts.map(post => (
              <Link key={post.id} href={`/dashboard/${post.author.name}/${post.slug}`}>
                <div css={css`
                  padding: 20px;
                  border: 1px solid #e1e4e8;
                  border-radius: 5px;
                  transition: box-shadow 0.2s ease;
                  &:hover {
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                  }
                `}>
                  <h2 css={css`
                    font-size: 20px;
                    margin-bottom: 10px;
                    color: #0366d6;
                  `}>{post.title}</h2>
                  <p css={css`
                    font-size: 14px;
                    color: #586069;
                  `}>{post.excerpt}</p>
                  <div css={css`
                    display: flex;
                    align-items: center;
                    margin-top: 10px;
                  `}>
                    {post.author.profilePic && (
                      <img
                        src={post.author.profilePic}
                        alt={post.author.name}
                        css={css`
                          width: 24px;
                          height: 24px;
                          border-radius: 50%;
                          margin-right: 10px;
                        `}
                      />
                    )}
                    <span css={css`font-size: 14px; color: #586069;`}>{post.author.name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p css={css`
            text-align: center;
            margin-top: 40px;
            color: #586069;
          `}>No posts found.</p>
        )}
      </Container>
    </>
  )
}
