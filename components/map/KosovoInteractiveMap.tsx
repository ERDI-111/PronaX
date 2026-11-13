'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Building2, 
  MapPin, 
  Navigation, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Home,
  Briefcase,
  Trees
} from 'lucide-react';

export interface MapPropertyItem {
  id: string;
  title: string;
  price: number;
  listing_type: 'shitje' | 'qira';
  property_type: string;
  municipality_name: string;
  settlement_name: string;
  lat: number;
  lng: number;
  area_m2: number;
  bedrooms?: number | null;
  cover_image: string;
  status: string;
  expires_at?: string;
}

interface KosovoInteractiveMapProps {
  properties: MapPropertyItem[];
  selectedProperty: MapPropertyItem | null;
  onSelectProperty: (property: MapPropertyItem) => void;
  targetMunicipalityCoords?: { lat: number; lng: number } | null;
}

// Center of Kosovo (near Komoran/Prishtinë)
const KOSOVO_CENTER: [number, number] = [42.6026, 20.9030];
const DEFAULT_ZOOM = 9;

// Kosovo bounding box (prevent panning completely away from Kosovo region)
const KOSOVO_BOUNDS = L.latLngBounds(
  L.latLng(41.8000, 19.8500),
  L.latLng(43.3500, 21.9000)
);

// Get category badge color scheme
function getCategoryColor(type: string): { bg: string; border: string; text: string; pinClass: string } {
  const normalized = (type || '').toLowerCase();
  if (normalized.includes('banes')) {
    return { bg: '#0B192C', border: '#10b981', text: '#ffffff', pinClass: 'cat-apartment' };
  }
  if (normalized.includes('shtëpi') || normalized.includes('shtepi') || normalized.includes('vil')) {
    return { bg: '#047857', border: '#34d399', text: '#ffffff', pinClass: 'cat-house' };
  }
  if (normalized.includes('truall') || normalized.includes('tokë') || normalized.includes('toke')) {
    return { bg: '#b45309', border: '#f59e0b', text: '#ffffff', pinClass: 'cat-land' };
  }
  if (normalized.includes('lokal') || normalized.includes('zyr') || normalized.includes('komercial')) {
    return { bg: '#6d28d9', border: '#a78bfa', text: '#ffffff', pinClass: 'cat-commercial' };
  }
  return { bg: '#1e293b', border: '#10b981', text: '#ffffff', pinClass: 'cat-default' };
}

export default function KosovoInteractiveMap({
  properties,
  selectedProperty,
  onSelectProperty,
  targetMunicipalityCoords,
}: KosovoInteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userLocationMarkerRef = useRef<L.Marker | null>(null);

  const [currentZoom, setCurrentZoom] = useState(DEFAULT_ZOOM);
  const [mapStyle, setMapStyle] = useState<'standard' | 'voyager'>('standard');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Initialize Map Instance
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: KOSOVO_CENTER,
      zoom: DEFAULT_ZOOM,
      minZoom: 8,
      maxZoom: 18,
      maxBounds: KOSOVO_BOUNDS,
      maxBoundsViscosity: 0.8,
      zoomControl: false, // Custom controls used instead
    });

    // Primary Geographic Tile Layer - OpenStreetMap (Kosovo cities, relief, roads)
    L.tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }
    ).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Invalidate size multiple times to ensure map tiles render properly across all screens
    const t1 = setTimeout(() => { map.invalidateSize(); }, 100);
    const t2 = setTimeout(() => { map.invalidateSize(); }, 300);
    const t3 = setTimeout(() => { map.invalidateSize(); }, 600);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    // Track zoom level for clustering calculation
    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch map tiles when mapStyle changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const url = mapStyle === 'voyager'
      ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const attribution = mapStyle === 'voyager'
      ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    L.tileLayer(url, {
      attribution,
      subdomains: mapStyle === 'voyager' ? 'abcd' : 'abc',
      maxZoom: 19,
    }).addTo(map);

    // Re-draw or ensure markers stay on top
    if (markersLayerRef.current && map) {
      markersLayerRef.current.addTo(map);
    }
  }, [mapStyle]);

  // Pan to target municipality if changed
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !targetMunicipalityCoords) return;

    map.flyTo([targetMunicipalityCoords.lat, targetMunicipalityCoords.lng], 12, {
      duration: 1.2,
    });
  }, [targetMunicipalityCoords]);

  // Pan to selected property if clicked from external list
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedProperty || !selectedProperty.lat || !selectedProperty.lng) return;

    map.flyTo([selectedProperty.lat, selectedProperty.lng], Math.max(map.getZoom(), 13), {
      duration: 1.0,
    });
  }, [selectedProperty]);

  // Cluster & Marker rendering algorithm
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    // Filter properties to only valid coordinates
    const validProps = properties.filter(
      (p) => typeof p.lat === 'number' && typeof p.lng === 'number' && !isNaN(p.lat) && !isNaN(p.lng)
    );

    if (validProps.length === 0) return;

    // Cluster calculation: group properties that are within 50px of each other
    interface Cluster {
      properties: MapPropertyItem[];
      centerLat: number;
      centerLng: number;
    }

    const clusters: Cluster[] = [];
    const CLUSTER_DISTANCE_PX = 48; // Cluster threshold in screen pixels

    validProps.forEach((prop) => {
      const point = map.latLngToLayerPoint([prop.lat, prop.lng]);
      let addedToCluster = false;

      for (const cluster of clusters) {
        const clusterPoint = map.latLngToLayerPoint([cluster.centerLat, cluster.centerLng]);
        const dist = point.distanceTo(clusterPoint);

        if (dist < CLUSTER_DISTANCE_PX) {
          cluster.properties.push(prop);
          // Recalculate cluster center as centroid
          const total = cluster.properties.length;
          cluster.centerLat = cluster.properties.reduce((s, p) => s + p.lat, 0) / total;
          cluster.centerLng = cluster.properties.reduce((s, p) => s + p.lng, 0) / total;
          addedToCluster = true;
          break;
        }
      }

      if (!addedToCluster) {
        clusters.push({
          properties: [prop],
          centerLat: prop.lat,
          centerLng: prop.lng,
        });
      }
    });

    // Render clusters and individual markers
    clusters.forEach((cluster) => {
      if (cluster.properties.length > 1) {
        // --- Multi-property Cluster Marker ---
        const count = cluster.properties.length;
        const prices = cluster.properties.map((p) => p.price);
        const minPrice = Math.min(...prices);

        const clusterIcon = L.divIcon({
          className: 'pronax-cluster-icon',
          html: `
            <div style="
              background: linear-gradient(135deg, #0B192C 0%, #1E3E62 100%);
              color: white;
              border: 3px solid #10b981;
              border-radius: 9999px;
              width: 52px;
              height: 52px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
              cursor: pointer;
              transition: transform 0.2s ease;
            ">
              <span style="font-size: 13px; font-weight: 900; line-height: 1; color: #34d399;">${count}</span>
              <span style="font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.9; margin-top: 2px;">prona</span>
            </div>
          `,
          iconSize: [52, 52],
          iconAnchor: [26, 26],
        });

        const marker = L.marker([cluster.centerLat, cluster.centerLng], { icon: clusterIcon });

        marker.on('click', () => {
          // Zoom in into cluster bounds
          const latLngs = cluster.properties.map((p) => L.latLng(p.lat, p.lng));
          const bounds = L.latLngBounds(latLngs);
          map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
        });

        marker.addTo(layer);
      } else {
        // --- Single Property Marker ---
        const prop = cluster.properties[0];
        const isSelected = selectedProperty?.id === prop.id;
        const colorScheme = getCategoryColor(prop.property_type);

        const formattedPrice = prop.price >= 1000
          ? `${(prop.price / 1000).toLocaleString('sq-AL', { maximumFractionDigits: 1 })}k €`
          : `${prop.price} €`;

        const markerHtml = `
          <div style="
            position: relative;
            cursor: pointer;
            transform: translate(-50%, -100%);
            display: inline-flex;
            flex-direction: column;
            align-items: center;
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.3));
          " class="marker-hover-wrap">
            <div style="
              background: ${isSelected ? '#10b981' : colorScheme.bg};
              color: ${isSelected ? '#0B192C' : colorScheme.text};
              border: 2px solid ${isSelected ? '#ffffff' : colorScheme.border};
              padding: 4px 8px;
              border-radius: 9999px;
              font-size: 11px;
              font-weight: 800;
              letter-spacing: -0.2px;
              white-space: nowrap;
              display: flex;
              align-items: center;
              gap: 4px;
              box-shadow: ${isSelected ? '0 0 0 4px rgba(16, 185, 129, 0.35)' : 'none'};
              transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
            ">
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${isSelected ? '#0B192C' : '#10b981'};"></span>
              <span>${formattedPrice}</span>
              ${prop.listing_type === 'qira' ? '<span style="font-size: 9px; font-weight: 600; opacity: 0.85;">/m</span>' : ''}
            </div>
            <div style="
              width: 0;
              height: 0;
              border-left: 6px solid transparent;
              border-right: 6px solid transparent;
              border-top: 6px solid ${isSelected ? '#10b981' : colorScheme.bg};
              margin-top: -1px;
            "></div>
          </div>
        `;

        const singleIcon = L.divIcon({
          className: 'pronax-single-icon',
          html: markerHtml,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });

        const marker = L.marker([prop.lat, prop.lng], { icon: singleIcon });

        marker.on('click', () => {
          onSelectProperty(prop);
        });

        marker.addTo(layer);
      }
    });
  }, [properties, selectedProperty, currentZoom, onSelectProperty]);

  // GPS User Location Handler
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGpsError('Pajisja juaj nuk e mbështet shërbimin GPS të vendndodhjes.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLoading(false);
        const { latitude, longitude } = position.coords;
        const map = mapInstanceRef.current;
        if (!map) return;

        // Verify if user is roughly inside/near Kosovo bounding box
        map.flyTo([latitude, longitude], 14, { duration: 1.5 });

        if (userLocationMarkerRef.current) {
          userLocationMarkerRef.current.setLatLng([latitude, longitude]);
        } else {
          const userIcon = L.divIcon({
            className: 'user-loc-icon',
            html: `
              <div style="
                width: 22px;
                height: 22px;
                border-radius: 50%;
                background: #2563eb;
                border: 3px solid white;
                box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.35);
                position: relative;
                animation: pulse 2s infinite;
              "></div>
            `,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          });
          userLocationMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon }).addTo(map);
        }
      },
      (error) => {
        setGpsLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGpsError('Keni refuzuar lejen e vendndodhjes në shfletues.');
            break;
          case error.POSITION_UNAVAILABLE:
            setGpsError('Vendndodhja GPS nuk është e disponueshme për momentin.');
            break;
          case error.TIMEOUT:
            setGpsError('Koha e kërkesës së vendndodhjes skadoi.');
            break;
          default:
            setGpsError('Ndodhi një gabim gjatë leximit të GPS.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  const handleResetKosovoView = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo(KOSOVO_CENTER, DEFAULT_ZOOM, { duration: 1.0 });
  };

  const handleZoomIn = () => {
    const map = mapInstanceRef.current;
    if (map) map.zoomIn();
  };

  const handleZoomOut = () => {
    const map = mapInstanceRef.current;
    if (map) map.zoomOut();
  };

  return (
    <div className="relative w-full h-full min-h-[500px]">
      {/* Real Map Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0 bg-slate-100" />

      {/* GPS Error Toast */}
      {gpsError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-rose-600 text-white text-xs px-4 py-2 rounded-xl shadow-xl flex items-center gap-2">
          <span>{gpsError}</span>
          <button onClick={() => setGpsError(null)} className="font-bold underline ml-1">Mbyll</button>
        </div>
      )}

      {/* Map Floating Controls Top Right */}
      <div className="absolute top-4 right-4 z-[900] flex flex-col gap-2">
        {/* Style toggle (Voyager / OSM) */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-1 shadow-lg border border-slate-200/80 flex items-center">
          <button
            onClick={() => setMapStyle('voyager')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
              mapStyle === 'voyager'
                ? 'bg-[#0B192C] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Harta e Pastër
          </button>
          <button
            onClick={() => setMapStyle('standard')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
              mapStyle === 'standard'
                ? 'bg-[#0B192C] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            OpenStreetMap
          </button>
        </div>

        {/* Legend Pill */}
        <div className="hidden sm:flex bg-white/95 backdrop-blur-md rounded-2xl px-3 py-2 shadow-lg border border-slate-200/80 items-center gap-3 text-[10px] font-bold text-slate-700">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0B192C] border border-emerald-500"></span>
            Banesë
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#047857] border border-emerald-400"></span>
            Shtëpi / Vilë
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#b45309] border border-amber-400"></span>
            Truall
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6d28d9] border border-purple-400"></span>
            Biznes
          </span>
        </div>
      </div>

      {/* Map Action Buttons Bottom Right */}
      <div className="absolute bottom-6 right-4 z-[900] flex flex-col gap-2">
        <button
          onClick={handleLocateMe}
          disabled={gpsLoading}
          className="w-10 h-10 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 flex items-center justify-center shadow-xl border border-slate-200 transition-transform active:scale-95 disabled:opacity-50"
          title="Lokacioni Im me GPS"
        >
          <Navigation className={`w-4 h-4 text-blue-600 ${gpsLoading ? 'animate-spin' : ''}`} />
        </button>

        <button
          onClick={handleResetKosovoView}
          className="w-10 h-10 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 flex items-center justify-center shadow-xl border border-slate-200 transition-transform active:scale-95"
          title="Kthe pamjen në Kosovë (38 komuna)"
        >
          <RotateCcw className="w-4 h-4 text-emerald-600" />
        </button>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 text-slate-800 border-b border-slate-100 transition-colors"
            title="Zmadho (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 text-slate-800 transition-colors"
            title="Zvogëlo (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Kosovo Status Pill Bottom Left */}
      <div className="absolute bottom-6 left-4 z-[900] bg-white/95 backdrop-blur-md rounded-2xl px-3.5 py-2 shadow-xl border border-slate-200 text-xs flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="font-bold text-[#0B192C]">Republika e Kosovës</span>
        <span className="text-slate-400">|</span>
        <span className="text-slate-600 font-semibold">{properties.length} prona në këtë pamje</span>
      </div>
    </div>
  );
}
