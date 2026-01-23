import { View, Text, StyleSheet } from "react-native";
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

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  async function load() {
    const table = await getTimetable();

    console.log("📦 LOADED TIMETABLE FROM STORAGE:", table);

    if (!table) {
      setTodayClasses([]);
      return;
    }

    const dayName = new Date().toLocaleString("en-US", { weekday: "long" });

    const classes = (table as WeeklyTimetable)[dayName] || [];

    console.log("📅 TODAY:", dayName);
    console.log("📚 TODAY CLASSES:", classes);

    setTodayClasses(classes);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📚 Today's Classes</Text>

      {todayClasses.length === 0 ? (
        <Text>No classes today 🎉</Text>
      ) : (
        todayClasses.map((c, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.subject}>{c.subject}</Text>
            <Text>
              {c.start} - {c.end}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  card: {
    backgroundColor: "#f1f5f9",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  subject: { fontSize: 16, fontWeight: "600" },
});
