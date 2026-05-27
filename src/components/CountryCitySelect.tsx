"use client";

import { useAppAuth } from "@/hooks/useAppAuth";
import { clientApiFetch } from "@/lib/api-client";
import { useCallback, useEffect, useState } from "react";

export type CountryOption = {
  code: string;
  name: string;
  dialCode: string;
};

const COUNTRIES_CACHE_KEY = "medibook_countries_v1";
const CITIES_CACHE_PREFIX = "medibook_cities_v1:";

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
  const [cities, setCities] = useState<string[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [cityError, setCityError] = useState<string | null>(null);

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

  const loadCities = useCallback(
    async (code: string) => {
      if (!code) {
        setCities([]);
        return;
      }

      const cacheKey = `${CITIES_CACHE_PREFIX}${code}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          setCities(JSON.parse(cached) as string[]);
          return;
        } catch {
          sessionStorage.removeItem(cacheKey);
        }
      }

      setLoadingCities(true);
      setCityError(null);
      try {
        const res = await clientApiFetch(getToken, `/api/locations/cities?code=${code}`);
        const data = (await res.json()) as { cities?: string[]; error?: string };
        if (!res.ok) throw new Error(data.error ?? "Could not load cities");
        const list = data.cities ?? [];
        setCities(list);
        sessionStorage.setItem(cacheKey, JSON.stringify(list));
      } catch {
        setCityError("Could not load cities — try again or pick another country.");
        setCities([]);
      } finally {
        setLoadingCities(false);
      }
    },
    [getToken]
  );

  useEffect(() => {
    if (value.country_code) loadCities(value.country_code);
  }, [value.country_code, loadCities]);

  const selectedCountry = countries.find((c) => c.code === value.country_code);

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
            Dial code {selectedCountry.dialCode} — used for SMS reminders
          </p>
        )}
      </div>

      <div>
        <label className="label">City</label>
        <select
          className="input-field"
          data-testid="city-select"
          value={value.city}
          disabled={!value.country_code || loadingCities || cities.length === 0}
          onChange={(e) => onChange({ ...value, city: e.target.value })}
          required
        >
          <option value="">
            {!value.country_code
              ? "Select a country first"
              : loadingCities
                ? "Loading cities…"
                : cities.length === 0
                  ? "No cities available"
                  : "Select city"}
          </option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
        {cityError && <p className="mt-1 text-xs text-red-600">{cityError}</p>}
      </div>
    </div>
  );
}
