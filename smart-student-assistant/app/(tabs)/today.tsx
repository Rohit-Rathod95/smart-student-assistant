import { View, Text, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { useCallback, useState, useEffect } from "react";
import { useFocusEffect } from "expo-router";
import { getTimetable, WeeklyTimetable } from "../services/timetableStorage";
import { Colors, Shadows, Spacing, Typography, Gradients } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import { GradientBackground } from "../../components/ui/GradientBackground";
import { Card } from "../../components/ui/Card";

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
    <GradientBackground>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      >
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <Text style={styles.title}>Today's Schedule</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString("en-US", { day: 'numeric', month: 'long', weekday: 'long' })}</Text>
        </Animated.View>

        {todayClasses.length === 0 && !loading ? (
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.emptyContainer}>
            <Card variant="elevated" style={styles.emptyCard}>
              <LinearGradient
                colors={Gradients.warm}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.emptyIconContainer}
              >
                <Ionicons name="sunny" size={48} color="white" />
              </LinearGradient>
              <Text style={styles.emptyText}>No classes today!</Text>
              <Text style={styles.emptySubtext}>Enjoy your free time 🎉</Text>
              <Text style={styles.emptyHint}>Perfect day to catch up on notes or plan ahead</Text>
            </Card>
          </Animated.View>
        ) : (
          <View style={styles.timeline}>
            {todayClasses.map((c, i) => {
              const status = getStatus(c.start, c.end);
              const isLast = i === todayClasses.length - 1;

              return (
                <Animated.View
                  key={i}
                  style={styles.timelineItem}
                  entering={FadeInDown.delay(200 + i * 100).springify()}
                  layout={Layout.springify()}
                >
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
                      <View style={styles.subjectContainer}>
                        <Ionicons 
                          name={status === 'current' ? 'radio-button-on' : 'book-outline'} 
                          size={18} 
                          color={status === 'current' ? Colors.light.success : Colors.light.textSecondary} 
                          style={styles.subjectIcon}
                        />
                        <Text style={[styles.subject, status === 'past' && styles.dimmedText]}>{c.subject}</Text>
                      </View>
                      {status === 'current' && (
                        <View style={styles.liveBadge}>
                          <View style={styles.liveDot} />
                          <Text style={styles.liveText}>LIVE</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.timeContainer}>
                      <Ionicons name="time-outline" size={14} color={Colors.light.textSecondary} />
                      <Text style={[styles.duration, status === 'past' && styles.dimmedText]}>
                        {c.start} - {c.end}
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.m
  },
  header: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.l,
  },
  title: {
    ...Typography.header,
    fontSize: 30,
    letterSpacing: -0.8,
  },
  date: {
    ...Typography.body,
    color: Colors.light.primary,
    fontWeight: "600",
    fontSize: 15,
    marginTop: 4,
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  emptyCard: {
    alignItems: "center",
    padding: Spacing.xl,
    width: '100%',
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.l,
    ...Shadows.medium,
  },
  emptyText: {
    ...Typography.subheader,
    color: Colors.light.text,
    fontSize: 22,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    ...Typography.body,
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.s,
  },
  emptyHint: {
    fontSize: 13,
    color: Colors.light.textLight,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  timeline: {
    paddingLeft: Spacing.s,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: Spacing.m,
  },
  leftColumn: {
    width: 70,
    alignItems: "center",
    marginRight: Spacing.m,
  },
  timeLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  lineWrapper: {
    alignItems: "center",
    flex: 1,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.light.primary,
    borderWidth: 3,
    borderColor: Colors.light.surface,
    zIndex: 1,
    ...Shadows.small,
  },
  activeDot: {
    backgroundColor: Colors.light.success,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: Colors.light.surface,
    ...Shadows.medium,
  },
  pastDot: {
    backgroundColor: Colors.light.gray200,
    borderColor: Colors.light.surface,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.light.border,
    marginVertical: 6,
  },
  pastLine: {
    backgroundColor: Colors.light.border,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: 18,
    padding: Spacing.l,
    marginBottom: Spacing.m,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
    ...Shadows.medium,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  activeCard: {
    backgroundColor: Colors.light.surface,
    borderLeftColor: Colors.light.success,
    borderLeftWidth: 5,
    ...Shadows.large,
    transform: [{ scale: 1.02 }],
  },
  pastCard: {
    backgroundColor: Colors.light.surfaceAlt,
    borderLeftColor: Colors.light.gray200,
    elevation: 0,
    shadowOpacity: 0,
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.s,
  },
  subjectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subjectIcon: {
    marginRight: Spacing.s,
  },
  subject: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.light.text,
    flex: 1,
    letterSpacing: -0.3,
  },
  dimmedText: {
    color: Colors.light.textLight,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  duration: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  liveBadge: {
    backgroundColor: Colors.light.danger,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    ...Shadows.small,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
  },
  liveText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  }
});
