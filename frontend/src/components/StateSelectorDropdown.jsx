import React, { useState, useRef, useEffect } from "react";
import { MapPin, Layers, ChevronDown, Check, Compass } from "lucide-react";
import { NER_STATES, ALL_NER_REGION, TOTAL_NER_HUBS_COUNT } from "../constants/nerLocations.js";

export const StateSelectorDropdown = ({ activeZone = "ALL", onSelectZone }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAll = !activeZone || activeZone === "ALL";
  const currentState = isAll
    ? ALL_NER_REGION
    : (NER_STATES.find(s => s.id === activeZone) || NER_STATES[0]);

  const hubCount = isAll ? TOTAL_NER_HUBS_COUNT : currentState.cities.length;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef} style={{ position: "relative", zIndex: 60 }}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-[#30483B]/40 bg-[#EDE8DC] hover:bg-[#E3DDCF] text-[#20231F] font-bold text-xs shadow-sm transition-all focus:outline-none"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "5px 12px",
          borderRadius: "10px",
          border: "1.5px solid #30483B",
          backgroundColor: "#EDE8DC",
          color: "#20231F",
          fontWeight: 800,
          fontSize: "0.78rem",
          cursor: "pointer",
          boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
          transition: "all 0.15s ease"
        }}
      >
        <div 
          className="flex items-center justify-center w-5 h-5 rounded-md bg-[#30483B]/15 text-[#A9573F]"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "20px",
            height: "20px",
            borderRadius: "6px",
            backgroundColor: "rgba(48, 72, 59, 0.12)",
            color: "#A9573F"
          }}
        >
          {isAll ? <Layers size={13} color="#A9573F" /> : <MapPin size={13} color="#A9573F" />}
        </div>

        <div className="flex flex-col text-left" style={{ display: "flex", flexDirection: "column", textAlign: "left", lineHeight: 1.1 }}>
          <span className="font-extrabold text-[#30483B] tracking-tight" style={{ fontWeight: 800, color: "#30483B" }}>
            {isAll ? "NER Overview" : currentState.name}
          </span>
          <span className="text-[10px] text-[#20231F]/70 font-semibold" style={{ fontSize: "0.65rem", color: "#4A5048", fontWeight: 600 }}>
            {hubCount} Tracked Hubs
          </span>
        </div>

        <ChevronDown 
          size={14} 
          className={`ml-1 text-[#30483B] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          style={{ 
            marginLeft: "4px", 
            color: "#30483B",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease"
          }} 
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-72 origin-top-right rounded-2xl bg-[#19221e]/95 backdrop-blur-xl border border-stone-700/80 shadow-2xl overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-150"
          style={{
            position: "absolute",
            right: 0,
            marginTop: "0.5rem",
            width: "18.5rem",
            transformOrigin: "top right",
            borderRadius: "1rem",
            backgroundColor: "rgba(25, 34, 30, 0.96)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(80, 94, 88, 0.6)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
            overflow: "hidden",
            padding: "0.4rem",
            zIndex: 100
          }}
        >
          {/* Header Label */}
          <div 
            className="px-3 py-1.5 border-b border-stone-800 text-[10px] uppercase font-extrabold tracking-wider text-stone-400 flex items-center justify-between"
            style={{
              padding: "0.4rem 0.75rem",
              borderBottom: "1px solid rgba(68, 79, 74, 0.5)",
              fontSize: "0.68rem",
              textTransform: "uppercase",
              fontWeight: 800,
              letterSpacing: "0.05em",
              color: "#9CA3AF",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <span className="flex items-center gap-1.5" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <Compass size={12} color="#86EFAC" /> Northeast Operating Zones
            </span>
            <span className="text-emerald-400" style={{ color: "#4ADE80" }}>{TOTAL_NER_HUBS_COUNT} Total Hubs</span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-stone-800/40" style={{ maxHeight: "20rem", overflowY: "auto" }}>
            {/* 1. All NER Region Item */}
            <button
              type="button"
              onClick={() => {
                onSelectZone("ALL");
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-colors ${
                isAll ? "bg-emerald-950/60 text-emerald-300" : "text-stone-200 hover:bg-stone-800/60"
              }`}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.55rem 0.75rem",
                fontSize: "0.78rem",
                fontWeight: 600,
                border: "none",
                borderRadius: "0.5rem",
                margin: "0.15rem 0",
                backgroundColor: isAll ? "rgba(6, 78, 59, 0.45)" : "transparent",
                color: isAll ? "#86EFAC" : "#E5E7EB",
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.15s ease"
              }}
            >
              <div className="flex items-center space-x-2.5" style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <Layers size={14} className={isAll ? "text-emerald-400" : "text-stone-400"} color={isAll ? "#4ADE80" : "#9CA3AF"} />
                <span className="font-bold">All 8 States (NER Overview)</span>
              </div>
              <div className="flex items-center space-x-2" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span 
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-stone-800 text-stone-300"
                  style={{
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    backgroundColor: "#2D3748",
                    color: "#CBD5E0"
                  }}
                >
                  127 Hubs
                </span>
                {isAll && <Check size={14} color="#4ADE80" />}
              </div>
            </button>

            {/* 2. Individual States */}
            {NER_STATES.map((st) => {
              const isSelected = activeZone === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    onSelectZone(st.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-colors ${
                    isSelected ? "bg-emerald-950/60 text-emerald-300" : "text-stone-200 hover:bg-stone-800/60"
                  }`}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.55rem 0.75rem",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    border: "none",
                    borderRadius: "0.5rem",
                    margin: "0.15rem 0",
                    backgroundColor: isSelected ? "rgba(6, 78, 59, 0.45)" : "transparent",
                    color: isSelected ? "#86EFAC" : "#E5E7EB",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.15s ease"
                  }}
                >
                  <div className="flex items-center space-x-2.5" style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <MapPin size={14} className={isSelected ? "text-emerald-400" : "text-stone-400"} color={isSelected ? "#4ADE80" : "#9CA3AF"} />
                    <span className="font-bold">{st.name}</span>
                  </div>
                  <div className="flex items-center space-x-2" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span 
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-stone-800 text-stone-300"
                      style={{
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        backgroundColor: isSelected ? "#14532D" : "#2D3748",
                        color: isSelected ? "#86EFAC" : "#CBD5E0"
                      }}
                    >
                      {st.cities.length} Hubs
                    </span>
                    {isSelected && <Check size={14} color="#4ADE80" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StateSelectorDropdown;
