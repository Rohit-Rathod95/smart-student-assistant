import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import { parseTimetableWithGeminiVision } from "../services/timetableAI";
import { saveTimetable } from "../services/timetableStorage";
import { Colors, Shadows, Spacing, Typography } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";

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
        <Ionicons name="image-outline" size={24} color={Colors.light.primary} style={{ marginBottom: 8 }} />
        <Text style={styles.infoText}>
          Take a photo or select an image to auto-import your schedule.
        </Text>
        <Text style={styles.infoSubtext}>
          Ensure the image is clear and well-lit for best results.
        </Text>
      </View>

      <TouchableOpacity style={styles.btn} onPress={pickFile} disabled={loading}>
        <Ionicons name="cloud-upload-outline" size={20} color="white" style={{ marginRight: 8 }} />
        <Text style={styles.btnText}>
          {loading ? "Processing..." : "Select Timetable Image"}
        </Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Analyzing with AI...</Text>
        </View>
      )}

      {status ? (
        <View style={[
          styles.statusBox,
          status.startsWith("✅") && styles.successBox,
          status.startsWith("❌") && styles.errorBox
        ]}>
          <Text style={[
            styles.statusText,
            status.startsWith("✅") && styles.successText,
            status.startsWith("❌") && styles.errorText
          ]}>{status}</Text>
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
  container: {
    flex: 1,
    padding: Spacing.m,
    backgroundColor: Colors.light.background
  },
  title: {
    ...Typography.header,
    fontSize: 24,
    marginBottom: Spacing.l,
    marginTop: Spacing.m,
  },
  infoBox: {
    backgroundColor: Colors.light.surface,
    padding: Spacing.l,
    borderRadius: 16,
    marginBottom: Spacing.l,
    alignItems: 'center',
    ...Shadows.small,
  },
  infoText: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: 'center',
  },
  infoSubtext: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  btn: {
    backgroundColor: Colors.light.primary,
    padding: Spacing.m,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: 'center',
    ...Shadows.medium,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16
  },
  loadingContainer: {
    marginTop: Spacing.l,
    alignItems: "center",
  },
  loadingText: {
    marginTop: Spacing.s,
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  statusBox: {
    marginTop: Spacing.l,
    padding: Spacing.m,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  successBox: {
    backgroundColor: Colors.light.surface,
    borderColor: Colors.light.success,
    borderLeftWidth: 4,
  },
  errorBox: {
    backgroundColor: Colors.light.surface,
    borderColor: Colors.light.danger,
    borderLeftWidth: 4,
  },
  statusText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: "500",
  },
  successText: {
    color: Colors.light.success,
  },
  errorText: {
    color: Colors.light.danger,
  },
  tipsBox: {
    marginTop: Spacing.xl,
    padding: Spacing.m,
    backgroundColor: Colors.light.gray100,
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: Spacing.s,
  },
  tipText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
});
