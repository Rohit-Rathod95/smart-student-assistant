import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { generateStudyPlan } from "../services/studyPlanner";

export default function PlannerScreen() {
  const [examName, setExamName] = useState("");
  const [subjects, setSubjects] = useState("");
  const [examDate, setExamDate] = useState("");
  const [dailyHours, setDailyHours] = useState("");

  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState("");

  async function generate() {
    if (!examName || !subjects || !examDate) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);
    setPlan("");

    try {
      const result = await generateStudyPlan({
        examName,
        subjects,
        examDate,
        dailyHours: dailyHours || "Not specified",
      });

      setPlan(result);
    } catch (e) {
      setPlan("❌ Failed to generate plan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📅 AI Study Planner</Text>

      <TextInput
        placeholder="Exam name (e.g. DBMS Midsem)"
        style={styles.input}
        value={examName}
        onChangeText={setExamName}
      />

      <TextInput
        placeholder="Subjects / Chapters (comma separated)"
        style={styles.input}
        value={subjects}
        onChangeText={setSubjects}
        multiline
      />

      <TextInput
        placeholder="Exam date (e.g. 25 Aug 2026)"
        style={styles.input}
        value={examDate}
        onChangeText={setExamDate}
      />

      <TextInput
        placeholder="Daily study hours (optional)"
        style={styles.input}
        value={dailyHours}
        onChangeText={setDailyHours}
      />

      <TouchableOpacity style={styles.btn} onPress={generate}>
        <Text style={styles.btnText}>Generate Plan</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator style={{ marginTop: 20 }} size="large" />}

      {plan ? (
        <View style={styles.planBox}>
          <Text style={styles.planText}>{plan}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },

  btn: {
    backgroundColor: "#7c3aed",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  planBox: {
    marginTop: 20,
    backgroundColor: "#f1f5f9",
    padding: 16,
    borderRadius: 10,
  },

  planText: {
    fontSize: 15,
    lineHeight: 22,
  },
});
