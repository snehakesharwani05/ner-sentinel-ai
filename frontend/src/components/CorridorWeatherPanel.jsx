import React from "react";
import { CloudRain, Droplets, Wind, Zap, Compass, AlertCircle } from "lucide-react";

export const CorridorWeatherPanel = ({
  hubName,
  stateName,
  weather,
  loading = false,
}) => {
  // Apple SF Pro Typography font stack
  const appleFontStack = {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", "Helvetica Neue", Helvetica, Arial, sans-serif',
  };

  const threatColor =
    weather?.threatLevel === "RED_ALERT"
      ? "text-rose-400 bg-rose-500/10 border-rose-500/30"
      : weather?.threatLevel === "ORANGE_WARNING"
      ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
      : "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";

  return (
    <div
      style={appleFontStack}
      className="w-full bg-[#121815]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 shadow-2xl text-white select-none transition-all"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Left: Location & Meteorological Status */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
            <Compass className="w-4 h-4 text-emerald-400"/>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold tracking-tight text-white">
                {hubName}
              </span>
              <span className="text-xs text-white/40 font-normal">
                {stateName}
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border tracking-wide uppercase ${threatColor}`}
              >
                {weather?.threatLevel?.replace("_", " ") || "YELLOW WATCH"}
              </span>
            </div>

            <p className="text-[11px] text-white/45 tracking-tight mt-0.5 flex items-center gap-1.5">
              <span>Open-Meteo</span>
              <span className="text-white/20">•</span>
              <span>Weatherstack</span>
              <span className="text-white/20">•</span>
              <span>AccuWeather Probes</span>
              {loading && (
                <span className="text-emerald-400 text-[10px] font-medium animate-pulse ml-1">
                  (Syncing live...)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right: Apple Weather Segmented Micro-Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full lg:w-auto">
          {/* Temperature */}
          <div className="bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] rounded-xl px-3 py-2 flex flex-col justify-center min-w-[92px] transition-colors">
            <span className="text-[10px] uppercase font-medium tracking-wider text-white/40">
              Temp
            </span>
            <div className="flex items-baseline space-x-0.5 mt-0.5">
              <span className="text-base font-semibold tracking-tight text-white">
                {weather?.temperature ? `${Math.round(weather.temperature)}` : "33"}
              </span>
              <span className="text-xs font-normal text-white/60">°C</span>
            </div>
          </div>

          {/* Precipitation / Rain */}
          <div className="bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] rounded-xl px-3 py-2 flex flex-col justify-center min-w-[92px] transition-colors">
            <div className="flex items-center justify-between text-white/40">
              <span className="text-[10px] uppercase font-medium tracking-wider">Rain</span>
              <CloudRain className="w-3 h-3 text-sky-400"/>
            </div>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-base font-semibold tracking-tight text-sky-300">
                {weather?.precipitationMm !== undefined ? weather.precipitationMm : "0"}
              </span>
              <span className="text-[10px] text-white/40 font-normal">mm/h</span>
            </div>
          </div>

          {/* Soil Moisture Saturation */}
          <div className="bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] rounded-xl px-3 py-2 flex flex-col justify-center min-w-[105px] transition-colors">
            <div className="flex items-center justify-between text-white/40">
              <span className="text-[10px] uppercase font-medium tracking-wider">Soil Sat</span>
              <Droplets className="w-3 h-3 text-amber-400"/>
            </div>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-base font-semibold tracking-tight text-amber-300">
                {weather?.soilMoisture ? weather.soilMoisture.toFixed(3) : "0.332"}
              </span>
              <span className="text-[10px] text-white/40 font-normal">m³/m³</span>
            </div>
          </div>

          {/* Wind & Humidity */}
          <div className="bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] rounded-xl px-3 py-2 flex flex-col justify-center min-w-[105px] transition-colors">
            <div className="flex items-center justify-between text-white/40">
              <span className="text-[10px] uppercase font-medium tracking-wider">Wind</span>
              <Wind className="w-3 h-3 text-emerald-400"/>
            </div>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-sm font-semibold tracking-tight text-white">
                {weather?.windSpeed ?? 6.7}
              </span>
              <span className="text-[10px] text-white/40">km/h</span>
              <span className="text-white/20 mx-0.5">•</span>
              <span className="text-xs font-medium text-white/80">
                {weather?.humidity ?? 61}%
              </span>
            </div>
          </div>

          {/* Lightning Probes (AccuWeather) */}
          <div className="bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] rounded-xl px-3 py-2 flex flex-col justify-center min-w-[95px] transition-colors col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-white/40">
              <span className="text-[10px] uppercase font-medium tracking-wider">Lightning</span>
              <Zap className="w-3 h-3 text-yellow-400"/>
            </div>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-base font-semibold tracking-tight text-white">
                {weather?.lightningCount ?? 0}
              </span>
              <span className="text-[10px] text-white/40 font-normal">/15m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorridorWeatherPanel;
