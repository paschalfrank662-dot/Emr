import { Country, State } from 'country-state-city'

export type CountryOption = {
  code: string
  name: string
  states: string[]
}

export const COUNTRIES: CountryOption[] = Country.getAllCountries()
  .map((country) => ({
    code: country.isoCode,
    name: country.name,
    states: State.getStatesOfCountry(country.isoCode).map((state) => state.name),
  }))
  .sort((a, b) => a.name.localeCompare(b.name))

export function getCountryByName(name: string) {
  return COUNTRIES.find((country) => country.name === name) ?? COUNTRIES.find((country) => country.code === 'NG')!
}

export function getStatesForCountry(countryName: string) {
  return getCountryByName(countryName).states
}
