import { useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CoffeeShop } from "@/data/coffeeShops";
import { ShopPreviewCard } from "./ShopPreviewCard";
import type { UserLocation } from "@/hooks/useUserLocation";

const DEFAULT_CENTER: [number, number] = [51.515, -0.09];

function createPinIcon(active: boolean) {
  const color = active ? "#FF3008" : "#737373";
  const size = active ? 38 : 32;
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size + 4],
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      border:2.5px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.25);
      display:flex;align-items:center;justify-content:center;
      transition:all 0.2s ease;
    "><span style="transform:rotate(45deg);font-size:${active ? 16 : 14}px;">☕</span></div>`,
  });
}

/** Recenter map when user location changes */
function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14, { animate: true });
  }, [center[0], center[1]]);
  return null;
}

interface CoffeeMapProps {
  filteredShops: CoffeeShop[];
  selectedShop: string | null;
  onSelectShop: (id: string | null) => void;
  userLocation: UserLocation | null;
}

export function CoffeeMap({ filteredShops, selectedShop, onSelectShop, userLocation }: CoffeeMapProps) {
  const defaultIcon = useMemo(() => createPinIcon(false), []);
  const activeIcon = useMemo(() => createPinIcon(true), []);

  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : DEFAULT_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={14}
      className="h-full w-full"
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
      />

      {/* Recenter when location updates */}
      {userLocation && <MapRecenter center={[userLocation.lat, userLocation.lng]} />}

      {/* User location blue dot */}
      {userLocation && (
        <CircleMarker
          center={[userLocation.lat, userLocation.lng]}
          radius={8}
          pathOptions={{
            fillColor: "hsl(217, 91%, 60%)",
            fillOpacity: 1,
            color: "white",
            weight: 3,
          }}
        >
          <Popup>
            <div className="text-xs font-medium p-1">📍 You are here</div>
          </Popup>
        </CircleMarker>
      )}

      {filteredShops.map((shop) => (
        <Marker
          key={shop.id}
          position={[shop.lat, shop.lng]}
          icon={selectedShop === shop.id ? activeIcon : defaultIcon}
          eventHandlers={{
            click: () => onSelectShop(shop.id),
          }}
        >
          <Popup>
            <ShopPreviewCard shop={shop} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
