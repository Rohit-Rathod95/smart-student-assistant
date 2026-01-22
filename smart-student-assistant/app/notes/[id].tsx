import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { getNotes, Note } from "../services/notesStorage";

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [note, setNote] = useState<Note | null>(null);

  useEffect(() => {
    loadNote();
  }, []);

  const loadNote = async () => {
    const allNotes = await getNotes();
    const found = allNotes.find((n) => n.id === id);
    if (found) setNote(found);
  };

  if (!note) {
    return (
      <View style={styles.center}>
        <Text>Loading note...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.topic}>{note.topic}</Text>
      <Text style={styles.date}>
        {new Date(note.createdAt).toLocaleString()}
      </Text>

      <View style={styles.contentBox}>
        <Text style={styles.content}>{note.content}</Text>
      </View>
    </ScrollView>
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
  topic: {
    fontSize: 24,
    fontWeight: "bold",
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
});
