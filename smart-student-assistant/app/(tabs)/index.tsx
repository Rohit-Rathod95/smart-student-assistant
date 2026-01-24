import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getTimetable, WeeklyTimetable } from "../services/timetableStorage";
import { Colors, Shadows, Spacing, Typography } from "../../constants/theme";
import { LinearGradient } from "expo-linear-gradient";

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
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting}, Rohit</Text>
          <Text style={styles.subtitle}>Ready to learn something new?</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn}>
          <Ionicons name="person" size={20} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>

      {/* HERO CARD: TODAY'S OVERVIEW */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 Today's Overview</Text>
        <LinearGradient
          colors={[Colors.light.primary, Colors.light.primaryDark]}
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
              <Ionicons name="sparkles-outline" size={24} color="white" />
              <Text style={styles.heroText}>No classes scheduled for today!</Text>
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
            onPress={() => router.push("/today")}
          >
            <Text style={styles.viewScheduleText}>View Full Schedule</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.light.primary} />
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* QUICK ACTIONS GRID */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
        <View style={styles.grid}>
          <ActionButton
            title="Scan Notes"
            icon="scan"
            color={Colors.light.secondary}
            onPress={() => router.push("/scan")}
          />
          <ActionButton
            title="My Notes"
            icon="library"
            color="#ec4899" // Pink
            onPress={() => router.push("/(tabs)/notes")}
          />
          <ActionButton
            title="Import TT"
            icon="cloud-upload"
            color="#f59e0b" // Amber
            onPress={() => router.push("/(tabs)/timetable-import")}
          />
          <ActionButton
            title="Plan Day"
            icon="calendar"
            color="#3b82f6" // Blue
            onPress={() => router.push("/(tabs)/daily-plan")}
          />
        </View>
      </View>
    </ScrollView>
  );
}

function ActionButton({ title, icon, color, onPress }: { title: string, icon: keyof typeof Ionicons.glyphMap, color: string, onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.actionBtn, styles.shadow]} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={styles.actionText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: Spacing.m,
  },
  shadow: Shadows.small,
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.xl,
    marginBottom: Spacing.l,
  },
  greeting: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.light.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.surface,
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.small,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: Spacing.m,
  },
  heroCard: {
    borderRadius: 24,
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
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    opacity: 0.9,
  },
  classCountBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  classCountText: {
    color: "white",
    fontWeight: "600",
    fontSize: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 10,
    gap: 10,
  },
  heroText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  heroLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  heroSubject: {
    color: "white",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  heroTime: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: Spacing.l,
  },
  viewScheduleBtn: {
    backgroundColor: "white",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
    marginTop: 10,
  },
  viewScheduleText: {
    color: Colors.light.primary,
    fontWeight: "700",
    fontSize: 14,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: Spacing.m,
  },
  actionBtn: {
    width: "47%", // slightly less than 50% to account for gap
    backgroundColor: Colors.light.surface,
    padding: Spacing.l,
    borderRadius: 20,
    alignItems: "center",
    gap: Spacing.s,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
