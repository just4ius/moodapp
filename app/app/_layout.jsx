import { StatusBar } from 'expo-status-bar'
import { Stack } from 'expo-router'
import { AppProvider, useAppTheme } from '../context/AppContext'

const AppStack = () => {
  const { theme, themeMode } = useAppTheme()
  
  return (
    <>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.textPrimary,
        headerTitleStyle: { fontWeight: 'bold' },
      }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="Home" options={{ headerShown: false }} />
        <Stack.Screen name="Statistics" options={{ title: 'Статистика' }} />
        <Stack.Screen name="Meditation" options={{ title: 'Медитація' }} />
        <Stack.Screen name="Advice" options={{ title: 'Поради' }} />
        <Stack.Screen name="Profile" options={{ title: 'Профіль' }} />
        <Stack.Screen name="Chat" options={{ title: 'MoodAI' }} />
      </Stack>
    </>
  )
}

export default function RootLayout() {
  return (
    <AppProvider>
      <AppStack />
    </AppProvider>
  )
}