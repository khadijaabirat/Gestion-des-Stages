'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const defaultCenter: [number, number] = [31.7917, -7.0926]; // Morocco

function LocationMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (p: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker 
      position={position} 
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          setPosition(e.target.getLatLng());
        }
      }}
    />
  );
}

export default function LocationPickerMap({ 
  initialLat, 
  initialLng, 
  onChange 
}: { 
  initialLat?: number | string | null, 
  initialLng?: number | string | null, 
  onChange: (lat: number, lng: number) => void 
}) {
  const [position, setPosition] = useState<L.LatLng | null>(
    (initialLat && initialLng) ? new L.LatLng(Number(initialLat), Number(initialLng)) : null
  );

  useEffect(() => {
    if (position) {
      onChange(position.lat, position.lng);
    }
  }, [position]);

  return (
    <div className="h-[250px] w-full rounded-xl overflow-hidden border border-outline-variant/50 relative z-10 group cursor-crosshair">
      <MapContainer 
        center={position || defaultCenter} 
        zoom={position ? 13 : 5} 
        className="h-full w-full"
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
      {!position && (
        <div className="absolute top-4 left-0 right-0 z-[1000] flex justify-center pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md text-sm font-bold text-slate-700 pointer-events-auto border border-slate-200">
            👆 Cliquez sur la carte pour placer le repère exact
          </div>
        </div>
      )}
    </div>
  );
}
