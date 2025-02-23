import { Sheet, YStack, XStack, Text, Input, Button } from 'tamagui';
import { Message } from './types';

interface AlertEditorSheetProps {
  alert: Message['alertData'] | null;
  onClose: () => void;
  onSave: (alertData: Message['alertData']) => void;
  isDark: boolean;
}

export const AlertEditorSheet = ({ alert, onClose, onSave, isDark }: AlertEditorSheetProps) => (
  <Sheet open={!!alert} onOpenChange={(open) => !open && onClose()} snapPoints={[50]} position={0}>
    <Sheet.Overlay />
    <Sheet.Frame padding="$2" backgroundColor={isDark ? '$gray1Dark' : '$white'} borderRadius="$4">
      <YStack space="$2">
        <Text fontSize="$5" fontWeight="bold" color={isDark ? '$gray12' : '$gray11'}>
          Edit Alert
        </Text>
        {alert && (
          <>
            <XStack space="$2" alignItems="center">
              <Text flex={1} color={isDark ? '$gray11' : '$gray10'}>Type</Text>
              <Input
                flex={3}
                value={alert.type}
                onChangeText={(text) => onSave({ ...alert, type: text })}
                backgroundColor={isDark ? '$gray3Dark' : '$white'}
                borderColor="$gray3Light"
                borderRadius="$3"
                padding="$2"
                color={isDark ? '$gray12' : '$gray11'}
              />
            </XStack>
            <XStack space="$2" alignItems="center">
              <Text flex={1} color={isDark ? '$gray11' : '$gray10'}>Target</Text>
              <Input
                flex={3}
                value={alert.target}
                onChangeText={(text) => onSave({ ...alert, target: text })}
                backgroundColor={isDark ? '$gray3Dark' : '$white'}
                borderColor="$gray3Light"
                borderRadius="$3"
                padding="$2"
                color={isDark ? '$gray12' : '$gray11'}
              />
            </XStack>
            <XStack space="$2" alignItems="center">
              <Text flex={1} color={isDark ? '$gray11' : '$gray10'}>Condition</Text>
              <Input
                flex={3}
                value={alert.condition}
                onChangeText={(text) => onSave({ ...alert, condition: text })}
                backgroundColor={isDark ? '$gray3Dark' : '$white'}
                borderColor="$gray3Light"
                borderRadius="$3"
                padding="$2"
                color={isDark ? '$gray12' : '$gray11'}
              />
            </XStack>
            <YStack space="$1">
              <Text color={isDark ? '$gray11' : '$gray10'}>Notify Via</Text>
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
                    color={alert.notificationMethod.includes(method) ? 'white' : isDark ? '$gray12' : '$gray11'}
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
                backgroundColor={isDark ? '$gray3Dark' : '$gray2Light'} 
                color={isDark ? '$gray12' : '$gray11'}
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