import React from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import { LogOut, User, Shield, Bell, HelpCircle, ChevronRight, Settings } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { session } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que quieres salir?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Salir", 
          style: "destructive", 
          onPress: () => supabase.auth.signOut() 
        }
      ]
    );
  };

  const SettingItem = ({ icon: Icon, label, value, destructive }: any) => (
    <TouchableOpacity 
      className={`flex-row items-center p-5 bg-zinc-900/50 mb-3 rounded-2xl border border-white/5 ${destructive ? 'active:bg-red-500/10' : ''}`}
    >
      <View className={`h-10 w-10 rounded-xl items-center justify-center mr-4 ${destructive ? 'bg-red-500/10' : 'bg-zinc-800'}`}>
        {/* @ts-ignore */}
        <Icon size={20} color={destructive ? "#ef4444" : "#94a3b8"} />
      </View>
      <View className="flex-1">
        <Text className={`text-base font-medium ${destructive ? 'text-red-500' : 'text-white'}`}>{label}</Text>
        {value && <Text className="text-zinc-500 text-xs mt-0.5">{value}</Text>}
      </View>
      {!destructive && (
        <View>
          {/* @ts-ignore */}
          <ChevronRight size={18} color="#3f3f46" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
        <View className="py-8 items-center">
          <View className="h-24 w-24 bg-emerald-500 rounded-[35px] items-center justify-center mb-4 shadow-2xl shadow-emerald-500/20">
            {/* @ts-ignore */}
            <User size={48} color="white" />
          </View>
          <Text className="text-white text-2xl font-bold">{session?.user?.email?.split('@')[0]}</Text>
          <Text className="text-zinc-500 font-medium">{session?.user?.email}</Text>
        </View>

        <View className="mb-8">
          <Text className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4 ml-1">Cuenta</Text>
          <SettingItem icon={User} label="Perfil del Agricultor" value="Editar datos personales" />
          <SettingItem icon={Shield} label="Seguridad" value="Cambiar contraseña" />
        </View>

        <View className="mb-8">
          <Text className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4 ml-1">Preferencias</Text>
          <SettingItem icon={Bell} label="Notificaciones" value="Configuración de alertas" />
          <SettingItem icon={Settings} label="Unidades de medida" value="Hectáreas / Metros" />
        </View>

        <View className="mb-8">
          <Text className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4 ml-1">Soporte</Text>
          <SettingItem icon={HelpCircle} label="Ayuda y feedback" />
        </View>

        <TouchableOpacity 
          onPress={handleLogout}
          className="flex-row items-center p-5 bg-red-500/10 rounded-2xl border border-red-500/20"
        >
          <View className="h-10 w-10 rounded-xl items-center justify-center mr-4 bg-red-500/20">
            {/* @ts-ignore */}
            <LogOut size={20} color="#ef4444" />
          </View>
          <Text className="text-red-500 text-base font-bold">Cerrar Sesión</Text>
        </TouchableOpacity>

        <Text className="text-center text-zinc-700 text-xs mt-12 mb-6">Bancals v1.0.0 • Made with ❤️ for Agriculture</Text>
      </ScrollView>
    </View>
  );
}
