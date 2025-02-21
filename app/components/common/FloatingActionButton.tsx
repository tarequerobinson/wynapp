// src/components/common/FloatingActionButton.tsx
import { styled } from 'tamagui'
import { Button, Stack } from 'tamagui'
import { Plus } from '@tamagui/lucide-icons'

const StyledFAB = styled(Button, {
  position: 'absolute',
  bottom: 24,
  right: 24,
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: '$blue10',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
})

interface FABProps {
  onPress: () => void
  icon?: React.ReactNode
}

export const FloatingActionButton = ({ 
  onPress, 
  icon = <Plus size={24} color="white" /> 
}: FABProps) => {
  return (
    <StyledFAB
      onPress={onPress}
      animation="bouncy"
      pressStyle={{ scale: 0.95 }}
    >
      <Stack alignItems="center" justifyContent="center">
        {icon}
      </Stack>
    </StyledFAB>
  )
}