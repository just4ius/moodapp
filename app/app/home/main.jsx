import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import { StyleSheet } from 'react-native'

export default function MainTab() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Головна сторінка</ThemedText>
      <ThemedText>Ви успішно увійшли!</ThemedText>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontWeight: 'bold', fontSize: 28, marginBottom: 20 },
})