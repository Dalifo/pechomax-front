import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { usePechoMaxFonts } from './src/theme/fonts';
import { colors } from './src/theme/theme';

export default function App() {
  const { fontsLoaded } = usePechoMaxFonts();

  if (!fontsLoaded) {
    return <View style={{ backgroundColor: colors.background, flex: 1 }} />;
  }

  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
    </>
  );
}
