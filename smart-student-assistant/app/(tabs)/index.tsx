import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getTimetable, WeeklyTimetable } from "../services/timetableStorage";
import { Colors, Shadows, Spacing, Typography, Gradients } from "../../constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { GradientBackground } from "../../components/ui/GradientBackground";
import { Card } from "../../components/ui/Card";

type ClassEntry = {
  start: string;
  end: string;
  subject: string;
};

export default function HomeScreen() {
  const router = useRouter();
  const [todayClasses, setTodayClasses] = useState<ClassEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const todayName = new Date().toLocaleString("en-US", { weekday: "long" });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  async function load() {
    const table = await getTimetable();
    if (!table) {
      setTodayClasses([]);
      return;
    }

    const classes = ((table as WeeklyTimetable)[todayName] || []) as ClassEntry[];
    // Sort logic could go here
    setTodayClasses(classes);
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, []);

  return (
    <GradientBackground>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* HEADER SECTION */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}, Rohit</Text>
            <Text style={styles.subtitle}>Ready to learn something new?</Text>
          </View>
          <TouchableOpacity style={styles.profileBtn} activeOpacity={0.7}>
            <Ionicons name="person" size={20} color={Colors.light.primary} />
          </TouchableOpacity>
        </Animated.View>

        {/* HERO CARD: TODAY'S OVERVIEW */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Today's Overview</Text>
          <LinearGradient
            colors={Gradients.primaryPurple}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroHeader}>
              <Text style={styles.heroDay}>{todayName}</Text>
              <View style={styles.classCountBadge}>
                <Text style={styles.classCountText}>{todayClasses.length} Classes</Text>
              </View>
            </View>

            {todayClasses.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="sparkles" size={32} color="white" />
                <Text style={styles.heroText}>No classes scheduled for today!</Text>
                <Text style={styles.heroSubtext}>Enjoy your free time 🎉</Text>
              </View>
            ) : (
              <View>
                <Text style={styles.heroLabel}>Up Next / First Class:</Text>
                <Text style={styles.heroSubject}>{todayClasses[0].subject}</Text>
                <Text style={styles.heroTime}>{todayClasses[0].start} - {todayClasses[0].end}</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.viewScheduleBtn}
              onPress={() => router.push("/(tabs)/today")}
              activeOpacity={0.8}
            >
              <Text style={styles.viewScheduleText}>View Full Schedule</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.light.primary} />
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        {/* QUICK ACTIONS GRID */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <View style={styles.grid}>
            <ActionButton
              title="Scan Notes"
              icon="scan"
              color={Colors.light.secondary}
              onPress={() => router.push("/scan")}
              delay={300}
            />
            <ActionButton
              title="My Notes"
              icon="library"
              color="#ec4899" // Pink
              onPress={() => router.push("/(tabs)/notes")}
              delay={350}
            />
            <ActionButton
              title="Import TT"
              icon="cloud-upload"
              color="#f59e0b" // Amber
              onPress={() => router.push("/(tabs)/timetable-import")}
              delay={400}
            />
            <ActionButton
              title="Plan Day"
              icon="calendar"
              color="#3b82f6" // Blue
              onPress={() => router.push("/(tabs)/daily-plan")}
              delay={450}
            />
          </View>
        </Animated.View>
      </ScrollView>
    </GradientBackground>
  );
}

function ActionButton({ title, icon, color, onPress, delay }: { title: string, icon: keyof typeof Ionicons.glyphMap, color: string, onPress: () => void, delay: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={{ width: "47%" }}>
      <TouchableOpacity 
        style={[styles.actionBtn, styles.shadow]} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={28} color={color} />
        </View>
        <Text style={styles.actionText}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.m,
  },
  shadow: Shadows.medium,
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.xl,
    marginBottom: Spacing.l,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.light.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: 6,
  },
  profileBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.surface,
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.small,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: Spacing.m,
    letterSpacing: -0.3,
  },
  heroCard: {
    borderRadius: 28,
    padding: Spacing.l,
    ...Shadows.large,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.l,
  },
  heroDay: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
    opacity: 0.95,
  },
  classCountBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  classCountText: {
    color: "white",
    fontWeight: "600",
    fontSize: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.m,
    gap: Spacing.s,
  },
  heroText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginTop: Spacing.s,
  },
  heroSubtext: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "500",
  },
  heroLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
  },
  heroSubject: {
    color: "white",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  heroTime: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.l,
  },
  viewScheduleBtn: {
    backgroundColor: "white",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
    marginTop: Spacing.s,
  },
  viewScheduleText: {
    color: Colors.light.primary,
    fontWeight: "700",
    fontSize: 15,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: Spacing.m,
  },
  actionBtn: {
    width: "100%",
    backgroundColor: Colors.light.surface,
    padding: Spacing.l,
    borderRadius: 22,
    alignItems: "center",
    gap: Spacing.s,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  actionText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.light.text,
  },
});
