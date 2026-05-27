"use client";

import { useAppAuth } from "@/hooks/useAppAuth";
import { clientApiFetch } from "@/lib/api-client";
import { useCallback, useEffect, useRef, useState } from "react";

export type CountryOption = {
  code: string;
  name: string;
  dialCode: string;
};

const COUNTRIES_CACHE_KEY = "medibook_countries_v1";

type CountryCityValue = {
  country_code: string;
  country: string;
  city: string;
};

export function CountryCitySelect({
  value,
  onChange,
}: {
  value: CountryCityValue;
  onChange: (next: CountryCityValue) => void;
}) {
  const { getToken } = useAppAuth();
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [cityInput, setCityInput] = useState(value.city);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cityError, setCityError] = useState<string | null>(null);
  const searchSeqRef = useRef(0);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cityWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCityInput(value.city);
  }, [value.city, value.country_code]);

  useEffect(() => {
    const cached = sessionStorage.getItem(COUNTRIES_CACHE_KEY);
    if (cached) {
      try {
        setCountries(JSON.parse(cached) as CountryOption[]);
        setLoadingCountries(false);
        return;
      } catch {
        sessionStorage.removeItem(COUNTRIES_CACHE_KEY);
      }
    }

    clientApiFetch(getToken, "/api/locations/countries")
      .then((r) => r.json())
      .then((d: { countries: CountryOption[] }) => {
        setCountries(d.countries ?? []);
        sessionStorage.setItem(COUNTRIES_CACHE_KEY, JSON.stringify(d.countries ?? []));
      })
      .catch(() => setCountries([]))
      .finally(() => setLoadingCountries(false));
  }, [getToken]);

  const fetchSuggestions = useCallback(
    async (code: string, query: string) => {
      const trimmed = query.trim();
      if (!code || trimmed.length < 1) {
        setSuggestions([]);
        setLoadingSuggestions(false);
        return;
      }

      const seq = ++searchSeqRef.current;
      setLoadingSuggestions(true);
      setCityError(null);

      try {
        const res = await clientApiFetch(
          getToken,
          `/api/locations/cities?code=${encodeURIComponent(code)}&q=${encodeURIComponent(trimmed)}`
        );
        const data = (await res.json()) as {
          country_code?: string;
          suggestions?: string[];
          error?: string;
        };
        if (seq !== searchSeqRef.current) return;
        if (!res.ok) throw new Error(data.error ?? "Could not load suggestions");
        if (data.country_code && data.country_code !== code.toUpperCase()) return;

        setSuggestions(data.suggestions ?? []);
      } catch {
        if (seq !== searchSeqRef.current) return;
        setSuggestions([]);
        setCityError("Could not load city suggestions — you can still type your city.");
      } finally {
        if (seq === searchSeqRef.current) setLoadingSuggestions(false);
      }
    },
    [getToken]
  );

  const scheduleSearch = useCallback(
    (code: string, query: string) => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      searchTimerRef.current = setTimeout(() => {
        void fetchSuggestions(code, query);
      }, 220);
    },
    [fetchSuggestions]
  );

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (cityWrapRef.current && !cityWrapRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCountry = countries.find((c) => c.code === value.country_code);

  function pickSuggestion(city: string) {
    setCityInput(city);
    onChange({ ...value, city });
    setSuggestions([]);
    setShowSuggestions(false);
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Country</label>
        <select
          className="input-field"
          data-testid="country-select"
          value={value.country_code}
          disabled={loadingCountries}
          onChange={(e) => {
            const code = e.target.value;
            const country = countries.find((c) => c.code === code);
            setCityInput("");
            setSuggestions([]);
            onChange({
              country_code: code,
              country: country?.name ?? "",
              city: "",
            });
          }}
          required
        >
          <option value="">
            {loadingCountries ? "Loading countries…" : "Select country"}
          </option>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.dialCode} · {c.name}
            </option>
          ))}
        </select>
        {selectedCountry && (
          <p className="mt-1 text-xs text-[var(--cr-text-muted)]">
            Dial code {selectedCountry.dialCode} — type a city in {selectedCountry.name}
          </p>
        )}
      </div>

      <div ref={cityWrapRef} className="relative">
        <label className="label" htmlFor="city-input">
          City
        </label>
        <input
          id="city-input"
          className="input-field"
          data-testid="city-input"
          type="text"
          autoComplete="off"
          value={cityInput}
          disabled={!value.country_code}
          placeholder={
            !value.country_code
              ? "Select a country first"
              : loadingSuggestions
                ? "Searching cities…"
                : "Start typing your city name"
          }
          onChange={(e) => {
            const next = e.target.value;
            setCityInput(next);
            onChange({ ...value, city: next });
            setShowSuggestions(true);
            if (value.country_code) scheduleSearch(value.country_code, next);
          }}
          onFocus={() => {
            setShowSuggestions(true);
            if (value.country_code && cityInput.trim()) {
              scheduleSearch(value.country_code, cityInput);
            }
          }}
          required
          minLength={2}
        />
        {showSuggestions && value.country_code && cityInput.trim().length >= 1 && (
          <ul
            className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-[var(--cr-border)] bg-[var(--cr-surface)] shadow-lg"
            data-testid="city-suggestions"
          >
            {loadingSuggestions && suggestions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-[var(--cr-text-muted)]">Searching…</li>
            ) : suggestions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-[var(--cr-text-muted)]">
                No matches — press enter to use &ldquo;{cityInput.trim()}&rdquo;
              </li>
            ) : (
              suggestions.map((city) => (
                <li key={city}>
                  <button
                    type="button"
                    data-testid="city-suggestion"
                    className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--cr-surface-hover)]"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pickSuggestion(city)}
                  >
                    {city}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
        {cityError && <p className="mt-1 text-xs text-amber-600">{cityError}</p>}
      </div>
    </div>
  );
}
