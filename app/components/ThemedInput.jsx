import { TextInput, useColorScheme, StyleSheet } from 'react-native'
import { Colors } from '../constants/Colors'

const ThemedInput = ({ style, ...props }) => {
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light

  return (
    <TextInput
      style={[
        styles.input,
        { backgroundColor: theme.inputBackground, color: theme.textPrimary },
        style
      ]}
      placeholderTextColor={theme.textSecondary}
      underlineColorAndroid="transparent"
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  input: {
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10
  }
})

export default ThemedInput