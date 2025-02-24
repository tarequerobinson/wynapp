import { useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import { TamaguiProvider, type TamaguiProviderProps } from 'tamagui';
import { ToastProvider, ToastViewport } from '@tamagui/toast';
import { CurrentToast } from './CurrentToast';
import { config } from '../tamagui.config';

export function Provider({ children, ...rest }: Omit<TamaguiProviderProps, 'config'>) {
  const [themeName, setThemeName] = useState(Appearance.getColorScheme() || 'light');

  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setThemeName(colorScheme || 'light');
    });
    return () => listener.remove();
  }, []);

  return (
    <TamaguiProvider
      config={config}
      defaultTheme={themeName}
      {...rest}
    >
      <ToastProvider
        swipeDirection="horizontal"
        duration={6000}
        native={
          [
            // Uncomment the next line for native toasts on mobile (requires dev build, not Expo Go)
            // 'mobile'
          ]
        }
      >
        {children}
        <CurrentToast />
        <ToastViewport top="$8" left={0} right={0} />
      </ToastProvider>
    </TamaguiProvider>
  );
}