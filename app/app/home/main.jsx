import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import { Colors } from '../../constants/Colors'
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const GradientCard = ({ iconName, text, onPress }) => {
  return (
    // 1. Всі стилі картки (card) та тіні (shadow) тепер тут
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      android_ripple={{ color: 'transparent' }}
      style={[styles.card, styles.shadow]}
    >
      {/* 2. Градієнт тепер просто заповнює батька, використовуючи новий стиль */}
      <LinearGradient
        colors={Colors.gradients.appPrimary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientFill}
      >
        <Feather name={iconName} size={24} color={Colors.white} style={styles.icon} />
        <Text style={styles.text}>{text}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default function MainTab() {
  const navigation = useNavigation();

  const navigateToStats = () => {
    navigation.navigate('Statistics');
  };

  const navigateToMeditation = () => {
    navigation.navigate('Meditation');
  };

  const navigateToAdvice = () => {
    navigation.navigate('Advice');
  };

  return (
    <ThemedView style={styles.container}>
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
        onPress={navigateToAdvice}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    marginBottom: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradientFill: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  icon: {
    marginRight: 15,
  },
  text: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
});