const getStorage = (): globalThis.Storage => {
  return globalThis.sessionStorage;
}

const isSupported = (): boolean => !!getStorage();

const get = (key: string): string | undefined => {
  const val = getStorage().getItem(key);

  if (val !== null)
    return val;

  return;
}

const getObject = <T>(key: string): T | undefined => {
  const val = get(key);
  if (val)
    return JSON.parse(val);

  return;
}

const set = (key: string, value: any): void => {
  if (typeof value === 'object')
    value = JSON.stringify(value);

  getStorage().setItem(key, value);
}

export const Storage = {
  isSupported,
  get,
  getObject,
  set,
};