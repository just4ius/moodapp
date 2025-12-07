import { Text } from 'react-native'
import { useAppTheme } from '../context/AppContext'

const ThemedText = ({ style, button = false, ...props }) => {
  const { theme } = useAppTheme()
  const textColor = button ? theme.buttonText : theme.textPrimary

  return (
    <Text
      style={[{ color: textColor, fontSize: 16 }, style]}
      {...props}
    />
  )
}
export default ThemedText