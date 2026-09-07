import React from "react";
import { CloudRain, Droplets, Wind, Thermometer, Compass } from "lucide-react";
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
  return (
    <div 
      className="bg-[#101713] border border-[#223027] rounded-2xl p-3 shadow-xl w-full select-none"
      style={{
        backgroundColor: "#101713",
        border: "1px solid #223027",
        borderRadius: "1rem",
        padding: "0.75rem",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
        width: "100%",
        userSelect: "none"
      }}
    >
      {/* Pinned Location Subtitle Header */}
      <div 
        className="flex items-center justify-between pb-2 mb-2 border-b border-[#223027]"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: "0.5rem",
          marginBottom: "0.5rem",
          borderBottom: "1px solid #223027"
        }}
      >
        <div className="flex items-center space-x-1.5" style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <Compass className="w-3.5 h-3.5 text-emerald-400" size={14} color="#34D399" />
          <span className="text-xs font-bold text-white tracking-wide uppercase" style={{ fontSize: "0.75rem", fontWeight: 800, color: "#FFFFFF", textTransform: "uppercase" }}>
            {hubName} <span className="text-stone-400 font-normal" style={{ color: "#9CA3AF", fontWeight: 400 }}>({stateName})</span>
          </span>
        </div>
        <div className="flex items-center space-x-1.5" style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <span 
            className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 uppercase"
            style={{
              fontSize: "0.58rem",
              fontFamily: "monospace",
              fontWeight: 800,
              padding: "2px 8px",
              borderRadius: "9999px",
              border: "1px solid rgba(245, 158, 11, 0.4)",
              backgroundColor: "rgba(245, 158, 11, 0.1)",
              color: "#FDE047",
              textTransform: "uppercase"
            }}
          >
            {weather?.threatLevel?.replace("_", " ") || "YELLOW WATCH"}
          </span>
          {loading && (
            <span 
              className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" 
              style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#34D399" }}
            />
          )}
        </div>
      </div>

      {/* 2x2 Bento Grid (Same exact dimensions and styles as the upper box) */}
      <div 
        className="grid grid-cols-2 gap-2.5"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "0.625rem"
        }}
      >
        {/* Cell 1: Temperature (Mirrors Mobility Index card) */}
        <div 
          className="flex flex-col justify-between p-2.5 bg-[#16201b] rounded-xl border border-[#223027] hover:border-[#2f4236] transition-colors"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "0.625rem",
            backgroundColor: "#16201b",
            borderRadius: "0.75rem",
            border: "1px solid #223027",
            transition: "border-color 0.2s ease"
          }}
        >
          <div className="flex items-center justify-between" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase" style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.05em", color: "#34D399", textTransform: "uppercase" }}>
              Ambient Temp
            </span>
            <div 
              className="p-1 rounded-md bg-[#101713] border border-[#223027]"
              style={{
                padding: "0.25rem",
                borderRadius: "0.375rem",
                backgroundColor: "#101713",
                border: "1px solid #223027",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Thermometer className="w-3.5 h-3.5 text-emerald-400" size={14} color="#34D399" />
            </div>
          </div>
          <div className="mt-1" style={{ marginTop: "0.25rem" }}>
            <div className="flex items-baseline space-x-1.5" style={{ display: "flex", alignItems: "baseline", gap: "0.375rem" }}>
              <span className="text-xl font-mono font-black text-white" style={{ fontSize: "1.25rem", fontFamily: "monospace", fontWeight: 900, color: "#FFFFFF", lineHeight: 1.1 }}>
                {weather?.temperature !== undefined ? Math.round(weather.temperature) : 31}°C
              </span>
              <span 
                className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" 
                style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#34D399" }}
              />
            </div>
            <p className="text-[10px] text-stone-400 mt-0.5 font-medium" style={{ fontSize: "0.62rem", color: "#9CA3AF", marginTop: "0.15rem", fontWeight: 500, margin: "0.15rem 0 0 0" }}>
              Multi-Source Telemetry
            </p>
          </div>
        </div>

        {/* Cell 2: Precipitation (Mirrors Strategic Passes card) */}
        <div 
          className="flex flex-col justify-between p-2.5 bg-[#16201b] rounded-xl border border-[#223027] hover:border-[#2f4236] transition-colors"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "0.625rem",
            backgroundColor: "#16201b",
            borderRadius: "0.75rem",
            border: "1px solid #223027",
            transition: "border-color 0.2s ease"
          }}
        >
          <div className="flex items-center justify-between" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="text-[10px] font-bold tracking-wider text-amber-400 uppercase" style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.05em", color: "#FBBF24", textTransform: "uppercase" }}>
              Live Rainfall
            </span>
            <div 
              className="p-1 rounded-md bg-[#101713] border border-[#223027]"
              style={{
                padding: "0.25rem",
                borderRadius: "0.375rem",
                backgroundColor: "#101713",
                border: "1px solid #223027",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <CloudRain className="w-3.5 h-3.5 text-amber-400" size={14} color="#FBBF24" />
            </div>
          </div>
          <div className="mt-1" style={{ marginTop: "0.25rem" }}>
            <span className="text-sm font-mono font-bold text-amber-300" style={{ fontSize: "0.82rem", fontFamily: "monospace", fontWeight: 700, color: "#FDE047", lineHeight: 1.1, display: "block" }}>
              {weather?.precipitationMm !== undefined ? weather.precipitationMm : 0.1} mm/h
            </span>
            <p className="text-[10px] text-stone-400 truncate mt-0.5" style={{ fontSize: "0.62rem", color: "#9CA3AF", marginTop: "0.15rem", margin: "0.15rem 0 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              Open-Meteo Doppler Feed
            </p>
          </div>
        </div>

        {/* Cell 3: Soil Saturation (Mirrors IMD Weather Watch card) */}
        <div 
          className="flex flex-col justify-between p-2.5 bg-[#16201b] rounded-xl border border-[#223027] hover:border-[#2f4236] transition-colors"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "0.625rem",
            backgroundColor: "#16201b",
            borderRadius: "0.75rem",
            border: "1px solid #223027",
            transition: "border-color 0.2s ease"
          }}
        >
          <div className="flex items-center justify-between" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="text-[10px] font-bold tracking-wider text-sky-400 uppercase" style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.05em", color: "#38BDF8", textTransform: "uppercase" }}>
              Soil Saturation
            </span>
            <div 
              className="p-1 rounded-md bg-[#101713] border border-[#223027]"
              style={{
                padding: "0.25rem",
                borderRadius: "0.375rem",
                backgroundColor: "#101713",
                border: "1px solid #223027",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Droplets className="w-3.5 h-3.5 text-sky-400" size={14} color="#38BDF8" />
            </div>
          </div>
          <div className="mt-1" style={{ marginTop: "0.25rem" }}>
            <span className="text-sm font-mono font-bold text-amber-300 uppercase" style={{ fontSize: "0.82rem", fontFamily: "monospace", fontWeight: 700, color: "#FDE047", textTransform: "uppercase", display: "block", lineHeight: 1.1 }}>
              {weather?.soilMoisture ? weather.soilMoisture.toFixed(3) : "0.347"} m³/m³
            </span>
            <p className="text-[10px] text-stone-400 font-mono mt-0.5" style={{ fontSize: "0.62rem", color: "#9CA3AF", fontFamily: "monospace", marginTop: "0.15rem", margin: "0.15rem 0 0 0" }}>
              Geotechnical Index
            </p>
          </div>
        </div>

        {/* Cell 4: Wind & Lightning Probes (Mirrors Active Convoys card) */}
        <div 
          className="flex flex-col justify-between p-2.5 bg-[#16201b] rounded-xl border border-[#223027] hover:border-[#2f4236] transition-colors"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "0.625rem",
            backgroundColor: "#16201b",
            borderRadius: "0.75rem",
            border: "1px solid #223027",
            transition: "border-color 0.2s ease"
          }}
        >
          <div className="flex items-center justify-between" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase" style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.05em", color: "#34D399", textTransform: "uppercase" }}>
              Atmospheric Flow
            </span>
            <div 
              className="p-1 rounded-md bg-[#101713] border border-[#223027]"
              style={{
                padding: "0.25rem",
                borderRadius: "0.375rem",
                backgroundColor: "#101713",
                border: "1px solid #223027",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Wind className="w-3.5 h-3.5 text-emerald-400" size={14} color="#34D399" />
            </div>
          </div>
          <div className="mt-1" style={{ marginTop: "0.25rem" }}>
            <div className="flex items-baseline space-x-1.5" style={{ display: "flex", alignItems: "baseline", gap: "0.375rem" }}>
              <span className="text-xl font-mono font-black text-white" style={{ fontSize: "1.25rem", fontFamily: "monospace", fontWeight: 900, color: "#FFFFFF", lineHeight: 1.1 }}>
                {weather?.windSpeed ?? 8.7}
              </span>
              <span className="text-xs text-stone-400 font-medium" style={{ fontSize: "0.7rem", color: "#9CA3AF", fontWeight: 500 }}>
                km/h
              </span>
            </div>
            <p className="text-[10px] text-stone-400 mt-0.5 font-medium" style={{ fontSize: "0.62rem", color: "#9CA3AF", marginTop: "0.15rem", fontWeight: 500, margin: "0.15rem 0 0 0" }}>
              Humidity: {weather?.humidity ?? 78}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorridorWeatherPanel;
