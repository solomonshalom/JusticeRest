/** @jsxImportSource @emotion/react */
import Head from 'next/head'
import { css } from '@emotion/react'
import { useAuthState } from 'react-firebase-hooks/auth'
import AnonymousLoginButton from '../components/AnonymousLoginButton'

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
      <div style={{ width: '100vw', minHeight: '100vh', position: 'fixed', zIndex: 1, display: 'flex', justifyContent: 'center', padding: '120px 24px 160px 24px', pointerEvents: 'none' }}>
        <div style={{ background: 'radial-gradient(circle, rgba(2, 0, 36, 0) 0, #fafafa 100%)', position: 'absolute', content: '""', zIndex: 2, width: '100%', height: '100%', top: 0 }}></div>
        <div style={{ content: '""', backgroundImage: 'url(https://assets.dub.co/misc/grid.svg)', zIndex: 1, position: 'absolute', width: '100%', height: '100%', top: 0, opacity: 0.4, filter: 'invert(1)' }}></div>
        <div style={{ zIndex: 3, width: '100%', maxWidth: '640px', backgroundImage: 'radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 1) 0px, transparent 0%), radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 1) 0px, transparent 50%), radial-gradient(at 52% 99%, hsla(354, 98%, 61%, 1) 0px, transparent 50%), radial-gradient(at 10% 29%, hsla(256, 96%, 67%, 1) 0px, transparent 50%), radial-gradient(at 97% 96%, hsla(38, 60%, 74%, 1) 0px, transparent 50%), radial-gradient(at 33% 50%, hsla(222, 67%, 73%, 1) 0px, transparent 50%), radial-gradient(at 79% 53%, hsla(343, 68%, 79%, 1) 0px, transparent 50%)', position: 'absolute', height: '100%', filter: 'blur(100px) saturate(150%)', top: '80px', opacity: 0.15 }}></div>
      </div>
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
          }
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
        <li>Post problems needing attention</li>
        <li>Engage with the community for solutions</li>
        <li>Advocate for justice by resolving issues</li>
      </ul>
      {loading ? (
        <Button>
          <Spinner />
        </Button>
      ) : user ? (
        <>
          <div
            css={css`
              display: flex;
            `}
          >
            <LinkButton 
            href="/dashboard"
            css={css`
              display: block;
              border: none;
              outline: none;
              cursor: pointer;

              padding: 0.1em 0em;
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
          `}
            >
              Dashboard 🕹️
            </LinkButton>
            <Button
              css={css`
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

                margin-left: 1rem;
              `}
              outline
              onClick={() => auth.signOut()}
            >
              Sign Out 🚪🚶
            </Button>
          </div>
          {/*
          <br />
          <a
            href="https://www.producthunt.com/posts/justicerest?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-justicerest"
            target="_blank"
          >
            <img
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=470161&theme=dark"
              alt="JusticeRest - A platform to speak up, seek change, and inspire justice! | Product Hunt"
              css={css`
                width: 300px;
                height: 54px;
              `}
              width="300"
              height="54"
            />
          </a>
          */}
        </>
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
              css={css`
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
              `}
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
            {/* Implementing an Avatar functionality */}
            <AnonymousLoginButton />
          </div>
          {/*
          <br />
          <a
            href="https://www.producthunt.com/posts/justicerest?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-justicerest"
            target="_blank"
          >
            <img
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=470161&theme=dark"
              alt="JusticeRest - A platform to speak up, seek change, and inspire justice! | Product Hunt"
              css={css`
                width: 300px;
                height: 54px;
              `}
              width="300"
              height="54"
            />
          </a>
          */}
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

        <link rel="manifest" href="https://www.justice.rest/justicerest.webmanifest" />
        <meta name="mobile-web-app-capable" content="yes" />

        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="a0cdb368-20ae-4630-8949-ac57917e2ae3"
        ></script>
      </Head>
      {page}
    </Container>
  )
}
