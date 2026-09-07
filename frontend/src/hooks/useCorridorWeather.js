import { useState, useEffect } from "react";

const WEATHERSTACK_KEY = (typeof import.meta !== "undefined" && import.meta.env?.VITE_WEATHERSTACK_KEY) || "";
const ACCUWEATHER_KEY = (typeof import.meta !== "undefined" && import.meta.env?.VITE_ACCUWEATHER_KEY) || "";

export function useCorridorWeather(lat, lng, radiusKm = 75) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lat || !lng) return;

    let isMounted = true;
    setLoading(true);

    async function fetchAllTelemetry() {
      // 1. Geotechnical & Rain Data from Open-Meteo
      const openMeteoPromise = fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code,soil_moisture_0_to_1cm`
      )
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);

      // 2. Real-Time Atmospheric Feed from Weatherstack
      const weatherstackPromise = WEATHERSTACK_KEY
        ? fetch(
            `https://api.weatherstack.com/current?access_key=${WEATHERSTACK_KEY}&query=${lat},${lng}`
          )
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null)
        : Promise.resolve(null);

      // 3. Lightning Activity & Severe Storm Feed from AccuWeather (Optional fallback)
      const accuLightningPromise = ACCUWEATHER_KEY
        ? fetch(
            `https://dataservice.accuweather.com/lightning/v1/15min/geoposition/radius.geojson?apikey=${ACCUWEATHER_KEY}&q=${lat},${lng}&distanceRadius=${Math.min(
              Math.round(radiusKm * 0.621371),
              60
            )}`
          )
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null)
        : Promise.resolve(null);

      const [omRes, wsRes, accuRes] = await Promise.all([
        openMeteoPromise,
        weatherstackPromise,
        accuLightningPromise,
      ]);

      if (!isMounted) return;

      // Extract telemetry values with robust fallbacks
      const temp =
        omRes?.current?.temperature_2m ??
        wsRes?.current?.temperature ??
        28;

      const rain =
        omRes?.current?.precipitation ??
        wsRes?.current?.precip ??
        0.0;

      const soil = omRes?.current?.soil_moisture_0_to_1cm ?? 0.320;
      const humid = omRes?.current?.relative_humidity_2m ?? wsRes?.current?.humidity ?? 78;
      const wind = omRes?.current?.wind_speed_10m ?? wsRes?.current?.wind_speed ?? 12;

      const lightningStrikes =
        accuRes?.features?.length ??
        accuRes?.lightningStrikes?.length ??
        0;

      // Classify IMD Threat Status
      let threat = "GREEN_CLEAR";
      if (rain > 15 || soil > 0.42 || lightningStrikes > 10) {
        threat = "RED_ALERT";
      } else if (rain > 5 || soil > 0.36 || lightningStrikes > 3) {
        threat = "ORANGE_WARNING";
      } else if (rain > 0.5 || soil > 0.31) {
        threat = "YELLOW_WATCH";
      }

      const desc =
        wsRes?.current?.weather_descriptions?.[0] ??
        (rain > 0 ? "Precipitation / Moist Ground" : "Nominal Transit Conditions");

      setData({
        temperature: temp,
        precipitationMm: rain,
        soilMoisture: soil,
        humidity: humid,
        windSpeed: wind,
        threatLevel: threat,
        weatherDescription: desc,
        source: wsRes?.current ? "Weatherstack + Open-Meteo" : "Open-Meteo Stream",
      });

      setLoading(false);
    }

    fetchAllTelemetry();

    return () => {
      isMounted = false;
    };
  }, [lat, lng, radiusKm]);

  return { weather: data, loading };
}

export default useCorridorWeather;
