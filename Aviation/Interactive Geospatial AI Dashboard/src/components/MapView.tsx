import { useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { NestingSite, FilterState } from '../App';

interface MapViewProps {
  filters: FilterState;
  selectedSite: NestingSite | null;
  onSiteSelect: (site: NestingSite | null) => void;
  sites?: NestingSite[];
}

const PRIORITY_COLOR: Record<string, string> = {
  high:   '#EF4444',
  medium: '#F59E0B',
  low:    '#22C55E',
};

function formatSiteName(raw: string): string {
  return raw.replace(/([A-Z])/g, ' $1').trim();
}

interface SiteCluster {
  lat: number;
  lng: number;
  siteName: string;
  priority: string;
  habitat: string;
  lastSurveyed: string;
  erosionRisk?: string;
  totalAbundance: number;
  species: { name: string; abundance: number; confidence: number }[];
  representativeId: string;
}

export function MapView({ filters, onSiteSelect, sites = [] }: MapViewProps) {
  const [selected, setSelected] = useState<SiteCluster | null>(null);

  const filtered = useMemo(() => sites.filter(site => {
    if (filters.species.length > 0 && !filters.species.includes(site.species)) return false;
    if (filters.habitat.length > 0 && !filters.habitat.includes(site.habitat)) return false;
    if (filters.priority.length > 0 && !filters.priority.includes(site.priority)) return false;
    if (site.abundance < filters.minAbundance) return false;
    return true;
  }), [sites, filters]);

  // One cluster per unique lat/lng — aggregate all species
  const clusters = useMemo<SiteCluster[]>(() => {
    const map = new Map<string, SiteCluster>();

    for (const site of filtered) {
      const key = `${site.lat.toFixed(4)},${site.lng.toFixed(4)}`;
      if (!map.has(key)) {
        map.set(key, {
          lat: site.lat,
          lng: site.lng,
          siteName: site.siteName ?? '',
          priority: site.priority,
          habitat: site.habitat,
          lastSurveyed: site.lastSurveyed,
          erosionRisk: site.erosionRisk,
          totalAbundance: 0,
          species: [],
          representativeId: site.id,
        });
      }
      const c = map.get(key)!;
      c.totalAbundance += site.abundance;
      // Escalate priority
      if (site.priority === 'high') c.priority = 'high';
      else if (site.priority === 'medium' && c.priority !== 'high') c.priority = 'medium';
      // Add species if not already present
      if (!c.species.find(s => s.name === site.species)) {
        c.species.push({ name: site.species, abundance: site.abundance, confidence: site.confidence });
      }
    }

    // Sort species by abundance within each cluster
    for (const c of map.values()) {
      c.species.sort((a, b) => b.abundance - a.abundance);
    }

    return [...map.values()];
  }, [filtered]);

  const handleClick = (c: SiteCluster) => {
    if (selected?.lat === c.lat && selected?.lng === c.lng) {
      setSelected(null);
      onSiteSelect(null);
    } else {
      setSelected(c);
      // Pass representative NestingSite for compatibility
      const rep = filtered.find(s => s.id === c.representativeId) ?? null;
      onSiteSelect(rep);
    }
  };

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <MapContainer
        center={[29.3, -90.4]}
        zoom={8}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {clusters.map((c, i) => {
          const isSelected = selected?.lat === c.lat && selected?.lng === c.lng;
          const radius = Math.max(8, Math.min(c.totalAbundance / 300, 26));
          const color = PRIORITY_COLOR[c.priority] ?? '#6B7280';

          return (
            <CircleMarker
              key={i}
              center={[c.lat, c.lng]}
              radius={isSelected ? radius * 1.35 : radius}
              pathOptions={{
                color: 'white',
                weight: isSelected ? 3 : 2,
                fillColor: color,
                fillOpacity: isSelected ? 1 : 0.85,
              }}
              eventHandlers={{ click: () => handleClick(c) }}
            >
              <Tooltip direction="right" offset={[12, 0]} opacity={1}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 2 }}>
                  {formatSiteName(c.siteName) || c.habitat}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#9CA3AF', marginBottom: 6 }}>{c.habitat}</div>
                <div style={{ fontSize: '0.75rem', color: '#4B5563', lineHeight: 1.7 }}>
                  <div style={{ marginBottom: 4 }}>
                    <strong>{c.totalAbundance.toLocaleString()}</strong> birds total
                  </div>
                  {c.species.map(s => (
                    <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: color, flexShrink: 0, opacity: 0.7,
                      }} />
                      <span>{s.name}</span>
                      <span style={{ color: '#9CA3AF', marginLeft: 'auto', paddingLeft: 8 }}>
                        {s.abundance.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div style={{
        position: 'absolute', top: 16, right: 16, zIndex: 1000,
        background: 'white', borderRadius: 12,
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        padding: '14px 16px', minWidth: 180,
        border: '1px solid rgba(45,106,79,0.1)',
      }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: '#111827' }}>Conservation Priority</div>
        {([
          ['#EF4444', 'High Priority'],
          ['#F59E0B', 'Medium Priority'],
          ['#22C55E', 'Low Priority'],
        ] as [string, string][]).map(([color, label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7, fontSize: 13 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
            <span style={{ color: '#374151' }}>{label}</span>
          </div>
        ))}
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #F3F4F6', fontSize: 11, color: '#9CA3AF' }}>
          {clusters.length} site{clusters.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Selected site panel — shows all species */}
      {selected && (
        <div style={{
          position: 'absolute', bottom: 16, left: 16, zIndex: 1000,
          background: 'white', borderRadius: 12,
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          padding: '16px', width: 280,
          border: '1px solid rgba(45,106,79,0.1)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>
                {formatSiteName(selected.siteName) || selected.habitat}
              </div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                {selected.habitat} · {selected.lastSurveyed} · {selected.totalAbundance.toLocaleString()} birds
              </div>
            </div>
            <button
              onClick={() => { setSelected(null); onSiteSelect(null); }}
              style={{ color: '#9CA3AF', fontSize: 18, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 8 }}
            >&times;</button>
          </div>

          {/* Priority + erosion row */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
              background: selected.priority === 'high' ? '#FEF2F2' : selected.priority === 'medium' ? '#FFFBEB' : '#F0FDF9',
              color: selected.priority === 'high' ? '#EF4444' : selected.priority === 'medium' ? '#F59E0B' : '#22C55E',
            }}>
              {selected.priority.toUpperCase()} RISK
            </span>
            {selected.erosionRisk && (
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                background: '#F9FAFB', color: '#6B7280',
              }}>
                {selected.erosionRisk} erosion
              </span>
            )}
          </div>

          {/* Species list */}
          <div style={{ fontSize: 12, color: '#374151' }}>
            <div style={{ fontWeight: 600, fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              Bird Populations
            </div>
            {selected.species.map((s, i) => {
              const pct = selected.totalAbundance > 0
                ? Math.round((s.abundance / selected.totalAbundance) * 100)
                : 0;
              return (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ color: '#111827', fontWeight: 500 }}>{s.name}</span>
                    <span style={{ color: '#6B7280', fontSize: 11 }}>{s.abundance.toLocaleString()} · {pct}%</span>
                  </div>
                  <div style={{ height: 5, background: '#F3F4F6', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 10,
                      background: PRIORITY_COLOR[selected.priority] ?? '#6B7280',
                      width: `${pct}%`,
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
