import React from "react";
import { CloudRain, Droplets, Wind, Zap, Navigation2, Activity } from "lucide-react";

export const CorridorWeatherPanel = ({
  hubName,
  stateName,
  weather,
  loading = false,
}) => {
  const sfFont = {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", -system-ui, sans-serif',
  };

  const threatConfig = {
    RED_ALERT: {
      label: "Red Alert",
      badge: "bg-rose-500/15 text-rose-300 border-rose-500/30",
      glow: "from-rose-500/10 via-transparent to-transparent",
    },
    ORANGE_WARNING: {
      label: "Orange Warning",
      badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      glow: "from-amber-500/10 via-transparent to-transparent",
    },
    YELLOW_WATCH: {
      label: "Yellow Watch",
      badge: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
      glow: "from-yellow-500/10 via-transparent to-transparent",
    },
    GREEN_CLEAR: {
      label: "Nominal",
      badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      glow: "from-emerald-500/10 via-transparent to-transparent",
    },
  };

  const activeThreat =
    threatConfig[weather?.threatLevel] ||
    threatConfig.YELLOW_WATCH;

  return (
    <div
      style={sfFont}
      className="relative w-full overflow-hidden rounded-2xl bg-[#0f1512]/95 border border-white/[0.08] p-3 shadow-2xl backdrop-blur-2xl text-white select-none transition-all duration-300"
    >
      {/* Dynamic ambient background glow */}
      <div
        className={`pointer-events-none absolute inset-0 bg-radial-gradient ${activeThreat.glow} opacity-60 transition-opacity duration-700`}
      />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Left: Location & Meteorological Threat Status */}
        <div className="flex items-center space-x-3">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.1] shadow-inner">
            <Navigation2 className="h-4 w-4 text-emerald-400 fill-emerald-400/20"/>
            {loading && (
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[13px] font-semibold tracking-tight text-white/95">
                {hubName}
              </span>
              <span className="text-[11px] font-medium tracking-tight text-white/40">
                {stateName}
              </span>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase font-mono ${activeThreat.badge}`}
              >
                {activeThreat.label}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-white/45 tracking-tight mt-0.5">
              <span className="flex items-center gap-1 font-medium text-white/60">
                <Activity className="w-3 h-3 text-emerald-400"/> Multi-Source Stream
              </span>
              <span className="text-white/20">•</span>
              <span>Open-Meteo</span>
              <span className="text-white/20">•</span>
              <span>Weatherstack</span>
              <span className="text-white/20">•</span>
              <span>AccuWeather</span>
            </div>
          </div>
        </div>

        {/* Right: Apple Segmented Micro-Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full lg:w-auto">
          {/* Temperature */}
          <div className="group flex flex-col justify-center min-w-[95px] rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] px-3 py-2 transition-colors">
            <span className="text-[9px] font-semibold tracking-wider uppercase text-white/40">
              Temperature
            </span>
            <div className="flex items-baseline space-x-0.5 mt-0.5">
              <span className="text-base font-semibold tracking-tight tabular-nums text-white">
                {weather?.temperature ? Math.round(weather.temperature) : "33"}
              </span>
              <span className="text-xs font-normal text-white/50">°C</span>
              <span className="text-[9px] font-normal text-white/30 ml-1">ambient</span>
            </div>
          </div>

          {/* Precipitation (Rainfall) */}
          <div className="group flex flex-col justify-center min-w-[95px] rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] px-3 py-2 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-semibold tracking-wider uppercase text-white/40">
                Rainfall
              </span>
              <CloudRain className="w-3 h-3 text-sky-400"/>
            </div>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-base font-semibold tracking-tight tabular-nums text-sky-300">
                {weather?.precipitationMm !== undefined ? weather.precipitationMm : "0.0"}
              </span>
              <span className="text-[10px] text-white/40 font-normal">mm/h</span>
            </div>
          </div>

          {/* Soil Saturation */}
          <div className="group flex flex-col justify-center min-w-[105px] rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] px-3 py-2 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-semibold tracking-wider uppercase text-white/40">
                Soil Saturation
              </span>
              <Droplets className="w-3 h-3 text-amber-400"/>
            </div>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-base font-semibold tracking-tight tabular-nums text-amber-300">
                {weather?.soilMoisture ? weather.soilMoisture.toFixed(3) : "0.332"}
              </span>
              <span className="text-[10px] text-white/40 font-normal">m³/m³</span>
            </div>
          </div>

          {/* Wind & Relative Humidity */}
          <div className="group flex flex-col justify-center min-w-[105px] rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] px-3 py-2 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-semibold tracking-wider uppercase text-white/40">
                Wind / Humid
              </span>
              <Wind className="w-3 h-3 text-emerald-400"/>
            </div>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-sm font-semibold tracking-tight tabular-nums text-white">
                {weather?.windSpeed ?? 6.7}
              </span>
              <span className="text-[9px] text-white/40">km/h</span>
              <span className="text-white/20 mx-0.5">•</span>
              <span className="text-xs font-medium tabular-nums text-white/70">
                {weather?.humidity ?? 61}%
              </span>
            </div>
          </div>

          {/* Lightning Activity */}
          <div className="group flex flex-col justify-center min-w-[95px] rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] px-3 py-2 transition-colors col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-semibold tracking-wider uppercase text-white/40">
                Lightning
              </span>
              <Zap className="w-3 h-3 text-yellow-400"/>
            </div>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-base font-semibold tracking-tight tabular-nums text-white">
                {weather?.lightningCount ?? 0}
              </span>
              <span className="text-[10px] text-white/40 font-normal">strikes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorridorWeatherPanel;
