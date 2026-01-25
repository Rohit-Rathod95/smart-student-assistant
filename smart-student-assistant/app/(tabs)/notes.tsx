import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { getNotes, Note } from "../services/notesStorage";
import { Colors, Shadows, Spacing, Typography } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import { GradientBackground } from "../../components/ui/GradientBackground";
import { SearchBar } from "../../components/ui/SearchBar";
import { Card } from "../../components/ui/Card";

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
    <GradientBackground>
      <View style={styles.container}>
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <Text style={styles.title}>My Notes</Text>
        </Animated.View>

        {/* FLOATING SEARCH BAR - Below title, in content area */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.searchWrapper}>
          <SearchBar
            value={search}
            onChangeText={onSearch}
            placeholder="Search notes..."
          />
        </Animated.View>

        {/* NOTES LIST */}
        {filteredNotes.length === 0 ? (
          <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.emptyState}>
            <View style={styles.emptyCard}>
              <Ionicons name="document-text-outline" size={56} color={Colors.light.textLight} />
              <Text style={styles.emptyText}>
                {search ? "No notes found matching your search" : "No notes yet"}
              </Text>
              <Text style={styles.emptySubtext}>
                {search ? "Try a different search term" : "Start scanning to create your first note!"}
              </Text>
            </View>
          </Animated.View>
        ) : (
          <FlatList
            data={filteredNotes}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInDown.delay(300 + index * 50).springify()} layout={Layout.springify()}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.noteCard}
                  onPress={() => openNote(item)}
                >
                  <View style={styles.noteHeader}>
                    <View style={styles.topicContainer}>
                      <Ionicons name="document-text" size={18} color={Colors.light.primary} style={styles.topicIcon} />
                      <Text style={styles.topic}>{item.topic}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={Colors.light.textLight} />
                  </View>
                  <Text style={styles.preview} numberOfLines={2}>
                    {item.content}
                  </Text>
                  <View style={styles.footer}>
                    <View style={styles.dateContainer}>
                      <Ionicons name="time-outline" size={12} color={Colors.light.textLight} />
                      <Text style={styles.date}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>Note</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            )}
          />
        )}
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.m,
  },
  header: {
    marginBottom: Spacing.l,
    marginTop: Spacing.xl,
  },
  title: {
    ...Typography.header,
    fontSize: 32,
    letterSpacing: -0.8,
  },
  searchWrapper: {
    marginBottom: Spacing.l,
  },
  noteCard: {
    backgroundColor: Colors.light.surface,
    padding: Spacing.l,
    borderRadius: 20,
    marginBottom: Spacing.m,
    ...Shadows.medium,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.s,
  },
  topicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  topicIcon: {
    marginRight: Spacing.s,
  },
  topic: {
    fontSize: 19,
    fontWeight: "700",
    color: Colors.light.text,
    flex: 1,
    letterSpacing: -0.3,
  },
  preview: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.m,
    marginLeft: 30, // Align with topic text (icon + margin)
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.textLight,
  },
  tag: {
    backgroundColor: Colors.light.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
  emptyCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 24,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadows.small,
    borderWidth: 1,
    borderColor: Colors.light.border,
    width: '100%',
  },
  emptyText: {
    color: Colors.light.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: Spacing.m,
    textAlign: 'center',
  },
  emptySubtext: {
    color: Colors.light.textSecondary,
    fontSize: 14,
    marginTop: Spacing.s,
    textAlign: 'center',
  }
});
