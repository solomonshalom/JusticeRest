/** @jsxImportSource @emotion/react */
import Link from 'next/link'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { css } from '@emotion/react'
import { useRouter } from 'next/router'
import { htmlToText } from 'html-to-text'
import { useAuthState } from 'react-firebase-hooks/auth'

import { createPostForUser, getUserPosts } from '../../lib/db'
import { auth } from '../../lib/firebase'

import Button from '../../components/button'
import Header from '../../components/header'
import Spinner from '../../components/spinner'
import Container from '../../components/container'
import Search from '../../components/search'
import ProfileSettingsModal from '../../components/profile-settings-modal'

function formatDate(date) {
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

export default function Dashboard() {
  const router = useRouter()

  const [user, userLoading, userError] = useAuthState(auth)
  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [postsError, setPostsError] = useState(null)
  const [filteredPosts, setFilteredPosts] = useState([])

  useEffect(() => {
    if (user) {
      const fetchPosts = async () => {
        try {
          const userPosts = await getUserPosts(user.uid)
          setPosts(userPosts)
          setFilteredPosts(userPosts)
        } catch (error) {
          setPostsError(error)
        } finally {
          setPostsLoading(false)
        }
      }
      fetchPosts()
    } else if (!userLoading && !userError) {
      router.push('/')
    }
  }, [router, user, userLoading, userError])

  const getFilteredPosts = (fp) => {
    setFilteredPosts(fp)
  }

  const getSearchInput = (searchInput) => {
    return searchInput
  }

  return (
    <>
      <Header>
        <Link href="/dashboard/list">
          <svg width="21" height="21" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 2.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.765.424L7.5 11.59l-3.735 2.334A.5.5 0 0 1 3 13.5zM4 3v9.598l2.97-1.856a1 1 0 0 1 1.06 0L11 12.598V3z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"/>
          </svg>
        </Link>

        <Link href="/explore">
          <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 9.1a4.9 4.9 0 1 1-9.8 0 4.9 4.9 0 0 1 9.8 0m-.967 4.922a6.3 6.3 0 1 1 .99-.99l3.973 3.972a.7.7 0 0 1-.991.991z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"/>
          </svg>
        </Link>

        <Link href="#" onClick={() => console.log('Profile clicked')} css={css`&:hover { var(--grey-3); }`}>
          <ProfileSettingsModal Trigger={() => (
            <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.5 1.225a5.075 5.075 0 0 0-1.408 9.953c-1.672.203-3.105.794-4.186 1.859-1.375 1.354-2.071 3.371-2.071 6.003a.665.665 0 1 0 1.33 0c0-2.408.634-4.032 1.674-5.057 1.042-1.026 2.598-1.558 4.661-1.558s3.619.532 4.662 1.558c1.039 1.026 1.673 2.649 1.673 5.057a.665.665 0 1 0 1.33 0c0-2.632-.696-4.648-2.072-6.003-1.078-1.064-2.513-1.656-4.185-1.859A5.078 5.078 0 0 0 10.5 1.225M6.755 6.3a3.745 3.745 0 1 1 7.49 0 3.745 3.745 0 0 1-7.49 0" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"/>
            </svg>
          )} uid={user?.uid} />
        </Link>

        <Link href="#" onClick={() => auth.signOut()}>
          <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.2 1.4a1.4 1.4 0 0 0-1.4 1.4v15.4a1.4 1.4 0 0 0 1.4 1.4h10.5a.7.7 0 0 0 0-1.4H4.2V2.8h10.5a.7.7 0 0 0 0-1.4zm13.446 5.454a.7.7 0 0 0-.991.991L18.61 9.8H9.1a.7.7 0 0 0 0 1.4h9.51l-1.956 1.954a.7.7 0 0 0 .991.991l3.15-3.15a.7.7 0 0 0 0-.991z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"/>
          </svg>
        </Link>
      </Header>

      {userError || postsError ? (
        <>
          <p>Oops, we've had an error:</p>
          <pre>{JSON.stringify(userError || postsError)}</pre>
        </>
      ) : user && filteredPosts && posts ? (
        <>
          <div css={css`display: flex; flex-wrap: wrap; gap: 1em; width: 109%;`}>
            <Button
              outline
              css={css`font-size: 1.3rem; padding: 0; width: 2.15em; height: 2.15em;`}
              onClick={async () => {
                const newPostsId = await createPostForUser(user.uid)
                router.push(`/dashboard/${newPostsId}`)
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="21px" height="21px" fill="none" stroke-width="1.5" viewBox="0 0 24 24" color="#ffffff" css={css`
                margin: 0.2em 0 0 0.1em;
                path {
                  stroke: black;
                }
                @media (prefers-color-scheme: dark) {
                  path {
                    stroke: white;
                  }
                }
              `}>
                <path stroke="#ffffff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" d="m14.363 5.652 1.48-1.48a2 2 0 0 1 2.829 0l1.414 1.414a2 2 0 0 1 0 2.828l-1.48 1.48m-4.243-4.242-9.616 9.615a2 2 0 0 0-.578 1.238l-.242 2.74a1 1 0 0 0 1.084 1.085l2.74-.242a2 2 0 0 0 1.24-.578l9.615-9.616m-4.243-4.242 4.243 4.243M9 19h12"></path>
              </svg>
            </Button>

            <Search posts={posts} getFilteredPosts={getFilteredPosts} getSearchInput={getSearchInput} />

            {filteredPosts.map((post, i) => (
              <Link
                key={i}
                href={`/dashboard/${post.slug}`}
                css={css`
                  display: block;
                  margin-top: 2em;
                  text-decoration: none;
                  width: 100%;
                `}
              >
                <Container post={post} />
              </Link>
            ))}
          </div>
        </>
      ) : (
        <Spinner size="lg" />
      )}
    </>
  )
}
