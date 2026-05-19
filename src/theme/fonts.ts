import { useFonts } from 'expo-font';

export const fontAssets = {
  FuturaBook: require('../../assets/TYPO/Futura Std Book.ttf'),
  FuturaBold: require('../../assets/TYPO/Futura Bold.ttf'),
} as const;

export function usePechoMaxFonts() {
  const [loaded, error] = useFonts(fontAssets);

  return {
    fontsLoaded: loaded,
    fontError: error,
  };
}
