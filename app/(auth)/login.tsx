import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link } from "expo-router";
import { supabase } from "../../lib/supabase";
import { MoveRight, Sprout } from "lucide-react-native";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) Alert.alert("Error", error.message);
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-8 pt-20">
        <View className="mb-12 items-center">
          <View className="h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 mb-6">
            <Sprout size={40} color="#4CAF50" />
          </View>
          <Text className="text-4xl font-bold text-zinc-900 tracking-tight">Bancals</Text>
          <Text className="text-zinc-500 text-lg mt-2 font-medium">Gestión inteligente de cultivos</Text>
        </View>

        <View className="space-y-6">
          <View>
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
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
            className="bg-primary h-16 rounded-2xl items-center justify-center flex-row mt-8 shadow-lg shadow-primary/30"
          >
            <Text className="text-white text-xl font-bold mr-2">Entrar</Text>
            {loading ? null : <MoveRight size={20} color="white" />}
          </TouchableOpacity>
        </View>

        <View className="mt-auto mb-10 items-center">
          <Text className="text-zinc-500 text-base">
            ¿No tienes cuenta?{" "}
            <Link href="/(auth)/register" asChild>
              <Text className="text-primary font-bold">Regístrate</Text>
            </Link>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
