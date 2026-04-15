import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../context/AuthContext";
import "../global.css";

function RootLayoutNav() {
  const { session, initialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      // Si no hay sesión y no estamos en auth, ir a login
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup) {
      // Si hay sesión y estamos en auth, ir a la app
      router.replace("/(app)/map");
    }
  }, [session, initialized, segments]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
