
import { createTamagui } from 'tamagui';
import { defaultConfig } from '@tamagui/config/v4';

export const config = createTamagui({
  ...defaultConfig,
  tokens: {
    ...defaultConfig.tokens,
    color: {
      ...defaultConfig.tokens.color,
      gray5: '#f0f0f0', 
      blue10: '#1e90ff', 
    },
  },
});

export default config;


