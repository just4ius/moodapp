import ThemedView from '../components/ThemedView';
import ThemedText from '../components/ThemedText';
import { StyleSheet } from 'react-native';

export default function MeditationScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText>Сторінка Медитації</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});