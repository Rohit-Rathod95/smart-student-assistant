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
        <Text>Loading note...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.container}>
        {/* TOP ACTION BUTTONS */}
        <View style={styles.actionRow}>
          {!isEditing ? (
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.btnText}>✏️ Edit</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.saveBtn} onPress={saveEdits}>
              <Text style={styles.btnText}>💾 Save</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.deleteBtn} onPress={deleteNote}>
            <Text style={styles.btnText}>🗑 Delete</Text>
          </TouchableOpacity>
        </View>

        {/* NOTE CONTENT */}
        {isEditing ? (
          <TextInput
            value={editTopic}
            onChangeText={setEditTopic}
            style={[styles.topic, styles.editInput]}
          />
        ) : (
          <Text style={styles.topic}>{note.topic}</Text>
        )}

        <Text style={styles.date}>
          {new Date(note.createdAt).toLocaleString()}
        </Text>

        <View style={styles.contentBox}>
          {isEditing ? (
            <TextInput
              value={editContent}
              onChangeText={setEditContent}
              multiline
              style={[styles.content, styles.editContent]}
            />
          ) : (
            <Text style={styles.content}>{note.content}</Text>
          )}
        </View>

        {/* 🔥 QUICK AI BUTTONS */}
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
            <Text style={styles.quickText}>📌 Important</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() =>
              sendQuickPrompt("Create 5 MCQs with answers from these notes.")
            }
          >
            <Text style={styles.quickText}>❓ MCQs</Text>
          </TouchableOpacity>
        </View>

        {/* CHAT SECTION */}
        <View style={styles.chatBox}>
          <Text style={styles.chatTitle}>🧠 Ask your notes</Text>

          {messages.length === 0 && (
            <Text style={styles.chatHint}>
              Ask anything about this note, e.g.:
              {"\n"}• Explain this in simple words
              {"\n"}• What is important for exam?
              {"\n"}• Give me 5 MCQs
            </Text>
          )}

          {messages.map((m, i) => (
            <View
              key={i}
              style={[
                styles.messageBubble,
                m.role === "user" ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <Text>{m.text}</Text>
            </View>
          ))}

          {loadingAI && (
            <View style={{ marginTop: 8 }}>
              <ActivityIndicator />
            </View>
          )}
        </View>
      </ScrollView>

      {/* INPUT BAR */}
      <View style={styles.inputBar}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask something about this note..."
          style={styles.input}
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendQuestion}
          disabled={loadingAI}
        >
          <Text style={styles.sendText}>Send</Text>
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
  },
  container: {
    flex: 1,
    padding: 16,
  },

  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },

  editBtn: {
    backgroundColor: "#2563eb",
    padding: 10,
    borderRadius: 8,
  },
  saveBtn: {
    backgroundColor: "#16a34a",
    padding: 10,
    borderRadius: 8,
  },
  deleteBtn: {
    backgroundColor: "#dc2626",
    padding: 10,
    borderRadius: 8,
  },

  btnText: {
    color: "#fff",
    fontWeight: "600",
  },

  topic: {
    fontSize: 24,
    fontWeight: "bold",
  },

  editInput: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },

  date: {
    marginTop: 4,
    color: "#64748b",
  },

  contentBox: {
    marginTop: 16,
    backgroundColor: "#f1f5f9",
    padding: 16,
    borderRadius: 8,
  },

  content: {
    fontSize: 16,
    lineHeight: 22,
  },

  editContent: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
  },

  // 🔥 Quick buttons styles
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },

  quickBtn: {
    backgroundColor: "#0ea5e9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },

  quickText: {
    color: "#fff",
    fontWeight: "600",
  },

  chatBox: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: "#e2e8f0",
  },

  chatTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },

  chatHint: {
    color: "#64748b",
    marginBottom: 12,
  },

  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 4,
    maxWidth: "85%",
  },

  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
  },

  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#EEE",
  },

  inputBar: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
    alignItems: "flex-end",
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    maxHeight: 120,
  },

  sendButton: {
    marginLeft: 8,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },

  sendText: {
    color: "#fff",
    fontWeight: "600",
  },
});
