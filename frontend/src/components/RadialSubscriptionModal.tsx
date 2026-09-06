import React, { useState } from "react";
import { Radio, X, MapPin, Sliders } from "lucide-react";
import { useAlertPin } from "../context/AlertPinContext";

export const STRATEGIC_HUBS = [
  { name: "Sonapur Tunnel / East Jaintia (NH6)", lat: 25.1100, lng: 92.3600 },
  { name: "Guwahati Freight Corridor (Assam)", lat: 26.1445, lng: 91.7362 },
  { name: "Silchar Transit Junction (Assam)", lat: 24.8333, lng: 92.7789 },
  { name: "Shillong Bypass Route (Meghalaya)", lat: 25.5788, lng: 91.8933 },
  { name: "Sela Pass High-Altitude Corridor (Arunachal)", lat: 27.5861, lng: 91.8594 },
  { name: "Dimapur Logistics Hub (Nagaland)", lat: 25.9090, lng: 93.7266 },
];

export const RadialSubscriptionModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { config, updateConfig } = useAlertPin();
  const [phone, setPhone] = useState(config.phone);
  const [hubName, setHubName] = useState(config.hubName);
  const [radius, setRadius] = useState(config.radiusKm);
  const [enabled, setEnabled] = useState(config.alertsEnabled);

  if (!isOpen) return null;

  const handleSave = () => {
    const hub = STRATEGIC_HUBS.find((h) => h.name === hubName) || STRATEGIC_HUBS[0];
    updateConfig({
      phone,
      hubName: hub.name,
      hubCoords: { lat: hub.lat, lng: hub.lng },
      radiusKm: radius,
      alertsEnabled: enabled,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="bg-[#161e1a] border border-stone-700/80 rounded-2xl w-full max-w-md p-5 text-stone-200 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse"/>
            <h3 className="font-bold text-white text-sm">Radial Proximity SMS Alerts</h3>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4"/>
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-stone-300 block mb-1">Target Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full bg-[#0e1411] border border-stone-700 rounded-lg px-3 py-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-stone-300 block mb-1">Pinned Operational Corridor</label>
            <div className="relative">
              <select
                value={hubName}
                onChange={(e) => setHubName(e.target.value)}
                className="w-full bg-[#0e1411] border border-stone-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 focus:outline-none appearance-none cursor-pointer"
              >
                {STRATEGIC_HUBS.map((hub) => (
                  <option key={hub.name} value={hub.name}>
                    {hub.name}
                  </option>
                ))}
              </select>
              <MapPin className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-2.5 pointer-events-none"/>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-stone-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-400"/> Watch Radius
              </label>
              <span className="font-mono text-emerald-400 font-bold">{radius} km</span>
            </div>
            <input
              type="range"
              min={25}
              max={150}
              step={25}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-stone-800 rounded-lg h-1.5 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-stone-800">
            <span className="text-stone-300 font-semibold">Enable Automated Dispatch</span>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-stone-700 text-stone-300 hover:bg-stone-800 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
          >
            Save & Activate
          </button>
        </div>
      </div>
    </div>
  );
};

export default RadialSubscriptionModal;
