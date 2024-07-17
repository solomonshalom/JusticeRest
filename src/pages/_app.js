import 'modern-normalize'
import Head from 'next/head'
import { ThemeProvider } from 'next-themes'
import { Global, css } from '@emotion/react'
import { IdProvider } from '@radix-ui/react-id'
import { AppProps } from 'next/app';


const App = ({ Component, pageProps }) => {
  const getLayout = Component.getLayout || (page => page)

  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap"
          rel="stylesheet"
        />

          <link rel="manifest" href="https://www.justice.rest/justicerest.webmanifest" />
          <meta name="mobile-web-app-capable" content="yes" />

<script defer src="https://cloud.umami.is/script.js" data-website-id="a0cdb368-20ae-4630-8949-ac57917e2ae3"></script>
      </Head>
      <Global
        styles={css`
          :root {
            --grey-1: #fcfcfc;
            --grey-2: #c7c7c7;
            --grey-3: #6f6f6f;
            --grey-4: #2e2e2e;
            --grey-5: #171717;
          }

          [data-theme='dark'] {
            --grey-1: #171717;
            --grey-2: #3a3939;
            --grey-4: #c7c7c7;
            --grey-5: #fcfcfc;
          }

          *,
          *::before,
          *::after {
            margin: 0;
            padding: 0;
          }

          html {
            font-size: 100%;
            color: var(--grey-4);
          }

          body {
            background: var(--grey-1);
            font-family: 'Inter', sans-serif;
            font-family: 'Inter', sans-serif;
            width: 100%;
            height: 100%;
            background-size: cover;
            background-position: center center;
            background-repeat: repeat;
            background-image: url('data:image/svg+xml,<svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg"><defs><filter id="b" x="-500" y="-500" width="2000" height="2000" filterUnits="userSpaceOnUse"><feGaussianBlur in="SourceGraphic" stdDeviation="100"/></filter><filter id="a" x="-500" y="-500" width="2000" height="2000" filterUnits="userSpaceOnUse"> > <feFlood flood-color="%23fff" result="neutral-gray"/><feTurbulence type="fractalNoise" baseFrequency="2.5" numOctaves="100" stitchTiles="stitch" result="noise"/><feColorMatrix in="noise" type="saturate" values="0" result="destaturatedNoise"/><feComponentTransfer in="desaturatedNoise" result="theNoise"><feFuncA type="table" tableValues="0 0 0.05 0"/></feComponentTransfer><feBlend in="SourceGraphic" in2="theNoise" mode="soft-light" result="noisy-image"/></filter><radialGradient id="c" cx="50%" cy="50%" r="50%" fx="20%" fy="40%"><stop offset="0%" stop-color="%239d00ff"/><stop offset="100%" stop-color="rgba(255,0,162,0.2)"/></radialGradient></defs><rect width="100%" height="100%"/><g filter="url(%23a)"><g filter="url(%23b)"><svg width="1000" height="1000" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg" transform="translate(-24.861 537.363)" opacity=".6"><path fill="url(%23c)" d="M468 388q-66 88-175 100t-188.5-88-5-209.5 183-79 180 109.5 5.5 167"/></svg></g></g><svg width="500" height="90.312" viewBox="0 0 1218 220" fill="none" xmlns="http://www.w3.org/2000/svg" transform="translate(250 454.844)"/></svg>');
          }

          h1,
          h2,
          h3,
          h4,
          h5,
          h6 {
            color: var(--grey-5);
            font-weight: 500;
          }

          @media (max-width: 420px) {
            html {
              font-size: 90%;
            }
          }

          // Proesemirror
          .ProseMirror-focused {
            outline: none;
          }

          .ProseMirror .is-editor-empty:first-of-type::before {
            content: attr(data-placeholder);
            float: left;
            color: inherit;
            opacity: 0.5;
            pointer-events: none;
            height: 0;
          }

          .ProseMirror img {
            max-width: 100%;
            height: auto;
          }

          .ProseMirror img.ProseMirror-selectednode {
            box-shadow: 0 0 1rem var(--grey-2);
          }

          /* Style for text selection */
          ::selection {
            background-color: #301a35;
            color: white; /* Text color when selected */
          }
      
          /* Preventing background color change when text is deselected */
          ::-moz-selection {
            background-color: #301a35;
            color: white;
          }
        `}
      />
      <IdProvider>
        <ThemeProvider defaultTheme="system">
          {getLayout(<Component {...pageProps} />)}
        </ThemeProvider>
      </IdProvider>
    </>
  )
}

export default App
