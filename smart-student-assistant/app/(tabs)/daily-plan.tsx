import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
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
import { Colors, Shadows, Spacing, Typography } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp, Layout } from "react-native-reanimated";
import { GradientBackground } from "../../components/ui/GradientBackground";
import { Card } from "../../components/ui/Card";
import { GradientButton } from "../../components/ui/GradientButton";

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
    <GradientBackground>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text style={styles.title}>🧠 AI Daily Planner</Text>
          <Text style={styles.sub}>Today is {todayName}</Text>
        </Animated.View>

        {/* SETUP SECTION */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Card variant="elevated" style={styles.setupCard}>
            <View style={styles.cardHeader}>
              <View style={styles.iconWrapper}>
                <Ionicons name="settings" size={22} color={Colors.light.primary} />
              </View>
              <Text style={styles.cardTitle}>Day Setup</Text>
            </View>

        <View style={styles.timeRow}>
          <View style={styles.timeGroup}>
            <Text style={styles.label}>Start</Text>
            <View style={styles.timeInputWrapper}>
              <TextInput
                value={dayStart}
                onChangeText={setDayStart}
                style={styles.timeInput}
                placeholder="06:00"
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>
          <View style={styles.arrowContainer}>
            <Ionicons name="arrow-forward" size={16} color={Colors.light.textLight} />
          </View>
          <View style={styles.timeGroup}>
            <Text style={styles.label}>End</Text>
            <View style={styles.timeInputWrapper}>
              <TextInput
                value={dayEnd}
                onChangeText={setDayEnd}
                style={styles.timeInput}
                placeholder="23:00"
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>
        </View>

            <View style={styles.divider} />

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{todayClasses.length}</Text>
                <Text style={styles.statLabel}>Classes</Text>
              </View>
              <View style={styles.verticalDivider} />
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: Colors.light.success }]}>
                  {formatDuration(totalFreeTime)}
                </Text>
                <Text style={styles.statLabel}>Free Time</Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Text style={styles.sectionHeader}>🎯 Your Goals</Text>
          <Card variant="outlined" style={styles.goalCard}>
            <TextInput
              placeholder="e.g. Revise DBMS, Morning workout..."
              placeholderTextColor={Colors.light.textLight}
              value={goals}
              onChangeText={setGoals}
              style={styles.goalInput}
              multiline
            />
          </Card>

          <GradientButton
            title="Generate Plan"
            icon="sparkles"
            onPress={generate}
            loading={loading}
            disabled={loading}
            variant="primary"
            style={styles.generateBtn}
          />
        </Animated.View>

        {/* TASK LIST */}
        {tasks.length > 0 && (
          <Animated.View entering={FadeInUp.delay(400).springify()} layout={Layout.springify()}>
            <Card variant="elevated" style={styles.tasksCard}>
              <View style={styles.tasksHeader}>
                <View>
                  <Text style={styles.tasksTitle}>✅ Today's Plan</Text>
                  <Text style={styles.tasksSub}>
                    {completedTasks} of {totalTasks} completed
                  </Text>
                </View>
                <TouchableOpacity style={styles.resetBtn} onPress={resetDay} activeOpacity={0.7}>
                  <Ionicons name="refresh" size={14} color={Colors.light.danger} />
                  <Text style={styles.resetText}>Reset</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }
                  ]}
                />
              </View>

              <View style={styles.taskList}>
                {tasks.map((t, index) => (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.taskRow, t.done && styles.taskRowDone]}
                    onPress={() => toggleTask(t.id)}
                    activeOpacity={0.7}
                  >
                    <Animated.View
                      entering={FadeInDown.delay(index * 50).springify()}
                      layout={Layout.springify()}
                      style={styles.taskContent}
                    >
                      <View style={[styles.checkbox, t.done && styles.checkboxDone]}>
                        {t.done && <Ionicons name="checkmark" size={14} color="white" />}
                      </View>
                      <Text style={[styles.taskText, t.done && styles.taskTextDone]}>
                        {t.text}
                      </Text>
                    </Animated.View>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          </Animated.View>
        )}
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.m,
  },
  title: {
    ...Typography.header,
    fontSize: 30,
    marginBottom: 4,
    marginTop: Spacing.xl,
    letterSpacing: -0.8,
  },
  sub: {
    ...Typography.body,
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.l,
  },
  setupCard: {
    marginBottom: Spacing.l,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s,
    marginBottom: Spacing.m,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    ...Typography.subheader,
    fontSize: 18,
    fontWeight: '700',
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeGroup: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: Colors.light.textLight,
    marginBottom: 6,
    fontWeight: "600",
  },
  timeInputWrapper: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  timeInput: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    textAlign: 'center',
  },
  arrowContainer: {
    paddingHorizontal: 10,
    paddingTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: Spacing.m,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  stat: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  verticalDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.light.border,
  },
  sectionHeader: {
    ...Typography.subheader,
    marginBottom: Spacing.m,
    color: Colors.light.text,
    fontSize: 20,
    fontWeight: '700',
  },
  goalCard: {
    marginBottom: Spacing.l,
  },
  goalInput: {
    minHeight: 120,
    fontSize: 16,
    color: Colors.light.text,
    textAlignVertical: 'top',
    lineHeight: 24,
  },
  generateBtn: {
    marginBottom: Spacing.xl,
  },
  tasksCard: {
    marginTop: Spacing.m,
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.m,
  },
  tasksTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
    letterSpacing: -0.3,
  },
  tasksSub: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.light.danger + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  resetText: {
    color: Colors.light.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.light.border,
    borderRadius: 4,
    marginBottom: Spacing.l,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.success,
    borderRadius: 4,
  },
  taskList: {
    gap: Spacing.m,
  },
  taskRow: {
    backgroundColor: Colors.light.surfaceAlt,
    padding: Spacing.m,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadows.small,
  },
  taskRowDone: {
    backgroundColor: Colors.light.background,
    borderColor: Colors.light.border,
    opacity: 0.6,
    elevation: 0,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.m,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2.5,
    borderColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxDone: {
    backgroundColor: Colors.light.success,
    borderColor: Colors.light.success,
  },
  taskText: {
    fontSize: 16,
    color: Colors.light.text,
    flex: 1,
    lineHeight: 24,
    fontWeight: '500',
  },
  taskTextDone: {
    color: Colors.light.textLight,
    textDecorationLine: 'line-through',
  },
});
