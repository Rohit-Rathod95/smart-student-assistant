import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { useEffect, useRef, useState } from "react";
import { Camera, useCameraDevice, useCameraPermission } from "react-native-vision-camera";
import TextRecognition from "@react-native-ml-kit/text-recognition";
import { cleanNotesWithGemini } from "../services/gemini";
import { saveNote } from "../services/notesStorage";


export default function ScanScreen() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice("back");
  const cameraRef = useRef<Camera>(null);

  const [recognizedText, setRecognizedText] = useState("");
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState("");

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  const scanText = async () => {
    try {
      if (!cameraRef.current) return;

      if (!topic.trim()) {
        alert("Please enter a topic first");
        return;
      }

      setLoading(true);
      setRecognizedText("");
      setAiText("");

      const photo = await cameraRef.current.takePhoto({
        flash: "off",
      });

      // ML Kit OCR (IMPORTANT: file://)
      const ocrResult = await TextRecognition.recognize("file://" + photo.path);
      const rawText = ocrResult.text || "";

      setRecognizedText(rawText || "No text found");

      if (rawText.trim().length === 0) {
        setAiText("No readable text found to clean.");
        setLoading(false);
        return;
      }

      // Gemini cleanup
      const cleaned = await cleanNotesWithGemini(topic, rawText);
      setAiText(cleaned);

      setLoading(false);
    } catch (err) {
      console.error("Scan error:", err);
      setRecognizedText("Error while scanning text");
      setAiText("Error while processing with AI");
      setLoading(false);
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Camera permission not granted</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Loading camera...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Topic Input */}
      <View style={styles.topicBox}>
        <TextInput
          placeholder="Enter topic (e.g. DBMS, ML Kit, OS...)"
          value={topic}
          onChangeText={setTopic}
          style={styles.topicInput}
        />
      </View>

      {/* Camera Preview */}
      <Camera
        ref={cameraRef}
        style={{ flex: 1 }}
        device={device}
        isActive={true}
        photo={true}
      />

      {/* Scan Button */}
      <View style={styles.bottomPanel}>
        <TouchableOpacity style={styles.scanButton} onPress={scanText} disabled={loading}>
          <Text style={styles.scanText}>
            {loading ? "Scanning..." : "Scan & Clean Notes"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* OCR Result */}
      {recognizedText.length > 0 && (
        <View style={styles.resultBox}>
          <ScrollView>
            <Text style={[styles.resultText, { fontWeight: "bold" }]}>
              🧾 Raw OCR Text:
            </Text>
            <Text style={styles.resultText}>{recognizedText}</Text>
          </ScrollView>
        </View>
      )}

      {/* AI Result */}
      {aiText.length > 0 && (
        <View style={[styles.resultBox, { top: "45%", backgroundColor: "rgba(0,0,0,0.85)" }]}>
          <ScrollView>
            <Text style={[styles.resultText, { fontWeight: "bold" }]}>
              ✨ AI Cleaned Notes:
            </Text>
            <Text style={styles.resultText}>{aiText}</Text>
          </ScrollView>
        </View>
      )}
      {aiText.length > 0 && (
  <View style={{ position: "absolute", bottom: 90, width: "100%", alignItems: "center" }}>
    <TouchableOpacity
      style={[styles.scanButton, { backgroundColor: "#2563eb" }]}
      onPress={async () => {
        await saveNote({
          id: Date.now().toString(),
          topic: topic,
          content: aiText,
          createdAt: Date.now(),
        });
        alert("Note saved!");
      }}
    >
      <Text style={styles.scanText}>💾 Save Note</Text>
    </TouchableOpacity>
  </View>
)}

    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  topicBox: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    zIndex: 10,
  },
  topicInput: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    elevation: 2,
  },

  bottomPanel: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    alignItems: "center",
  },
  scanButton: {
    backgroundColor: "#16a34a",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  scanText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  resultBox: {
    position: "absolute",
    top: 70,
    left: 10,
    right: 10,
    maxHeight: "35%",
    backgroundColor: "rgba(0,0,0,0.75)",
    padding: 12,
    borderRadius: 8,
  },
  resultText: {
    color: "white",
    fontSize: 14,
  },
});
