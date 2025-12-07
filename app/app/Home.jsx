import React, { useState, useRef, useCallback } from 'react'
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Pressable,
  Dimensions,
  Text,
  Animated,
  TextInput,
  Keyboard
} from 'react-native'
import {
  SafeAreaProvider,
  useSafeAreaInsets
} from 'react-native-safe-area-context'
import { Colors } from '../constants/Colors'
import ThemedView from '../components/ThemedView'
import ThemedText from '../components/ThemedText'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Path } from 'react-native-svg'
import { BlurView } from 'expo-blur'
import { Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'

const MOODS = [
  { id: 'happy', label: 'Чудовий', emoji: '😄' },
  { id: 'good', label: 'Добре', emoji: '🙂' },
  { id: 'neutral', label: 'Ніякий', emoji: '😐' },
  { id: 'sad', label: 'Сумний', emoji: '😔' },
  { id: 'tired', label: 'Втомлений', emoji: '😫' },
  { id: 'anxious', label: 'Тривожний', emoji: '😰' },
  { id: 'angry', label: 'Злий', emoji: '😡' }
]

const SkeletonItem = ({ style, theme }) => {
  const animatedValue = useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    ).start()
  }, [])

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7]
  })

  return (
    <Animated.View
      style={[
        {
          opacity,
          backgroundColor: theme.textMuted,
          borderRadius: 4
        },
        style
      ]}
    />
  )
}

const GradientCard = ({ iconName, text, onPress, theme, colorScheme }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      android_ripple={{ color: 'transparent' }}
      style={[styles.card, styles.shadow, { borderColor: theme.cardBorder }]}
    >
      <BlurView
        intensity={20}
        tint={colorScheme === 'dark' ? 'dark' : 'light'}
        style={styles.blurContainer}
      >
        <LinearGradient
          colors={Colors.gradients.appPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientFill}
        >
          <Feather
            name={iconName}
            size={24}
            color={Colors.white}
            style={styles.icon}
          />
          <Text style={styles.text}>{text}</Text>
        </LinearGradient>
      </BlurView>
    </TouchableOpacity>
  )
}

const MoodSelector = ({ selectedMood, onSelect, theme }) => {
  return (
    <View style={styles.moodSelectorWrapper}>
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
        Як ви себе почуваєте?
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.moodList}
      >
        {MOODS.map((item) => {
          const isSelected = selectedMood === item.label
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => onSelect(item.label)}
              activeOpacity={0.7}
              style={[
                styles.moodItem,
                isSelected && styles.moodItemActive,
                {
                  backgroundColor: isSelected ? theme.tint : theme.inputBackground,
                  // Додаємо легку рамку для неактивних елементів для контрасту
                  borderColor: isSelected ? 'transparent' : theme.cardBorder,
                  borderWidth: 1
                }
              ]}
            >
              <Text style={styles.moodEmoji}>{item.emoji}</Text>
              <Text
                style={[
                  styles.moodLabel,
                  {
                    color: isSelected ? '#FFF' : theme.textPrimary,
                    fontWeight: isSelected ? '700' : '500'
                  }
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}

function HomeScreen() {
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light
  const { width } = Dimensions.get('window')
  const svgWidth = width - 40

  const [mood, setMood] = useState('Чудовий')
  const [moodNote, setMoodNote] = useState('')
  const [advice, setAdvice] = useState('')
  const [loadingAdvice, setLoadingAdvice] = useState(false)
  const [adviceRequested, setAdviceRequested] = useState(false)

  const fetchAdvice = async () => {
    Keyboard.dismiss()
    setLoadingAdvice(true)
    setAdviceRequested(true)

    try {
      const response = await fetch('http://192.168.31.42:5051/api/Advice/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 1,
          currentMood: mood,
          note: moodNote
        })
      })

      if (response.ok) {
        const data = await response.json()
        setAdvice(data.advice)
      } else {
        setAdvice('Сьогодні чудовий день, щоб подбати про себе.')
      }
    } catch (error) {
      console.error(error)
      setAdvice('Не вдалося з\'єднатися з сервером. Перевірте підключення.')
    } finally {
      setLoadingAdvice(false)
    }
  }

  const navigateToProfile = () => navigation.navigate('Profile')
  const navigateToChat = () => navigation.navigate('Chat')
  const navigateToStats = () => navigation.navigate('Statistics')
  const navigateToMeditation = () => navigation.navigate('Meditation')
  const navigateToAdviceList = () => navigation.navigate('Advice')

  return (
    <ThemedView style={styles.rootContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity
            onPress={navigateToProfile}
            style={[
              styles.profileIcon,
              styles.shadow,
              { backgroundColor: theme.inputBackground }
            ]}
          >
            <Feather name="user" size={28} color={theme.textPrimary} />
          </TouchableOpacity>
          <Pressable
            onPress={navigateToChat}
            style={[
              styles.chatInputPressable,
              styles.shadow,
              { backgroundColor: theme.inputBackground }
            ]}
          >
            <ThemedText
              style={[styles.chatInputPlaceholder, { color: theme.placeholder }]}
            >
              Чат...
            </ThemedText>
          </Pressable>
        </View>

        <MoodSelector
          selectedMood={mood}
          onSelect={setMood}
          theme={theme}
        />

        <View style={styles.inputSection}>
          <TextInput
            style={[
              styles.noteInput,
              {
                backgroundColor: theme.inputBackground,
                color: theme.textPrimary,
                borderColor: theme.cardBorder
              }
            ]}
            placeholder="Що саме викликало такі емоції? (необов'язково)"
            placeholderTextColor={theme.placeholder}
            value={moodNote}
            onChangeText={setMoodNote}
            multiline
            maxLength={200}
          />

          <TouchableOpacity
            onPress={fetchAdvice}
            disabled={loadingAdvice}
            style={[styles.generateButton, styles.shadow]}
          >
            <LinearGradient
              colors={Colors.gradients.appPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButtonFill}
            >
              <Text style={styles.generateButtonText}>
                {loadingAdvice ? 'Аналіз...' : 'Отримати пораду'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.separatorContainer}>
          <Svg height="20" width={svgWidth}>
            <Path
              d={`M0 10 Q ${svgWidth / 2} 30 ${svgWidth} 10`}
              stroke={theme.cardBorder}
              strokeWidth="1.5"
              fill="transparent"
            />
          </Svg>
        </View>

        {adviceRequested && (
          <View
            style={[
              styles.adviceContainer,
              styles.shadow,
              { backgroundColor: theme.inputBackground, minHeight: 100 }
            ]}
          >
            <ThemedText
              style={[styles.adviceTitle, { color: theme.textSecondary }]}
            >
              Ваша персональна порада
            </ThemedText>

            {loadingAdvice ? (
              <View style={{ marginTop: 10 }}>
                <SkeletonItem theme={theme} style={{ width: '90%', height: 16, marginBottom: 8 }} />
                <SkeletonItem theme={theme} style={{ width: '80%', height: 16, marginBottom: 8 }} />
                <SkeletonItem theme={theme} style={{ width: '40%', height: 16 }} />
              </View>
            ) : (
              <ThemedText style={[styles.adviceText, { color: theme.textPrimary }]}>
                {advice}
              </ThemedText>
            )}
          </View>
        )}

        <View style={styles.cardsContainer}>
          <GradientCard
            iconName="bar-chart-2"
            text="Статистика"
            onPress={navigateToStats}
            theme={theme}
            colorScheme={colorScheme}
          />
          <GradientCard
            iconName="heart"
            text="Медитація"
            onPress={navigateToMeditation}
            theme={theme}
            colorScheme={colorScheme}
          />
          <GradientCard
            iconName="info"
            text="Поради"
            onPress={navigateToAdviceList}
            theme={theme}
            colorScheme={colorScheme}
          />
        </View>
      </ScrollView>
    </ThemedView>
  )
}

export default function MainTab() {
  return (
    <SafeAreaProvider>
      <HomeScreen />
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1
  },
  scrollContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  profileIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  chatInputPressable: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  chatInputPlaceholder: {
    fontSize: 16,
    opacity: 0.8
  },
  moodSelectorWrapper: {
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    marginLeft: 5
  },
  moodList: {
    paddingRight: 20,
    paddingBottom: 10,
    paddingLeft: 5
  },

  moodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 30,
    marginRight: 12,
  },
  moodItemActive: {
    transform: [{ scale: 1.02 }],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4
  },
  moodEmoji: {
    fontSize: 20,
    marginRight: 10,
    marginBottom: 0
  },
  moodLabel: {
    fontSize: 15,
    fontWeight: '500'
  },

  inputSection: {
    marginBottom: 10
  },
  noteInput: {
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 15
  },
  generateButton: {
    borderRadius: 25,
    overflow: 'hidden',
    height: 50
  },
  gradientButtonFill: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  generateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  separatorContainer: {
    alignItems: 'center',
    marginVertical: 15
  },
  adviceContainer: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 25,
    justifyContent: 'center'
  },
  adviceTitle: {
    fontSize: 14,
    marginBottom: 10,
    fontWeight: '600',
    opacity: 0.7
  },
  adviceText: {
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 22
  },
  cardsContainer: {},
  card: {
    width: '100%',
    marginBottom: 10,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1
  },
  blurContainer: {
    width: '100%'
  },
  gradientFill: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    width: '100%',
    backgroundColor: 'transparent'
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8
  },
  icon: {
    marginRight: 15
  },
  text: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    flex: 1
  }
})