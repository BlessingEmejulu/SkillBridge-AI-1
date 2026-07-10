import { get, set } from 'idb-keyval';

export async function saveToDB(key: string, value: any) {
  try {
    await set(key, value);
  } catch (err) {
    console.error('Failed to save to IndexedDB', err);
  }
}

export async function loadFromDB(key: string, defaultValue: any) {
  try {
    const val = await get(key);
    return val !== undefined ? val : defaultValue;
  } catch (err) {
    console.error('Failed to load from IndexedDB', err);
    return defaultValue;
  }
}
