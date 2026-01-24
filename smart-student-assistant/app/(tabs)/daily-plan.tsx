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
import {
  Task,
  saveTasks,
  loadTasks,
  clearTasks,
} from "../services/dailyTasksStorage";

type ClassEntry = {
  start: string;
  end: string;
  subject: string;
};

function parsePlanToTasks(planText: string): Task[] {
  const lines = planText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  return lines.map((line, idx) => ({
    id: Date.now().toString() + idx,
    text: line.replace(/^[-•*⏰📚🍽️💪🎯✨]/g, "").trim(),
    done: false,
  }));
}

export default function DailyPlanScreen() {
  const [todayClasses, setTodayClasses] = useState<ClassEntry[]>([]);
  const [freeSlots, setFreeSlots] = useState<{ start: string; end: string }[]>([]);
  const [dayStart, setDayStart] = useState("06:00");
  const [dayEnd, setDayEnd] = useState("23:00");

  const [goals, setGoals] = useState("");
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);

  const todayName = new Date().toLocaleString("en-US", { weekday: "long" });

  useFocusEffect(
    useCallback(() => {
      load();
      loadSavedTasks();
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

  async function loadSavedTasks() {
    const saved = await loadTasks();
    setTasks(saved);
  }

  async function generate() {
    if (!goals.trim()) {
      alert("Enter your goals for today");
      return;
    }

    setLoading(true);

    try {
      const planText = await generateDailyPlan({
        today: todayName,
        classes: todayClasses,
        freeSlots,
        goals,
        dayStart,
        dayEnd,
      });

      const newTasks = parsePlanToTasks(planText);
      setTasks(newTasks);
      await saveTasks(newTasks);
    } catch (e) {
      alert("Failed to generate plan");
    } finally {
      setLoading(false);
    }
  }

  async function toggleTask(id: string) {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, done: !t.done } : t
    );
    setTasks(updated);
    await saveTasks(updated);
  }

  async function resetDay() {
    await clearTasks();
    setTasks([]);
    setGoals("");
  }

  const totalFreeTime = getTotalFreeMinutes(freeSlots);
  const completedTasks = tasks.filter(t => t.done).length;
  const totalTasks = tasks.length;

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
        placeholder="e.g. Revise DBMS, Complete MPP report, Morning workout, Study for exam..."
        value={goals}
        onChangeText={setGoals}
        style={styles.input}
        multiline
      />

      <TouchableOpacity style={styles.btn} onPress={generate}>
        <Text style={styles.btnText}>🧠 Generate Complete Day Plan</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#7c3aed" />}

      {/* TASK LIST */}
      {tasks.length > 0 && (
        <View style={styles.tasksBox}>
          <View style={styles.taskHeader}>
            <View>
              <Text style={styles.taskHeaderTitle}>✅ Today's Tasks</Text>
              <Text style={styles.progressText}>
                {completedTasks}/{totalTasks} completed
              </Text>
            </View>
            <TouchableOpacity onPress={resetDay} style={styles.resetBtn}>
              <Text style={styles.resetText}>Reset Day</Text>
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }
              ]} 
            />
          </View>

          {tasks.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={styles.taskRow}
              onPress={() => toggleTask(t.id)}
            >
              <Text style={styles.checkbox}>{t.done ? "✅" : "⬜"}</Text>
              <Text
                style={[
                  styles.taskText,
                  t.done && { textDecorationLine: "line-through", color: "#94a3b8" },
                ]}
              >
                {t.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
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

  tasksBox: {
    marginTop: 20,
    marginBottom: 30,
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  taskHeaderTitle: {
    fontWeight: "600",
    fontSize: 18,
    color: "#1e293b",
  },

  progressText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },

  resetBtn: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },

  resetText: {
    color: "#dc2626",
    fontWeight: "600",
    fontSize: 14,
  },

  progressBarContainer: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 16,
  },

  progressBarFill: {
    height: "100%",
    backgroundColor: "#7c3aed",
    borderRadius: 4,
  },

  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
    paddingVertical: 4,
  },

  checkbox: {
    fontSize: 20,
    marginRight: 10,
  },

  taskText: {
    fontSize: 15,
    flex: 1,
    color: "#334155",
  },
});