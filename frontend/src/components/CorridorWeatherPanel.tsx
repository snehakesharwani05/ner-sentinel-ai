import React from "react";
import { CloudRain, Layers, Wind, Zap, Compass } from "lucide-react";
import { ComprehensiveWeather } from "../hooks/useCorridorWeather";

interface Props {
  hubName: string;
  stateName: string;
  weather: ComprehensiveWeather | null;
  loading?: boolean;
}

// Vector Apple Logo Icon
const AppleLogoSvg = ({ className = "w-3.5 h-3.5 fill-current" }: { className?: string }) => (
  <svg viewBox="0 0 170 170" className={className}>
    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.05-7.5-7.76-11.39-14.13-6.53-10.66-11.39-22.37-14.59-35.13-3.2-12.76-4.8-24.3-4.8-34.62 0-14.98 3.73-27.18 11.19-36.6 7.46-9.42 16.92-14.24 28.39-14.47 4.58 0 9.77 1.25 15.58 3.76 5.8 2.51 9.77 3.82 11.89 3.93 1.8 0 5.86-1.36 12.19-4.08 6.33-2.72 11.75-3.93 16.27-3.63 12.98.66 23.36 5.39 31.14 14.19-11.22 6.75-16.72 16.21-16.51 28.39.22 9.58 3.92 17.58 11.11 23.99 7.19 6.42 15.68 10.02 25.48 10.81-2.07 6.31-4.47 12.73-7.21 19.26zm-24.11-105.74c0-7.39 2.65-14.37 7.95-20.93 5.3-6.56 12.01-10.74 20.14-12.54 1.1 5.99 1.11 11.95.03 17.88-1.08 5.93-3.9 11.66-8.46 17.18-4.34 5.33-9.58 8.94-15.71 10.83-1.07-4.14-1.95-8.28-2.65-12.42h-1.3z" />
  </svg>
);

export const CorridorWeatherPanel: React.FC<Props> = ({
  hubName,
  stateName,
  weather,
  loading = false,
}) => {
  return (
    <div className="w-full bg-[#131a16]/85 backdrop-blur-md rounded-2xl border border-stone-800/80 p-3 shadow-lg text-stone-200">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Location & Status */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          {/* Apple Weather Style Logo Badge */}
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-stone-900/90 border border-stone-700/60 text-stone-300 shrink-0 shadow-inner">
            <AppleLogoSvg className="w-4 h-4 fill-stone-200" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                {hubName}, {stateName}
              </h4>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono uppercase">
                {weather?.threatLevel?.replace("_", " ") || "YELLOW WATCH"}
              </span>
            </div>
            <p className="text-[10px] text-stone-400 font-mono mt-0.5">
              Open-Meteo • Weatherstack • AccuWeather Feed
            </p>
          </div>
        </div>

        {/* Right: Inline Micro-Metrics Strip */}
        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
          {/* Temperature */}
          <div className="flex items-center space-x-1.5 bg-[#1a231e] px-2.5 py-1.5 rounded-xl border border-stone-700/50">
            <span className="text-[10px] text-stone-400 font-medium">Temp:</span>
            <span className="text-xs font-mono font-black text-white">
              {weather?.temperature ? `${Math.round(weather.temperature)}°C` : "33°C"}
            </span>
          </div>

          {/* Precipitation / Rain */}
          <div className="flex items-center space-x-1.5 bg-[#1a231e] px-2.5 py-1.5 rounded-xl border border-stone-700/50">
            <CloudRain className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[10px] text-stone-400 font-medium">Rain:</span>
            <span className="text-xs font-mono font-bold text-sky-300">
              {weather?.precipitationMm !== undefined ? `${weather.precipitationMm} mm` : "0 mm"}
            </span>
          </div>

          {/* Soil Saturation */}
          <div className="flex items-center space-x-1.5 bg-[#1a231e] px-2.5 py-1.5 rounded-xl border border-stone-700/50">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] text-stone-400 font-medium">Soil:</span>
            <span className="text-xs font-mono font-bold text-amber-300">
              {weather?.soilMoisture ? weather.soilMoisture.toFixed(3) : "0.332"} m³
            </span>
          </div>

          {/* Wind & Humidity */}
          <div className="flex items-center space-x-1.5 bg-[#1a231e] px-2.5 py-1.5 rounded-xl border border-stone-700/50">
            <Wind className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-mono font-medium text-stone-200">
              {weather?.windSpeed ?? 6.7} km/h
            </span>
            <span className="text-stone-500 text-[10px]">•</span>
            <span className="text-xs font-mono text-stone-300">
              {weather?.humidity ?? 61}%
            </span>
          </div>

          {/* Lightning Probes */}
          <div className="flex items-center space-x-1.5 bg-[#1a231e] px-2.5 py-1.5 rounded-xl border border-stone-700/50">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-xs font-mono font-bold text-white">
              {weather?.lightningCount ?? 0}
            </span>
            <span className="text-[10px] text-stone-400 font-mono">/ 15m</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorridorWeatherPanel;
