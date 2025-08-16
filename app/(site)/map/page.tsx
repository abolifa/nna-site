"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { isOpenNow, todayRanges } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, LocateFixed, Loader } from "lucide-react";
import { useMap } from "react-leaflet";
import MapWrapper from "@/components/map-wrapper";
import api from "@/lib/api";
import { Center } from "@/lib/types";
import ErrorComponent from "@/components/error-component";

const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), {
  ssr: false,
});
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), {
  ssr: false,
});

function FitBounds({ points }: { points: Array<[number, number]> }) {
  const map = useMap();
  React.useEffect(() => {
    if (!points.length) return;
    import("leaflet").then((L) => {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40] });
    });
  }, [points, map]);
  return null;
}

export default function CentersMap() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["centers"],
    queryFn: async () => (await api.get("/centers/guest")).data as Center[],
  });

  const [city, setCity] = React.useState("all");
  const [q, setQ] = React.useState("");
  const [userPos, setUserPos] = React.useState<[number, number] | null>(null);

  const cities = React.useMemo(() => {
    const set = new Set(
      (data ?? []).map((c) => c.city).filter(Boolean) as string[]
    );
    return ["all", ...Array.from(set)];
  }, [data]);

  const filtered = React.useMemo(() => {
    if (!data) return [];
    const term = q.trim().toLowerCase();
    return data.filter((c) => {
      if (city !== "all" && (c.city ?? "") !== city) return false;
      if (!term) return true;
      const hay = [c.name, c.address, c.street, c.city, c.phone, c.alt_phone]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(term);
    });
  }, [data, city, q]);

  const points = React.useMemo(
    () =>
      filtered
        .filter(
          (c) =>
            typeof c.latitude === "number" && typeof c.longitude === "number"
        )
        .map((c) => [c.latitude!, c.longitude!] as [number, number]),
    [filtered]
  );

  if (isLoading)
    return (
      <div className="w-full grid gap-3 md:grid-cols-[320px_1fr]">
        <div className="w-full h-[500px] border rounded-lg flex items-center justify-center">
          <Loader className="animate-spin" />
        </div>
        <div className="w-full h-[500px] border rounded-lg flex items-center justify-center">
          <Loader className="animate-spin" />
        </div>
      </div>
    );

  if (isError) return <ErrorComponent error={error} keyParam={"centers"} />;

  return (
    <div className="w-full grid gap-3 md:grid-cols-[320px_1fr]">
      {/* Filters */}
      <aside className="bg-card border rounded-lg p-3 space-y-3">
        <div className="font-semibold">البحث عن مركز</div>

        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث عن مكان"
          className="w-full"
        />

        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="المدينة" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>
                {c === "all" ? "جميع المدن" : c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="text-sm text-muted-foreground">
          عرض {filtered.length} من {data?.length ?? 0}
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            navigator.geolocation?.getCurrentPosition(
              (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
              () => setUserPos(null),
              { enableHighAccuracy: true, timeout: 5000 }
            );
          }}
        >
          <LocateFixed className="w-4 h-4 mr-2" /> استخدام موقعي
        </Button>
      </aside>

      {/* Map */}
      <div className="h-[70vh] rounded-lg overflow-hidden border">
        <MapWrapper>
          {userPos && (
            <Marker position={userPos}>
              <Popup>موقعي الحالي</Popup>
            </Marker>
          )}

          {filtered.map((c) => {
            const lat = Number(c.latitude);
            const lng = Number(c.longitude);
            if (isNaN(lat) || isNaN(lng)) return null;

            return (
              <Marker key={c.id} position={[lat, lng]}>
                <Popup minWidth={260}>
                  <div className="space-y-2">
                    <div className="font-semibold flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      {c.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {(c.address || c.street) ?? "—"}{" "}
                      {c.city ? `• ${c.city}` : ""}
                    </div>
                    <div className="text-sm">
                      📞 {c.phone}
                      {c.alt_phone ? `, ${c.alt_phone}` : ""}
                    </div>
                    <div className="flex items-center gap-2">
                      {isOpenNow((c as Center).schedules) ? (
                        <Badge>مفتوح الآن</Badge>
                      ) : (
                        <Badge variant="secondary">مغلق</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {todayRanges((c as Center).schedules).join(" • ") ||
                          "لا توجد ساعات عمل اليوم"}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          <FitBounds points={[...points, ...(userPos ? [userPos] : [])]} />
        </MapWrapper>
      </div>
    </div>
  );
}
