import { useState, useRef, useEffect } from 'react'
import {
  StyleSheet,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  FlatList,
  ActivityIndicator,
  useColorScheme,
  Keyboard,
  Animated,
  Easing,
  Pressable
} from 'react-native'
import {
  SafeAreaProvider,
  useSafeAreaInsets
} from 'react-native-safe-area-context'
import { Colors } from '../constants/Colors'
import ThemedView from '../components/ThemedView'
import ThemedInput from '../components/ThemedInput'
import ThemedText from '../components/ThemedText'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Path, Rect } from 'react-native-svg'
import MaskedView from '@react-native-masked-view/masked-view'
import { BlurView } from 'expo-blur'

const SendIcon = ({ color = Colors.white, size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2 .01 7z" fill={color} />
  </Svg>
)

const StopIcon = ({ color = Colors.primary, size = 24 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    strokeWidth="2"
    stroke={color}
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <Rect x="4" y="4" width="16" height="16" rx="2" />
  </Svg>
)

const GradientText = ({ style, children }) => {
  return (
    <MaskedView maskElement={<ThemedText style={style}>{children}</ThemedText>}>
      <LinearGradient
        colors={Colors.gradients.appPrimary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <ThemedText style={[style, { opacity: 0 }]}>{children}</ThemedText>
      </LinearGradient>
    </MaskedView>
  )
}

const FormattedMessage = ({ text, style }) => {
  const parts = text.split(/\*\*(.*?)\*\*/g)

  return (
    <ThemedText style={style}>
      {parts.map((part, index) => {
        if (index % 2 === 1) {
          return (
            <ThemedText key={index} style={{ fontWeight: 'bold' }}>
              {part}
            </ThemedText>
          )
        }

        const listItemParts = part.split(/(\*)/g)

        return listItemParts.map((itemPart, itemIndex) => {
          if (itemPart === '*') {
            return <ThemedText key={`${index}-${itemIndex}`}>· </ThemedText>
          }
          return itemPart
        })
      })}
    </ThemedText>
  )
}

function MainScreen() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const flatListRef = useRef(null)
  const xhrRef = useRef(null)
  const isCancelled = useRef(false)
  const insets = useSafeAreaInsets()

  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light

  const initialBottom = 70
  const inputContainerBottom = useRef(
    new Animated.Value(initialBottom)
  ).current
  const welcomeTextOpacity = useRef(new Animated.Value(1)).current
  const welcomeTextTranslateY = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      e => {
        const keyboardHeight = e.endCoordinates.height + 70
        Animated.parallel([
          Animated.timing(inputContainerBottom, {
            toValue: keyboardHeight,
            duration: 350,
            useNativeDriver: false,
            easing: Easing.bezier(0.3, 0.28, 0.23, 0.99)
          }),
          Animated.timing(welcomeTextTranslateY, {
            toValue: -50,
            duration: 350,
            useNativeDriver: true,
            easing: Easing.bezier(0.3, 0.28, 0.23, 0.99)
          }),
          Animated.timing(welcomeTextOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true
          })
        ]).start()
      }
    )
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        Animated.parallel([
          Animated.timing(inputContainerBottom, {
            toValue: initialBottom,
            duration: 350,
            useNativeDriver: false,
            easing: Easing.bezier(0.3, 0.28, 0.23, 0.99)
          }),
          Animated.timing(welcomeTextTranslateY, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
            easing: Easing.bezier(0.3, 0.28, 0.23, 0.99)
          }),
          Animated.timing(welcomeTextOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true
          })
        ]).start()
      }
    )

    return () => {
      keyboardDidHideListener.remove()
      keyboardDidShowListener.remove()
    }
  }, [initialBottom])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) {
      return
    }

    isCancelled.current = false
    const userMessage = { id: Date.now(), text: input, sender: 'user' }
    const promptText = input
    setInput('')

    const aiPlaceholderMessage = {
      id: Date.now() + 1,
      text: '',
      sender: 'ai',
      isLoading: true
    }

    setMessages(prev => [...prev, userMessage, aiPlaceholderMessage])
    setIsLoading(true)

    const apiUrl = 'http://192.168.31.43:5051/api/Chat'
    const xhr = new XMLHttpRequest()
    xhrRef.current = xhr

    let lastResponseLength = 0
    let accumulatedText = ''
    let aiMessageId = aiPlaceholderMessage.id

    xhr.open('POST', apiUrl)
    xhr.setRequestHeader('Content-Type', 'application/json')

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 3 || xhr.readyState === 4) {
        const newText = xhr.responseText.substring(lastResponseLength)
        lastResponseLength = xhr.responseText.length

        const lines = newText.split('\n')

        let chunkText = ''
        for (const line of lines) {
          if (line.trim() === '') continue
          try {
            const parsed = JSON.parse(line)
            if (parsed && parsed.response) {
              chunkText += parsed.response
            }
          } catch (e) {
            console.error('Failed to parse JSON line:', line, e)
          }
        }

        if (chunkText) {
          accumulatedText += chunkText
          setMessages(prev =>
            prev.map(msg =>
              msg.id === aiMessageId
                ? { ...msg, text: accumulatedText, isLoading: false }
                : msg
            )
          )
        }
      }

      if (xhr.readyState === 4) {
        setIsLoading(false)
        xhrRef.current = null
        if (xhr.status !== 200) {
          if (isCancelled.current) return

          console.error('Error:', xhr.responseText)
          Alert.alert('Помилка', `Не вдалося отримати відповідь: ${xhr.status}`)
          setMessages(prev =>
            prev.map(msg =>
              msg.id === aiMessageId
                ? {
                  ...msg,
                  text: `Помилка з'єднання: ${xhr.status}`,
                  isLoading: false
                }
                : msg
            )
          )
        }
      }
    }

    xhr.onerror = () => {
      if (isCancelled.current) return

      console.error('XHR Error:', xhr.responseText)
      Alert.alert('Помилка', 'Сталася мережева помилка.')
      setIsLoading(false)
      xhrRef.current = null
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessageId
            ? { ...msg, text: "Помилка з'єднання.", isLoading: false }
            : msg
        )
      )
    }

    xhr.send(JSON.stringify({ prompt: promptText }))
  }

  const handleCancelGeneration = () => {
    if (xhrRef.current) {
      isCancelled.current = true
      xhrRef.current.abort()
      xhrRef.current = null
      setIsLoading(false)
      setMessages(prev => prev.filter(msg => !msg.isLoading))
    }
  }

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user'
    return (
      <ThemedView
        style={[
          styles.messageRow,
          isUser ? styles.userMessageRow : styles.aiMessageRow
        ]}
      >
        <ThemedView
          style={[
            styles.messageBubble,
            {
              backgroundColor: isUser
                ? theme.userBubble
                : theme.inputBackground
            }
          ]}
        >
          {item.isLoading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : isUser ? (
            <ThemedText style={styles.userMessageText}>{item.text}</ThemedText>
          ) : (
            <FormattedMessage text={item.text} style={styles.aiMessageText} />
          )}
        </ThemedView>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        {messages.length === 0 ? (
          <Animated.View
            style={[
              styles.welcomeContainer,
              {
                opacity: welcomeTextOpacity,
                transform: [{ translateY: welcomeTextTranslateY }]
              }
            ]}
          >
            <GradientText style={styles.title}>
              Що Вас турбує сьогодні?
            </GradientText>
          </Animated.View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id.toString()}
            style={styles.chatList}
            contentContainerStyle={{
              paddingTop: 20,
              paddingBottom: 120
            }}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />
        )}
      </KeyboardAvoidingView>
      <Animated.View
        style={[
          styles.inputContainer,
          {
            bottom: inputContainerBottom
          }
        ]}
      >
        <BlurView
          intensity={120}
          tint={colorScheme === 'dark' ? 'dark' : 'light'}
          style={[styles.inputWrapper, styles.shadow]}
        >
          <ThemedInput
            placeholder="Напишіть своє повідомлення..."
            placeholderTextColor={theme.placeholder}
            style={[styles.input, { color: theme.primaryText }]}
            value={input}
            onChangeText={setInput}
            multiline
            underlineColorAndroid="transparent"
          />
        </BlurView>

        <TouchableOpacity
          onPress={isLoading ? handleCancelGeneration : handleSendMessage}
          style={[styles.button, styles.shadow]}
          activeOpacity={0.8}
          android_ripple={{ color: 'transparent' }}
        >
          {isLoading ? (
            <BlurView
              intensity={120}
              tint={colorScheme === 'dark' ? 'dark' : 'light'}
              style={styles.buttonFill}
            >
              <StopIcon />
            </BlurView>
          ) : (
            <LinearGradient
              colors={Colors.gradients.appPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonFill}
            >
              <SendIcon />
            </LinearGradient>
          )}
        </TouchableOpacity>
      </Animated.View>
    </ThemedView>
  )
}

export default function MainTab() {
  return (
    <SafeAreaProvider>
      <MainScreen />
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  keyboardAvoidingView: {
    flex: 1
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  title: {
    fontWeight: 'bold',
    fontSize: 28,
    textAlign: 'center'
  },
  chatList: {
    flex: 1,
    paddingHorizontal: 10
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 5
  },
  userMessageRow: {
    justifyContent: 'flex-end'
  },
  aiMessageRow: {
    justifyContent: 'flex-start'
  },
  messageBubble: {
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 15,
    maxWidth: '80%'
  },
  userMessageText: {
    fontSize: 16
  },
  aiMessageText: {
    fontSize: 16
  },
  inputContainer: {
    position: 'absolute',
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  inputWrapper: {
    flex: 1,
    marginRight: 10,
    borderRadius: 20,
    overflow: 'hidden'
  },
  input: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    minHeight: 48,
    borderRadius: 20,
    maxHeight: 120,
    fontSize: 16
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden'
  },
  buttonFill: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10
  }
})