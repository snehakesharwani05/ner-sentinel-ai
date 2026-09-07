import React from "react";
import { CloudRain, Droplets, Wind, Zap, Compass, Radio } from "lucide-react";
import { ComprehensiveWeather } from "../hooks/useCorridorWeather";

interface Props {
  hubName: string;
  stateName: string;
  weather: ComprehensiveWeather | null;
  loading?: boolean;
}

export const CorridorWeatherPanel: React.FC<Props> = ({
  hubName,
  stateName,
  weather,
  loading = false,
}) => {
  const threatBadgeStyle =
    weather?.threatLevel === "RED_ALERT"
      ? "text-rose-300 bg-rose-950/80 border-rose-700/60"
      : weather?.threatLevel === "ORANGE_WARNING"
      ? "text-amber-300 bg-amber-950/80 border-amber-700/60"
      : "text-emerald-300 bg-emerald-950/80 border-emerald-700/60";

  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", -system-ui, sans-serif',
      }}
      className="w-full bg-[#141b18]/95 backdrop-blur-xl border border-stone-800/90 rounded-2xl p-3.5 shadow-2xl text-stone-200 select-none transition-all"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-stone-800/80">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-[#1b2420] border border-stone-700/60 flex items-center justify-center shrink-0">
            <Compass className="w-3.5 h-3.5 text-amber-400"/>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-black tracking-wide text-white uppercase">
                {hubName}
              </span>
              <span className="text-[11px] text-stone-400 font-medium">
                ({stateName})
              </span>
            </div>
            <p className="text-[9px] text-stone-500 font-mono leading-none mt-0.5">
              Multi-Source Telemetry Feed
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${threatBadgeStyle}`}
          >
            {weather?.threatLevel?.replace("_", " ") || "YELLOW WATCH"}
          </span>
          {loading && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          )}
        </div>
      </div>

      {/* 4-Cell Telemetry Bento Grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* Cell 1: Temperature */}
        <div className="flex flex-col justify-between p-2.5 bg-[#1b2420]/90 rounded-xl border border-stone-700/40 hover:border-stone-600/60 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold tracking-wider text-stone-400 uppercase">
              Temperature
            </span>
            <Radio className="w-3 h-3 text-emerald-400 opacity-70"/>
          </div>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-xl font-mono font-black text-white">
              {weather?.temperature !== undefined ? Math.round(weather.temperature) : "31"}°C
            </span>
            <span className="text-[10px] text-stone-400 font-medium">ambient</span>
          </div>
        </div>

        {/* Cell 2: Rainfall */}
        <div className="flex flex-col justify-between p-2.5 bg-[#1b2420]/90 rounded-xl border border-stone-700/40 hover:border-sky-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold tracking-wider text-sky-400 uppercase">
              Rainfall
            </span>
            <CloudRain className="w-3.5 h-3.5 text-sky-400"/>
          </div>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-xl font-mono font-black text-sky-300">
              {weather?.precipitationMm !== undefined ? weather.precipitationMm : "0.1"}
            </span>
            <span className="text-[10px] text-stone-400 font-mono">mm/h</span>
          </div>
        </div>

        {/* Cell 3: Soil Saturation */}
        <div className="flex flex-col justify-between p-2.5 bg-[#1b2420]/90 rounded-xl border border-stone-700/40 hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold tracking-wider text-amber-400 uppercase">
              Soil Saturation
            </span>
            <Droplets className="w-3.5 h-3.5 text-amber-400"/>
          </div>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-base font-mono font-black text-amber-300">
              {weather?.soilMoisture ? weather.soilMoisture.toFixed(3) : "0.347"}
            </span>
            <span className="text-[10px] text-stone-400 font-mono">m³/m³</span>
          </div>
        </div>

        {/* Cell 4: Wind & Lightning */}
        <div className="flex flex-col justify-between p-2.5 bg-[#1b2420]/90 rounded-xl border border-stone-700/40 hover:border-stone-600/60 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold tracking-wider text-stone-400 uppercase">
              Wind • Probes
            </span>
            <Wind className="w-3.5 h-3.5 text-emerald-400"/>
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px] font-mono">
            <span className="text-white font-bold">
              {weather?.windSpeed ?? 8.7} km/h
            </span>
            <span className="flex items-center gap-0.5 text-yellow-300 font-bold">
              <Zap className="w-3 h-3"/>
              {weather?.lightningCount ?? 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorridorWeatherPanel;
