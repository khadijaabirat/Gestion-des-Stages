'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';
import { getAvatarUrl } from '@/lib/api';

// Fix Leaflet icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon (Mapbox-like style)
const customIcon = new L.DivIcon({
  className: 'custom-leaflet-marker',
  html: `<div style="background-color: #5644D0; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; transition: transform 0.2s;"><div style="background-color: white; width: 8px; height: 8px; border-radius: 50%;"></div></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const MOROCCAN_CITIES: Record<string, [number, number]> = {
  'Casablanca': [33.5731, -7.5898],
  'Rabat': [34.0209, -6.8416],
  'Marrakech': [31.6295, -7.9811],
  'Agadir': [30.4278, -9.5981],
  'Tanger': [35.7595, -5.8340],
  'Fes': [34.0331, -5.0003],
  'Fès': [34.0331, -5.0003],
  'Meknes': [33.8935, -5.5328],
  'Meknès': [33.8935, -5.5328],
  'Oujda': [34.6814, -1.9086],
  'Kenitra': [34.2541, -6.5890],
  'Kénitra': [34.2541, -6.5890],
  'Tetouan': [35.5785, -5.3684],
  'Tétouan': [35.5785, -5.3684],
  'Safi': [32.2994, -9.2372],
  'El Jadida': [33.2316, -8.5007],
};

function getCoordinates(localisation: string): [number, number] {
  if (!localisation) return [31.7917 + (Math.random() - 0.5) * 2, -7.0926 + (Math.random() - 0.5) * 2];
  
  const loc = localisation.toLowerCase();
  for (const [city, coords] of Object.entries(MOROCCAN_CITIES)) {
    if (loc.includes(city.toLowerCase())) {
      // Add a slight random offset so multiple offers in same city don't completely overlap
      const offsetLat = (Math.random() - 0.5) * 0.03;
      const offsetLng = (Math.random() - 0.5) * 0.03;
      return [coords[0] + offsetLat, coords[1] + offsetLng];
    }
  }
  // Default center of Morocco with more spread if city not found
  return [31.7917 + (Math.random() - 0.5) * 4, -7.0926 + (Math.random() - 0.5) * 4];
}

export default function OffersMap({ offers }: { offers: any[] }) {
  const [mounted, setMounted] = useState(false);
  const [coordsMap, setCoordsMap] = useState<Record<number, [number, number]>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const initialCoords: Record<number, [number, number]> = {};
    const toGeocode: any[] = [];

    offers.forEach(offer => {
      if (offer.latitude && offer.longitude) {
        initialCoords[offer.id] = [parseFloat(offer.latitude), parseFloat(offer.longitude)];
      } else {
        const loc = (offer.localisation || '').toLowerCase();
        let found = false;
        for (const [city, coords] of Object.entries(MOROCCAN_CITIES)) {
          if (loc.includes(city.toLowerCase())) {
            initialCoords[offer.id] = [coords[0] + (Math.random() - 0.5) * 0.03, coords[1] + (Math.random() - 0.5) * 0.03];
            found = true;
            break;
          }
        }
        if (!found) {
          toGeocode.push(offer);
          initialCoords[offer.id] = [31.7917 + (Math.random() - 0.5) * 4, -7.0926 + (Math.random() - 0.5) * 4];
        }
      }
    });

    setCoordsMap(initialCoords);

    toGeocode.forEach(async (offer) => {
      try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(offer.localisation)}&count=1&format=json`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const lat = data.results[0].latitude;
          const lng = data.results[0].longitude;
          setCoordsMap(prev => ({
            ...prev,
            [offer.id]: [lat + (Math.random() - 0.5) * 0.01, lng + (Math.random() - 0.5) * 0.01]
          }));
        }
      } catch (e) {
        // ignore
      }
    });
  }, [offers]);
  if (!mounted) return <div className="h-[600px] w-full bg-surface-variant/30 rounded-2xl animate-pulse"></div>;

  return (
    <div className="h-[600px] w-full rounded-2xl overflow-hidden shadow-xl border border-outline-variant/30 relative z-10 group">
      <MapContainer center={[31.7917, -7.0926]} zoom={6} scrollWheelZoom={true} className="h-full w-full">
        {/* Voyager is a Mapbox-like premium style from CARTO */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {offers.map(offer => {
          const coords = coordsMap[offer.id];
          if (!coords) return null;
          
          const logoUrl = getAvatarUrl(offer.entreprise?.nom || 'Stage', offer.entreprise?.photo);

          return (
            <Marker key={offer.id} position={coords} icon={customIcon}>
              <Popup className="custom-popup">
                <div className="p-1 max-w-[260px]">
                  <div className="flex items-start gap-3 mb-3">
                    <img src={logoUrl} alt="Logo" className="w-12 h-12 rounded-xl object-cover shadow-sm bg-white" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-sm leading-tight text-slate-800 line-clamp-2 mb-1">{offer.titre}</h4>
                      <p className="text-xs text-primary font-bold line-clamp-1">{offer.entreprise?.nom || 'Entreprise'}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {offer.localisation && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium">📍 {offer.localisation}</span>
                    )}
                    {offer.duree && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium">⏱️ {offer.duree}</span>
                    )}
                  </div>
                  <Link 
                    href={`/offres/${offer.id}`} 
                    className="block w-full bg-primary text-white text-center text-xs py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-md"
                  >
                    Voir l'offre
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          padding: 4px;
        }
        .leaflet-popup-content {
          margin: 10px;
          line-height: 1.4;
        }
        .leaflet-container a.leaflet-popup-close-button {
          padding: 6px;
          color: #94a3b8;
          font-size: 18px;
        }
        .leaflet-container a.leaflet-popup-close-button:hover {
          color: #0f172a;
        }
        .custom-leaflet-marker:hover > div {
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
}
