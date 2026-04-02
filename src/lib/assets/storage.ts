import type { AvatarAssetRecord } from "@/lib/types";

const STORAGE_EVENT = "tangshi-cup:avatar-assets-change";
const DATABASE_NAME = "tangshi-cup-assets";
const DATABASE_VERSION = 1;
const STORE_NAME = "avatar-assets";

export type AvatarAssetsSnapshot = Record<string, AvatarAssetRecord>;

const EMPTY_SNAPSHOT: AvatarAssetsSnapshot = {};

let avatarAssetsCache: {
  raw: string;
  value: AvatarAssetsSnapshot;
} = {
  raw: "{}",
  value: EMPTY_SNAPSHOT,
};

let memoryAssets: AvatarAssetsSnapshot = EMPTY_SNAPSHOT;
let loadPromise: Promise<AvatarAssetsSnapshot> | null = null;
let didAttemptInitialLoad = false;

function canUseBrowser() {
  return typeof window !== "undefined";
}

function canUseIndexedDb() {
  return typeof indexedDB !== "undefined";
}

function sortEntries(snapshot: AvatarAssetsSnapshot) {
  return Object.entries(snapshot).sort(([leftId], [rightId]) => leftId.localeCompare(rightId));
}

function buildRawSnapshot(snapshot: AvatarAssetsSnapshot) {
  return JSON.stringify(sortEntries(snapshot));
}

function setAvatarAssetsSnapshot(snapshot: AvatarAssetsSnapshot) {
  const raw = buildRawSnapshot(snapshot);

  if (raw === avatarAssetsCache.raw) {
    return avatarAssetsCache.value;
  }

  const nextSnapshot = Object.freeze(
    Object.fromEntries(sortEntries(snapshot).map(([assetId, asset]) => [assetId, Object.freeze({ ...asset })])),
  ) as AvatarAssetsSnapshot;

  avatarAssetsCache = {
    raw,
    value: nextSnapshot,
  };
  memoryAssets = nextSnapshot;

  if (canUseBrowser()) {
    window.dispatchEvent(new Event(STORAGE_EVENT));
  }

  return nextSnapshot;
}

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("无法打开头像资源存储"));
  });
}

function readAllAvatarAssetsFromIndexedDb() {
  return new Promise<AvatarAssetsSnapshot>(async (resolve, reject) => {
    try {
      const database = await openDatabase();
      const transaction = database.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const assets = (request.result as AvatarAssetRecord[]) ?? [];
        resolve(
          assets.reduce<AvatarAssetsSnapshot>((accumulator, asset) => {
            accumulator[asset.id] = asset;
            return accumulator;
          }, {}),
        );
        database.close();
      };

      request.onerror = () => {
        database.close();
        reject(request.error ?? new Error("无法读取头像资源"));
      };
    } catch (error) {
      reject(error);
    }
  });
}

function saveAvatarAssetToIndexedDb(asset: AvatarAssetRecord) {
  return new Promise<void>(async (resolve, reject) => {
    try {
      const database = await openDatabase();
      const transaction = database.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      transaction.oncomplete = () => {
        database.close();
        resolve();
      };
      transaction.onerror = () => {
        database.close();
        reject(transaction.error ?? new Error("无法保存头像资源"));
      };
      transaction.onabort = () => {
        database.close();
        reject(transaction.error ?? new Error("头像资源保存已中断"));
      };

      store.put(asset);
    } catch (error) {
      reject(error);
    }
  });
}

export function getAvatarAssetsSnapshot() {
  return avatarAssetsCache.value;
}

export async function loadAvatarAssets() {
  if (!canUseBrowser()) {
    return getAvatarAssetsSnapshot();
  }

  if (didAttemptInitialLoad) {
    return loadPromise ?? getAvatarAssetsSnapshot();
  }

  didAttemptInitialLoad = true;

  if (!canUseIndexedDb()) {
    return setAvatarAssetsSnapshot(memoryAssets);
  }

  loadPromise = readAllAvatarAssetsFromIndexedDb()
    .then((assets) => setAvatarAssetsSnapshot(assets))
    .finally(() => {
      loadPromise = null;
    });

  return loadPromise;
}

export async function saveAvatarAsset(asset: AvatarAssetRecord) {
  await loadAvatarAssets();

  const nextSnapshot = {
    ...memoryAssets,
    [asset.id]: asset,
  };

  if (canUseBrowser() && canUseIndexedDb()) {
    await saveAvatarAssetToIndexedDb(asset);
  }

  return setAvatarAssetsSnapshot(nextSnapshot)[asset.id];
}

export function subscribeAssetStorage(onChange: () => void) {
  if (!canUseBrowser()) {
    return () => {};
  }

  const handleChange = () => {
    onChange();
  };

  window.addEventListener(STORAGE_EVENT, handleChange);

  return () => {
    window.removeEventListener(STORAGE_EVENT, handleChange);
  };
}
