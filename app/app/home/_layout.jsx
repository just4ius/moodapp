import { Tabs } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Colors } from '../../constants/Colors'
import { useColorScheme, Image } from 'react-native'
import * as NavigationBar from 'expo-navigation-bar'
import { useEffect } from 'react'

export default function HomeTabsLayout() {
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light

  useEffect(() => {
    NavigationBar.setButtonStyleAsync(colorScheme === 'dark' ? 'light' : 'dark')
  }, [theme, colorScheme])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar
        style={colorScheme === 'dark' ? 'light' : 'dark'}
        backgroundColor={theme.background}
      />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.link,
          tabBarInactiveTintColor: theme.textMuted,
          tabBarStyle: {
            height: 60,
            paddingBottom: 6,
            elevation: 0,
            shadowOpacity: 0,
            borderTopWidth: 0,
            backgroundColor: theme.background,
          },
        }}
      >
        <Tabs.Screen
          name="main"
          options={{ tabBarLabel: 'Головна', headerShown: false }}
        />
        <Tabs.Screen
          name="moodAI"
          options={{
            tabBarLabel: 'Mood AI',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Image
                source={require('../../assets/moodAI_logo.png')}
                style={{ width: size, height: size }}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{ tabBarLabel: 'Аналітика', headerShown: false }}
        />
        <Tabs.Screen
          name="profile"
          options={{ tabBarLabel: 'Мій профіль', headerShown: false }}
        />
      </Tabs>
    </SafeAreaView>
  )
}