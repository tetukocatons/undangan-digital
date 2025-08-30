// src/components/dashboard/LocationPicker.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, Autocomplete } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px',
};

// Lokasi default: Jakarta, Indonesia
const defaultCenter = {
  lat: -6.2087634,
  lng: 106.845599
};

type LocationPickerProps = {
  onLocationChange: (location: { address: string; lat: number; lng: number }) => void;
};

type Libraries = ("places")[];
const libraries: Libraries = ["places"];

export default function LocationPicker({ onLocationChange }: LocationPickerProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  const onLoad = useCallback(function callback(mapInstance: google.maps.Map) {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPosition({ lat, lng });

      // Dapatkan alamat dari lat/lng (Geocoding)
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          onLocationChange({ address: results[0].formatted_address, lat, lng });
        } else {
          onLocationChange({ address: `Koordinat: ${lat}, ${lng}`, lat, lng });
        }
      });
    }
  }, [onLocationChange]);

  const onAutocompleteLoad = (ac: google.maps.places.Autocomplete) => {
    setAutocomplete(ac);
  };
  
  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      const location = place.geometry?.location;
      if (location) {
        const lat = location.lat();
        const lng = location.lng();
        map?.panTo({ lat, lng });
        map?.setZoom(15);
        setMarkerPosition({ lat, lng });
        onLocationChange({ address: place.formatted_address || '', lat, lng });
      }
    } else {
      console.log('Autocomplete is not loaded yet!');
    }
  };

  if (!isLoaded) {
    return <div>Memuat Peta...</div>;
  }

  return (
    <div>
      <p className="block font-semibold text-brand-charcoal mb-2">Cari atau klik lokasi di peta:</p>
      <Autocomplete
        onLoad={onAutocompleteLoad}
        onPlaceChanged={onPlaceChanged}
      >
        <input
          type="text"
          placeholder="Contoh: Gedung Serbaguna, Jl. Merdeka No. 10"
          className="w-full p-3 mb-4 bg-brand-champagne border border-brand-gold/50 rounded-lg"
        />
      </Autocomplete>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={onMapClick}
      >
        <MarkerF position={markerPosition} />
      </GoogleMap>
    </div>
  );
}