import { Card, YStack, Text } from 'tamagui';

interface ToastNotificationProps {
  visible: boolean;
  title: string;
  message: string;
  bgColor: string;
}

export const ToastNotification = ({ visible, title, message, bgColor }: ToastNotificationProps) => (
  visible && (
    <Card
      position="absolute"
      top="$8"
      left="$2"
      right="$2"
      backgroundColor={bgColor}
      padding="$2"
      borderRadius="$6"
      elevation="$2"
      animation="quick"
      enterStyle={{ opacity: 0, scale: 0.5, y: -25 }}
      exitStyle={{ opacity: 0, scale: 1, y: -20 }}
      zIndex={1000}
    >
      <YStack alignItems="center" gap="$1">
        <Text color="white" fontWeight="bold" fontSize="$4">{title}</Text>
        <Text color="white" fontSize="$3">{message}</Text>
      </YStack>
    </Card>
  )
);