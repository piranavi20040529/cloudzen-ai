import React from 'react';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

export default function WebMap({ style, colomboCoords, originCoords, originName, destCoords, destinationName, routePolyline, riskColor }) {
  const target = destCoords || { latitude: 7.2906, longitude: 80.6337 };
  const origin = originCoords || colomboCoords || { latitude: 6.9271, longitude: 79.8612 };

  const centerLat = (origin.latitude + target.latitude) / 2;
  const centerLon = (origin.longitude + target.longitude) / 2;
  const latDelta = Math.max(Math.abs(origin.latitude - target.latitude) * 1.5, 0.4);
  const lonDelta = Math.max(Math.abs(origin.longitude - target.longitude) * 1.5, 0.4);

  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={style}
      region={{
        latitude: centerLat,
        longitude: centerLon,
        latitudeDelta: latDelta,
        longitudeDelta: lonDelta,
      }}
    >
      <Marker coordinate={origin} title={`${originName || 'Origin'}`} pinColor="blue" />
      <Marker coordinate={target} title={`${destinationName || 'Destination'}`} pinColor="red" />
      {routePolyline && (
        <Polyline
          coordinates={routePolyline}
          strokeColor={riskColor || '#0284C7'}
          strokeWidth={5}
        />
      )}
    </MapView>
  );
}


