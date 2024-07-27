/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import ModalOverlay from './modal-overlay';
import Button from './button';
import Input from './input';
import { default as countryList } from 'country-list'; // Import country-list as a whole

const StyledLabel = (props) => (
  <label
    css={css`
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      color: var(--grey-3);
    `}
    {...props}
  >
    {props.children}
  </label>
);

const countries = countryList.getData(); // Fetch the data directly

const countryOptions = countries.map((country) => (
  <option key={country.code} value={country.name}>
    {country.name}
  </option>
));

const categoryOptions = [
  { value: '', label: 'Select Category' },
  { value: 'Social', label: 'Social' },
  { value: 'Economic', label: 'Economic' },
  { value: 'Political', label: 'Political' },
  { value: 'Corporate', label: 'Corporate' },
  { value: 'Others', label: 'Others' },
];

function FilterEditor({ filters, setFilters }) {
  return (
    <>
      <div
        css={css`
          margin: 1.5rem 0 2.5rem 0;
          font-size: 0.9rem;
          input,
          select {
            width: 20em;
          }
          select {
            padding: 0.75em 1.5em;
            border: 1px solid var(--grey-2);
            border-radius: 0.5rem;
            background-color: var(--grey-1);
          }
          div {
            margin-bottom: 1.5rem;
          }
        `}
      >
        <div>
          <StyledLabel htmlFor="filter-country">Country</StyledLabel>
          <select
            css={css`
              text-transform: none;
              display: block;
            `}
            id="filter-country"
            value={filters.country}
            onChange={(e) =>
              setFilters((prevFilters) => ({
                ...prevFilters,
                country: e.target.value,
              }))
            }
          >
            <option value="">Select Country</option>
            {countryOptions}
          </select>
        </div>
        <div>
          <StyledLabel htmlFor="filter-keyword">Keyword</StyledLabel>
          <Input
            id="filter-keyword"
            type="text"
            value={filters.keyword}
            onChange={(e) =>
              setFilters((prevFilters) => ({
                ...prevFilters,
                keyword: e.target.value,
              }))
            }
          />
        </div>
        <div>
          <StyledLabel htmlFor="filter-date">Date</StyledLabel>
          <Input
            id="filter-date"
            type="date"
            value={filters.date}
            onChange={(e) =>
              setFilters((prevFilters) => ({
                ...prevFilters,
                date: e.target.value,
              }))
            }
          />
        </div>
        <div>
          <StyledLabel htmlFor="filter-category">Category</StyledLabel>
          <select
            css={css`
              text-transform: none;
              display: block;
              width: 20em;
              padding: 0.75em 1.5em;
              background: none;
              border: 1px solid var(--grey-2);
              outline: none;
              border-radius: 0.5rem;
              color: inherit;
              background-color: var(--grey-1);
            `}
            id="filter-category"
            value={filters.category}
            onChange={(e) =>
              setFilters((prevFilters) => ({
                ...prevFilters,
                category: e.target.value,
              }))
            }
          >
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button
        css={css`
          margin-left: auto;
          font-size: 0.9rem;
        `}
        onClick={() => {
          // Apply filters
          console.log('Filters applied:', filters);
        }}
      >
        Apply Filters
      </Button>
    </>
  );
}

export default function FilterModal(props) {
  const [filters, setFilters] = useState({
    country: '',
    keyword: '',
    date: '',
    category: '', // Added category filter
  });

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <props.Trigger />
      </Dialog.Trigger>

      <ModalOverlay />

      <Dialog.Content
        css={css`
          background: var(--grey-1);
          border-radius: 0.5rem;
          padding: 1.5rem;
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        `}
      >
        <Dialog.Title>Filter Posts</Dialog.Title>
        <Dialog.Description
          css={css`
            margin: 1rem 0 0.5rem 0;
            max-width: 20rem;
            color: var(--grey-3);
            font-size: 0.9rem;
          `}
        >
          Adjust your filter criteria and click 'Apply Filters' to see the results.
        </Dialog.Description>
        <FilterEditor filters={filters} setFilters={setFilters} />

        <Dialog.Close
          as={Button}
          css={css`
            position: absolute;
            top: 1rem;
            right: 1rem;
            font-size: 0.9rem;
          `}
        >
          <Cross2Icon />
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Root>
  );
}
