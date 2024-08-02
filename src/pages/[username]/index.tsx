/** @jsxImportSource @emotion/react */
import Link from 'next/link'
import Head from 'next/head'
import { css } from '@emotion/react'
import { htmlToText } from 'html-to-text'
import { useEffect, useState } from 'react'

import { truncate } from '../../lib/utils'
import { getUserByName } from '../../lib/db'

import meta from '../../components/meta'
import Container from '../../components/container'

import firebase from 'firebase/app';

interface User {
  id: string;
  name: string;
  displayName: string;
  about: string;
  photo: string;
  posts: Post[];
  readingList: string[];
}

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  lastEdited: firebase.firestore.Timestamp;
  published: boolean;
  author: string;
  category?: string;
}

function formatDate(date: firebase.firestore.Timestamp | number): string {
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  const dateValue = date instanceof firebase.firestore.Timestamp ? date.toDate() : new Date(date);
  return new Intl.DateTimeFormat('en-US', options).format(dateValue);
}

export default function Profile({ user }: { user: User }) {
  return (
    <Container maxWidth="640px">
      <Head>
        {meta({
          title: `${user.displayName} (@${user.name}) / JusticeRest`,
          description: user.about,
          url: `/${user.name}`,
          image: user.photo,
        })}

        <link rel="manifest" href="https://www.justice.rest/justicerest.webmanifest" />
        <meta name="mobile-web-app-capable" content="yes" />

        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,600;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Script
        src="https://cloud.umami.is/script.js"
        data-website-id="a0cdb368-20ae-4630-8949-ac57917e2ae3"
        strategy="afterInteractive"
      />

      <img
        src={user.photo}
        alt="Profile picture"
        css={css`
          width: 5rem;
          border-radius: 2.5rem;
        `}
      />
      <h1
        css={css`
          font-size: 1.5rem;
          letter-spacing: -0.03em;
          margin: 1.5rem 0 1rem 0;
        `}
      >
        {user.displayName}
      </h1>

      <p
        css={css`
          color: var(--grey-4);
          font-size: 1.125rem;
          font-family: 'Newsreader', serif;
          line-height: 1.5em;
        `}
      >
        {user.about}
      </p>

      <ul
        id="posts"
        css={css`
          list-style: none;
          margin-top: 3rem;
        `}
      >
        {user.posts.map(post => (
          <li
            key={post.id}
            css={css`
              display: flex;
              margin: 2.5rem 0;

              a {
                text-decoration: none;
                color: inherit;
                display: block;
                width: 70%;
                margin-left: auto;
              }

              @media (max-width: 626px) {
                flex-direction: column;

                a {
                  width: 100%;
                }
              }
            `}
          >
            <p
              css={css`
                margin: 0.75rem 0;
                font-size: 0.9rem;
                color: var(--grey-3);
                margin: 0 auto auto 0;

                @media (max-width: 626px) {
                  margin-bottom: 1rem;
                }
              `}
            >
              {formatDate(new Date(post.lastEdited))}
            </p>

            <Link href={`/${user.name}/${post.slug}`}>
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

                <p
                  css={css`
                    max-width: 25rem;
                    color: var(--grey-4);
                    font-family: 'Newsreader', serif;
                    line-height: 1.5em;
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
    </Container>
  )
}

export async function getStaticPaths(): Promise<{
  paths: never[];
  fallback: 'blocking';
}> {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export async function getStaticProps({ params }: { params: { username: string } }): Promise<{ props: { user: User }; revalidate: number } | { notFound: boolean }> {
  const { username } = params;

  try {
    const user = await getUserByName(username);
    user.posts = user.posts.map(p => ({
      ...p,
      lastEdited: p.lastEdited instanceof firebase.firestore.Timestamp
        ? p.lastEdited.toDate().getTime()
        : p.lastEdited,
    }));
    user.posts.sort((a, b) => {
      const aTime = typeof a.lastEdited === 'number' ? a.lastEdited : a.lastEdited.toDate().getTime();
      const bTime = typeof b.lastEdited === 'number' ? b.lastEdited : b.lastEdited.toDate().getTime();
      return bTime - aTime;
    });
    user.posts = user.posts.filter(p => p.published);

    return {
      props: { user: JSON.parse(JSON.stringify(user)) },
      revalidate: 1,
    };
  } catch (err) {
    console.error('Error fetching user data:', err);
    return { notFound: true };
  }
}
