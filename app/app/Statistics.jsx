import React, { useState, useEffect, useMemo } from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  useColorScheme
} from 'react-native'
import { Svg, Path, Circle, Line, Text as SvgText } from 'react-native-svg'
import { Feather } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Colors } from '../constants/Colors'
import ThemedView from '../components/ThemedView'
import ThemedText from '../components/ThemedText'
import Spacer from '../components/Spacer'

const SCREEN_WIDTH = Dimensions.get('window').width
const CHART_HEIGHT = 220
const API_URL = 'http://192.168.31.42:5051/api/MoodEntries'

const MOOD_SCORES = {
  'Чудовий': 6,
  'Добре': 5,
  'Ніякий': 4,
  'Втомлений': 3,
  'Сумний': 2,
  'Тривожний': 1,
  'Злий': 0
}

const REVERSE_MOOD_SCORES = {
  6: 'Чудовий',
  5: 'Добре',
  4: 'Ніякий',
  3: 'Втомлений',
  2: 'Сумний',
  1: 'Тривожний',
  0: 'Злий'
}

const MOOD_COLORS = {
  'Чудовий': '#3BA55D',
  'Добре': '#A1C45A',
  'Ніякий': '#FFD166',
  'Втомлений': '#8AAEE0',
  'Сумний': '#6883BA',
  'Тривожний': '#CC475A',
  'Злий': '#E53935'
}

const MoodChart = ({ data, theme }) => {
  const padding = 40
  const width = SCREEN_WIDTH - 40
  const height = CHART_HEIGHT
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  const hasSinglePoint = data.length === 1
  const xStep = hasSinglePoint ? 0 : chartWidth / (data.length - 1)
  const yStep = chartHeight / 6

  let points = ''
  if (data.length > 0) {
    points = data.map((item, index) => {
      const x = hasSinglePoint 
        ? width / 2 
        : padding + index * xStep
      const y = height - padding - (item.score * yStep)
      return `${x},${y}`
    }).join(' ')
  }

  return (
    <View style={[styles.chartContainer, styles.shadow, { backgroundColor: theme.card }]}>
      <ThemedText style={styles.chartTitle}>Динаміка настрою</ThemedText>
      
      {data.length === 0 ? (
        <View style={styles.noDataContainer}>
           <ThemedText style={{ color: theme.textMuted }}>Немає записів за цей період</ThemedText>
        </View>
      ) : (
        <Svg width={width} height={height}>
          {Array.from({ length: 7 }).map((_, i) => (
            <Line
              key={i}
              x1={padding}
              y1={height - padding - i * yStep}
              x2={width - padding}
              y2={height - padding - i * yStep}
              stroke={theme.border}
              strokeDasharray="5, 5"
              strokeWidth="1"
            />
          ))}

          {data.length > 1 && (
            <Path
              d={`M${points}`}
              fill="none"
              stroke={Colors.primary}
              strokeWidth="3"
            />
          )}

          {data.map((item, index) => {
            const x = hasSinglePoint 
              ? width / 2 
              : padding + index * xStep
            const y = height - padding - (item.score * yStep)
            return (
              <Circle
                key={index}
                cx={x}
                cy={y}
                r="5"
                fill={Colors.primary}
              />
            )
          })}
        </Svg>
      )}
    </View>
  )
}

const CalendarView = ({ dailyData, currentDate, theme }) => {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const getMoodColorForDay = (day) => {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const entry = dailyData[dateKey]

    if (!entry) return theme.inputBackground

    const roundedScore = Math.round(entry.score)
    const moodLabel = REVERSE_MOOD_SCORES[roundedScore] || 'Ніякий'
    
    return MOOD_COLORS[moodLabel] || theme.inputBackground
  }

  return (
    <View style={[styles.calendarContainer, styles.shadow, { backgroundColor: theme.card }]}>
      <ThemedText style={styles.chartTitle}>Календар</ThemedText>
      <View style={styles.calendarGrid}>
        {daysArray.map((day) => (
          <View key={day} style={styles.dayWrapper}>
            <View style={[styles.dayCircle, { backgroundColor: getMoodColorForDay(day) }]}>
              <ThemedText style={styles.dayText}>{day}</ThemedText>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

export default function StatisticsScreen() {
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light
  
  const [loading, setLoading] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [rawData, setRawData] = useState([])
  
  const [chartData, setChartData] = useState([])
  const [dailyMap, setDailyMap] = useState({})

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    processMoodData(rawData)
  }, [rawData, currentDate])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/1`)
      if (response.ok) {
        const data = await response.json()
        setRawData(data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const processMoodData = (data) => {
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()

    const filtered = data.filter(item => {
      const d = new Date(item.createdAt)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })

    const groupedByDay = filtered.reduce((acc, curr) => {
      const dateObj = new Date(curr.createdAt)
      const dateKey = dateObj.toISOString().split('T')[0] 
      
      if (!acc[dateKey]) {
        acc[dateKey] = { totalScore: 0, count: 0, date: dateObj }
      }
      
      const score = MOOD_SCORES[curr.moodLabel] ?? 4
      acc[dateKey].totalScore += score
      acc[dateKey].count += 1
      
      return acc
    }, {})

    const processedArray = Object.keys(groupedByDay).map(dateKey => {
      const dayData = groupedByDay[dateKey]
      return {
        date: dayData.date,
        dateString: dateKey,
        score: dayData.totalScore / dayData.count 
      }
    })

    const sortedData = processedArray.sort((a, b) => a.date - b.date)

    const map = {}
    sortedData.forEach(item => {
      map[item.dateString] = item
    })
    
    setDailyMap(map)
    setChartData(sortedData)
  }

  const changeMonth = (increment) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + increment)
    setCurrentDate(newDate)
  }

  const monthNames = [
    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
  ]

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerControl}>
          <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.arrowBtn}>
            <Feather name="chevron-left" size={28} color={theme.textPrimary} />
          </TouchableOpacity>
          
          <ThemedText style={styles.monthTitle}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </ThemedText>

          <TouchableOpacity onPress={() => changeMonth(1)} style={styles.arrowBtn}>
            <Feather name="chevron-right" size={28} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>

        <Spacer height={20} />

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} />
        ) : (
          <>
            <MoodChart data={chartData} theme={theme} />
            <Spacer height={20} />
            <CalendarView 
              dailyData={dailyMap} 
              currentDate={currentDate} 
              theme={theme} 
            />
          </>
        )}
        
        <Spacer height={40} />
      </ScrollView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    padding: 20
  },
  headerControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10
  },
  arrowBtn: {
    padding: 10
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  chartContainer: {
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    overflow: 'hidden',
    minHeight: 250
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 180
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    alignSelf: 'flex-start',
    marginLeft: 10
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5
  },
  calendarContainer: {
    borderRadius: 20,
    padding: 20
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start'
  },
  dayWrapper: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5
  },
  dayCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF' 
  }
})