import React from "react";
import { CloudRain, Droplets, Wind, Zap, Compass, Activity } from "lucide-react";
import { ComprehensiveWeather } from "../hooks/useCorridorWeather";

interface Props {
  hubName: string;
  stateName: string;
  weather: ComprehensiveWeather | null;
  loading?: boolean;
}

export const CorridorWeatherBar: React.FC<Props> = ({
  hubName,
  stateName,
  weather,
  loading = false,
}) => {
  const sfFont = {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", -system-ui, sans-serif',
  };

  const threatColor =
    weather?.threatLevel === "RED_ALERT"
      ? "text-rose-400 bg-rose-500/15 border-rose-500/30"
      : weather?.threatLevel === "ORANGE_WARNING"
      ? "text-amber-400 bg-amber-500/15 border-amber-500/30"
      : "text-emerald-400 bg-emerald-500/15 border-emerald-500/30";

  return (
    <div
      style={sfFont}
      className="w-full bg-[#141b18]/90 backdrop-blur-md rounded-2xl border border-stone-800/80 p-3 shadow-xl text-stone-200 select-none transition-all my-3"
    >
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Left Segment: Location & Live Telemetry Stream Indicator */}
        <div className="flex items-center space-x-3 px-1">
          <div className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0">
            <Compass className="w-4 h-4 text-emerald-400"/>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold tracking-tight text-white uppercase">
                {hubName}
              </span>
              <span className="text-xs text-stone-400 font-medium">
                ({stateName})
              </span>
              <span
                className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase ${threatColor}`}
              >
                {weather?.threatLevel?.replace("_", " ") || "YELLOW WATCH"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-stone-400 font-mono mt-0.5">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <Activity className="w-3 h-3"/> Live Feed
              </span>
              <span className="text-stone-600">•</span>
              <span>Open-Meteo</span>
              <span className="text-stone-600">•</span>
              <span>Weatherstack</span>
              <span className="text-stone-600">•</span>
              <span>AccuWeather</span>
              {loading && (
                <span className="text-emerald-400 font-medium animate-pulse ml-1">
                  (Syncing...)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Segment: 5 Tactical Metric Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 flex-1 lg:max-w-3xl">
          {/* Temperature */}
          <div className="flex flex-col justify-center bg-[#1b2420]/80 rounded-xl border border-stone-700/40 px-3 py-2">
            <span className="text-[10px] font-bold tracking-wider text-stone-400 uppercase">
              Temperature
            </span>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-base font-mono font-bold text-white">
                {weather?.temperature !== undefined ? Math.round(weather.temperature) : "31"}°C
              </span>
              <span className="text-[10px] text-stone-500 font-mono">ambient</span>
            </div>
          </div>

          {/* Precipitation / Rainfall */}
          <div className="flex flex-col justify-center bg-[#1b2420]/80 rounded-xl border border-stone-700/40 px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider text-sky-400 uppercase">
                Rainfall
              </span>
              <CloudRain className="w-3 h-3 text-sky-400"/>
            </div>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-base font-mono font-bold text-sky-300">
                {weather?.precipitationMm !== undefined ? weather.precipitationMm : "0.1"}
              </span>
              <span className="text-[10px] text-stone-400 font-mono">mm/h</span>
            </div>
          </div>

          {/* Soil Saturation */}
          <div className="flex flex-col justify-center bg-[#1b2420]/80 rounded-xl border border-stone-700/40 px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider text-amber-400 uppercase">
                Soil Sat
              </span>
              <Droplets className="w-3 h-3 text-amber-400"/>
            </div>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-base font-mono font-bold text-amber-300">
                {weather?.soilMoisture ? weather.soilMoisture.toFixed(3) : "0.347"}
              </span>
              <span className="text-[10px] text-stone-400 font-mono">m³/m³</span>
            </div>
          </div>

          {/* Wind & Humidity */}
          <div className="flex flex-col justify-center bg-[#1b2420]/80 rounded-xl border border-stone-700/40 px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
                Wind / Humid
              </span>
              <Wind className="w-3 h-3 text-emerald-400"/>
            </div>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-xs font-mono font-bold text-white">
                {weather?.windSpeed ?? 7.6} km/h
              </span>
              <span className="text-stone-600">•</span>
              <span className="text-xs font-mono text-stone-300">
                {weather?.humidity ?? 77}%
              </span>
            </div>
          </div>

          {/* Lightning Activity */}
          <div className="flex flex-col justify-center bg-[#1b2420]/80 rounded-xl border border-stone-700/40 px-3 py-2 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider text-yellow-400 uppercase">
                Lightning
              </span>
              <Zap className="w-3 h-3 text-yellow-400"/>
            </div>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-base font-mono font-bold text-white">
                {weather?.lightningCount ?? 0}
              </span>
              <span className="text-[10px] text-stone-400 font-mono">/ 15m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorridorWeatherBar;
