import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { getTimetable, WeeklyTimetable } from "../services/timetableStorage";
import { getFreeSlots, getTotalFreeMinutes, formatDuration } from "../services/timeUtils";
import { generateDailyPlan } from "../services/dailyPlannerAI";

type ClassEntry = {
  start: string;
  end: string;
  subject: string;
};

export default function DailyPlanScreen() {
  const [todayClasses, setTodayClasses] = useState<ClassEntry[]>([]);
  const [freeSlots, setFreeSlots] = useState<{ start: string; end: string }[]>([]);
  const [dayStart, setDayStart] = useState("06:00");
  const [dayEnd, setDayEnd] = useState("23:00");

  const [goals, setGoals] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState("");

  const todayName = new Date().toLocaleString("en-US", { weekday: "long" });

  useFocusEffect(
    useCallback(() => {
      load();
    }, [dayStart, dayEnd])
  );

  async function load() {
    const table = await getTimetable();
    if (!table) {
      // No timetable, so entire day is free
      setTodayClasses([]);
      const free = getFreeSlots([], dayStart, dayEnd);
      setFreeSlots(free);
      return;
    }

    const classes = ((table as WeeklyTimetable)[todayName] || []) as ClassEntry[];
    setTodayClasses(classes);

    const free = getFreeSlots(classes, dayStart, dayEnd);
    setFreeSlots(free);
  }

  async function generate() {
    if (!goals.trim()) {
      alert("Enter your goals for today");
      return;
    }

    setLoading(true);
    setPlan("");

    try {
      const result = await generateDailyPlan({
        today: todayName,
        classes: todayClasses,
        freeSlots,
        goals,
        dayStart,
        dayEnd,
      });

      setPlan(result);
    } catch (e) {
      setPlan("❌ Failed to generate daily plan.");
    } finally {
      setLoading(false);
    }
  }

  const totalFreeTime = getTotalFreeMinutes(freeSlots);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🧠 AI Daily Planner</Text>

      <Text style={styles.sub}>📅 Today: {todayName}</Text>

      {/* Day Time Range */}
      <View style={styles.timeRangeContainer}>
        <Text style={styles.section}>⏰ Day Time Range:</Text>
        <View style={styles.timeInputRow}>
          <View style={styles.timeInputGroup}>
            <Text style={styles.timeLabel}>Start:</Text>
            <TextInput
              value={dayStart}
              onChangeText={setDayStart}
              style={styles.timeInput}
              placeholder="06:00"
            />
          </View>
          <View style={styles.timeInputGroup}>
            <Text style={styles.timeLabel}>End:</Text>
            <TextInput
              value={dayEnd}
              onChangeText={setDayEnd}
              style={styles.timeInput}
              placeholder="23:00"
            />
          </View>
        </View>
      </View>

      <Text style={styles.section}>📚 Today's Classes:</Text>
      {todayClasses.length === 0 ? (
        <Text style={styles.infoText}>No classes scheduled 🎉</Text>
      ) : (
        todayClasses.map((c, i) => (
          <Text key={i} style={styles.listItem}>
            • {c.start}-{c.end} {c.subject}
          </Text>
        ))
      )}

      <View style={styles.freeSlotsHeader}>
        <Text style={styles.section}>⏳ Available Free Time:</Text>
        <Text style={styles.totalTime}>{formatDuration(totalFreeTime)}</Text>
      </View>
      
      {freeSlots.length === 0 ? (
        <Text style={styles.infoText}>No free time available</Text>
      ) : (
        freeSlots.map((s, i) => {
          const duration = formatDuration(
            parseInt(s.end.split(":")[0]) * 60 + parseInt(s.end.split(":")[1]) -
            (parseInt(s.start.split(":")[0]) * 60 + parseInt(s.start.split(":")[1]))
          );
          return (
            <Text key={i} style={styles.listItem}>
              • {s.start} - {s.end} ({duration})
            </Text>
          );
        })
      )}

      <Text style={styles.section}>🎯 Your Goals for Today:</Text>
      <TextInput
        placeholder="e.g. Revise DBMS, Complete MPP report, Solve W&A numericals, Morning workout, Study for exam"
        value={goals}
        onChangeText={setGoals}
        style={styles.input}
        multiline
      />

      <TouchableOpacity style={styles.btn} onPress={generate}>
        <Text style={styles.btnText}>🧠 Generate Complete Day Plan</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator style={{ marginTop: 20 }} size="large" />}

      {plan ? (
        <View style={styles.planBox}>
          <Text style={styles.planTitle}>📋 Your Day Plan</Text>
          <Text style={styles.planText}>{plan}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  sub: { color: "#64748b", marginBottom: 12, fontSize: 16 },

  timeRangeContainer: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },

  timeInputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  timeInputGroup: {
    flex: 1,
    marginHorizontal: 4,
  },

  timeLabel: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 4,
  },

  timeInput: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },

  section: { marginTop: 12, fontWeight: "600", fontSize: 16 },

  freeSlotsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  totalTime: {
    color: "#7c3aed",
    fontWeight: "600",
    fontSize: 16,
  },

  infoText: {
    color: "#94a3b8",
    fontStyle: "italic",
    marginTop: 4,
  },

  listItem: {
    marginTop: 4,
    color: "#334155",
  },

  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    minHeight: 100,
    fontSize: 15,
  },

  btn: {
    backgroundColor: "#7c3aed",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },

  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },

  planBox: {
    marginTop: 20,
    marginBottom: 30,
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  planTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#1e293b",
  },

  planText: { fontSize: 15, lineHeight: 24, color: "#334155" },
});