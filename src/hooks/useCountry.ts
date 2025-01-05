import { useState, useEffect } from "react";
import { Country, countriesWithImage } from "../domain/countries";

export function useCountry(): [Country | undefined] {
  const [country, setCountry] = useState<Country | undefined>(() => {
    // Check if we have a stored country for current game
    const stored = localStorage.getItem("currentCountry");
    if (stored) return JSON.parse(stored);

    // If not, pick a random one
    const randomIndex = Math.floor(Math.random() * countriesWithImage.length);
    const newCountry = countriesWithImage[randomIndex];
    localStorage.setItem("currentCountry", JSON.stringify(newCountry));
    return newCountry;
  });

  return [country];
}
