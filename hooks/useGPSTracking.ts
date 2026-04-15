import { useState, useRef, useCallback } from "react";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import { Alert } from "react-native";

export interface GPSPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
}

export const useGPSTracking = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [path, setPath] = useState<GPSPoint[]>([]);
  const [currentAccuracy, setCurrentAccuracy] = useState<number | null>(null);
  const watcher = useRef<Location.LocationSubscription | null>(null);

  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Se necesita acceso a la ubicación para trazar linderos.");
      return;
    }

    setPath([]);
    setIsTracking(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    watcher.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 2000, // Cada 2 segundos
        distanceInterval: 1, // O cada metro
      },
      (location) => {
        const { latitude, longitude, accuracy } = location.coords;
        setCurrentAccuracy(accuracy);

        // Filtro de precisión: Solo aceptamos puntos con menos de 5m de error
        if (accuracy && accuracy <= 5) {
          setPath((prev) => [...prev, { 
            latitude, 
            longitude, 
            timestamp: location.timestamp,
            accuracy 
          }]);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    );
  };

  const stopTracking = useCallback(() => {
    if (watcher.current) {
      watcher.current.remove();
      watcher.current = null;
    }
    setIsTracking(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, []);

  return {
    isTracking,
    path,
    currentAccuracy,
    startTracking,
    stopTracking,
    setPath,
  };
};
