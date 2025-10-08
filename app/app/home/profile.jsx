import React from 'react'
import { StyleSheet, Pressable, Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'

export default function ProfileTab() {
  const router = useRouter()

  const handleLogout = async () => {
    await AsyncStorage.removeItem('jwtToken')
    router.replace('/')
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Мій профіль</ThemedText>
      <Pressable style={styles.button} onPress={handleLogout}>
        <ThemedText style={styles.buttonText}>Вийти</ThemedText>
      </Pressable>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontWeight: 'bold', fontSize: 24, marginBottom: 20 },
  button: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
})