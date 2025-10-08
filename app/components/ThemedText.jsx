import { Text, useColorScheme } from 'react-native'
import { Colors } from '../constants/Colors'

const ThemedText = ({ style, button = false, ...props }) => {
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light

  const textColor = button ? theme.buttonText : theme.textPrimary

  return (
    <Text
      style={[{ color: textColor, fontSize: 16 }, style]}
      {...props}
    />
  )
}

export default ThemedText