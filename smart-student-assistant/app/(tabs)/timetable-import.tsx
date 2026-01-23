import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import { parseTimetableWithGeminiVision } from "../services/timetableAI";
import { saveTimetable } from "../services/timetableStorage";

export default function TimetableImportScreen() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function pickFile() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];

      // Only accept images (Gemini vision works best with images)
      if (!file.mimeType?.startsWith("image/")) {
        setStatus("❌ Please select an image file (JPG, PNG, etc.)");
        return;
      }

      setLoading(true);
      setStatus("🖼️ Reading image...");

      console.log("📂 Selected file:", file.uri);

      setStatus("🧠 Analyzing timetable with AI vision...");

      // Send image directly to Gemini Vision
      const structured = await parseTimetableWithGeminiVision(file.uri);

      setStatus("💾 Saving timetable...");

      await saveTimetable(structured);

      console.log("📅 STRUCTURED TIMETABLE:\n", JSON.stringify(structured, null, 2));

      // Show preview
      const dayCount = Object.keys(structured).filter(
        (key) => Array.isArray(structured[key]) && structured[key].length > 0
      ).length;
      
      const totalClasses = Object.values(structured).reduce(
        (sum: number, day: any) => sum + (Array.isArray(day) ? day.length : 0), 
        0
      );
      
      setStatus(`✅ Success! Found ${dayCount} days with ${totalClasses} total classes`);
      
    } catch (err) {
      console.error("❌ Import Error:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setStatus(`❌ Failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📅 Import Timetable</Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          📸 Take a photo or select an image of your timetable
        </Text>
        <Text style={styles.infoSubtext}>
          Works best with clear, well-lit images
        </Text>
      </View>

      <TouchableOpacity style={styles.btn} onPress={pickFile} disabled={loading}>
        <Text style={styles.btnText}>
          {loading ? "Processing..." : "📂 Select Timetable Image"}
        </Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.loadingText}>Analyzing with AI...</Text>
        </View>
      )}

      {status ? (
        <View style={[
          styles.statusBox,
          status.startsWith("✅") && styles.successBox,
          status.startsWith("❌") && styles.errorBox
        ]}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      ) : null}

      <View style={styles.tipsBox}>
        <Text style={styles.tipsTitle}>💡 Tips for best results:</Text>
        <Text style={styles.tipText}>• Ensure good lighting</Text>
        <Text style={styles.tipText}>• Capture the entire table</Text>
        <Text style={styles.tipText}>• Avoid shadows or glare</Text>
        <Text style={styles.tipText}>• Keep the image straight</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#ffffff" },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 16, 
    textAlign: "center",
    color: "#0f172a"
  },
  infoBox: {
    backgroundColor: "#f0f9ff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  infoText: {
    fontSize: 15,
    color: "#0c4a6e",
    fontWeight: "600",
    marginBottom: 4,
  },
  infoSubtext: {
    fontSize: 13,
    color: "#075985",
  },
  btn: {
    backgroundColor: "#0ea5e9",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  btnText: { 
    color: "#fff", 
    fontWeight: "600", 
    fontSize: 16 
  },
  loadingContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748b",
  },
  statusBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  successBox: {
    backgroundColor: "#f0fdf4",
    borderColor: "#86efac",
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    borderColor: "#fca5a5",
  },
  statusText: {
    fontSize: 14,
    color: "#0f172a",
    textAlign: "center",
    fontWeight: "500",
  },
  tipsBox: {
    marginTop: 30,
    padding: 16,
    backgroundColor: "#fefce8",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fde047",
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#854d0e",
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: "#a16207",
    marginBottom: 4,
  },
});