import { Tabs } from "expo-router";
import { Compass, Home, Sprout, Settings } from "lucide-react-native";

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4CAF50",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          backgroundColor: "#000",
          borderTopWidth: 1,
          borderTopColor: "#18181b",
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="map"
        options={{
          title: "Mapa",
          // @ts-ignore
          tabBarIcon: ({ color }) => <Compass size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="farms"
        options={{
          title: "Fincas",
          // @ts-ignore
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="species"
        options={{
          title: "Especies",
          // @ts-ignore
          tabBarIcon: ({ color }) => <Sprout size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Ajustes",
          // @ts-ignore
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
