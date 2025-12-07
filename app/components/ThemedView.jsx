import { View } from 'react-native'
import { useAppTheme } from '../context/AppContext'

const ThemedView = ({ style, ...props }) => {
  const { theme } = useAppTheme()

  return (
    <View
      style={[{ backgroundColor: theme.background }, style]}
      {...props}
    />
  )
}
export default ThemedView