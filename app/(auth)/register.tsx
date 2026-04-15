import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link } from "expo-router";
import { supabase } from "../../lib/supabase";
import { UserPlus, MoveRight } from "lucide-react-native";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !username) {
      Alert.alert("Error", "Por favor rellena todos los campos");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        },
      },
    });
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Éxito", "Cuenta creada correctamente. Por favor inicia sesión.");
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-8 pt-20">
        <View className="mb-10 items-center">
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <UserPlus size={32} color="#4CAF50" />
          </View>
          <Text className="text-3xl font-bold text-zinc-900 tracking-tight">Crear cuenta</Text>
          <Text className="text-zinc-500 text-lg mt-1 font-medium">Únete a la comunidad Bancals</Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-zinc-700 font-semibold mb-2 ml-1">Nombre de Usuario</Text>
            <TextInput
              className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-lg text-zinc-900 focus:border-primary"
              placeholder="tu_nombre"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View className="mt-4">
            <Text className="text-zinc-700 font-semibold mb-2 ml-1">Email</Text>
            <TextInput
              className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-lg text-zinc-900 focus:border-primary"
              placeholder="tu@email.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View className="mt-4">
            <Text className="text-zinc-700 font-semibold mb-2 ml-1">Contraseña</Text>
            <TextInput
              className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-lg text-zinc-900 focus:border-primary"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
            className="bg-primary h-16 rounded-2xl items-center justify-center flex-row mt-8 shadow-lg shadow-primary/30"
          >
            <Text className="text-white text-xl font-bold mr-2">Empezar</Text>
            {loading ? null : <MoveRight size={20} color="white" />}
          </TouchableOpacity>
        </View>

        <View className="mt-10 mb-10 items-center">
          <Text className="text-zinc-500 text-base">
            ¿Ya tienes cuenta?{" "}
            <Link href="/(auth)/login" asChild>
              <Text className="text-primary font-bold">Inicia sesión</Text>
            </Link>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
