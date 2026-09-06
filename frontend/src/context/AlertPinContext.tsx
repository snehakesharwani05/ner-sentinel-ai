import React, { createContext, useContext, useState, useEffect } from "react";

export interface AlertPinConfig {
  phone: string;
  hubName: string;
  hubCoords: { lat: number; lng: number };
  radiusKm: number;
  alertsEnabled: boolean;
}

const DEFAULT_CONFIG: AlertPinConfig = {
  phone: "",
  hubName: "Sonapur Tunnel / East Jaintia (NH6)",
  hubCoords: { lat: 25.1100, lng: 92.3600 },
  radiusKm: 75,
  alertsEnabled: true,
};

interface AlertPinContextType {
  config: AlertPinConfig;
  updateConfig: (updated: Partial<AlertPinConfig>) => void;
}

const AlertPinContext = createContext<AlertPinContextType | null>(null);

export const AlertPinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<AlertPinConfig>(() => {
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

  const updateConfig = (updated: Partial<AlertPinConfig>) => {
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
