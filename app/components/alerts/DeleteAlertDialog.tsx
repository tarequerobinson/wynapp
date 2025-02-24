import { AlertDialog, Button, H2, Paragraph, XStack, YStack } from 'tamagui';

type DeleteAlertDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDark: boolean;
};

export const DeleteAlertDialog = ({ isOpen, onOpenChange, onConfirm, isDark }: DeleteAlertDialogProps) => (
  <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
    <AlertDialog.Portal>
      <AlertDialog.Overlay animation="quick" opacity={0.5} />
      <AlertDialog.Content
        bordered
        elevate
        animation="quick"
        enterStyle={{ y: -20, opacity: 0 }}
        exitStyle={{ y: 10, opacity: 0 }}
        maxWidth="90%"
        backgroundColor={isDark ? '$gray2' : '$background'}
      >
        <YStack space="$3" padding="$3">
          <H2 fontSize="$6" color={isDark ? '$gray12' : '$gray11'}>Delete Alert</H2>
          <Paragraph size="$3" color={isDark ? '$gray11' : '$gray10'}>
            Are you sure you want to delete this alert? This action cannot be undone.
          </Paragraph>
          <XStack space="$2" justifyContent="flex-end">
            <Button theme="gray" size="$3" onPress={() => onOpenChange(false)} backgroundColor={isDark ? '$gray4' : '$gray3'}>
              Cancel
            </Button>
            <Button theme="red" size="$3" onPress={onConfirm}>
              Delete
            </Button>
          </XStack>
        </YStack>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  </AlertDialog>
);