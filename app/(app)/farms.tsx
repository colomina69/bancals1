import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { MapPin, ChevronRight, Sprout, TrendingUp, Trash2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { farmService } from "../../services/farmService";
import { treeService } from "../../services/treeService";

export default function FarmsScreen() {
  const insets = useSafeAreaInsets();
  const [farms, setFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFarms();
  }, []);

  const loadFarms = async () => {
    try {
      setLoading(true);
      const data = await farmService.getFarms();
      
      // Para cada finca, obtener el conteo de árboles
      const farmsWithCounts = await Promise.all((data || []).map(async (farm) => {
        const trees = await treeService.getTreesByFarm(farm.id);
        return { ...farm, treeCount: trees.length };
      }));
      
      setFarms(farmsWithCounts);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderFarm = ({ item }: { item: any }) => (
    <TouchableOpacity className="bg-zinc-900/50 border border-white/5 p-6 rounded-[32px] mb-4 flex-row items-center shadow-sm">
      <View className="bg-emerald-500/10 h-14 w-14 rounded-2xl items-center justify-center mr-4">
        {/* @ts-ignore */}
        <MapPin size={24} color="#10b981" />
      </View>
      
      <View className="flex-1">
        <Text className="text-white text-xl font-bold mb-1">{item.name}</Text>
        <View className="flex-row items-center">
          {/* @ts-ignore */}
          <Sprout size={14} color="#71717a" className="mr-1" />
          <Text className="text-zinc-500 text-sm font-medium">{item.treeCount || 0} árboles registrados</Text>
        </View>
      </View>
      
      {/* @ts-ignore */}
      <ChevronRight size={20} color="#3f3f46" />
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      <View className="px-6 py-6">
        <Text className="text-zinc-500 text-sm font-medium uppercase tracking-widest mb-1">Mis Propiedades</Text>
        <Text className="text-white text-3xl font-bold">Tus Fincas</Text>
      </View>

      <View className="flex-row px-6 mb-8 space-x-4">
        <View className="flex-1 bg-zinc-900/80 p-5 rounded-3xl border border-white/5">
          <Text className="text-zinc-500 text-xs font-bold uppercase mb-2">Total Fincas</Text>
          <Text className="text-white text-2xl font-bold">{farms.length}</Text>
        </View>
        <View className="flex-1 bg-zinc-900/80 p-5 rounded-3xl border border-white/5">
          <Text className="text-zinc-500 text-xs font-bold uppercase mb-2">Total Árboles</Text>
          <Text className="text-white text-2xl font-bold">
            {farms.reduce((acc, f) => acc + (f.treeCount || 0), 0)}
          </Text>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#10b981" />
        </View>
      ) : (
        <FlatList
          data={farms}
          keyExtractor={(item) => item.id}
          renderItem={renderFarm}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          ListEmptyComponent={
            <View className="mt-20 items-center justify-center px-10">
              <View className="bg-zinc-900 h-24 w-24 rounded-full items-center justify-center mb-6">
                {/* @ts-ignore */}
                <TrendingUp size={40} color="#27272a" />
              </View>
              <Text className="text-white text-xl font-bold text-center mb-2">Sin fincas todavía</Text>
              <Text className="text-zinc-500 text-center text-base">Usa el mapa para trazar tu primer lindero y empezar la gestión.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
