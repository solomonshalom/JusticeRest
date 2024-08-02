/** @jsxImportSource @emotion/react */
import React, { useState } from 'react';
import { css } from '@emotion/react';
import * as Dialog from '@radix-ui/react-dialog';
import countryList, { Country } from 'country-list';

const countries: Country[] = countryList.getData(); // Fetch the data directly

const countryOptions = countries.map((country: Country) => (
  <option key={country.code} value={country.name}>
    {country.name}
  </option>
));

interface FilterModalProps {
  onFilter: (filters: { country: string; category: string }) => void;
}

function FilterModal({ onFilter }: FilterModalProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountry(e.target.value);
    onFilter({ country: e.target.value, category: selectedCategory });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    onFilter({ country: selectedCountry, category: e.target.value });
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button css={css`
          /* Style your trigger button */
          padding: 0.5em 1em;
          border: none;
          border-radius: 0.5rem;
          background-color: var(--blue);
          color: white;
          cursor: pointer;
          font-size: 0.9rem;
        `}>
          Filter
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay css={css`
          background: rgba(0, 0, 0, 0.5);
          position: fixed;
          inset: 0;
        `} />
        <Dialog.Content
          css={css`
            background: var(--grey-1);
            border-radius: 0.5rem;
            padding: 1.5rem;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90%;
            max-width: 500px;
            box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.2);
          `}
        >
          <Dialog.Title>Filter</Dialog.Title>
          <Dialog.Description
            css={css`
              margin: 1rem 0;
              color: var(--grey-3);
              font-size: 0.9rem;
            `}
          >
            Use the options below to filter posts by country and category.
          </Dialog.Description>

          <div
            css={css`
              margin: 1.5rem 0;
            `}
          >
            <label htmlFor="filter-country">Country</label>
            <select
              css={css`
                text-transform: none;
                display: block;
                width: 100%;
                padding: 0.75em 1.5em;
                background: none;
                border: 1px solid var(--grey-2);
                outline: none;
                border-radius: 0.5rem;
                color: inherit;
                background-color: var(--grey-1);
                margin-bottom: 1.5em;
              `}
              id="filter-country"
              value={selectedCountry}
              onChange={handleCountryChange}
            >
              <option value="">Select Country</option>
              {countryOptions}
            </select>
          </div>

          <div>
            <label htmlFor="filter-category">Category</label>
            <select
              css={css`
                text-transform: none;
                display: block;
                width: 100%;
                padding: 0.75em 1.5em;
                background: none;
                border: 1px solid var(--grey-2);
                outline: none;
                border-radius: 0.5rem;
                color: inherit;
                background-color: var(--grey-1);
                margin-bottom: 1.5em;
              `}
              id="filter-category"
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              <option value="">Type of Concern</option>
              <option value="Social">Social</option>
              <option value="Economic">Economic</option>
              <option value="Political">Political</option>
              <option value="Corporate">Corporate</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div
            css={css`
              display: flex;
              justify-content: flex-end;
              margin-top: 1rem;
            `}
          >
            <Dialog.Close asChild>
              <button
                css={css`
                  padding: 0.5em 1em;
                  border: none;
                  border-radius: 0.5rem;
                  background-color: var(--blue);
                  color: white;
                  cursor: pointer;
                  font-size: 0.9rem;
                  margin-right: 0.5rem;
                `}
                onClick={() => {
                  onFilter({ country: selectedCountry, category: selectedCategory });
                }}
              >
                Apply
              </button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <button
                css={css`
                  padding: 0.5em 1em;
                  border: none;
                  border-radius: 0.5rem;
                  background-color: var(--grey-2);
                  color: var(--grey-1);
                  cursor: pointer;
                  font-size: 0.9rem;
                `}
              >
                Cancel
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default FilterModal;
