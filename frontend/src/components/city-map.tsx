import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import { Link } from "react-router-dom";
import { categories, categoryColors, statuses } from "../utils/labels";
import type { Incident, Vehicle } from "../types";
import { Button } from "./ui/button";
function PointPicker({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (event) => onPick(event.latlng.lat, event.latlng.lng),
  });
  return null;
}
export function CityMap({
  incidents = [],
  vehicles = [],
  large = false,
  picker,
  point,
}: {
  incidents?: Incident[];
  vehicles?: Vehicle[];
  large?: boolean;
  picker?: (lat: number, lng: number) => void;
  point?: [number, number];
}) {
  const [filter, setFilter] = useState("ALL");
  const filteredIncidents = incidents.filter(
    (item) => filter === "ALL" || item.type === filter,
  );
  const showVehicles = filter === "ALL" || filter === "TRANSPORT";
  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      {!picker && (
        <div className="flex flex-wrap gap-2 border-b p-3">
          <Button
            size="sm"
            variant={filter === "ALL" ? "default" : "ghost"}
            onClick={() => setFilter("ALL")}
          >
            Все
          </Button>
          {Object.entries(categories).map(([key, label]) => (
            <Button
              key={key}
              size="sm"
              variant={filter === key ? "default" : "ghost"}
              onClick={() => setFilter(key)}
            >
              <span
                className="size-2 rounded-full"
                style={{
                  background: categoryColors[key as keyof typeof categories],
                }}
              />
              {label}
            </Button>
          ))}
          <Button
            size="sm"
            variant={filter === "TRANSPORT" ? "default" : "ghost"}
            onClick={() => setFilter("TRANSPORT")}
          >
            Транспорт
          </Button>
        </div>
      )}
      <MapContainer
        center={[55.752, 37.621]}
        zoom={13}
        scrollWheelZoom={large || !!picker}
        style={{
          height: picker ? 230 : large ? "min(65vh, 720px)" : 350,
          minHeight: 230,
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {filteredIncidents.map((item) => (
          <CircleMarker
            key={item.id}
            center={[item.latitude, item.longitude]}
            radius={8}
            pathOptions={{
              color: "white",
              weight: 2,
              fillColor: categoryColors[item.type],
              fillOpacity: 1,
            }}
          >
            <Popup>
              <div className="space-y-2">
                <strong>{item.title}</strong>
                <div>
                  {categories[item.type]} · {statuses[item.status]}
                </div>
                <div>{item.address}</div>
                <p>{item.description}</p>
                <Link className="text-primary" to="/incidents">
                  К списку инцидентов →
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        ))}
        {showVehicles &&
          vehicles.map((item) => (
            <CircleMarker
              key={item.id}
              center={[item.latitude, item.longitude]}
              radius={6}
              pathOptions={{
                color: "#105a4e",
                weight: 2,
                fillColor: "#67c9ad",
                fillOpacity: 1,
              }}
            >
              <Popup>
                <strong>Транспорт № {item.number}</strong>
                <p>
                  Маршрут {item.route.name}
                  <br />
                  {item.speed} км/ч ·{" "}
                  {item.status === "ACTIVE"
                    ? "На маршруте"
                    : statuses[item.status]}
                </p>
              </Popup>
            </CircleMarker>
          ))}
        {picker && <PointPicker onPick={picker} />}{" "}
        {point && (
          <CircleMarker
            center={point}
            radius={9}
            pathOptions={{ color: "#167466", fillOpacity: 0.8 }}
          />
        )}
      </MapContainer>
      {!picker && (
        <div className="flex flex-wrap justify-between gap-2 border-t px-4 py-3 text-xs text-muted-foreground">
          <span>
            {filteredIncidents.length} инцидентов ·{" "}
            {showVehicles ? vehicles.length : 0} транспортных средств
          </span>
          <span>Москва · Данные учебного прототипа</span>
        </div>
      )}
    </div>
  );
}
