import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator } from "react-native";
import { Plus, Trash2, Tag, Palette, X, TreeDeciduous } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { speciesService, TreeSpecies } from "../../services/speciesService";

const PRESET_COLORS = [
  "#22c55e", "#3b82f6", "#ef4444", "#eab308", 
  "#a855f7", "#ec4899", "#f97316", "#06b6d4"
];

export default function SpeciesScreen() {
  const insets = useSafeAreaInsets();
  const [species, setSpecies] = useState<TreeSpecies[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);

  useEffect(() => {
    loadSpecies();
  }, []);

  const loadSpecies = async () => {
    try {
      setLoading(true);
      const data = await speciesService.getSpecies();
      setSpecies(data);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSpecies = async () => {
    if (!name.trim()) return;
    try {
      setIsSaving(true);
      await speciesService.createSpecies({ name, color_code: color });
      setName("");
      setColor(PRESET_COLORS[0]);
      setShowModal(false);
      loadSpecies();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Eliminar Especie",
      "¿Estás seguro? Se perderá la referencia en los árboles asociados.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: async () => {
            try {
              await speciesService.deleteSpecies(id);
              loadSpecies();
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: TreeSpecies }) => (
    <View className="bg-zinc-900/50 border border-white/5 p-5 rounded-3xl mb-4 flex-row justify-between items-center shadow-sm">
      <View className="flex-row items-center flex-1">
        <View 
          className="h-12 w-12 rounded-2xl items-center justify-center mr-4"
          style={{ backgroundColor: `${item.color_code}20` }}
        >
          {/* @ts-ignore */}
          <TreeDeciduous size={24} color={item.color_code} />
        </View>
        <View>
          <Text className="text-white text-lg font-bold">{item.name}</Text>
          <Text className="text-zinc-500 text-sm">ID: {item.id.slice(0, 8)}</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        onPress={() => handleDelete(item.id)}
        className="h-10 w-10 bg-red-500/10 items-center justify-center rounded-xl"
      >
        {/* @ts-ignore */}
        <Trash2 size={20} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      <View className="px-6 py-4 flex-row justify-between items-center">
        <View>
          <Text className="text-zinc-500 text-sm font-medium uppercase tracking-widest mb-1">Catálogo</Text>
          <Text className="text-white text-3xl font-bold">Especies</Text>
        </View>
        <TouchableOpacity 
          onPress={() => setShowModal(true)}
          className="bg-emerald-500 h-12 w-12 rounded-2xl items-center justify-center shadow-lg shadow-emerald-500/20"
        >
          {/* @ts-ignore */}
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#10b981" />
        </View>
      ) : (
        <FlatList
          data={species}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
          ListEmptyComponent={
            <View className="mt-20 items-center">
              <View className="bg-zinc-900 h-20 w-20 rounded-full items-center justify-center mb-4">
                {/* @ts-ignore */}
                <Tag size={32} color="#3f3f46" />
              </View>
              <Text className="text-zinc-400 text-center text-lg">No has añadido especies aún.{"\n"}Configura tus cultivos arriba.</Text>
            </View>
          }
        />
      )}

      {/* Modal Nueva Especie */}
      <Modal visible={showModal} animationType="fade" transparent>
        <View className="flex-1 bg-black/80 justify-center px-6">
          <View className="bg-zinc-900 rounded-[40px] p-8 border border-white/10 shadow-2xl">
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-white text-2xl font-bold">Nueva Especie</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                {/* @ts-ignore */}
                <X color="#94a3b8" size={24} />
              </TouchableOpacity>
            </View>

            <View className="mb-6">
              <Text className="text-zinc-400 mb-2 ml-1">Nombre (ej: Olivo Picual)</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Introducir nombre..."
                placeholderTextColor="#52525b"
                className="bg-zinc-800 text-white p-5 rounded-2xl text-lg border border-white/5"
                autoFocus
              />
            </View>

            <View className="mb-8">
              <Text className="text-zinc-400 mb-4 ml-1">Color Identificador</Text>
              <View className="flex-row flex-wrap gap-4">
                {PRESET_COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setColor(c)}
                    className={`h-10 w-10 rounded-full items-center justify-center ${color === c ? 'border-2 border-white' : ''}`}
                    style={{ backgroundColor: c }}
                  >
                    {color === c && (
                      <View className="h-2 w-2 bg-white rounded-full" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              onPress={handleAddSpecies}
              disabled={isSaving || !name.trim()}
              className={`h-16 rounded-2xl items-center justify-center ${isSaving || !name.trim() ? 'bg-zinc-800' : 'bg-emerald-500 shadow-xl shadow-emerald-500/20'}`}
            >
              {isSaving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">Guardar Especie</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
