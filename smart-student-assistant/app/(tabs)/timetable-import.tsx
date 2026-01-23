import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import TextRecognition from "@react-native-ml-kit/text-recognition";
import { parseTimetableWithGemini } from "../services/timetableAI";
import { saveTimetable } from "../services/timetableStorage";

export default function TimetableImportScreen() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function pickFile() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];

      setLoading(true);
      setStatus("📂 Reading file...");

      let extractedText = "";

      // 🖼️ If image → OCR
      if (file.mimeType?.startsWith("image/")) {
        const ocr = await TextRecognition.recognize(file.uri);
        extractedText = ocr.text || "";
      } else {
        // 📄 If PDF → send hint text to Gemini (v1 simple mode)
        extractedText = `
This is a PDF timetable file.
File name: ${file.name}

Please infer the timetable structure from this document.
`;
      }
      console.log("📄 EXTRACTED TEXT:\n", extractedText);

      if (!extractedText.trim()) {
        setStatus("❌ Could not extract any text.");
        setLoading(false);
        return;
      }

      setStatus("🧠 Understanding timetable...");

      const structured = await parseTimetableWithGemini(extractedText);

      await saveTimetable(structured);

      console.log("📅 STRUCTURED TIMETABLE:\n", structured);

      setStatus("✅ Timetable imported successfully!");
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to import timetable");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📅 Import Timetable</Text>

      <TouchableOpacity style={styles.btn} onPress={pickFile} disabled={loading}>
        <Text style={styles.btnText}>
          {loading ? "Processing..." : "📂 Select PDF / Image"}
        </Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator style={{ marginTop: 20 }} size="large" />}

      {status ? <Text style={{ marginTop: 20 }}>{status}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  btn: {
    backgroundColor: "#0ea5e9",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
