import { Stack, useTheme } from 'tamagui';

interface OverlayProps {
  onPress: () => void;
}

export function Overlay({ onPress }: OverlayProps) {
  const theme = useTheme();
  const isDark = theme.name === 'dark';

  return (
    <Stack
      position="absolute"
      left={300}
      top={0}
      right={0}
      bottom={0}
      backgroundColor={isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)'}
      onPress={onPress}
    />
  );
}