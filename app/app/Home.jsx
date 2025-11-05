import React, { useState } from 'react'
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Pressable,
  Dimensions,
  Text
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

const GradientCard = ({ iconName, text, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      android_ripple={{ color: 'transparent' }}
      style={[styles.card, styles.shadow]}
    >
      <BlurView
        intensity={20}
        tint="light"
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

function HomeScreen() {
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light
  const { width } = Dimensions.get('window')
  const svgWidth = width - 40

  const [mood, setMood] = useState('Чудовий')
  const [advice, setAdvice] = useState(
    'Пам’ятайте, що відпочинок є такою ж важливою частиною продуктивності, як і сама робота.'
  )

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
            <Feather name="user" size={28} color={theme.primaryText} />
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
              У Вас все добре?
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.infoContainer}>
          <ThemedText style={[styles.dateText, { color: theme.secondaryText }]}>
            5 листопада
          </ThemedText>
          <View style={styles.moodContainer}>
            <ThemedText style={[styles.moodText, { color: theme.primaryText }]}>
              Ваш настрій:{' '}
            </ThemedText>
            <ThemedText
              style={[styles.moodValueText, { color: theme.primaryText }]}
            >
              {mood}
            </ThemedText>
          </View>
        </View>

        <View style={styles.separatorContainer}>
          <Svg height="20" width={svgWidth}>
            <Path
              d={`M0 10 Q ${svgWidth / 2} 30 ${svgWidth} 10`}
              stroke={theme.placeholder}
              strokeWidth="1.5"
              fill="transparent"
            />
          </Svg>
        </View>

        <View
          style={[
            styles.adviceContainer,
            styles.shadow,
            { backgroundColor: theme.inputBackground }
          ]}
        >
          <ThemedText
            style={[styles.adviceTitle, { color: theme.secondaryText }]}
          >
            Випадкова порада
          </ThemedText>
          <ThemedText style={[styles.adviceText, { color: theme.primaryText }]}>
            {advice}
          </ThemedText>
        </View>

        <View style={styles.cardsContainer}>
          <GradientCard
            iconName="bar-chart-2"
            text="Статистика"
            onPress={navigateToStats}
          />
          <GradientCard
            iconName="heart"
            text="Медитація"
            onPress={navigateToMeditation}
          />
          <GradientCard
            iconName="info"
            text="Поради"
            onPress={navigateToAdviceList}
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
    paddingHorizontal: 20,
    paddingBottom: 20
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
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
  infoContainer: {
    paddingTop: 10,
    alignItems: 'center'
  },
  dateText: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500'
  },
  moodContainer: {
    flexDirection: 'row'
  },
  moodText: {
    fontSize: 18
  },
  moodValueText: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  separatorContainer: {
    alignItems: 'center',
    marginVertical: 15
  },
  adviceContainer: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 25
  },
  adviceTitle: {
    fontSize: 14,
    marginBottom: 5,
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
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
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