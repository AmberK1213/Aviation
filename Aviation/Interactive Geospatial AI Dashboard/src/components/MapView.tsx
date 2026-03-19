import { useEffect, useRef, useState } from 'react';
import { MapPin, Circle } from 'lucide-react';
import { NestingSite, FilterState } from '../App';
import { nestingSites as mockSites, getPriorityColor } from '../data/mockData';
import { useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { NestingSite, FilterState, Detection } from "../types";
import { getPriorityColor } from "../data/mockData";

interface MapViewProps {
  filters: FilterState;
  selectedSite: NestingSite | null;
  onSiteSelect: (site: NestingSite | null) => void;
  sites?: NestingSite[];
}

export function MapView({
  filters,
  selectedSite,
  onSiteSelect,
  sites,
  detections,
}: MapViewProps) {
  const filteredSites = sites.filter((site) => {
    if (filters.species.length > 0 && !filters.species.includes(site.species))
      return false;
    if (filters.habitat.length > 0 && !filters.habitat.includes(site.habitat))
      return false;
    if (
      filters.priority.length > 0 &&
      !filters.priority.includes(site.priority)
    )
      return false;
    if (site.abundance < filters.minAbundance) return false;
    return true;
  });

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <MapContainer
        center={[29.5, -91]}
        zoom={8}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {filteredSites.map((site) => {
          const isSelected = selectedSite?.id === site.id;
          const radius = Math.max(6, Math.min(site.abundance / 20, 20));
          const color = getPriorityColor(site.priority);

          return (
            <CircleMarker
              key={site.id}
              center={[site.lat, site.lng]}
              radius={isSelected ? radius * 1.3 : radius}
              pathOptions={{
                color: "white",
                weight: 2,
                fillColor: color,
                fillOpacity: isSelected ? 1 : 0.85,
              }}
              eventHandlers={{
                click: () => onSiteSelect(site),
              }}
            >
              <Tooltip
                direction="right"
                offset={[10, 0]}
                opacity={1}
                permanent={false}
              >
                <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                  {site.species}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#4B5563",
                    marginTop: "4px",
                  }}
                >
                  <div>Abundance: {site.abundance} individuals</div>
                  <div>Habitat: {site.habitat}</div>
                  <div>Confidence: {(site.confidence * 100).toFixed(0)}%</div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Legend — sits above the map via z-index */}
      <div
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          background: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          padding: "16px",
          zIndex: 1000,
          minWidth: "180px",
        }}
      >
        <div
          style={{ fontWeight: 600, fontSize: "14px", marginBottom: "12px" }}
        >
          Conservation Priority
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            fontSize: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                backgroundColor: "#EF4444",
                flexShrink: 0,
              }}
            />
            <span>High Priority</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                backgroundColor: "#F59E0B",
                flexShrink: 0,
              }}
            />
            <span>Medium Priority</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                backgroundColor: "#22C55E",
                flexShrink: 0,
              }}
            />
            <span>Low Priority</span>
          </div>
        </div>
        <div
          style={{
            marginTop: "12px",
            paddingTop: "12px",
            borderTop: "1px solid #E5E7EB",
            fontSize: "12px",
            color: "#6B7280",
          }}
        >
          Showing {filteredSites.length} of {sites.length} nesting sites
        </div>
      </div>
    </div>
  );
}
