
import ThemedView from '../components/ThemedView';
import ThemedText from '../components/ThemedText';
import { StyleSheet } from 'react-native';

export default function AdviceScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText>Сторінка Порад</ThemedText>
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