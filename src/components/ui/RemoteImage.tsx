import { PropsWithChildren, useEffect, useState } from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, opacity } from '../../theme/theme';

type RemoteImageProps = PropsWithChildren<{
  imageStyle?: StyleProp<ImageStyle>;
  style?: StyleProp<ViewStyle>;
  uri?: string;
}>;

export function RemoteImage({ children, imageStyle, style, uri }: RemoteImageProps) {
  const [failed, setFailed] = useState(false);
  const canRender = Boolean(uri) && !failed;

  useEffect(() => {
    setFailed(false);
  }, [uri]);

  return (
    <View style={[styles.container, style]}>
      {canRender ? <Image onError={() => setFailed(true)} source={{ uri }} style={[styles.image, imageStyle]} /> : children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: opacity.secondary10,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    backgroundColor: colors.surface,
    height: '100%',
    resizeMode: 'cover',
    width: '100%',
  },
});
