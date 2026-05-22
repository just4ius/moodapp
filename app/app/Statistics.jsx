import React, { useState, useEffect } from 'react'
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
import { Colors } from '../constants/Colors'
import ThemedView from '../components/ThemedView'
import ThemedText from '../components/ThemedText'
import Spacer from '../components/Spacer'

const SCREEN_WIDTH = Dimensions.get('window').width
const CHART_HEIGHT = 220
const API_URL = 'http://192.168.0.124:5051/api/MoodEntries'

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

const ViewSelector = ({ currentMode, onSelect, theme }) => {
  const modes = [
    { key: 'day', label: 'День' },
    { key: 'week', label: 'Тиждень' },
    { key: 'month', label: 'Місяць' },
    { key: 'all', label: 'Все' },
  ]

  return (
    <View style={[styles.selectorContainer, { backgroundColor: theme.card }]}>
      {modes.map((mode) => (
        <TouchableOpacity
          key={mode.key}
          style={[
            styles.selectorButton,
            currentMode === mode.key && { backgroundColor: Colors.primary }
          ]}
          onPress={() => onSelect(mode.key)}
        >
          <ThemedText
            style={[
              styles.selectorText,
              currentMode === mode.key && { color: '#FFF', fontWeight: 'bold' }
            ]}
          >
            {mode.label}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const MoodChart = ({ data, theme, viewMode }) => {
  const verticalPadding = 40
  const rightPadding = 20
  const leftPadding = 85
  const width = SCREEN_WIDTH - 40
  const height = CHART_HEIGHT
  const chartWidth = width - leftPadding - rightPadding
  const chartHeight = height - verticalPadding * 2

  const hasSinglePoint = data.length === 1
  const xStep = hasSinglePoint ? 0 : chartWidth / (data.length - 1)
  const yStep = chartHeight / 6

  let points = ''
  if (data.length > 0) {
    points = data.map((item, index) => {
      const x = hasSinglePoint 
        ? leftPadding + chartWidth / 2 
        : leftPadding + index * xStep
      const y = height - verticalPadding - (item.score * yStep)
      return `${x},${y}`
    }).join(' ')
  }

  const getLabel = (item) => {
    if (viewMode === 'day') {
      const date = new Date(item.timestamp)
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    }
    const date = new Date(item.date)
    return `${date.getDate()}.${String(date.getMonth() + 1).padStart(2, '0')}`
  }

  return (
    <View style={[styles.chartContainer, styles.shadow, { backgroundColor: theme.card }]}>
      <ThemedText style={styles.chartTitle}>Динаміка настрою</ThemedText>
      
      {data.length === 0 ? (
        <View style={styles.noDataContainer}>
           <ThemedText style={{ color: theme.textMuted }}>Немає записів</ThemedText>
        </View>
      ) : (
        <Svg width={width} height={height}>
          {Array.from({ length: 7 }).map((_, i) => {
            const y = height - verticalPadding - i * yStep
            return (
              <React.Fragment key={i}>
                <SvgText
                    x={leftPadding - 10}
                    y={y + 4}
                    fontSize="10"
                    fill={theme.textMuted}
                    textAnchor="end"
                >
                    {REVERSE_MOOD_SCORES[i]}
                </SvgText>
                <Line
                  x1={leftPadding}
                  y1={y}
                  x2={width - rightPadding}
                  y2={y}
                  stroke={theme.border}
                  strokeDasharray="5, 5"
                  strokeWidth="1"
                />
              </React.Fragment>
            )
          })}

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
              ? leftPadding + chartWidth / 2 
              : leftPadding + index * xStep
            const y = height - verticalPadding - (item.score * yStep)
            return (
              <React.Fragment key={index}>
                <Circle
                  cx={x}
                  cy={y}
                  r="5"
                  fill={Colors.primary}
                />
                {data.length < 10 && (
                  <SvgText
                    x={x}
                    y={height - 10}
                    fontSize="10"
                    fill={theme.textMuted}
                    textAnchor="middle"
                  >
                    {getLabel(item)}
                  </SvgText>
                )}
              </React.Fragment>
            )
          })}
        </Svg>
      )}
    </View>
  )
}

const CalendarView = ({ dailyData, currentDate, theme, onDayPress }) => {
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
          <TouchableOpacity 
            key={day} 
            style={styles.dayWrapper}
            onPress={() => onDayPress(day)}
          >
            <View style={[styles.dayCircle, { backgroundColor: getMoodColorForDay(day) }]}>
              <ThemedText style={styles.dayText}>{day}</ThemedText>
            </View>
          </TouchableOpacity>
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
  
  const [viewMode, setViewMode] = useState('month') 

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    processData()
  }, [rawData, currentDate, viewMode])

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

  const processData = () => {
    if (!rawData || rawData.length === 0) return

    let filtered = []
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()
    const currentDay = currentDate.getDate()

    if (viewMode === 'day') {
      filtered = rawData.filter(item => {
        const d = new Date(item.createdAt)
        return d.getFullYear() === currentYear &&
               d.getMonth() === currentMonth &&
               d.getDate() === currentDay
      }).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

      const mapped = filtered.map(item => ({
        score: MOOD_SCORES[item.moodLabel] ?? 4,
        timestamp: item.createdAt,
        id: item.id
      }))
      setChartData(mapped)
      updateDailyMap(rawData)
      return
    }

    if (viewMode === 'week') {
      const startOfWeek = new Date(currentDate)
      const day = startOfWeek.getDay() || 7 
      if (day !== 1) startOfWeek.setHours(-24 * (day - 1))
      startOfWeek.setHours(0,0,0,0)
      
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23,59,59,999)

      filtered = rawData.filter(item => {
        const d = new Date(item.createdAt)
        return d >= startOfWeek && d <= endOfWeek
      })
    } else if (viewMode === 'month') {
      filtered = rawData.filter(item => {
        const d = new Date(item.createdAt)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
      })
    } else if (viewMode === 'all') {
      filtered = [...rawData]
    }

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
        score: dayData.totalScore / dayData.count,
        timestamp: dayData.date
      }
    }).sort((a, b) => a.date - b.date)

    setChartData(processedArray)
    updateDailyMap(rawData)
  }

  const updateDailyMap = (data) => {
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()

    const filteredForMonth = data.filter(item => {
      const d = new Date(item.createdAt)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })

    const grouped = filteredForMonth.reduce((acc, curr) => {
      const dateObj = new Date(curr.createdAt)
      const dateKey = dateObj.toISOString().split('T')[0]
      if (!acc[dateKey]) acc[dateKey] = { totalScore: 0, count: 0 }
      acc[dateKey].totalScore += (MOOD_SCORES[curr.moodLabel] ?? 4)
      acc[dateKey].count += 1
      return acc
    }, {})

    const map = {}
    Object.keys(grouped).forEach(k => {
      map[k] = { score: grouped[k].totalScore / grouped[k].count }
    })
    setDailyMap(map)
  }

  const changePeriod = (increment) => {
    const newDate = new Date(currentDate)
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + increment)
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (increment * 7))
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + increment)
    }
    setCurrentDate(newDate)
  }

  const handleDayPress = (day) => {
    const newDate = new Date(currentDate)
    newDate.setDate(day)
    setCurrentDate(newDate)
    setViewMode('day')
  }

  const getHeaderTitle = () => {
    if (viewMode === 'all') return 'Вся історія'
    
    const d = currentDate
    const mName = [
      'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
      'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
    ][d.getMonth()]

    if (viewMode === 'day') {
      return `${d.getDate()} ${mName} ${d.getFullYear()}`
    }
    return `${mName} ${d.getFullYear()}`
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <ViewSelector currentMode={viewMode} onSelect={setViewMode} theme={theme} />
        <Spacer height={15} />

        {viewMode !== 'all' && (
          <View style={styles.headerControl}>
            <TouchableOpacity onPress={() => changePeriod(-1)} style={styles.arrowBtn}>
              <Feather name="chevron-left" size={28} color={theme.textPrimary} />
            </TouchableOpacity>
            
            <ThemedText style={styles.monthTitle}>
              {getHeaderTitle()}
            </ThemedText>

            <TouchableOpacity onPress={() => changePeriod(1)} style={styles.arrowBtn}>
              <Feather name="chevron-right" size={28} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>
        )}

        <Spacer height={20} />

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} />
        ) : (
          <>
            <MoodChart data={chartData} theme={theme} viewMode={viewMode} />
            <Spacer height={20} />
            <CalendarView 
              dailyData={dailyMap} 
              currentDate={currentDate} 
              theme={theme} 
              onDayPress={handleDayPress}
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
  selectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 4,
    marginBottom: 10
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10
  },
  selectorText: {
    fontSize: 14
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