const DB_NAME = 'bronze-ware-particle-cache';
const STORE_NAME = 'samples';

function openCache() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return resolve(null);
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function readParticleCache(key) {
  try {
    const db = await openCache();
    if (!db) return null;
    return await new Promise((resolve, reject) => {
      const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key);
      request.onsuccess = () => resolve(request.result ? new Float32Array(request.result) : null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.debug('Particle cache read skipped:', error);
    return null;
  }
}

export async function writeParticleCache(key, positions) {
  try {
    const db = await openCache();
    if (!db) return;
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(positions.buffer.slice(0), key);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.debug('Particle cache write skipped:', error);
  }
}
