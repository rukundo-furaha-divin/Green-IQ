import * as SecureStore from 'expo-secure-store';

export const saveUser = async (user) => {
  await SecureStore.setItemAsync('user', JSON.stringify(user));
};

export const getUser = async () => {
  const user = await SecureStore.getItemAsync('user');
  return user ? JSON.parse(user) : null;
};