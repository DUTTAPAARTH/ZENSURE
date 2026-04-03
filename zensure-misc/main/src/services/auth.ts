import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveToken = (token: string) => AsyncStorage.setItem('zensure_token', token);

export const getToken = () => AsyncStorage.getItem('zensure_token');

export const saveWorker = (worker: unknown) =>
  AsyncStorage.setItem('zensure_worker', JSON.stringify(worker));

export const getWorker = async <T>() => {
  const data = await AsyncStorage.getItem('zensure_worker');
  return data ? (JSON.parse(data) as T) : null;
};

export const clearAuth = () => AsyncStorage.multiRemove(['zensure_token', 'zensure_worker']);

export const isLoggedIn = async () => {
  const token = await AsyncStorage.getItem('zensure_token');
  return !!token;
};
