import { Sheet, YStack, XStack, Text, Input, Button, useTheme } from 'tamagui';
import { Message } from './types';

interface GoalEditorSheetProps {
  goal: Message['goalData'] | null;
  onClose: () => void;
  onSave: (goalData: Message['goalData']) => void;
}

export const GoalEditorSheet = ({ goal, onClose, onSave }: GoalEditorSheetProps) => {
  const theme = useTheme();
  const isDark = theme.name === 'dark';

  return (
    <Sheet open={!!goal} onOpenChange={(open) => !open && onClose()} snapPoints={[50]} position={0}>
      <Sheet.Overlay />
      <Sheet.Frame padding="$2" backgroundColor="$background" borderRadius="$4">
        <YStack space="$2">
          <Text fontSize="$5" fontWeight="bold" color="$color">
            Edit Goal
          </Text>
          {goal && (
            <>
              <XStack space="$2" alignItems="center">
                <Text flex={1} color="$gray10">Title</Text>
                <Input
                  flex={3}
                  value={goal.title}
                  onChangeText={(text) => onSave({ ...goal, title: text })}
                  backgroundColor={isDark ? '$gray3' : '$white'}
                  borderColor="$gray4"
                  borderRadius="$3"
                  padding="$2"
                  color="$color"
                />
              </XStack>
              <XStack space="$2" alignItems="center">
                <Text flex={1} color="$gray10">Target (JMD)</Text>
                <Input
                  flex={3}
                  value={goal.target.toString()}
                  onChangeText={(text) => onSave({ ...goal, target: parseFloat(text) || 0 })}
                  keyboardType="numeric"
                  backgroundColor={isDark ? '$gray3' : '$white'}
                  borderColor="$gray4"
                  borderRadius="$3"
                  padding="$2"
                  color="$color"
                />
              </XStack>
              <XStack space="$2" alignItems="center">
                <Text flex={1} color="$gray10">Timeframe</Text>
                <Input
                  flex={3}
                  value={goal.timeframe}
                  onChangeText={(text) => onSave({ ...goal, timeframe: text })}
                  backgroundColor={isDark ? '$gray3' : '$white'}
                  borderColor="$gray4"
                  borderRadius="$3"
                  padding="$2"
                  color="$color"
                />
              </XStack>
              <XStack space="$2" alignItems="center">
                <Text flex={1} color="$gray10">Description</Text>
                <Input
                  flex={3}
                  value={goal.description || ''}
                  onChangeText={(text) => onSave({ ...goal, description: text })}
                  multiline
                  backgroundColor={isDark ? '$gray3' : '$white'}
                  borderColor="$gray4"
                  borderRadius="$3"
                  padding="$2"
                  color="$color"
                />
              </XStack>
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
                  backgroundColor="$green9"
                  onPress={() => {
                    onSave(goal);
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

export default GoalEditorSheet;