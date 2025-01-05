import { Country, countryISOMapping } from "./countries";
import { Direction } from "./geography";

export interface Guess {
  name: string;
  distance: number;
  direction: Direction;
  country?: Country;
}

// Replace loadAllGuesses and saveGuesses with simpler versions
export function loadGuesses(): Guess[] {
  const storedGuesses = localStorage.getItem("currentGame");
  return storedGuesses != null ? JSON.parse(storedGuesses) : [];
}

export function saveGuesses(guesses: Guess[]): void {
  localStorage.setItem("currentGame", JSON.stringify(guesses));
}

// Keep OEC link function unchanged
export function constructOecLink(country: Country) {
  const country3LetterCode = country?.code
    ? countryISOMapping[country.code].toLowerCase()
    : "";
  return `https://oec.world/en/profile/country/${country3LetterCode}`;
}
