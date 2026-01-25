import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { useEffect, useRef, useState } from "react";
import { Camera, useCameraDevice, useCameraPermission } from "react-native-vision-camera";
import TextRecognition from "@react-native-ml-kit/text-recognition";
import { cleanNotesWithGemini } from "../services/gemini";
import { saveNote } from "../services/notesStorage";
import { Colors, Shadows, Spacing, Typography, Gradients } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { GradientButton } from "../../components/ui/GradientButton";
import { Card } from "../../components/ui/Card";
import Animated, { FadeInDown } from "react-native-reanimated";


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
      <LinearGradient colors={Gradients.background} style={styles.fullScreen}>
        <View style={styles.center}>
          <View style={styles.iconContainer}>
            <Ionicons name="camera-outline" size={64} color={Colors.light.primary} />
          </View>
          <Text style={styles.title}>Camera Permission Required</Text>
          <Text style={styles.subtitle}>We need access to your camera to scan notes</Text>
          <GradientButton
            title="Grant Permission"
            icon="camera"
            onPress={requestPermission}
            variant="primary"
            style={styles.permissionButton}
          />
        </View>
      </LinearGradient>
    );
  }

  if (device == null) {
    return (
      <LinearGradient colors={Gradients.background} style={styles.fullScreen}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading camera...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      {/* Topic Input - Floating Card */}
      <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.topicBox}>
        <Card variant="elevated" style={styles.topicCard}>
          <View style={styles.topicHeader}>
            <Ionicons name="document-text" size={20} color={Colors.light.primary} />
            <Text style={styles.topicLabel}>Topic</Text>
          </View>
          <TextInput
            placeholder="e.g. DBMS, ML Kit, OS..."
            placeholderTextColor={Colors.light.textLight}
            value={topic}
            onChangeText={setTopic}
            style={styles.topicInput}
          />
        </Card>
      </Animated.View>

      {/* Camera Preview */}
      <Camera
        ref={cameraRef}
        style={styles.camera}
        device={device}
        isActive={true}
        photo={true}
      />

      {/* Scan Button */}
      <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.bottomPanel}>
        <GradientButton
          title={loading ? "Scanning..." : "Scan & Clean Notes"}
          icon={loading ? undefined : "scan"}
          onPress={scanText}
          disabled={loading || !topic.trim()}
          variant="secondary"
          style={styles.scanButton}
        />
      </Animated.View>

      {/* OCR Result */}
      {recognizedText.length > 0 && (
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.resultBox}>
          <Card variant="elevated" style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Ionicons name="document-text" size={18} color={Colors.light.textSecondary} />
              <Text style={styles.resultTitle}>Raw OCR Text</Text>
            </View>
            <ScrollView style={styles.resultScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.resultText}>{recognizedText}</Text>
            </ScrollView>
          </Card>
        </Animated.View>
      )}

      {/* AI Result */}
      {aiText.length > 0 && (
        <Animated.View entering={FadeInDown.delay(400).springify()} style={[styles.resultBox, styles.aiResultBox]}>
          <Card variant="elevated" style={StyleSheet.flatten([styles.resultCard, styles.aiResultCard])}>
            <View style={styles.resultHeader}>
              <LinearGradient
                colors={Gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.aiBadge}
              >
                <Ionicons name="sparkles" size={16} color="white" />
                <Text style={styles.aiBadgeText}>AI Cleaned</Text>
              </LinearGradient>
            </View>
            <ScrollView style={styles.resultScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.resultText}>{aiText}</Text>
            </ScrollView>
          </Card>
        </Animated.View>
      )}

      {/* Save Button */}
      {aiText.length > 0 && (
        <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.saveButtonContainer}>
          <GradientButton
            title="Save Note"
            icon="save"
            onPress={async () => {
              await saveNote({
                id: Date.now().toString(),
                topic: topic,
                content: aiText,
                createdAt: Date.now(),
              });
              alert("Note saved!");
            }}
            variant="primary"
            style={styles.saveButton}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  fullScreen: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.light.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.l,
  },
  title: {
    ...Typography.header,
    fontSize: 24,
    marginBottom: Spacing.s,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    color: Colors.light.textSecondary,
  },
  loadingText: {
    ...Typography.body,
    marginTop: Spacing.m,
    color: Colors.light.textSecondary,
  },
  permissionButton: {
    marginTop: Spacing.m,
    minWidth: 200,
  },
  camera: {
    flex: 1,
  },
  topicBox: {
    position: "absolute",
    top: Spacing.xl,
    left: Spacing.m,
    right: Spacing.m,
    zIndex: 10,
  },
  topicCard: {
    padding: Spacing.m,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s,
    marginBottom: Spacing.s,
  },
  topicLabel: {
    ...Typography.label,
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  topicInput: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '500',
    paddingVertical: Spacing.xs,
  },
  bottomPanel: {
    position: "absolute",
    bottom: Spacing.xl*3,
    left: Spacing.m,
    right: Spacing.m,
    zIndex: 10,
  },
  scanButton: {
    width: '100%',
  },
  resultBox: {
    position: "absolute",
    top: 140,
    left: Spacing.m,
    right: Spacing.m,
    maxHeight: "38%",
    zIndex: 5,
  },
  aiResultBox: {
    top: "50%",
    maxHeight: "35%",
  },
  resultCard: {
    padding: Spacing.m,
  },
  aiResultCard: {
    borderWidth: 2,
    borderColor: Colors.light.primary + '30',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s,
    marginBottom: Spacing.m,
  },
  resultTitle: {
    ...Typography.subheader,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    ...Shadows.small,
  },
  aiBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  resultScroll: {
    maxHeight: 200,
  },
  resultText: {
    ...Typography.body,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.light.text,
  },
  saveButtonContainer: {
    position: "absolute",
    bottom: 100,
    left: Spacing.m,
    right: Spacing.m,
    zIndex: 10,
  },
  saveButton: {
    width: '100%',
  },
});