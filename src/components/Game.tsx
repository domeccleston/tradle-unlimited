import { DateTime } from "luxon";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import {
  getCountryName,
  countryISOMapping,
  getFictionalCountryByName,
  getCountryByName,
} from "../domain/countries";
import { getCompassDirection } from "../domain/geography";
import { useGuesses } from "../hooks/useGuesses";
import { CountryInput } from "./CountryInput";
import * as geolib from "geolib";
import { Share } from "./Share";
import { Guesses } from "./Guesses";
import { useTranslation } from "react-i18next";
import { SettingsData } from "../hooks/useSettings";
import { useMode } from "../hooks/useMode";
import { useCountry } from "../hooks/useCountry";
import axios from "axios";

function getDayString() {
  return DateTime.now().toUTC().toFormat("yyyy-MM-dd");
}

const MAX_TRY_COUNT = 6;

interface GameProps {
  settingsData: SettingsData;
}

export function Game({ settingsData }: GameProps) {
  const { t, i18n } = useTranslation();
  const countryInputRef = useRef<HTMLInputElement>(null);

  const [country] = useCountry();
  const [guesses, addGuess] = useGuesses();
  const [currentGuess, setCurrentGuess] = useState("");
  const [countryValue, setCountryValue] = useState("");
  const [won, setWon] = useState(() =>
    guesses.some((guess) => guess.distance === 0)
  );
  const [hideImageMode, setHideImageMode] = useMode(
    "hideImageMode",
    undefined,
    settingsData.noImageMode
  );
  const [rotationMode, setRotationMode] = useMode(
    "rotationMode",
    undefined,
    settingsData.rotationMode
  );

  const startNewGame = useCallback(() => {
    localStorage.removeItem("currentGame");
    localStorage.removeItem("currentCountry");
    window.location.reload();
  }, []);

  const gameEnded = guesses.length === MAX_TRY_COUNT || won;
  console.log({
    guessesLength: guesses.length,
    MAX_TRY_COUNT,
    won,
    gameEnded,
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!country) return;
      const guessedCountry = getCountryByName(currentGuess);

      if (guessedCountry == null) {
        toast.error(t("unknownCountry"));
        return;
      }

      const newGuess = {
        name: currentGuess,
        distance: geolib.getDistance(guessedCountry, country),
        direction: getCompassDirection(guessedCountry, country),
        country: guessedCountry,
      };

      addGuess(newGuess);
      setCurrentGuess("");
      setCountryValue("");

      if (newGuess.distance === 0) {
        setWon(true);
      }
    },
    [addGuess, country, currentGuess, t]
  );

  useEffect(() => {
    if (
      guesses.length === MAX_TRY_COUNT &&
      guesses[guesses.length - 1].distance > 0
    ) {
      const countryName = country
        ? getCountryName(i18n.resolvedLanguage, country)
        : "";
      if (countryName) {
        toast.info(countryName.toUpperCase(), {
          autoClose: false,
          delay: 2000,
        });
      }
    }
  }, [country, guesses, i18n.resolvedLanguage]);

  let iframeSrc = "https://oec.world/en/tradle/aprilfools.html";
  let oecLink = "https://oec.world/";
  const country3LetterCode = country?.code
    ? countryISOMapping[country.code].toLowerCase()
    : "";
  if (true) {
    const oecCode = country?.oecCode
      ? country?.oecCode?.toLowerCase()
      : country3LetterCode;
    iframeSrc = `https://oec.world/en/visualize/embed/tree_map/hs92/export/${oecCode}/all/show/2022/?controls=false&title=false&click=false`;
    oecLink = `https://oec.world/en/profile/country/${country3LetterCode}`;
  }

  return (
    <div className="flex-grow flex flex-col mx-2 relative">
      {hideImageMode && !gameEnded && (
        <button
          className="border-2 uppercase my-2 hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-slate-800 dark:active:bg-slate-700"
          type="button"
          onClick={() => setHideImageMode(false)}
        >
          {t("showCountry")}
        </button>
      )}
      <h2 className="font-bold text-center">
        Guess which country exports these products!
      </h2>
      <div
        style={{
          position: "relative",
          paddingBottom: "70%",
          paddingTop: "25px",
          height: 0,
        }}
      >
        {country3LetterCode ? (
          <iframe
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
            title="Country to guess"
            width="390"
            height="315"
            src={iframeSrc}
            frameBorder="0"
          />
        ) : null}
      </div>
      {rotationMode && !hideImageMode && !gameEnded && (
        <button
          className="border-2 uppercase mb-2 hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-slate-800 dark:active:bg-slate-700"
          type="button"
          onClick={() => setRotationMode(false)}
        >
          {t("cancelRotation")}
        </button>
      )}
      <Guesses
        rowCount={MAX_TRY_COUNT}
        guesses={guesses}
        settingsData={settingsData}
        countryInputRef={countryInputRef}
        isAprilFools={false}
      />
      <div className="my-2">
        {gameEnded ? (
          <>
            <a
              className="underline w-full text-center block mt-4 flex justify-center"
              href={oecLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              {t("showOnGoogleMaps")}
            </a>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="">
              <CountryInput
                countryValue={countryValue}
                setCountryValue={setCountryValue}
                setCurrentGuess={setCurrentGuess}
                isAprilFools={false}
              />
              <div className="text-left flex gap-2">
                <button
                  type="submit"
                  className="my-2 inline-block justify-end bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded items-center"
                >
                  🌍 <span>Guess</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (country) {
                      toast.info(country.name.toUpperCase(), {
                        autoClose: 2000,
                      });
                      localStorage.removeItem("currentCountry");
                      localStorage.removeItem("currentGame");
                      window.location.reload();
                    }
                  }}
                  className="my-2 inline-block justify-end bg-red-300 hover:bg-red-400 text-gray-800 font-bold py-2 px-4 rounded items-center"
                >
                  ⏭️ <span>Skip</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
      {gameEnded && (
        <button
          className="mt-4 px-4 py-2 bg-oec-orange hover:bg-oec-yellow text-black font-bold rounded"
          onClick={startNewGame}
        >
          {t("New game")}
        </button>
      )}
    </div>
  );
}
