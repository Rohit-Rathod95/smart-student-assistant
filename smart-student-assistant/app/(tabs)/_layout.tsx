import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Shadows, Spacing, Gradients } from "../../constants/theme";
import { useColorScheme, View, Platform, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, // Cleaner look without text labels
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          position: 'absolute',
          bottom: Spacing.m,
          left: Spacing.m,
          right: Spacing.m,
          backgroundColor: theme.surface,
          borderRadius: 28,
          borderTopWidth: 0,
          ...Shadows.float,
          height: 70,
          paddingBottom: 0,
          borderWidth: 1,
          borderColor: theme.border,
        },
        tabBarItemStyle: {
          height: 64, // Ensure items fill the floating bar
          justifyContent: 'center',
          alignItems: 'center',
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              top: Platform.OS === 'ios' ? 10 : 0
            }}>
              {focused && (
                <LinearGradient
                  colors={Gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    position: 'absolute',
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    opacity: 0.15,
                  }}
                />
              )}
              <Ionicons 
                name={focused ? "home" : "home-outline"} 
                size={focused ? 28 : 26} 
                color={focused ? Colors.light.primary : color} 
              />
              {focused && (
                <View style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: Colors.light.primary,
                  marginTop: 4,
                }} />
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="scan"
        options={{
          title: "Scan",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              top: Platform.OS === 'ios' ? 10 : 0
            }}>
              {focused && (
                <LinearGradient
                  colors={Gradients.secondary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    position: 'absolute',
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    opacity: 0.15,
                  }}
                />
              )}
              <Ionicons 
                name={focused ? "scan-circle" : "scan-circle-outline"} 
                size={focused ? 34 : 32} 
                color={focused ? Colors.light.secondary : color} 
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="notes"
        options={{
          title: "Notes",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              top: Platform.OS === 'ios' ? 10 : 0
            }}>
              {focused && (
                <LinearGradient
                  colors={['#ec4899', '#f472b6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    position: 'absolute',
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    opacity: 0.15,
                  }}
                />
              )}
              <Ionicons 
                name={focused ? "library" : "library-outline"} 
                size={focused ? 28 : 26} 
                color={focused ? '#ec4899' : color} 
              />
              {focused && (
                <View style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#ec4899',
                  marginTop: 4,
                }} />
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="timetable-import"
        options={{
          title: "Import",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              top: Platform.OS === 'ios' ? 10 : 0
            }}>
              {focused && (
                <LinearGradient
                  colors={Gradients.warm}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    position: 'absolute',
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    opacity: 0.15,
                  }}
                />
              )}
              <Ionicons 
                name={focused ? "cloud-upload" : "cloud-upload-outline"} 
                size={focused ? 28 : 26} 
                color={focused ? Colors.light.accent : color} 
              />
              {focused && (
                <View style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: Colors.light.accent,
                  marginTop: 4,
                }} />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="daily-plan"
        options={{
          title: "Plan",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              top: Platform.OS === 'ios' ? 10 : 0
            }}>
              {focused && (
                <LinearGradient
                  colors={Gradients.primaryPurple}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    position: 'absolute',
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    opacity: 0.15,
                  }}
                />
              )}
              <Ionicons 
                name={focused ? "calendar" : "calendar-outline"} 
                size={focused ? 28 : 26} 
                color={focused ? Colors.light.primary : color} 
              />
              {focused && (
                <View style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: Colors.light.primary,
                  marginTop: 4,
                }} />
              )}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
