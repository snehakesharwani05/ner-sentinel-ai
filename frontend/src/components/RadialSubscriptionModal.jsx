import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Radio, X, Sliders, MapPin, Phone, ShieldCheck, CheckCircle2, ChevronDown, Compass } from "lucide-react";
import { NER_STATES } from "../constants/nerLocations";
import { useAlertPin } from "../context/AlertPinContext";
import { useAuth } from "../context/AuthContext";

export const RadialSubscriptionModal = ({
  isOpen,
  onClose,
  config: propConfig,
  userPhone: propUserPhone,
  userName: propUserName,
  onSaveConfig: propOnSave,
}) => {
  let contextConfig = null;
  let contextUpdate = null;
  let authUser = null;

  try {
    const ctx = useAlertPin();
    contextConfig = ctx?.config;
    contextUpdate = ctx?.updateConfig;
  } catch (e) {}

  try {
    const auth = useAuth();
    authUser = auth?.user;
  } catch (e) {}

  const activeConfig = propConfig || contextConfig || {
    phone: "",
    stateId: "AS",
    stateName: "Assam",
    hubName: "Guwahati",
    hubCoords: { lat: 26.1445, lng: 91.7362 },
    radiusKm: 75,
    alertsEnabled: true,
  };

  const [mounted, setMounted] = useState(false);
  const rawPhone = propUserPhone || authUser?.phone || authUser?.mobile || activeConfig.phone || "+91 9876543210";
  const activeNumber = rawPhone.startsWith("+91") ? rawPhone : (rawPhone.startsWith("+") ? rawPhone : `+91 ${rawPhone.replace(/\D/g, "").slice(-10)}`);
  const activeUserName = propUserName || authUser?.name || "Active Operator";

  // Cascading Selection States
  const [selectedStateId, setSelectedStateId] = useState(activeConfig.stateId || "AS");
  const [selectedHubName, setSelectedHubName] = useState(activeConfig.hubName || "Guwahati");
  const [radius, setRadius] = useState(activeConfig.radiusKm || 75);
  const [alertsEnabled, setAlertsEnabled] = useState(activeConfig.alertsEnabled ?? true);

  // Active state data and its respective hubs
  const currentState = useMemo(() => {
    return NER_STATES.find((s) => s.id === selectedStateId) || NER_STATES[0];
  }, [selectedStateId]);

  // When state changes, reset selected hub to the first city of that state
  const handleStateChange = (newStateId) => {
    setSelectedStateId(newStateId);
    const targetState = NER_STATES.find((s) => s.id === newStateId);
    if (targetState && targetState.cities.length > 0) {
      setSelectedHubName(targetState.cities[0].name);
    }
  };

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setSelectedStateId(activeConfig.stateId || "AS");
      setSelectedHubName(activeConfig.hubName || "Guwahati");
      setRadius(activeConfig.radiusKm || 75);
      setAlertsEnabled(activeConfig.alertsEnabled ?? true);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, activeConfig.stateId, activeConfig.hubName, activeConfig.radiusKm, activeConfig.alertsEnabled]);

  if (!isOpen || !mounted || typeof document === "undefined") return null;

  const handleSave = (e) => {
    e.preventDefault();
    const cityData = currentState.cities.find((c) => c.name === selectedHubName) || currentState.cities[0];

    const newConfig = {
      phone: activeNumber,
      stateId: currentState.id,
      stateName: currentState.name,
      hubName: cityData.name,
      hubCoords: { lat: cityData.lat, lng: cityData.lng },
      radiusKm: radius,
      alertsEnabled,
    };

    if (propOnSave) {
      propOnSave(newConfig);
    } else if (contextUpdate) {
      contextUpdate(newConfig);
    }

    onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(12px)",
        padding: "1rem",
        overflowY: "auto",
      }}
    >
      <div
        className="relative w-full max-w-lg bg-[#141b18] border border-stone-700/90 rounded-2xl shadow-2xl p-6 text-stone-200 my-auto animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "32rem",
          backgroundColor: "#141b18",
          border: "1px solid rgba(120, 113, 108, 0.9)",
          borderRadius: "1rem",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
          padding: "1.5rem",
          color: "#e7e5e4",
          margin: "auto",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between pb-4 border-b border-stone-800"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: "1rem",
            borderBottom: "1px solid #292524",
          }}
        >
          <div
            className="flex items-center space-x-2.5"
            style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}
          >
            <div
              className="p-2 rounded-lg bg-emerald-950/70 border border-emerald-800/60"
              style={{
                padding: "0.5rem",
                borderRadius: "0.5rem",
                backgroundColor: "rgba(6, 78, 59, 0.7)",
                border: "1px solid rgba(6, 95, 70, 0.6)",
              }}
            >
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" size={16} color="#34d399" />
            </div>
            <div>
              <h3
                className="font-bold text-white text-base tracking-wide"
                style={{ fontWeight: 700, color: "#ffffff", fontSize: "1rem", margin: 0 }}
              >
                Radial Proximity SMS Alerts
              </h3>
              <p
                className="text-[11px] text-stone-400"
                style={{ fontSize: "0.6875rem", color: "#a8a29e", margin: "0.15rem 0 0 0" }}
              >
                Automated Twilio gateway for verified corridor closures
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800/60 transition-colors"
            style={{
              padding: "0.375rem",
              borderRadius: "0.5rem",
              background: "transparent",
              border: "none",
              color: "#a8a29e",
              cursor: "pointer",
            }}
          >
            <X className="w-5 h-5" size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSave}
          className="mt-5 space-y-4 text-xs"
          style={{
            marginTop: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            fontSize: "0.75rem",
          }}
        >
          {/* Read-Only Registered Mobile Card */}
          <div>
            <div
              className="flex items-center justify-between font-bold text-stone-300 mb-1.5"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontWeight: 700,
                color: "#d6d3d1",
                marginBottom: "0.375rem",
              }}
            >
              <span className="flex items-center gap-1.5" style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <Phone className="w-3.5 h-3.5 text-emerald-400" size={14} color="#34d399" />
                Recipient Mobile
              </span>
              <span
                className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/50 px-2 py-0.5 rounded-full font-medium"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  fontSize: "0.625rem",
                  color: "#34d399",
                  backgroundColor: "rgba(6, 78, 59, 0.8)",
                  border: "1px solid rgba(6, 95, 70, 0.5)",
                  padding: "0.125rem 0.5rem",
                  borderRadius: "9999px",
                  fontWeight: 500,
                }}
              >
                <CheckCircle2 className="w-3 h-3" size={12} color="#34d399" /> Registered Account
              </span>
            </div>
            <div
              className="flex items-center justify-between bg-[#0d1210] border border-stone-800 rounded-xl px-3.5 py-2.5"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#0d1210",
                border: "1px solid #292524",
                borderRadius: "0.75rem",
                padding: "0.625rem 0.875rem",
              }}
            >
              <div className="flex items-center space-x-2.5" style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <div
                  className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
                  style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#34d399" }}
                />
                <span
                  className="font-mono font-bold text-sm text-white tracking-wider"
                  style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.875rem", color: "#ffffff", letterSpacing: "0.05em" }}
                >
                  {activeNumber}
                </span>
                <span className="text-stone-500 font-medium" style={{ color: "#78716c", fontWeight: 500 }}>
                  ({activeUserName})
                </span>
              </div>
              <span className="text-[10px] text-stone-400 font-medium" style={{ fontSize: "0.625rem", color: "#a8a29e", fontWeight: 500 }}>
                Alert messages sent here
              </span>
            </div>
          </div>

          {/* Cascading Location Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
            {/* Step 1: Select State */}
            <div>
              <label className="flex items-center gap-1.5 font-bold text-stone-300 mb-1.5" style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontWeight: 700, color: "#d6d3d1", marginBottom: "0.375rem" }}>
                <Compass className="w-3.5 h-3.5 text-amber-400" size={14} color="#fbbf24" />
                Operational State
              </label>
              <div className="relative" style={{ position: "relative" }}>
                <select
                  value={selectedStateId}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full bg-[#0d1210] border border-stone-700/80 rounded-xl px-3 py-2.5 text-white text-xs font-medium focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none"
                  style={{
                    width: "100%",
                    backgroundColor: "#0d1210",
                    border: "1px solid rgba(120, 113, 108, 0.8)",
                    borderRadius: "0.75rem",
                    padding: "0.625rem 0.75rem",
                    paddingRight: "2rem",
                    color: "#ffffff",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    outline: "none",
                    cursor: "pointer",
                    boxSizing: "border-box",
                  }}
                >
                  {NER_STATES.map((state) => (
                    <option key={state.id} value={state.id} className="bg-[#151c18] text-white" style={{ backgroundColor: "#151c18", color: "#ffffff" }}>
                      {state.name} ({state.cities.length} Hubs)
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-3 pointer-events-none" size={14} color="#a8a29e" style={{ position: "absolute", right: "0.75rem", top: "0.75rem", pointerEvents: "none" }} />
              </div>
            </div>

            {/* Step 2: Select City / Hub within that State */}
            <div>
              <label className="flex items-center gap-1.5 font-bold text-stone-300 mb-1.5" style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontWeight: 700, color: "#d6d3d1", marginBottom: "0.375rem" }}>
                <MapPin className="w-3.5 h-3.5 text-rose-500" size={14} color="#f43f5e" />
                Transit City / Hub
              </label>
              <div className="relative" style={{ position: "relative" }}>
                <select
                  value={selectedHubName}
                  onChange={(e) => setSelectedHubName(e.target.value)}
                  className="w-full bg-[#0d1210] border border-stone-700/80 rounded-xl px-3 py-2.5 text-white text-xs font-medium focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none"
                  style={{
                    width: "100%",
                    backgroundColor: "#0d1210",
                    border: "1px solid rgba(120, 113, 108, 0.8)",
                    borderRadius: "0.75rem",
                    padding: "0.625rem 0.75rem",
                    paddingRight: "2rem",
                    color: "#ffffff",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    outline: "none",
                    cursor: "pointer",
                    boxSizing: "border-box",
                  }}
                >
                  {currentState.cities.map((city) => (
                    <option key={city.name} value={city.name} className="bg-[#151c18] text-white" style={{ backgroundColor: "#151c18", color: "#ffffff" }}>
                      {city.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-3 pointer-events-none" size={14} color="#a8a29e" style={{ position: "absolute", right: "0.75rem", top: "0.75rem", pointerEvents: "none" }} />
              </div>
            </div>
          </div>

          {/* Proximity Slider */}
          <div
            className="bg-[#0d1210] border border-stone-800/80 rounded-xl p-3.5 space-y-2"
            style={{
              backgroundColor: "#0d1210",
              border: "1px solid rgba(41, 37, 36, 0.8)",
              borderRadius: "0.75rem",
              padding: "0.875rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <div
              className="flex items-center justify-between"
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              <span
                className="flex items-center gap-1.5 font-bold text-stone-300"
                style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontWeight: 700, color: "#d6d3d1" }}
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-400" size={14} color="#34d399" />
                Proximity Radius
              </span>
              <span
                className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-md"
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#34d399",
                  backgroundColor: "rgba(6, 78, 59, 0.6)",
                  border: "1px solid rgba(6, 95, 70, 0.4)",
                  padding: "0.125rem 0.5rem",
                  borderRadius: "0.375rem",
                }}
              >
                {radius} km
              </span>
            </div>
            <input
              type="range"
              min={25}
              max={150}
              step={25}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              style={{ width: "100%", height: "0.375rem", accentColor: "#10b981", cursor: "pointer" }}
            />
            <div
              className="flex justify-between text-[10px] text-stone-500 font-mono"
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.625rem",
                color: "#78716c",
                fontFamily: "monospace",
              }}
            >
              <span>25 km</span>
              <span>75 km</span>
              <span>150 km</span>
            </div>
          </div>

          {/* Automated Dispatch Toggle */}
          <label
            className="flex items-center justify-between p-3 bg-[#0d1210] border border-stone-800/80 rounded-xl cursor-pointer hover:border-stone-700 transition-colors"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.75rem",
              backgroundColor: "#0d1210",
              border: "1px solid rgba(41, 37, 36, 0.8)",
              borderRadius: "0.75rem",
              cursor: "pointer",
            }}
          >
            <div
              className="flex items-center space-x-2.5"
              style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" size={16} color="#34d399" />
              <div>
                <p className="font-bold text-white" style={{ fontWeight: 700, color: "#ffffff", margin: 0 }}>
                  Automated SMS Dispatch
                </p>
                <p
                  className="text-[10px] text-stone-400"
                  style={{ fontSize: "0.625rem", color: "#a8a29e", margin: "0.1rem 0 0 0" }}
                >
                  Trigger exclusively for CRITICAL_BLOCKED incidents
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={alertsEnabled}
              onChange={(e) => setAlertsEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-stone-700 bg-stone-900 accent-emerald-500 cursor-pointer"
              style={{ width: "1rem", height: "1rem", accentColor: "#10b981", cursor: "pointer" }}
            />
          </label>

          {/* Form Actions */}
          <div
            className="flex items-center justify-end space-x-2.5 pt-3 border-t border-stone-800"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "0.625rem",
              paddingTop: "0.75rem",
              borderTop: "1px solid #292524",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-700/80 text-stone-300 font-semibold hover:bg-stone-800/80 transition-colors"
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.75rem",
                border: "1px solid rgba(120, 113, 108, 0.8)",
                background: "transparent",
                color: "#d6d3d1",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-950/50 transition-all"
              style={{
                padding: "0.5rem 1.25rem",
                borderRadius: "0.75rem",
                backgroundColor: "#059669",
                border: "none",
                color: "#ffffff",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 10px 15px -3px rgba(6, 78, 59, 0.5)",
              }}
            >
              Save & Activate
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default RadialSubscriptionModal;
