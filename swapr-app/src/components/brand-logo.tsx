import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { palette } from '../constants/palette';
import { useAppTheme } from './app-theme';

/** Shared shopping identity for the app's welcome, account, and main headers. */
export function BrandLogo({ compact = false }: { compact?: boolean }) {
  const { isDark } = useAppTheme();
  return (
    <View style={[styles.lockup, isDark && styles.sticker]}>
      <Image
        source={require('../../assets/brand/genz-lockup.png')}
        style={{ width: compact ? 110 : 164, height: compact ? 29 : 43 }}
        contentFit="contain"
        accessibilityLabel="Swapr, ukay and preloved finds"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  lockup: { flexShrink: 0 },
  sticker: { backgroundColor: palette.background, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 12 },
});
