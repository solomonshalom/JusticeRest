/** @jsxImportSource @emotion/react */
import React, { useEffect, useState } from 'react'
import { css, SerializedStyles } from '@emotion/react'

const inputStyles = css`
  display: block;
  width: 100%;
  padding: 0.75em 1em 0.75em 2.5em;
  background: none;
  border: 1px solid var(--grey-2);
  outline: none;
  border-radius: 0.5rem;

  color: var(--grey-4);
  &::placeholder {
    color: var(--grey-3);
  }
`

interface SearchProps {
  isGlobalSearch: boolean;
  getSearchInput: (input: string) => void;
  posts?: Array<{ title: string }>;
  getFilteredPosts?: (posts: Array<{ title: string }>) => void;
}

export default function Search({ isGlobalSearch, getSearchInput, posts, getFilteredPosts }: SearchProps) {
  const [searchInput, setSearchInput] = useState('');
  const searchBarPlaceholder = isGlobalSearch ? 'Search published posts...' : 'Search your posts...'

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (isGlobalSearch) {
      if (event.key === 'Enter') {
        console.log('do validate')
        getSearchInput(searchInput);
      }
    }
  }

  useEffect(() => {
    if (isGlobalSearch) {
      // Do nothing for global search
    } else {
      const delayDebounceFn = setTimeout(() => {
        if (posts) {
          filterPosts();
          getSearchInput(searchInput);
        }
      }, 500)

      return () => clearTimeout(delayDebounceFn)
    }
  }, [searchInput, isGlobalSearch, posts, getSearchInput])

  const filterPosts = () => {
    if (isGlobalSearch) {
      console.log('Do global search')
    } else if (posts && getFilteredPosts) {
      let tempPosts = posts.filter(p => p.title.toLowerCase().includes(searchInput.toLowerCase()))
      getFilteredPosts(tempPosts);
    }
  }

  const exploreSearchBarStyles: SerializedStyles =
    isGlobalSearch ?
      css`width: 80%`    // Explore page search bar styles
      :
      css`width: 80%`     // Dashboard page search bar styles

  return (
    <div css={exploreSearchBarStyles}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1.1em"
        height="1.1em"
        fill="none"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
        css={css`
          position: absolute;
          margin: 0.8em;

          path {
            stroke: black;
          }

          @media (prefers-color-scheme: dark) {
            path {
              stroke: white;
            }
          }
        `}
      >
        <path
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m17 17 4 4M3 11a8 8 0 1 0 16 0 8 8 0 0 0-16 0Z">
        </path>
      </svg>
      <input
        id="search-posts"
        type="text"
        placeholder={searchBarPlaceholder}
        onKeyDown={handleKeyDown}
        css={inputStyles}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setSearchInput(e.target.value);
        }}
      />
    </div>
  )
}
