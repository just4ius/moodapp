import React, { useState, useEffect } from 'react'
import { StyleSheet, Pressable, Switch, ScrollView, View, Alert, Image } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import ThemedView from '../components/ThemedView'
import ThemedText from '../components/ThemedText'
import { Colors } from '../constants/Colors'
import { useColorScheme } from 'react-native'

const ProfileOption = ({ icon, label, value, onPress, isDestructive, type = 'arrow', theme }) => (
  <Pressable
    style={({ pressed }) => [
      styles.optionRow,
      { backgroundColor: theme.card },
      pressed && { opacity: 0.7 }
    ]}
    onPress={onPress}
  >
    <View style={styles.optionLeft}>
      <View style={[styles.iconContainer, { backgroundColor: theme.inputBackground }]}>
        <Feather name={icon} size={20} color={isDestructive ? Colors.warning : theme.textPrimary} />
      </View>
      <ThemedText style={[styles.optionLabel, isDestructive && { color: Colors.warning }]}>
        {label}
      </ThemedText>
    </View>
    
    <View style={styles.optionRight}>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onPress}
          trackColor={{ false: '#767577', true: Colors.primary }}
          thumbColor={'#f4f3f4'}
        />
      ) : (
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      )}
    </View>
  </Pressable>
)

export default function ProfileTab() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [userEmail, setUserEmail] = useState('user@example.com')

  useEffect(() => {
    // Тут можна зробити запит до API для отримання даних користувача
  }, [])

  const handleLogout = async () => {
    Alert.alert(
      "Вихід",
      "Ви впевнені, що хочете вийти?",
      [
        { text: "Скасувати", style: "cancel" },
        { 
          text: "Вийти", 
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem('jwtToken')
            router.replace('/')
          }
        }
      ]
    )
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <View style={[styles.avatarContainer, { borderColor: theme.border }]}>
             <Feather name="user" size={40} color={theme.textSecondary} />
          </View>
          <ThemedText style={styles.nameText}>Гість</ThemedText>
          <ThemedText style={[styles.emailText, { color: theme.textSecondary }]}>
            {userEmail}
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            НАЛАШТУВАННЯ
          </ThemedText>
          <View style={[styles.sectionContent, { backgroundColor: theme.card }]}>
            <ProfileOption 
              icon="bell" 
              label="Сповіщення" 
              type="switch"
              value={notificationsEnabled}
              onPress={(val) => setNotificationsEnabled(val)}
              theme={theme}
            />
            <View style={[styles.separator, { backgroundColor: theme.inputBackground }]} />
            <ProfileOption 
              icon="moon" 
              label="Тема додатку" 
              onPress={() => {}}
              theme={theme}
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            ПІДТРИМКА
          </ThemedText>
          <View style={[styles.sectionContent, { backgroundColor: theme.card }]}>
            <ProfileOption 
              icon="help-circle" 
              label="Допомога" 
              onPress={() => {}}
              theme={theme}
            />
            <View style={[styles.separator, { backgroundColor: theme.inputBackground }]} />
            <ProfileOption 
              icon="info" 
              label="Про додаток" 
              onPress={() => {}}
              theme={theme}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.sectionContent, { backgroundColor: theme.card }]}>
            <ProfileOption 
              icon="log-out" 
              label="Вийти" 
              onPress={handleLogout}
              isDestructive
              theme={theme}
            />
          </View>
        </View>

        <ThemedText style={[styles.versionText, { color: theme.textMuted }]}>
          Версія 1.0.0
        </ThemedText>

      </ScrollView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingVertical: 20 },
  header: { alignItems: 'center', marginBottom: 30 },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#F0F0F0'
  },
  nameText: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  emailText: { fontSize: 16 },
  section: { marginBottom: 25, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '600', marginBottom: 10, marginLeft: 10, textTransform: 'uppercase' },
  sectionContent: { borderRadius: 12, overflow: 'hidden' },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
    minHeight: 56
  },
  optionLeft: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  optionLabel: { fontSize: 16, fontWeight: '500' },
  separator: { height: 1, marginLeft: 59 },
  versionText: { textAlign: 'center', fontSize: 12, marginTop: 10 }
})