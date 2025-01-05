import { useCallback, useState } from "react";
import { Guess, loadGuesses, saveGuesses } from "../domain/guess";

export function useGuesses(): [Guess[], (guess: Guess) => void] {
  const [guesses, setGuesses] = useState<Guess[]>(loadGuesses());

  const addGuess = useCallback(
    (newGuess: Guess) => {
      const newGuesses = [...guesses, newGuess];
      setGuesses(newGuesses);
      saveGuesses(newGuesses);
    },
    [guesses]
  );

  return [guesses, addGuess];
}
