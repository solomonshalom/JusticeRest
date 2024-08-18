declare module 'country-list' {
  export interface Country {
    code: string;
    name: string;
  }

  export function getData(): Country[];
  export function getName(code: string): string | undefined;
  export function getCode(name: string): string | undefined;
  export function getNames(): string[];
  export function getCodes(): string[];

  const countryList: {
    getData: typeof getData;
    getName: typeof getName;
    getCode: typeof getCode;
    getNames: typeof getNames;
    getCodes: typeof getCodes;
  };

  export default countryList;
}
