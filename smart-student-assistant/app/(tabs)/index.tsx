import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { getTimetable, WeeklyTimetable } from "../services/timetableStorage";

type ClassEntry = {
  start: string;
  end: string;
  subject: string;
};

export default function HomeScreen() {
  const router = useRouter();
  const [todayClasses, setTodayClasses] = useState<ClassEntry[]>([]);

  const todayName = new Date().toLocaleString("en-US", { weekday: "long" });

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
    setTodayClasses(classes);
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.greeting}>👋 Hi Rohit</Text>
      <Text style={styles.subtitle}>Let’s plan your day smartly.</Text>

      {/* TODAY CLASSES */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📅 Today ({todayName})</Text>

        {todayClasses.length === 0 ? (
          <Text style={{ color: "#64748b" }}>No classes today 🎉</Text>
        ) : (
          todayClasses.map((c, i) => (
            <Text key={i} style={styles.classItem}>
              • {c.start}-{c.end} {c.subject}
            </Text>
          ))
        )}

        <TouchableOpacity
          style={styles.linkBtn}
          onPress={() => router.push("/today")}
        >
          <Text style={styles.linkText}>View Full Today Schedule →</Text>
        </TouchableOpacity>
      </View>

      {/* QUICK ACTIONS */}
      <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>

      <View style={styles.grid}>
        <ActionButton
          title="📸 Scan Notes"
          onPress={() => router.push("/scan")}
        />

        <ActionButton
          title="📚 My Notes"
          onPress={() => router.push("/(tabs)/notes")}
        />

        <ActionButton
          title="📂 Import Timetable"
          onPress={() => router.push("/(tabs)/timetable-import")}
        />

        <ActionButton
          title="🧠 Plan My Day"
          onPress={() => router.push("/(tabs)/daily-plan")}
        />
      </View>
    </ScrollView>
  );
}

function ActionButton({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
      <Text style={styles.actionText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8fafc",
  },

  greeting: {
    fontSize: 28,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#64748b",
    marginBottom: 16,
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 2,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },

  classItem: {
    marginBottom: 4,
  },

  linkBtn: {
    marginTop: 10,
  },

  linkText: {
    color: "#2563eb",
    fontWeight: "600",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  actionBtn: {
    backgroundColor: "#0ea5e9",
    padding: 16,
    borderRadius: 16,
    width: "48%",
    alignItems: "center",
  },

  actionText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
});
