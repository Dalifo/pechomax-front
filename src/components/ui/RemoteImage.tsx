import { PropsWithChildren, useEffect, useState } from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, opacity } from '../../theme/theme';

type RemoteImageProps = PropsWithChildren<{
  debugLabel?: string;
  imageStyle?: StyleProp<ImageStyle>;
  style?: StyleProp<ViewStyle>;
  uri?: string;
}>;

export function RemoteImage({ children, debugLabel, imageStyle, style, uri }: RemoteImageProps) {
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const sources = imageSources(uri);
  const currentUri = sources[attempt];
  const canRender = Boolean(uri) && !failed;

  useEffect(() => {
    setAttempt(0);
    setFailed(false);
    if (__DEV__) {
      console.log('[RemoteImage] uri changed', { label: debugLabel, hasUri: Boolean(uri), sources });
    }
  }, [uri]);

  return (
    <View style={[styles.container, style]}>
      {canRender ? (
        <Image
          onError={(event) => {
            if (__DEV__) {
              console.log('[RemoteImage] load error', {
                error: event.nativeEvent.error,
                attempt,
                label: debugLabel,
                uri: currentUri,
              });
            }
            if (attempt < sources.length - 1) {
              setAttempt((current) => current + 1);
              return;
            }
            setFailed(true);
          }}
          onLoad={() => {
            if (__DEV__) {
              console.log('[RemoteImage] loaded', { attempt, label: debugLabel, uri: currentUri });
            }
          }}
          source={{
            uri: currentUri,
            headers: {
              Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
              'User-Agent': 'PechoMax/1.0 ExpoGo',
            },
          }}
          style={[styles.image, imageStyle]}
        />
      ) : children}
    </View>
  );
}

function imageSources(uri?: string) {
  if (!uri) {
    return [];
  }

  if (!uri.startsWith('https://upload.wikimedia.org/')) {
    return [uri];
  }

  const withoutProtocol = uri.replace(/^https?:\/\//, '');
  return [uri, `https://images.weserv.nl/?url=${encodeURIComponent(withoutProtocol)}&w=1200&output=jpg`];
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
