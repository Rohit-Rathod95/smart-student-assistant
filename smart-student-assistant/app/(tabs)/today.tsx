import { View, Text, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { useCallback, useState, useEffect } from "react";
import { useFocusEffect } from "expo-router";
import { getTimetable, WeeklyTimetable } from "../services/timetableStorage";
import { Colors, Shadows, Spacing, Typography } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";

type Entry = {
  start: string;
  end: string;
  subject: string;
};

export default function TodayScreen() {
  const [todayClasses, setTodayClasses] = useState<Entry[]>([]);
  const [currentDay, setCurrentDay] = useState("");
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // Update "now" every minute to keep the UI fresh
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  async function load() {
    setLoading(true);
    try {
      const table = await getTimetable();
      if (!table) {
        setTodayClasses([]);
        setLoading(false);
        return;
      }

      const dayName = new Date().toLocaleString("en-US", { weekday: "long" });
      setCurrentDay(dayName);

      const classes = (table as WeeklyTimetable)[dayName] || [];
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

  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  function getStatus(start: string, end: string) {
    if (currentTime >= end) return "past";
    if (currentTime >= start && currentTime < end) return "current";
    return "future";
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Today's Schedule</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString("en-US", { day: 'numeric', month: 'long', weekday: 'long' })}</Text>
      </View>

      {todayClasses.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="sunny" size={64} color={Colors.light.warning} />
          <Text style={styles.emptyText}>No classes today!</Text>
          <Text style={styles.emptySubtext}>Enjoy your free time.</Text>
        </View>
      ) : (
        <View style={styles.timeline}>
          {todayClasses.map((c, i) => {
            const status = getStatus(c.start, c.end);
            const isLast = i === todayClasses.length - 1;

            return (
              <View key={i} style={styles.timelineItem}>
                <View style={styles.leftColumn}>
                  <Text style={[styles.timeLabel, status === 'past' && styles.dimmedText]}>{c.start}</Text>

                  <View style={styles.lineWrapper}>
                    <View style={[
                      styles.dot,
                      status === 'current' && styles.activeDot,
                      status === 'past' && styles.pastDot
                    ]} />
                    {!isLast && <View style={[styles.line, status === 'past' && styles.pastLine]} />}
                  </View>
                </View>

                <View style={[
                  styles.card,
                  status === 'current' && styles.activeCard,
                  status === 'past' && styles.pastCard
                ]}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.subject, status === 'past' && styles.dimmedText]}>{c.subject}</Text>
                    {status === 'current' && (
                      <View style={styles.liveBadge}>
                        <Text style={styles.liveText}>LIVE</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.duration, status === 'past' && styles.dimmedText]}>
                    {c.start} - {c.end}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: Spacing.m
  },
  header: {
    marginTop: Spacing.l,
    marginBottom: Spacing.l,
  },
  title: {
    ...Typography.header,
    fontSize: 24,
  },
  date: {
    ...Typography.body,
    color: Colors.light.primary,
    fontWeight: "600",
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: "center",
    gap: Spacing.m,
  },
  emptyText: {
    ...Typography.subheader,
    color: Colors.light.textSecondary,
  },
  emptySubtext: {
    ...Typography.body,
    fontSize: 14,
  },
  timeline: {
    paddingLeft: Spacing.s,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: Spacing.s,
  },
  leftColumn: {
    width: 60,
    alignItems: "center",
    marginRight: Spacing.s,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 4,
  },
  lineWrapper: {
    alignItems: "center",
    flex: 1,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.primary,
    borderWidth: 2,
    borderColor: Colors.light.background,
    zIndex: 1,
  },
  activeDot: {
    backgroundColor: Colors.light.success,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  pastDot: {
    backgroundColor: Colors.light.gray200,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.light.gray200,
    marginVertical: 4,
  },
  pastLine: {
    backgroundColor: Colors.light.gray200, // Keep it subtle
  },
  card: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: Spacing.m,
    marginBottom: Spacing.m,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
    ...Shadows.small,
  },
  activeCard: {
    backgroundColor: Colors.light.surface,
    borderLeftColor: Colors.light.success,
    ...Shadows.medium,
    transform: [{ scale: 1.02 }],
  },
  pastCard: {
    backgroundColor: Colors.light.gray100,
    borderLeftColor: Colors.light.gray200,
    elevation: 0,
    shadowOpacity: 0,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  subject: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.text,
  },
  dimmedText: {
    color: Colors.light.textLight,
  },
  duration: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  liveBadge: {
    backgroundColor: Colors.light.danger,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
  }
});
