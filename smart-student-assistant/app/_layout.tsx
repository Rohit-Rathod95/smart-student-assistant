import { useEffect, useState, useRef } from "react";
import { View, ActivityIndicator } from "react-native";
import { Slot, useRouter, useSegments, useRootNavigationState } from "expo-router";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./services/firebase";
import { Colors } from "../constants/theme";

export default function RootLayout() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  
  // Prevent multiple redirects
  const hasNavigated = useRef(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      console.log("AUTH CHANGED:", u?.email || "null");
      setUser(u);
      // Reset navigation flag when auth changes
      hasNavigated.current = false;
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!navigationState?.key || user === undefined) {
      return;
    }

    // Prevent multiple simultaneous navigations
    if (hasNavigated.current) {
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      hasNavigated.current = true;
      console.log("→ Redirecting to login");
      
      // Use setTimeout to ensure navigation happens after render
      setTimeout(() => {
        router.replace("/(auth)/login");
      }, 50);
      
    } else if (user && inAuthGroup) {
      hasNavigated.current = true;
      console.log("→ Redirecting to tabs");
      
      setTimeout(() => {
        router.replace("/(tabs)");
      }, 50);
    }
  }, [user, segments, navigationState?.key]);

  if (!navigationState?.key || user === undefined) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center", 
        backgroundColor: "#fff" 
      }}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return <Slot />;
}