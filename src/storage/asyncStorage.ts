import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Generic Storage Helpers ─────────────────────────────────────────────────

export async function storeData<T>(key: string, value: T): Promise<void> {
  try {
    const json = JSON.stringify(value, (_k, v) => {
      // Serialize Dates to ISO strings
      if (v instanceof Date) return { __type: 'Date', value: v.toISOString() };
      return v;
    });
    await AsyncStorage.setItem(key, json);
  } catch (error) {
    console.error(`[AsyncStorage] storeData error for key "${key}":`, error);
    throw error;
  }
}

export async function getData<T>(key: string): Promise<T | null> {
  try {
    const json = await Promise.race([
      AsyncStorage.getItem(key),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error('AsyncStorage timeout')), 2000))
    ]);
    if (json === null) return null;
    return JSON.parse(json as string, (_k, v) => {
      // Deserialize Dates
      if (v && typeof v === 'object' && v.__type === 'Date') {
        return new Date(v.value);
      }
      return v;
    }) as T;
  } catch (error) {
    console.error(`[AsyncStorage] getData error for key "${key}":`, error);
    return null;
  }
}

export async function removeData(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`[AsyncStorage] removeData error for key "${key}":`, error);
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('[AsyncStorage] clearAllData error:', error);
  }
}

export async function getAllKeys(): Promise<readonly string[]> {
  try {
    return await AsyncStorage.getAllKeys();
  } catch {
    return [];
  }
}
