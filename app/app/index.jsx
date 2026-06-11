import { useState, useEffect } from 'react'
import { Pressable, StyleSheet, ActivityIndicator, useColorScheme, Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import ThemedView from '../components/ThemedView'
import ThemedText from '../components/ThemedText'
import ThemedInput from '../components/ThemedInput'
import Spacer from '../components/Spacer'
import { Colors } from '../constants/Colors'

const API_URL = 'http://192.168.31.51:5051/api/auth'

const fetchWithTimeout = async (url, options, timeout = 5000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Помилка з'єднання із сервером.")), timeout)
    )
  ])
}

const StartPage = () => {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')

  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light
  const router = useRouter()

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('jwtToken')
      if (token) {
        console.log('JWT вже збережений:', token)
        router.replace('Home')
      }
    }
    checkToken()
  }, [])

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleSendCode = async () => {
    if (!validateEmail(email)) {
      Alert.alert('Помилка', 'Введіть коректну електронну адресу.')
      return
    }

    setLoading(true)
    try {
      const res = await fetchWithTimeout(`${API_URL}/login-or-sendcode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      }, 7000)

      const data = await res.json()

      if (res.ok) {
        // Alert.alert('Успіх', data.message)
        setCodeSent(true)
      } else {
        Alert.alert('Помилка', data.message)
      }
    } catch (error) {
      console.error(error)
      Alert.alert('Помилка', error.message || 'Не вдалося зв’язатися з сервером.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      Alert.alert('Помилка', 'Введіть код підтвердження.')
      return
    }

    setLoading(true)
    try {
      const res = await fetchWithTimeout(`${API_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode })
      }, 7000)

      let data
      const contentType = res.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        data = await res.json()
      } else {
        data = { message: await res.text() }
      }

      if (res.ok) {
        // Alert.alert('Успіх', 'Вхід успішний!')
        console.log('JWT Token:', data.token)

        await AsyncStorage.setItem('jwtToken', data.token)
        router.replace('Home')
      } else {
        Alert.alert('Помилка', data.message)
      }
    } catch (error) {
      console.error(error)
      Alert.alert('Помилка', error.message || 'Не вдалося зв’язатися з сервером.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Вітаю!</ThemedText>

      <Spacer height={20} />

      <ThemedInput
        placeholder="Електронна адреса"
        keyboardType="email-address"
        style={{ width: 300 }}
        value={email}
        onChangeText={setEmail}
        editable={!codeSent}
      />

      <Spacer height={10} />

      {codeSent && (
        <>
          <ThemedInput
            placeholder="Код підтвердження"
            keyboardType="numeric"
            style={{ width: 300 }}
            value={verificationCode}
            onChangeText={setVerificationCode}
          />
          <Spacer height={10} />
        </>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          loading && styles.buttonDisabled
        ]}
        onPress={codeSent ? handleVerifyCode : handleSendCode}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={theme.text} />
        ) : (
          <ThemedText button>{codeSent ? 'Підтвердити код' : 'Увійти / Зареєструватись'}</ThemedText>
        )}
      </Pressable>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: {
    fontWeight: 'bold',
    // color: Color.gradients.gradientTextBlue,
    fontSize: 30
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 300,
    height: 50,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    backgroundColor: Colors.button,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
    elevation: 5,
  },
  buttonPressed: { backgroundColor: Colors.primary, opacity: 0.9 },
  buttonDisabled: { backgroundColor: Colors.disabled, opacity: 0.7 },
})

export default StartPage
