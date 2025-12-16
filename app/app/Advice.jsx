import { useEffect, useState } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, View } from 'react-native';
import ThemedView from '../components/ThemedView';
import ThemedText from '../components/ThemedText';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';

export default function AdviceScreen() {
  const [adviceList, setAdviceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  useEffect(() => {
    fetchAdviceHistory();
  }, []);

  const fetchAdviceHistory = async () => {
    try {
      const response = await fetch('http://10.232.16.43:5051/api/Advice/history/1');
      if (response.ok) {
        const data = await response.json();
        setAdviceList(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: theme.inputBackground }]}>
      <View style={styles.headerRow}>
        <ThemedText style={styles.date}>
          {new Date(item.createdAt).toLocaleDateString()}
        </ThemedText>
        <ThemedText style={styles.mood}>{item.moodLabel}</ThemedText>
      </View>
      
      {item.note && (
        <ThemedText style={[styles.note, { color: theme.textSecondary }]}>
          "{item.note}"
        </ThemedText>
      )}
      
      <View style={styles.adviceBox}>
        <ThemedText style={styles.adviceText}>{item.advice}</ThemedText>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Ваші поради</ThemedText>
      
      {loading ? (
        <ActivityIndicator size="large" color={theme.link} />
      ) : (
        <FlatList
          data={adviceList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <ThemedText style={styles.emptyText}>Поки немає збережених порад.</ThemedText>
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    opacity: 0.6,
  },
  mood: {
    fontWeight: 'bold',
  },
  note: {
    fontStyle: 'italic',
    marginBottom: 10,
    fontSize: 14,
  },
  adviceBox: {
    marginTop: 5,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.2)',
  },
  adviceText: {
    fontSize: 15,
    lineHeight: 22,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    opacity: 0.5,
  }
});