import { Sheet, YStack, XStack, Text, Input, Button } from 'tamagui';
import { Message } from './types';

interface GoalEditorSheetProps {
  goal: Message['goalData'] | null;
  onClose: () => void;
  onSave: (goalData: Message['goalData']) => void;
  isDark: boolean;
}

export const GoalEditorSheet = ({ goal, onClose, onSave, isDark }: GoalEditorSheetProps) => (
  <Sheet open={!!goal} onOpenChange={(open) => !open && onClose()} snapPoints={[50]} position={0}>
    <Sheet.Overlay />
    <Sheet.Frame padding="$2" backgroundColor={isDark ? '$gray1Dark' : '$white'} borderRadius="$4">
      <YStack space="$2">
        <Text fontSize="$5" fontWeight="bold" color={isDark ? '$gray12' : '$gray11'}>
          Edit Goal
        </Text>
        {goal && (
          <>
            <XStack space="$2" alignItems="center">
              <Text flex={1} color={isDark ? '$gray11' : '$gray10'}>Title</Text>
              <Input
                flex={3}
                value={goal.title}
                onChangeText={(text) => onSave({ ...goal, title: text })}
                backgroundColor={isDark ? '$gray3Dark' : '$white'}
                borderColor="$gray3Light"
                borderRadius="$3"
                padding="$2"
                color={isDark ? '$gray12' : '$gray11'}
              />
            </XStack>
            <XStack space="$2" alignItems="center">
              <Text flex={1} color={isDark ? '$gray11' : '$gray10'}>Target (JMD)</Text>
              <Input
                flex={3}
                value={goal.target.toString()}
                onChangeText={(text) => onSave({ ...goal, target: parseFloat(text) || 0 })}
                keyboardType="numeric"
                backgroundColor={isDark ? '$gray3Dark' : '$white'}
                borderColor="$gray3Light"
                borderRadius="$3"
                padding="$2"
                color={isDark ? '$gray12' : '$gray11'}
              />
            </XStack>
            <XStack space="$2" alignItems="center">
              <Text flex={1} color={isDark ? '$gray11' : '$gray10'}>Timeframe</Text>
              <Input
                flex={3}
                value={goal.timeframe}
                onChangeText={(text) => onSave({ ...goal, timeframe: text })}
                backgroundColor={isDark ? '$gray3Dark' : '$white'}
                borderColor="$gray3Light"
                borderRadius="$3"
                padding="$2"
                color={isDark ? '$gray12' : '$gray11'}
              />
            </XStack>
            <XStack space="$2" alignItems="center">
              <Text flex={1} color={isDark ? '$gray11' : '$gray10'}>Description</Text>
              <Input
                flex={3}
                value={goal.description || ''}
                onChangeText={(text) => onSave({ ...goal, description: text })}
                multiline
                backgroundColor={isDark ? '$gray3Dark' : '$white'}
                borderColor="$gray3Light"
                borderRadius="$3"
                padding="$2"
                color={isDark ? '$gray12' : '$gray11'}
              />
            </XStack>
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
                backgroundColor="$green9"
                onPress={() => {
                  onSave(goal);
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