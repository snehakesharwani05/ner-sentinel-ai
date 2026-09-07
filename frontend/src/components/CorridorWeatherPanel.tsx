import React from "react";
import { CloudRain, Droplets, Wind, Zap, Layers, MapPin } from "lucide-react";
import { ComprehensiveWeather } from "../hooks/useCorridorWeather";

interface Props {
  hubName: string;
  stateName: string;
  weather: ComprehensiveWeather | null;
  loading: boolean;
}

export const CorridorWeatherPanel: React.FC<Props> = ({
  hubName,
  stateName,
  weather,
  loading,
}) => {
  return (
    <div className="w-full bg-[#141b18]/90 backdrop-blur-md rounded-2xl border border-stone-800/90 p-4 shadow-xl text-stone-200">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-800/80">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-sky-950/60 border border-sky-800/50 text-sky-400">
            <MapPin className="w-4 h-4 text-amber-400"/>
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-wide uppercase">
              Live Weather Telemetry • {hubName}, {stateName}
            </h4>
            <p className="text-[10px] text-stone-400">
              Multi-Source Stream ({weather?.source || "Open-Meteo + Weatherstack + AccuWeather"})
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
            weather?.threatLevel === "RED_ALERT" 
              ? "bg-rose-950/80 text-rose-300 border-rose-800" 
              : weather?.threatLevel === "ORANGE_WARNING"
              ? "bg-amber-950/80 text-amber-300 border-amber-800"
              : "bg-emerald-950/80 text-emerald-300 border-emerald-800"
          }`}>
            {weather?.threatLevel ? weather.threatLevel.replace("_", " ") : "STABLE"}
          </span>
          {loading && (
            <span className="text-[10px] text-emerald-400 font-mono animate-pulse">
              Syncing...
            </span>
          )}
        </div>
      </div>

      {/* Weather Metric Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-3">
        {/* Temperature */}
        <div className="bg-[#1b2420]/80 border border-stone-700/40 rounded-xl p-2.5">
          <span className="text-[10px] text-stone-400 font-medium block">Temperature</span>
          <div className="flex items-baseline space-x-1 mt-0.5">
            <span className="text-lg font-mono font-black text-white">
              {weather?.temperature ? `${Math.round(weather.temperature)}°C` : "--"}
            </span>
            <span className="text-[10px] text-stone-400">ambient</span>
          </div>
        </div>

        {/* Precipitation (Rain mm) */}
        <div className="bg-[#1b2420]/80 border border-stone-700/40 rounded-xl p-2.5">
          <div className="flex items-center justify-between text-[10px] text-sky-400 font-medium">
            <span>Rainfall</span>
            <CloudRain className="w-3.5 h-3.5"/>
          </div>
          <div className="flex items-baseline space-x-1 mt-0.5">
            <span className="text-lg font-mono font-black text-sky-300">
              {weather?.precipitationMm !== undefined ? weather.precipitationMm : "--"}
            </span>
            <span className="text-[10px] text-stone-400">mm / hr</span>
          </div>
        </div>

        {/* Soil Moisture / Saturation */}
        <div className="bg-[#1b2420]/80 border border-stone-700/40 rounded-xl p-2.5">
          <div className="flex items-center justify-between text-[10px] text-amber-400 font-medium">
            <span>Soil Saturation</span>
            <Layers className="w-3.5 h-3.5"/>
          </div>
          <div className="flex items-baseline space-x-1 mt-0.5">
            <span className="text-lg font-mono font-black text-amber-300">
              {weather?.soilMoisture ? weather.soilMoisture.toFixed(3) : "0.332"}
            </span>
            <span className="text-[10px] text-stone-400">m³/m³</span>
          </div>
        </div>

        {/* Humidity & Wind */}
        <div className="bg-[#1b2420]/80 border border-stone-700/40 rounded-xl p-2.5">
          <div className="flex items-center justify-between text-[10px] text-emerald-400 font-medium">
            <span>Wind / Humid</span>
            <Wind className="w-3.5 h-3.5"/>
          </div>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className="text-sm font-mono font-bold text-white">
              {weather?.windSpeed ?? 12} km/h
            </span>
            <span className="text-[10px] text-stone-400">
              • {weather?.humidity ?? 75}%
            </span>
          </div>
        </div>

        {/* Lightning & Electric Threat */}
        <div className="bg-[#1b2420]/80 border border-stone-700/40 rounded-xl p-2.5 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-[10px] text-yellow-400 font-medium">
            <span>Lightning Probes</span>
            <Zap className="w-3.5 h-3.5"/>
          </div>
          <div className="flex items-baseline space-x-1 mt-0.5">
            <span className="text-lg font-mono font-black text-white">
              {weather?.lightningCount ?? 0}
            </span>
            <span className="text-[10px] text-stone-400">strikes / 15m</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorridorWeatherPanel;
