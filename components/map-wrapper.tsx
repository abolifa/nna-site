"use client";

import React from "react";
import dynamic from "next/dynamic";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);

type LeafletContainer = HTMLDivElement & {
  _leaflet_id: number | null;
};

export default function MapWrapper({
  children,
}: {
  children?: React.ReactNode;
}) {
  const mapId = React.useId();

  React.useEffect(() => {
    import("leaflet").then((L) => {
      const container = L.DomUtil.get(mapId);
      if (container && (container as LeafletContainer)._leaflet_id) {
        (container as LeafletContainer)._leaflet_id = null;
      }

      const iconUrl =
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
      const iconRetinaUrl =
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
      const shadowUrl =
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

      const defaultIcon = new L.Icon({
        iconUrl,
        iconRetinaUrl,
        shadowUrl,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      L.Marker.prototype.options.icon = defaultIcon;
    });
  }, [mapId]);

  return (
    <MapContainer
      id={mapId}
      center={[27.3, 17.0]}
      zoom={5}
      className="h-full w-full z-10"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {children}
    </MapContainer>
  );
}
