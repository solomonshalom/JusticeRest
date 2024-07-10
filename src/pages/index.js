/** @jsxImportSource @emotion/react */
import Head from 'next/head'
import { css } from '@emotion/react'
import { useAuthState } from 'react-firebase-hooks/auth'
import AnonymousLoginButton from '../components/AnonymousLoginButton';

import firebase, { auth } from '../lib/firebase'
import { setUser, userWithIDExists } from '../lib/db'

import meta from '../components/meta'
import Spinner from '../components/spinner'
import Container from '../components/container'
import Button, { LinkButton } from '../components/button'

export default function Home() {
  const [user, loading, error] = useAuthState(auth)

  if (error) {
    return (
      <>
        <p>Oop, we&apos;ve had an error:</p>
        <pre>{JSON.stringify(error)}</pre>
      </>
    )
  }

  return (
    <div>
      <div
        css={css`
          margin-top: 0rem;
          margin-bottom: 1rem;
          position: relative;
          right: 1rem;

          @media (max-width: 500px) {
            margin-bottom: 1rem;
          }

          width: 200px;
          height: 200px;

          background-image: url('/images/logo.png');
          background-position: center;
          background-repeat: no-repeat;
          background-size: contain;
        `}
      ></div>
      <h1
        css={css`
          font-size: 1.5rem;
          letter-spacing: -0.02rem;
          margin-bottom: 1.5rem;
        `}
      >
        JusticeRest
      </h1>
      <ul
        css={css`
          list-style: none;
          color: var(--grey-3);
          margin-bottom: 2.5rem;

          li {
            margin: 0.75rem 0;
          }

          li::before {
            display: inline-block;
            content: '';
            font-size: 0.9rem;
            margin-right: 0.5rem;
          }
        `}
      >
        <li>Speak Up</li>
        <li>Seek Change</li>
        <li>Inspire Justice</li>
      </ul>
      {loading ? (
        <Button>
          <Spinner />
        </Button>
      ) : user ? (
        <div
          css={css`
            display: flex;
          `}
        >
          <LinkButton href="/dashboard">Dashboard 🕹️</LinkButton>
          <Button
            css={css`
              margin-left: 1rem;
            `}
            outline
            onClick={() => auth.signOut()}
          >
            Sign Out 🚪🚶
          </Button>
        </div>
      ) : (
        <>
          <div
            css={css`
              display: flex;
              button:first-of-type {
                margin-right: 1rem;
              }
            `}
          >
            <Button
              onClick={() => {
                const googleAuthProvider = new firebase.auth.GoogleAuthProvider()
                auth.signInWithPopup(googleAuthProvider).then(async cred => {
                  let userExists = await userWithIDExists(cred.user.uid)
                  
                  if (!userExists) {
                    await setUser(cred.user.uid, {
                      name: cred.user.uid,
                      displayName: cred.user.displayName || 'Anonymous',
                      about: 'hii',
                      posts: [],
                      photo: cred.user.photoURL,
                      readingList: [],
                    })
                  }
                })
              }}
            >
              User ⛹️
            </Button>
            {/*Implementing an Avatar functionality + Makes code much better! Praise, God (Couldn't have done it w/o him <3):D*/}
            <AnonymousLoginButton />
          </div>
          <br />
          <a href="https://www.producthunt.com/posts/justicerest?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-justicerest" target="_blank">
            <img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=470161&theme=dark" alt="JusticeRest - A&#0032;platform&#0032;to&#0032;speak&#0032;up&#0044;&#0032;seek&#0032;change&#0044;&#0032;and&#0032;inspire&#0032;justice&#0033; | Product Hunt" style="width: 350px; height: 54px;" width="350" height="54" />
          </a>
        </>
      )}
    </div>
  )
}

Home.getLayout = function HomeLayout(page) {
  return (
    <Container maxWidth="420px">
      <Head>
        {meta({
          title: 'JusticeRest',
          description:
            'A platform to speak up, seek change, and inspire justice~',
          url: '/',
          image: '/images/socials.png',
        })}
      </Head>
      {page}
    </Container>
  )
}
