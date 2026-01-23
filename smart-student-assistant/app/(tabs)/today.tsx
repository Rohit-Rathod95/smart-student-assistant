import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { getTimetable, WeeklyTimetable } from "../services/timetableStorage";

type Entry = {
  start: string;
  end: string;
  subject: string;
};

export default function TodayScreen() {
  const [todayClasses, setTodayClasses] = useState<Entry[]>([]);
  const [currentDay, setCurrentDay] = useState("");
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  async function load() {
    setLoading(true);
    try {
      const table = await getTimetable();

      console.log("📦 LOADED TIMETABLE FROM STORAGE:", JSON.stringify(table, null, 2));

      if (!table) {
        setTodayClasses([]);
        setLoading(false);
        return;
      }

      // Get current day name
      const dayName = new Date().toLocaleString("en-US", { weekday: "long" });
      setCurrentDay(dayName);

      console.log("📅 TODAY IS:", dayName);

      // Get classes for today
      const classes = (table as WeeklyTimetable)[dayName] || [];

      console.log(`📚 CLASSES FOR ${dayName.toUpperCase()}:`, JSON.stringify(classes, null, 2));

      // Sort classes by start time
      const sortedClasses = classes.sort((a, b) => {
        const timeA = a.start.replace(":", "");
        const timeB = b.start.replace(":", "");
        return timeA.localeCompare(timeB);
      });

      setTodayClasses(sortedClasses);
    } catch (error) {
      console.error("❌ Error loading timetable:", error);
      setTodayClasses([]);
    } finally {
      setLoading(false);
    }
  }

  // Get current time for highlighting
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  function isCurrentClass(start: string, end: string): boolean {
    return currentTime >= start && currentTime < end;
  }

  function isPastClass(end: string): boolean {
    return currentTime >= end;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📚 Today's Classes</Text>
      
      {currentDay && (
        <Text style={styles.subtitle}>{currentDay}</Text>
      )}

      {loading ? (
        <Text style={styles.emptyText}>Loading...</Text>
      ) : todayClasses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No classes today 🎉</Text>
          <Text style={styles.emptySubtext}>Enjoy your free day!</Text>
        </View>
      ) : (
        todayClasses.map((c, i) => {
          const isCurrent = isCurrentClass(c.start, c.end);
          const isPast = isPastClass(c.end);
          
          return (
            <View 
              key={i} 
              style={[
                styles.card,
                isCurrent && styles.currentCard,
                isPast && styles.pastCard
              ]}
            >
              <View style={styles.cardHeader}>
                <Text style={[
                  styles.subject,
                  isCurrent && styles.currentSubject,
                  isPast && styles.pastSubject
                ]}>
                  {c.subject}
                </Text>
                {isCurrent && (
                  <Text style={styles.liveBadge}>🔴 LIVE</Text>
                )}
              </View>
              <Text style={[
                styles.timeText,
                isPast && styles.pastText
              ]}>
                {c.start} - {c.end}
              </Text>
            </View>
          );
        })
      )}

      {todayClasses.length > 0 && (
        <Text style={styles.footer}>
          Total: {todayClasses.length} {todayClasses.length === 1 ? "class" : "classes"} today
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  subtitle: { 
    fontSize: 16, 
    color: "#64748b", 
    marginBottom: 16 
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: "center",
  },
  emptyText: { 
    fontSize: 18, 
    color: "#94a3b8",
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#cbd5e1",
    marginTop: 8,
  },
  card: {
    backgroundColor: "#f1f5f9",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#0ea5e9",
  },
  currentCard: {
    backgroundColor: "#dbeafe",
    borderLeftColor: "#ef4444",
  },
  pastCard: {
    backgroundColor: "#f8fafc",
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  subject: { 
    fontSize: 16, 
    fontWeight: "600",
    color: "#0f172a",
  },
  currentSubject: {
    color: "#1e40af",
  },
  pastSubject: {
    color: "#64748b",
  },
  timeText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
  },
  pastText: {
    color: "#64748b",
    fontWeight: "500",
  },
  liveBadge: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ef4444",
  },
  footer: {
    marginTop: 20,
    marginBottom: 20,
    textAlign: "center",
    fontSize: 13,
    color: "#94a3b8",
  },
});