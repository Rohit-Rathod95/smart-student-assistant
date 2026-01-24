import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { getNotes, Note } from "../services/notesStorage";
import { Colors, Shadows, Spacing, Typography } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";

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
      <View style={styles.header}>
        <Text style={styles.title}>My Notes</Text>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.light.textLight} style={styles.searchIcon} />
        <TextInput
          placeholder="Search notes..."
          placeholderTextColor={Colors.light.textLight}
          value={search}
          onChangeText={onSearch}
          style={styles.input}
        />
      </View>

      {/* NOTES LIST */}
      {filteredNotes.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={48} color={Colors.light.gray200} />
          <Text style={styles.emptyText}>No notes found{search ? " matching your search" : ""}.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.noteCard}
              onPress={() => openNote(item)}
            >
              <View style={styles.noteHeader}>
                <Text style={styles.topic}>{item.topic}</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.light.textLight} />
              </View>
              <Text style={styles.preview} numberOfLines={2}>
                {item.content}
              </Text>
              <View style={styles.footer}>
                <Text style={styles.date}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>Note</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.m,
    backgroundColor: Colors.light.background,
  },
  header: {
    marginBottom: Spacing.m,
    marginTop: Spacing.m,
  },
  title: {
    ...Typography.header,
    fontSize: 28,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s, // 8
    marginBottom: Spacing.l,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchIcon: {
    marginRight: Spacing.s,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    height: 40,
  },
  noteCard: {
    backgroundColor: Colors.light.surface,
    padding: Spacing.m,
    borderRadius: 16,
    marginBottom: Spacing.m,
    ...Shadows.small,
    borderWidth: 1,
    borderColor: Colors.light.gray100,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  topic: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.text,
  },
  preview: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.m,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.textLight,
  },
  tag: {
    backgroundColor: Colors.light.gray100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
  },
  emptyState: {
    alignItems: "center",
    marginTop: 60,
    gap: Spacing.m,
  },
  emptyText: {
    color: Colors.light.textSecondary,
    fontSize: 16,
  }
});
