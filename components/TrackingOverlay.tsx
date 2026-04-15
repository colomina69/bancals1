import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Circle, StopCircle, Navigation } from "lucide-react-native";

interface Props {
  isTracking: boolean;
  pointCount: number;
  accuracy: number | null;
  onStop: () => void;
}

export default function TrackingOverlay({ isTracking, pointCount, accuracy, onStop }: Props) {
  if (!isTracking) return null;

  const isHighAccuracy = accuracy && accuracy <= 5;

  return (
    <View className="absolute top-14 left-4 right-4 bg-white/90 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-white/20 flex-row items-center justify-between">
      <View className="flex-row items-center">
        <View className={`h-3 w-3 rounded-full mr-3 ${isHighAccuracy ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`} />
        <View>
          <Text className="text-zinc-900 font-bold text-lg">Trazando finca...</Text>
          <Text className="text-zinc-500 text-sm font-medium">
            {pointCount} puntos • Precisión: {accuracy?.toFixed(1)}m
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={onStop}
        activeOpacity={0.7}
        className="bg-red-500 h-14 w-14 rounded-2xl items-center justify-center shadow-lg shadow-red-500/30"
      >
        <StopCircle size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}
