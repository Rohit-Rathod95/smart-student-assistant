import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "DAILY_TASKS";

export type Task = {
  id: string;
  text: string;
  done: boolean;
};

export async function saveTasks(tasks: Task[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export async function loadTasks(): Promise<Task[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export async function clearTasks() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
