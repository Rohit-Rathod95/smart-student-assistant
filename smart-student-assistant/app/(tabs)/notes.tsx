import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { getNotes, Note } from "../services/notesStorage";
import { router } from "expo-router";


export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [])
  );

  const loadNotes = async () => {
    const data = await getNotes();
    setNotes(data);
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={styles.title}>📚 Your Notes</Text>

      {notes.length === 0 ? (
        <Text style={{ marginTop: 20 }}>No notes saved yet.</Text>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
  style={styles.card}
  onPress={() => router.push(`/notes/${item.id}`)}
>
              <Text style={styles.topic}>{item.topic}</Text>
              <Text numberOfLines={3} style={styles.preview}>
                {item.content}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#f1f5f9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  topic: {
    fontSize: 16,
    fontWeight: "bold",
  },
  preview: {
    marginTop: 4,
    color: "#334155",
  },
});
