import React, { createContext, useContext, useState, useEffect } from "react";

const DEFAULT_CONFIG = {
  phone: "",
  hubName: "Sonapur Tunnel / East Jaintia (NH6)",
  hubCoords: { lat: 25.1100, lng: 92.3600 },
  radiusKm: 75,
  alertsEnabled: true,
};

const AlertPinContext = createContext(null);

export const AlertPinProvider = ({ children }) => {
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem("purvasetu_pinned_subscription");
      return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    } catch (e) {
      return DEFAULT_CONFIG;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("purvasetu_pinned_subscription", JSON.stringify(config));
    } catch (e) {}
  }, [config]);

  const updateConfig = (updated) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  return (
    <AlertPinContext.Provider value={{ config, updateConfig }}>
      {children}
    </AlertPinContext.Provider>
  );
};

export const useAlertPin = () => {
  const ctx = useContext(AlertPinContext);
  if (!ctx) throw new Error("useAlertPin must be used within AlertPinProvider");
  return ctx;
};

export default AlertPinContext;
