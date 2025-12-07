import React, { useState, useEffect } from 'react'
import { StyleSheet, Pressable, Switch, ScrollView, View, Alert, Image, TextInput, ActivityIndicator, Modal } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import ThemedView from '../components/ThemedView'
import ThemedText from '../components/ThemedText'
import { Colors } from '../constants/Colors'
import { useAppTheme } from '../context/AppContext'
import { BlurView } from 'expo-blur'

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

export default function ProfileScreen() {
  const router = useRouter()
  const { theme, themeMode, updateTheme, user, updateUser, isThemeLoading } = useAppTheme()
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (user?.name) {
      setEditName(user.name)
    }
  }, [user])

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

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      })
  
      if (!result.canceled && result.assets && result.assets[0].base64) {
        setUploading(true)
        const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`
        const success = await updateUser({ profilePhoto: base64Img })
        if (!success) Alert.alert('Помилка', 'Не вдалося оновити фото')
        setUploading(false)
      }
    } catch (error) {
      console.error(error)
      Alert.alert('Помилка', 'Не вдалося відкрити галерею')
      setUploading(false)
    }
  }

  const saveName = async () => {
    if (editName !== user?.name) {
        await updateUser({ name: editName })
    }
    setIsEditing(false)
  }

  const toggleTheme = () => {
    const modes = ['system', 'light', 'dark']
    const currentIndex = modes.indexOf(themeMode)
    const nextMode = modes[(currentIndex + 1) % modes.length]
    updateTheme(nextMode)
  }

  const getThemeLabel = () => {
    switch(themeMode) {
        case 'light': return 'Світла'
        case 'dark': return 'Темна'
        default: return 'Системна'
    }
  }

  return (
    <ThemedView style={styles.container}>
      <Modal visible={isThemeLoading} transparent animationType="fade">
        <View style={styles.loaderContainer}>
            <BlurView intensity={20} style={StyleSheet.absoluteFill} />
            <View style={[styles.loaderBox, { backgroundColor: theme.card }]}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <ThemedText style={{ marginTop: 10 }}>Зміна теми...</ThemedText>
            </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Pressable onPress={pickImage} style={[styles.avatarContainer, { borderColor: theme.border }]}>
            {uploading ? (
                 <ActivityIndicator color={Colors.primary} />
            ) : user?.profilePhoto ? (
                <Image source={{ uri: user.profilePhoto }} style={styles.avatarImage} />
            ) : (
                <Feather name="user" size={40} color={theme.textSecondary} />
            )}
            <View style={[styles.editBadge, { backgroundColor: theme.buttonPrimary }]}>
                <Feather name="camera" size={12} color="#FFF" />
            </View>
          </Pressable>

          {isEditing ? (
            <View style={styles.editNameRow}>
                <TextInput 
                    style={[styles.nameInput, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.inputBackground }]}
                    value={editName}
                    onChangeText={setEditName}
                    autoFocus
                />
                <Pressable onPress={saveName} style={styles.saveBtn}>
                    <Feather name="check" size={24} color={Colors.success} />
                </Pressable>
            </View>
          ) : (
            <Pressable onPress={() => setIsEditing(true)} style={styles.nameRow}>
                <ThemedText style={styles.nameText}>{user?.name || 'Гість'}</ThemedText>
                <Feather name="edit-2" size={16} color={theme.textSecondary} style={{ marginLeft: 8 }} />
            </Pressable>
          )}

          <ThemedText style={[styles.emailText, { color: theme.textSecondary }]}>
            {user?.email || 'Завантаження...'}
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
              label={`Тема: ${getThemeLabel()}`}
              onPress={toggleTheme}
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
    backgroundColor: '#F0F0F0',
    position: 'relative'
  },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF'
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  editNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  nameInput: { fontSize: 20, padding: 5, borderWidth: 1, borderRadius: 8, minWidth: 150, textAlign: 'center' },
  saveBtn: { marginLeft: 10, padding: 5 },
  nameText: { fontSize: 24, fontWeight: 'bold' },
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
  optionRight: { marginRight: 5 },
  separator: { height: 1, marginLeft: 59 },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  loaderBox: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    width: 150
  }
})