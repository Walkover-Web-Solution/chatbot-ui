import createWebStorage from "redux-persist/es/storage/createWebStorage";

type Storage = {
  getItem: (key: string) => Promise<null>;
  setItem: (key: string, value: any) => Promise<any>;
  removeItem: (key: string) => Promise<void>;
};

const createNoopStorage = (): Storage => ({
  getItem: (_key: string) => Promise.resolve(null),
  setItem: (_key: string, value: any) => Promise.resolve(value),
  removeItem: (_key: string) => Promise.resolve(),
});

const createStorage = () => {
  if (typeof window === "undefined") return createNoopStorage();
  return {
    local: createWebStorage("local"),
    session: createWebStorage("session"),
  };
};

export const STORAGE_OPTIONS = createStorage();