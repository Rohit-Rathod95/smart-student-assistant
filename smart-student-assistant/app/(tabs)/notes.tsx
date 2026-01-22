import { View, Text, FlatList, StyleSheet, TextInput } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { getNotes, Note } from "../services/notesStorage";

export default function NotesScreen() {
  const router = useRouter();

  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [])
  );

  const loadNotes = async () => {
    const notes = await getNotes();
    setAllNotes(notes);
    setFilteredNotes(notes);
  };

  function onSearch(text: string) {
    setSearch(text);

    if (!text.trim()) {
      setFilteredNotes(allNotes);
      return;
    }

    const lower = text.toLowerCase();

    const filtered = allNotes.filter(
      (n) =>
        n.topic.toLowerCase().includes(lower) ||
        n.content.toLowerCase().includes(lower)
    );

    setFilteredNotes(filtered);
  }

  function openNote(note: Note) {
    router.push(`/notes/${note.id}`);
  }

  return (
    <View style={styles.container}>
      {/* SEARCH BAR */}
      <TextInput
        placeholder="Search notes..."
        value={search}
        onChangeText={onSearch}
        style={styles.search}
      />

      {/* NOTES LIST */}
      {filteredNotes.length === 0 ? (
        <Text style={styles.empty}>No notes found.</Text>
      ) : (
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.noteCard} onTouchEnd={() => openNote(item)}>
              <Text style={styles.topic}>{item.topic}</Text>
              <Text style={styles.preview} numberOfLines={2}>
                {item.content}
              </Text>
              <Text style={styles.date}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  search: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },

  noteCard: {
    backgroundColor: "#f1f5f9",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  topic: {
    fontSize: 18,
    fontWeight: "600",
  },

  preview: {
    marginTop: 4,
    color: "#000000",
  },

  date: {
    marginTop: 6,
    fontSize: 12,
    color: "#64748b",
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#64748b",
  },
});
