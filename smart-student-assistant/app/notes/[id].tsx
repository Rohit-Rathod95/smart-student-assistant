import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  getNotes,
  Note,
  updateNote,
  deleteNoteById,
} from "../services/notesStorage";
import { askNoteQuestion } from "../services/notesQA";
import { Colors, Shadows, Spacing, Typography } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";

type Message = {
  role: "user" | "ai";
  text: string;
};

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [note, setNote] = useState<Note | null>(null);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editTopic, setEditTopic] = useState("");
  const [editContent, setEditContent] = useState("");

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    loadNote();
  }, []);

  const loadNote = async () => {
    const allNotes = await getNotes();
    const found = allNotes.find((n) => n.id === id);
    if (found) {
      setNote(found);
      setEditTopic(found.topic);
      setEditContent(found.content);
    }
  };

  async function saveEdits() {
    if (!note) return;

    const updated: Note = {
      ...note,
      topic: editTopic,
      content: editContent,
    };

    await updateNote(updated);
    setNote(updated);
    setIsEditing(false);
  }

  async function deleteNote() {
    if (!note) return;
    await deleteNoteById(note.id);
    router.back();
  }

  async function sendQuestion() {
    if (!input.trim() || !note || loadingAI) return;

    const question = input.trim();

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setLoadingAI(true);

    try {
      const answer = await askNoteQuestion(note.content, question);
      setMessages((prev) => [...prev, { role: "ai", text: answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "❌ Error talking to AI. Try again." },
      ]);
    } finally {
      setLoadingAI(false);
    }
  }

  // 🔥 NEW: Quick AI buttons handler
  async function sendQuickPrompt(promptText: string) {
    if (!note || loadingAI) return;

    setMessages((prev) => [...prev, { role: "user", text: promptText }]);
    setLoadingAI(true);

    try {
      const answer = await askNoteQuestion(note.content, promptText);
      setMessages((prev) => [...prev, { role: "ai", text: answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "❌ Error talking to AI. Try again." },
      ]);
    } finally {
      setLoadingAI(false);
    }
  }

  if (!note) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={{ marginTop: 10, color: Colors.light.textSecondary }}>Loading note...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.light.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* TOP ACTION BUTTONS */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            {!isEditing ? (
              <TouchableOpacity
                style={[styles.btn, styles.editBtn]}
                onPress={() => setIsEditing(true)}
              >
                <Ionicons name="pencil" size={16} color="white" />
                <Text style={styles.btnText}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={saveEdits}>
                <Ionicons name="save" size={16} color="white" />
                <Text style={styles.btnText}>Save</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={[styles.btn, styles.deleteBtn]} onPress={deleteNote}>
              <Ionicons name="trash" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* NOTE CONTENT */}
        {isEditing ? (
          <TextInput
            value={editTopic}
            onChangeText={setEditTopic}
            style={[styles.topic, styles.editInput]}
            placeholder="Topic"
          />
        ) : (
          <Text style={styles.topic}>{note.topic}</Text>
        )}

        <Text style={styles.date}>
          Created: {new Date(note.createdAt).toLocaleString()}
        </Text>

        <View style={styles.contentBox}>
          {isEditing ? (
            <TextInput
              value={editContent}
              onChangeText={setEditContent}
              multiline
              textAlignVertical="top"
              style={[styles.content, styles.editContent]}
              placeholder="Start typing your note here..."
            />
          ) : (
            <Text style={styles.content}>{note.content}</Text>
          )}
        </View>

        {/* 🔥 QUICK AI BUTTONS */}
        <Text style={styles.sectionHeader}>✨ AI Actions</Text>
        <View style={styles.quickRow}>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() =>
              sendQuickPrompt("Summarize these notes in simple words.")
            }
          >
            <Text style={styles.quickText}>🧠 Summarize</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() =>
              sendQuickPrompt(
                "List the most important points for exam from these notes."
              )
            }
          >
            <Text style={styles.quickText}>📌 Important Points</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() =>
              sendQuickPrompt("Create 5 MCQs with answers from these notes.")
            }
          >
            <Text style={styles.quickText}>❓ Generate MCQs</Text>
          </TouchableOpacity>
        </View>

        {/* CHAT SECTION */}
        <View style={styles.chatBox}>
          <Text style={styles.chatTitle}>💬 Ask your notes</Text>

          {messages.length === 0 && (
            <View style={styles.emptyChat}>
              <Ionicons name="chatbubbles-outline" size={32} color={Colors.light.textLight} />
              <Text style={styles.chatHint}>
                Ask me anything about this note!
              </Text>
            </View>
          )}

          {messages.map((m, i) => (
            <View
              key={i}
              style={[
                styles.messageBubble,
                m.role === "user" ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <Text style={m.role === 'user' ? styles.userText : styles.aiText}>{m.text}</Text>
            </View>
          ))}

          {loadingAI && (
            <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ActivityIndicator size="small" color={Colors.light.primary} />
              <Text style={{ color: Colors.light.textSecondary, fontSize: 12 }}>Thinking...</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* INPUT BAR */}
      <View style={styles.inputBar}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask something..."
          placeholderTextColor={Colors.light.textLight}
          style={styles.input}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, loadingAI && { opacity: 0.5 }]}
          onPress={sendQuestion}
          disabled={loadingAI}
        >
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.background,
  },
  container: {
    flex: 1,
    padding: Spacing.m,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.l,
    marginTop: Spacing.s,
  },
  backBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.surface,
    ...Shadows.small,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    ...Shadows.small,
  },
  editBtn: {
    backgroundColor: Colors.light.primary,
  },
  saveBtn: {
    backgroundColor: Colors.light.success,
  },
  deleteBtn: {
    backgroundColor: Colors.light.danger,
    paddingHorizontal: 12,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  topic: {
    ...Typography.header,
    fontSize: 26,
    marginBottom: 4,
  },
  editInput: {
    borderBottomWidth: 2,
    borderColor: Colors.light.primary,
    paddingVertical: 4,
  },
  date: {
    ...Typography.caption,
    marginBottom: Spacing.m,
  },
  contentBox: {
    backgroundColor: Colors.light.surface,
    padding: Spacing.m,
    borderRadius: 16,
    minHeight: 150,
    ...Shadows.small,
  },
  content: {
    ...Typography.body,
    fontSize: 16,
    lineHeight: 24,
  },
  editContent: {
    minHeight: 150,
    textAlignVertical: 'top',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.text,
    marginTop: Spacing.xl,
    marginBottom: Spacing.m,
  },
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  quickBtn: {
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  quickText: {
    color: Colors.light.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  chatBox: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.m,
    borderTopWidth: 1,
    borderColor: Colors.light.border,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.m,
    color: Colors.light.text,
  },
  emptyChat: {
    alignItems: 'center',
    gap: 8,
    marginVertical: 20,
    opacity: 0.7,
  },
  chatHint: {
    color: Colors.light.textSecondary,
    fontSize: 14,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: "85%",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: Colors.light.primary,
    borderBottomRightRadius: 2,
  },
  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: Colors.light.surface,
    borderBottomLeftRadius: 2,
    ...Shadows.small,
  },
  userText: {
    color: "white",
    fontSize: 15,
  },
  aiText: {
    color: Colors.light.text,
    fontSize: 15,
  },
  inputBar: {
    flexDirection: "row",
    padding: Spacing.m,
    borderTopWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
    alignItems: "flex-end",
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    color: Colors.light.text,
  },
  sendButton: {
    backgroundColor: Colors.light.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
});
