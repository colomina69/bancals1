import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from "react-native";
import MapView, { Marker, Polygon, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import ClusterMapView from "react-native-map-clustering";
import { cssInterop } from "nativewind";

cssInterop(ClusterMapView, { className: "style" });
import * as Location from "expo-location";
import { useGPSTracking } from "../../hooks/useGPSTracking";
import TrackingOverlay from "../../components/TrackingOverlay";
import { Navigation, Plus, Map as MapIcon, Layers, Trees, Check, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { farmService } from "../../services/farmService";
import { speciesService, TreeSpecies } from "../../services/speciesService";
import { treeService, Tree } from "../../services/treeService";
import { Alert, Modal, TextInput, FlatList, ActivityIndicator } from "react-native";

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<any>(null);
  const { isTracking, path, currentAccuracy, startTracking, stopTracking, setPath } = useGPSTracking();
  const [mapType, setMapType] = useState<"standard" | "satellite">("satellite");
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [farms, setFarms] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [farmName, setFarmName] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Estados para Árboles
  const [isAddingTree, setIsAddingTree] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<Location.LocationObjectCoords | null>(null);
  const [species, setSpecies] = useState<TreeSpecies[]>([]);
  const [showTreeModal, setShowTreeModal] = useState(false);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loadingTrees, setLoadingTrees] = useState(false);

  useEffect(() => {
    loadFarms();
    loadSpecies();
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  const loadFarms = async () => {
    try {
      const data = await farmService.getFarms();
      setFarms(data || []);
      // También cargamos árboles si hay fincas
      if (data && data.length > 0) {
        loadAllTrees(data);
      }
    } catch (error) {
      console.error("Error loading farms:", error);
    }
  };

  const loadSpecies = async () => {
    try {
      const data = await speciesService.getSpecies();
      setSpecies(data);
    } catch (error) {
      console.error("Error loading species:", error);
    }
  };

  const loadAllTrees = async (currentFarms: any[]) => {
    try {
      setLoadingTrees(true);
      const allTrees: Tree[] = [];
      for (const farm of currentFarms) {
        const farmTrees = await treeService.getTreesByFarm(farm.id);
        allTrees.push(...farmTrees);
      }
      setTrees(allTrees);
    } catch (error) {
      console.error("Error loading trees:", error);
    } finally {
      setLoadingTrees(false);
    }
  };

  const centerOnUser = async () => {
    let loc = await Location.getCurrentPositionAsync({});
    mapRef.current?.animateToRegion({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });
  };

  const handleStopTracking = () => {
    stopTracking();
    if (path.length > 3) {
      setShowSaveModal(true);
    } else {
      Alert.alert("Trazado insuficiente", "Necesitas al menos 4 puntos para definir una finca.");
      setPath([]);
    }
  };

  const handleSaveFarm = async () => {
    if (!farmName.trim()) {
      Alert.alert("Error", "Debes ingresar un nombre para la finca.");
      return;
    }

    try {
      setIsSaving(true);
      await farmService.createFarm({
        name: farmName,
        boundary: path
      });
      Alert.alert("Éxito", "Finca guardada correctamente.");
      setShowSaveModal(false);
      setFarmName("");
      setPath([]);
      loadFarms(); // Recargar mapa
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo guardar la finca.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleMapPress = async (e: any) => {
    if (isAddingTree) {
      const coords = e.nativeEvent.coordinate;
      // Verificar si el punto está dentro de una finca
      const farm = await farmService.findFarmAtPoint(coords.latitude, coords.longitude);
      
      if (!farm) {
        Alert.alert("Fuera de límites", "Debes situar el árbol dentro de una de tus fincas registradas.");
        setIsAddingTree(false);
        return;
      }

      setSelectedCoords({ ...coords, farmId: farm.id, farmName: farm.name });
      setShowTreeModal(true);
      setIsAddingTree(false);
    }
  };

  const handleSaveTree = async (speciesId: string) => {
    if (!selectedCoords) return;

    try {
      setIsSaving(true);
      await treeService.createTree({
        // @ts-ignore
        farm_id: selectedCoords.farmId,
        species_id: speciesId,
        location: {
          latitude: selectedCoords.latitude,
          longitude: selectedCoords.longitude
        }
      });
      setShowTreeModal(false);
      loadFarms(); // Recargar datos
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-zinc-950">
      <ClusterMapView
        ref={mapRef}
        className="flex-1"
        onPress={handleMapPress}
        mapType={mapType}
        showsUserLocation
        showsMyLocationButton={false}
        initialRegion={{
          latitude: 39.4699, // Valencia approx
          longitude: -0.3763,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        clusterColor="#22c55e"
      >
        {/* Fincas existentes (Polígonos y Nombres) */}
        {farms.map((farm) => {
          if (!farm.boundary_coords) return null; 
          
          // Calcular el centro aproximado para la etiqueta del nombre
          const lats = farm.boundary_coords.map((c: any) => c.latitude);
          const lngs = farm.boundary_coords.map((c: any) => c.longitude);
          const centroid = {
            latitude: lats.reduce((a: number, b: number) => a + b, 0) / lats.length,
            longitude: lngs.reduce((a: number, b: number) => a + b, 0) / lngs.length,
          };

          return (
            <React.Fragment key={`farm-group-${farm.id}`}>
              <Polygon
                coordinates={farm.boundary_coords}
                fillColor="rgba(34, 197, 94, 0.15)"
                strokeColor="#22c55e"
                strokeWidth={2}
              />
              <Marker
                coordinate={centroid}
                anchor={{ x: 0.5, y: 0.5 }}
                tracksViewChanges={false}
              >
                <View className="bg-black/40 px-2 py-1 rounded-lg border border-white/10">
                  <Text className="text-white text-[10px] font-bold uppercase tracking-tighter">
                    {farm.name}
                  </Text>
                </View>
              </Marker>
            </React.Fragment>
          );
        })}

        {/* Marcadores de Árboles (Puntos) */}
        {trees.map((tree) => (
          <Marker
            key={`tree-${tree.id}`}
            coordinate={tree.location}
            tracksViewChanges={false}
          >
            <View 
              className="h-8 w-8 rounded-full border-2 border-white items-center justify-center shadow-md shadow-black/50"
              style={{ backgroundColor: tree.species?.color_code || "#22c55e" }}
            >
              {/* @ts-ignore */}
              <Trees size={16} color="white" />
            </View>
          </Marker>
        ))}

        {/* Visualización del perímetro que se está trazando */}
        {path.length > 0 && (
          <Polyline
            coordinates={path}
            strokeColor="#ef4444"
            strokeWidth={4}
            lineDashPattern={[0]}
          />
        )}
      </ClusterMapView>

      <TrackingOverlay 
        isTracking={isTracking}
        pointCount={path.length}
        accuracy={currentAccuracy}
        onStop={handleStopTracking}
      />

      {/* FABs Lateral Derecho (Cambiado a posición inferior para mejor ergonomía) */}
      <View 
        className="absolute right-6 items-center"
        style={{ bottom: isTracking ? 180 : 120 }}
      >
        <TouchableOpacity
          onPress={() => setMapType(mapType === "standard" ? "satellite" : "standard")}
          className="bg-zinc-900/80 h-14 w-14 rounded-2xl items-center justify-center mb-4 backdrop-blur-md shadow-xl border border-white/10"
        >
          {/* @ts-ignore */}
          <Layers size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={centerOnUser}
          className="bg-zinc-900/80 h-14 w-14 rounded-2xl items-center justify-center backdrop-blur-md shadow-xl border border-white/10"
        >
          {/* @ts-ignore */}
          <Navigation size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Botones Principales (Inferior) */}
      {!isTracking && !showSaveModal && (
        <View className="absolute bottom-10 left-0 right-0 items-center px-10 flex-row space-x-4">
          <TouchableOpacity
            onPress={() => setIsAddingTree(!isAddingTree)}
            className={`${isAddingTree ? 'bg-amber-500' : 'bg-zinc-900/90'} flex-1 flex-row items-center justify-center h-16 rounded-3xl shadow-xl border border-white/10`}
          >
            {/* @ts-ignore */}
            <Trees size={24} color="white" className="mr-2" />
            <Text className="text-white font-bold text-lg">{isAddingTree ? 'Cancelar' : 'Añadir Árbol'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={startTracking}
            className="bg-emerald-500 flex-1 flex-row items-center justify-center h-16 rounded-3xl shadow-2xl shadow-emerald-500/40"
          >
            {/* @ts-ignore */}
            <Plus size={24} color="white" className="mr-2" />
            <Text className="text-white font-bold text-lg">Trazar Finca</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Indicador de Modo Añadir Árbol */}
      {isAddingTree && (
        <View className="absolute top-32 left-0 right-0 items-center">
          <View className="bg-amber-500 px-6 py-3 rounded-full shadow-lg">
            <Text className="text-white font-bold">Toca el mapa para situar un árbol</Text>
          </View>
        </View>
      )}

      {/* Modal de Guardado */}
      <Modal
        visible={showSaveModal}
        transparent
        animationType="slide"
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-zinc-900 rounded-t-[40px] p-8 pb-12 border-t border-white/10">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-2xl font-bold">Nueva Finca</Text>
              <TouchableOpacity onPress={() => setShowSaveModal(false)}>
                {/* @ts-ignore */}
                <X color="#94a3b8" size={24} />
              </TouchableOpacity>
            </View>

            <Text className="text-zinc-400 mb-2 font-medium">Nombre de la finca</Text>
            <TextInput
              value={farmName}
              onChangeText={setFarmName}
              placeholder="Ej: El Olivar de Arriba"
              placeholderTextColor="#52525b"
              className="bg-zinc-800 text-white p-5 rounded-2xl mb-8 text-lg border border-white/5"
              autoFocus
            />

            <TouchableOpacity
              onPress={handleSaveFarm}
              disabled={isSaving}
              className={`h-16 rounded-2xl items-center justify-center shadow-lg ${isSaving ? 'bg-zinc-700' : 'bg-emerald-500 shadow-emerald-500/20'}`}
            >
              {isSaving ? (
                <Text className="text-zinc-400 font-bold text-lg">Guardando...</Text>
              ) : (
                <View className="flex-row items-center">
                  {/* @ts-ignore */}
                  <Check color="white" size={24} className="mr-2" />
                  <Text className="text-white font-bold text-lg">Confirmar Linderos</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Modal Selección de Especie */}
      <Modal visible={showTreeModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-zinc-900 rounded-t-[40px] p-8 pb-12 border-t border-white/10 max-h-[80%]">
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-white text-2xl font-bold">Identificar Árbol</Text>
                {/* @ts-ignore */}
                <Text className="text-zinc-500">En finca: {selectedCoords?.farmName}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowTreeModal(false)}>
                {/* @ts-ignore */}
                <X color="#94a3b8" size={24} />
              </TouchableOpacity>
            </View>

            {species.length === 0 ? (
              <View className="py-10 items-center">
                <Text className="text-zinc-400 text-center mb-6">No tienes especies creadas.{"\n"}Ve a la pestaña Especies primero.</Text>
              </View>
            ) : (
              <FlatList
                data={species}
                keyExtractor={(s) => s.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSaveTree(item.id)}
                    className="flex-row items-center bg-zinc-800/50 p-4 rounded-2xl mb-3 border border-white/5"
                  >
                    <View 
                      className="h-10 w-10 rounded-xl items-center justify-center mr-4"
                      style={{ backgroundColor: `${item.color_code}20` }}
                    >
                      {/* @ts-ignore */}
                      <Trees size={20} color={item.color_code} />
                    </View>
                    <Text className="text-white text-lg font-medium">{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            )}

            {isSaving && (
              <View className="absolute inset-0 bg-zinc-900/80 items-center justify-center rounded-t-[40px]">
                <ActivityIndicator color="#10b981" size="large" />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
