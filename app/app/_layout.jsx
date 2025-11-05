import { StatusBar, StyleSheet, useColorScheme } from 'react-native'
import { Stack } from 'expo-router'
import { Colors } from '../constants/Colors'

const RootLayout = () => {
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light

  return (
    <>
      <StatusBar value="auto" />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="Home" options={{ headerShown: false }} />

        <Stack.Screen
          name="Statistics"
          options={{
            title: 'Статистика',
            headerShown: true
          }}
        />
        <Stack.Screen
          name="Meditation"
          options={{
            title: 'Медитація',
            headerShown: true
          }}
        />
        <Stack.Screen
          name="Advice"
          options={{
            title: 'Поради',
            headerShown: true
          }}
        />
        <Stack.Screen
          name="Profile"
          options={{
            title: 'Профіль',
            headerShown: true
          }}
        />
        <Stack.Screen
          name="Chat"
          options={{
            title: 'MoodAI',
            headerShown: true
          }}
        />
      </Stack>
    </>
  )
}

export default RootLayout

const styles = StyleSheet.create({})