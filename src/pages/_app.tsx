import 'modern-normalize'
import Head from 'next/head'
import { ThemeProvider, ThemeProviderProps } from 'next-themes'
import { Global, css } from '@emotion/react'
import { IdProvider } from '@radix-ui/react-id'
import { AppProps } from 'next/app'
import { ReactElement, ReactNode } from 'react'

type NextPageWithLayout = AppProps['Component'] & {
  getLayout?: (page: ReactElement) => ReactNode
}

interface MyAppProps extends AppProps {
  Component: NextPageWithLayout
}

const App = ({ Component, pageProps }: MyAppProps): JSX.Element => {
  const getLayout = Component.getLayout ?? ((page) => page)

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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          value={{
            light: 'light',
            dark: 'dark',
            system: 'system',
          }}
        >
          {getLayout(<Component {...pageProps} />)}
        </ThemeProvider>
      </IdProvider>
    </>
  )
}

export default App
