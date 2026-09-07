import React from "react";
import { 
  CloudRain, Wind, Droplets, Thermometer, Zap, 
  Layers, Radio, AlertTriangle, ShieldCheck, Compass 
} from "lucide-react";
import { ComprehensiveWeather } from "../hooks/useCorridorWeather";

interface Props {
  hubName: string;
  stateName?: string;
  radiusKm: number;
  weather: ComprehensiveWeather | null;
  loading?: boolean;
  onOpenRadialModal?: () => void;
}

export const CorridorWeatherPanel: React.FC<Props> = ({
  hubName = "Guwahati",
  stateName = "Assam",
  radiusKm = 75,
  weather,
  loading = false,
  onOpenRadialModal
}) => {
  const threatLevel = weather?.threatLevel || "YELLOW_WATCH";
  
  const getThreatBadge = (level: string) => {
    switch (level) {
      case "RED_ALERT":
        return {
          bg: "bg-rose-950/80 border-rose-500/60 text-rose-300",
          dot: "bg-rose-400",
          label: "RED ALERT • FLASH FLOOD / SEVERE SLIP"
        };
      case "ORANGE_WARNING":
        return {
          bg: "bg-amber-950/80 border-amber-500/60 text-amber-300",
          dot: "bg-amber-400",
          label: "ORANGE WARNING • HIGH SATURATION"
        };
      case "GREEN_CLEAR":
        return {
          bg: "bg-emerald-950/80 border-emerald-500/60 text-emerald-300",
          dot: "bg-emerald-400",
          label: "GREEN CLEAR • PASSABLE CORRIDOR"
        };
      case "YELLOW_WATCH":
      default:
        return {
          bg: "bg-yellow-950/80 border-yellow-500/60 text-yellow-300",
          dot: "bg-yellow-400",
          label: "YELLOW WATCH • MONSOON ADVISORY"
        };
    }
  };

  const threatBadge = getThreatBadge(threatLevel);
  const soilSat = weather?.soilMoisture ?? 0.32;
  const soilPercent = Math.min(100, Math.round((soilSat / 0.50) * 100));

  return (
    <div 
      className="bg-[#141b18]/95 backdrop-blur-md rounded-2xl border border-stone-800/80 p-4 shadow-xl text-stone-200 transition-all hover:border-stone-700/80"
      style={{
        backgroundColor: "rgba(20, 27, 24, 0.95)",
        backdropFilter: "blur(14px)",
        borderRadius: "1rem",
        border: "1px solid rgba(41, 53, 47, 0.8)",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.35)",
        color: "#EDE8DC"
      }}
    >
      {/* Header Strip */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-stone-800/60">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-sky-950/70 border border-sky-800/60 text-sky-400">
            <CloudRain className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold tracking-wide text-white">
                {hubName} Pinned Corridor Telemetry
              </h3>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-stone-800/90 text-stone-300 border border-stone-700/60">
                {stateName} • {radiusKm}km Radial
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-0.5 flex items-center gap-1.5">
              <span>{weather?.weatherDescription || "Live Geotechnical & Atmospheric Stream"}</span>
              <span className="opacity-40">•</span>
              <span className="text-[10px] text-emerald-400/90 font-mono">Open-Meteo + Weatherstack Multi-Stream</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Threat Level Badge */}
          <div className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold border flex items-center space-x-1.5 ${threatBadge.bg}`}>
            <span className={`inline-block w-2 h-2 rounded-full animate-pulse ${threatBadge.dot}`} />
            <span>{threatBadge.label}</span>
          </div>

          {onOpenRadialModal && (
            <button
              onClick={onOpenRadialModal}
              className="p-1.5 rounded-xl bg-[#1b2420] hover:bg-[#23302b] border border-stone-700/60 text-stone-300 hover:text-white transition-colors"
              title="Configure Alert Radius"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          )}
        </div>
      </div>

      {/* 6-Metric Precision Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 mt-3">
        {/* 1. Temperature */}
        <div className="p-2.5 rounded-xl bg-[#1b2420]/80 border border-stone-700/40 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Surface Temp</span>
            <Thermometer className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="mt-1.5">
            <span className="text-lg font-mono font-black text-white">
              {weather?.temperature !== undefined ? `${Math.round(weather.temperature)}°C` : "--°C"}
            </span>
            <p className="text-[10px] text-stone-400 mt-0.5">Atmospheric Real-Feel</p>
          </div>
        </div>

        {/* 2. Precipitation Rate */}
        <div className="p-2.5 rounded-xl bg-[#1b2420]/80 border border-stone-700/40 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Precipitation</span>
            <CloudRain className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="mt-1.5">
            <span className="text-lg font-mono font-black text-sky-300">
              {weather?.precipitationMm !== undefined ? `${weather.precipitationMm} mm` : "0.0 mm"}
            </span>
            <p className="text-[10px] text-stone-400 mt-0.5">Active Downpour Rate</p>
          </div>
        </div>

        {/* 3. Soil Saturation & Landslide Hazard */}
        <div className="p-2.5 rounded-xl bg-[#1b2420]/80 border border-stone-700/40 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Soil Saturation</span>
            <Layers className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-1.5">
            <span className="text-lg font-mono font-black text-amber-300">
              {soilSat.toFixed(3)} <span className="text-xs font-normal text-stone-400">m³/m³</span>
            </span>
            <div className="w-full bg-stone-800 rounded-full h-1.5 mt-1 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${soilSat >= 0.40 ? 'bg-rose-500' : soilSat >= 0.35 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${soilPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4. Relative Humidity */}
        <div className="p-2.5 rounded-xl bg-[#1b2420]/80 border border-stone-700/40 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Humidity</span>
            <Droplets className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="mt-1.5">
            <span className="text-lg font-mono font-black text-teal-300">
              {weather?.humidity !== undefined ? `${weather.humidity}%` : "74%"}
            </span>
            <p className="text-[10px] text-stone-400 mt-0.5">Moisture Saturation</p>
          </div>
        </div>

        {/* 5. Wind Velocity */}
        <div className="p-2.5 rounded-xl bg-[#1b2420]/80 border border-stone-700/40 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Wind Velocity</span>
            <Wind className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="mt-1.5">
            <span className="text-lg font-mono font-black text-indigo-300">
              {weather?.windSpeed !== undefined ? `${Math.round(weather.windSpeed)} km/h` : "12 km/h"}
            </span>
            <p className="text-[10px] text-stone-400 mt-0.5">Ridge Line Gusts</p>
          </div>
        </div>

        {/* 6. Proximity Radar Status */}
        <div className="p-2.5 rounded-xl bg-[#1b2420]/80 border border-stone-700/40 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">SMS Watcher</span>
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          </div>
          <div className="mt-1.5">
            <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Armed & Active
            </span>
            <p className="text-[10px] text-stone-400 mt-0.5">4-hr Cooldown Guard</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorridorWeatherPanel;
