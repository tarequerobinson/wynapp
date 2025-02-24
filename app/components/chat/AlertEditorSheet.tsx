import { Sheet, YStack, XStack, Text, Input, Button, useTheme } from 'tamagui';
import { Message } from './types';

interface AlertEditorSheetProps {
  alert: Message['alertData'] | null;
  onClose: () => void;
  onSave: (alertData: Message['alertData']) => void;
}

export const AlertEditorSheet = ({ alert, onClose, onSave }: AlertEditorSheetProps) => {
  const theme = useTheme();
  const isDark = theme.name === 'dark';

  return (
    <Sheet open={!!alert} onOpenChange={(open) => !open && onClose()} snapPoints={[50]} position={0}>
      <Sheet.Overlay />
      <Sheet.Frame padding="$2" backgroundColor="$background" borderRadius="$4">
        <YStack space="$2">
          <Text fontSize="$5" fontWeight="bold" color="$color">
            Edit Alert
          </Text>
          {alert && (
            <>
              <XStack space="$2" alignItems="center">
                <Text flex={1} color="$gray10">Type</Text>
                <Input
                  flex={3}
                  value={alert.type}
                  onChangeText={(text) => onSave({ ...alert, type: text })}
                  backgroundColor={isDark ? '$gray3' : '$white'}
                  borderColor="$gray4"
                  borderRadius="$3"
                  padding="$2"
                  color="$color"
                />
              </XStack>
              <XStack space="$2" alignItems="center">
                <Text flex={1} color="$gray10">Target</Text>
                <Input
                  flex={3}
                  value={alert.target}
                  onChangeText={(text) => onSave({ ...alert, target: text })}
                  backgroundColor={isDark ? '$gray3' : '$white'}
                  borderColor="$gray4"
                  borderRadius="$3"
                  padding="$2"
                  color="$color"
                />
              </XStack>
              <XStack space="$2" alignItems="center">
                <Text flex={1} color="$gray10">Condition</Text>
                <Input
                  flex={3}
                  value={alert.condition}
                  onChangeText={(text) => onSave({ ...alert, condition: text })}
                  backgroundColor={isDark ? '$gray3' : '$white'}
                  borderColor="$gray4"
                  borderRadius="$3"
                  padding="$2"
                  color="$color"
                />
              </XStack>
              <YStack space="$1">
                <Text color="$gray10">Notify Via</Text>
                <XStack space="$1" flexWrap="wrap">
                  {['email', 'sms', 'push', 'in-app'].map((method) => (
                    <Button
                      key={method}
                      size="$2"
                      backgroundColor={alert.notificationMethod.includes(method) ? '$yellow9' : '$gray3'}
                      onPress={() => {
                        const updatedMethods = alert.notificationMethod.includes(method)
                          ? alert.notificationMethod.filter(m => m !== method)
                          : [...alert.notificationMethod, method];
                        onSave({ ...alert, notificationMethod: updatedMethods });
                      }}
                      color={alert.notificationMethod.includes(method) ? '$white' : '$color'}
                    >
                      {method}
                    </Button>
                  ))}
                </XStack>
              </YStack>
              <XStack justifyContent="flex-end" space="$1" marginTop="$2">
                <Button 
                  size="$3"
                  onPress={onClose} 
                  backgroundColor="$gray3" 
                  color="$color"
                >
                  Cancel
                </Button>
                <Button
                  size="$3"
                  backgroundColor="$yellow9"
                  onPress={() => {
                    onSave(alert);
                    onClose();
                  }}
                  color="$white"
                >
                  Save
                </Button>
              </XStack>
            </>
          )}
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
};

export default AlertEditorSheet;