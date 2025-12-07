import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Colors';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system');
  const [user, setUser] = useState({ email: '...', name: 'Гість', profilePhoto: null });
  const [isThemeLoading, setIsThemeLoading] = useState(false);

  useEffect(() => {
    loadSettings();
    fetchUserProfile();
  }, []);

  const loadSettings = async () => {
    const savedTheme = await AsyncStorage.getItem('themeMode');
    if (savedTheme) setThemeMode(savedTheme);
  };

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken')

      if (!token) {
        console.log("Токен відсутній. Перериваємо виконання.")
        return
      }

      const url = 'http://192.168.31.42:5051/api/User/me'

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.status === 401) {
            await AsyncStorage.removeItem('jwtToken')
            setUser(null)
            alert("Ваша сесія закінчилась. Будь ласка, увійдіть знову.")
            return
        }

      if (response.ok) {
        const data = await response.json()
        setUser(data)
      } else {
        const errorText = await response.text()
      }
    } catch (e) {
      console.error("КРИТИЧНА ПОМИЛКА fetchUserProfile:", e)
      alert("Помилка оновлення профілю: " + e.message)
    }
  }

  const updateTheme = async (mode) => {
    setIsThemeLoading(true);

    setTimeout(async () => {
      setThemeMode(mode);
      await AsyncStorage.setItem('themeMode', mode);
      setIsThemeLoading(false);
    }, 600);
  };

  const updateUser = async (updatedData) => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const response = await fetch('http://192.168.31.42:5051/api/User/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const activeScheme = themeMode === 'system' ? systemScheme : themeMode;
  const theme = Colors[activeScheme] ?? Colors.light;

  return (
    <AppContext.Provider value={{
      theme,
      themeMode,
      updateTheme,
      user,
      fetchUserProfile,
      updateUser,
      isThemeLoading
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppTheme = () => useContext(AppContext);