import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { IftarSpot } from "@/lib/supabase";

interface IftarMapProps {
  spots: IftarSpot[];
  flyTo: { lat: number; lng: number } | null;
  onMapClick: ((latlng: { lat: number; lng: number }) => void) | null;
}

const createIcon = (hasSpecial: boolean) => {
  const color = hasSpecial ? "#f97316" : "#16a34a";
  const pulse = hasSpecial
    ? `<div style="position:absolute;top:-6px;left:-6px;width:36px;height:36px;border-radius:50%;background:${color}33;animation:pulse-ring 2s ease-out infinite;"></div>`
    : "";

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;">
        ${pulse}
        <div style="width:24px;height:24px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);position:relative;z-index:1;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:12px;">${hasSpecial ? "🍛" : "🕌"}</span>
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -16],
  });
};

const IftarMap = ({ spots, flyTo, onMapClick }: IftarMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const style = document.createElement("style");
    style.textContent = `
      @keyframes pulse-ring {
        0% { transform: scale(0.8); opacity: 1; }
        100% { transform: scale(2); opacity: 0; }
      }
      .custom-marker { background: none !important; border: none !important; }
    `;
    document.head.appendChild(style);

    const map = L.map(containerRef.current, {
      zoomControl: false,
    }).setView([23.8103, 90.4125], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);

    L.control.zoom({ position: "topright" }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      style.remove();
    };
  }, []);

  // Handle map click for location picking
  const onMapClickRef = useRef(onMapClick);
  onMapClickRef.current = onMapClick;

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handler = (e: L.LeafletMouseEvent) => {
      if (onMapClickRef.current) {
        onMapClickRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    };

    if (onMapClick) {
      map.getContainer().style.cursor = "crosshair";
      map.on("click", handler);
    } else {
      map.getContainer().style.cursor = "";
    }

    return () => {
      map.off("click", handler);
      map.getContainer().style.cursor = "";
    };
  }, [onMapClick]);

  // Update markers
  useEffect(() => {
    if (!markersRef.current) return;
    markersRef.current.clearLayers();

    spots.forEach((spot) => {
      const marker = L.marker([spot.lat, spot.lng], {
        icon: createIcon(spot.has_special),
      });

      const popupContent = `
        <div style="min-width:180px;font-family:system-ui;">
          <h3 style="margin:0 0 4px;font-size:15px;font-weight:700;color:#16a34a;">${spot.mosque_name}</h3>
          <p style="margin:0 0 4px;font-size:13px;color:#666;">📍 ${spot.area}</p>
          ${spot.menu ? `<p style="margin:0 0 4px;font-size:13px;">🍽️ ${spot.menu}</p>` : ""}
          ${spot.has_special ? `<span style="display:inline-block;background:#f97316;color:white;font-size:11px;padding:2px 8px;border-radius:999px;font-weight:600;">🍛 ${spot.special_type || "স্পেশাল"}</span>` : ""}
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: "custom-popup",
        maxWidth: 250,
      });

      markersRef.current!.addLayer(marker);
    });
  }, [spots]);

  // Fly to location
  useEffect(() => {
    if (flyTo && mapRef.current) {
      mapRef.current.flyTo([flyTo.lat, flyTo.lng], 16, { duration: 1 });
    }
  }, [flyTo]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default IftarMap;
