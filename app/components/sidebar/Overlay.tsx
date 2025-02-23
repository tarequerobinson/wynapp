import { Stack } from 'tamagui';

interface OverlayProps {
  onPress: () => void;
}

export function Overlay({ onPress }: OverlayProps) {
  return (
    <Stack
      position="absolute"
      left={300}
      top={0}
      right={0}
      bottom={0}
      backgroundColor="rgba(0,0,0,0.4)"
      onPress={onPress}
    />
  );
}