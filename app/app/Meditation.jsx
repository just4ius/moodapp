import React, { useState, useRef, useEffect } from 'react'
import {
  StyleSheet,
  View,
  Animated,
  TouchableOpacity,
  useColorScheme,
  Dimensions
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import ThemedView from '../components/ThemedView'
import ThemedText from '../components/ThemedText'
import { Colors } from '../constants/Colors'
import { useNavigation } from 'expo-router'

const { width } = Dimensions.get('window')
const CIRCLE_SIZE = width * 0.65

const PHASES = [
  { label: 'Вдих', duration: 4000, scale: 1.5, opacity: 1.0 },
  { label: 'Затримка', duration: 4000, scale: 1.5, opacity: 1.0 },
  { label: 'Видих', duration: 4000, scale: 1.0, opacity: 0.6 },
  { label: 'Затримка', duration: 4000, scale: 1.0, opacity: 0.6 }
]

const FALLBACK_GRADIENTS = {
  blue: ["#4A90E2", "#50E3C2"]
}

export default function MeditationScreen() {
  const navigation = useNavigation()
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light
  
  const [isActive, setIsActive] = useState(false)
  const activeRef = useRef(false)
  
  const [phaseLabel, setPhaseLabel] = useState('Натисніть,\nщоб почати')
  
  const scaleAnim = useRef(new Animated.Value(1)).current
  const fadeAnim = useRef(new Animated.Value(0.6)).current
  const textOpacity = useRef(new Animated.Value(1)).current

  const stopMeditation = () => {
    setIsActive(false)
    activeRef.current = false
    
    scaleAnim.stopAnimation()
    fadeAnim.stopAnimation()
    textOpacity.stopAnimation()

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true
      }),
      Animated.timing(fadeAnim, {
        toValue: 0.6,
        duration: 500,
        useNativeDriver: true
      }),
      Animated.timing(textOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      })
    ]).start(() => {
      setPhaseLabel('Натисніть,\nщоб почати')
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }).start()
    })
  }

  const runPhase = (index) => {
    if (!activeRef.current) return

    const phaseIndex = index % PHASES.length
    const currentPhase = PHASES[phaseIndex]
    
    Animated.timing(textOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      if (!activeRef.current) return
      setPhaseLabel(currentPhase.label)
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }).start()
    })

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: currentPhase.scale,
        duration: currentPhase.duration,
        useNativeDriver: true
      }),
      Animated.timing(fadeAnim, {
        toValue: currentPhase.opacity,
        duration: currentPhase.duration,
        useNativeDriver: true
      })
    ]).start(({ finished }) => {
      if (finished && activeRef.current) {
        runPhase(index + 1)
      }
    })
  }

  const toggleMeditation = () => {
    if (isActive) {
      stopMeditation()
    } else {
      setIsActive(true)
      activeRef.current = true
      runPhase(0)
    }
  }

  useEffect(() => {
    return () => {
      activeRef.current = false
      scaleAnim.stopAnimation()
      fadeAnim.stopAnimation()
      textOpacity.stopAnimation()
    }
  }, [])

  const circleGradient = Colors.gradients?.gradientTextBlue || FALLBACK_GRADIENTS.blue

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity
          onPress={toggleMeditation}
          activeOpacity={0.9}
          style={styles.circleContainer}
        >
          <Animated.View
            style={[
              styles.breathingCircle,
              {
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim
              }
            ]}
          >
            <LinearGradient
              colors={circleGradient}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </Animated.View>
          
          <Animated.View style={{ opacity: textOpacity, zIndex: 10 }}>
            <ThemedText style={styles.phaseText}>
              {phaseLabel}
            </ThemedText>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50
  },
  circleContainer: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  breathingCircle: {
    width: '100%',
    height: '100%',
    borderRadius: CIRCLE_SIZE / 2,
    position: 'absolute'
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: CIRCLE_SIZE / 2
  },
  phaseText: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    color: '#FFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
    paddingHorizontal: 20
  }
})