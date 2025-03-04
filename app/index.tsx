// app/index.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Animated, Platform } from 'react-native';
import { Text, useTheme, YStack, XStack, Button, H1, H4, View, Separator } from 'tamagui';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from './context/AuthContext';

// Hardcoded test credentials
const TEST_USERNAME = "user@example.com";
const TEST_PASSWORD = "password123";

export default function Index() {
  const theme = useTheme();
  const router = useRouter();
  const { isAuthenticated, login, loginWithBiometrics } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if device supports biometrics
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricAvailable(compatible && enrolled);
    })();
  }, []);

  useEffect(() => {
    // If authentication status changes to true, navigate to portfolio
    if (isAuthenticated) {
      router.replace('/(tabs)/portfolio');
    }
  }, [isAuthenticated, router]);

  // Function to handle manual login
  const handleLogin = () => {
    setIsLoading(true);
    setError('');
    
    // Simulate network request
    setTimeout(() => {
      const success = login(username, password);
      if (!success) {
        setError('Invalid username or password');
      }
      setIsLoading(false);
    }, 800);
  };

  // Function to handle biometric authentication
  const handleBiometricAuth = async () => {
    try {
      setError('');
      const biometricAuth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login with biometrics',
        fallbackLabel: 'Use password instead',
      });
      if (biometricAuth.success) {
        loginWithBiometrics();
      }
    } catch (error) {
      setError('Authentication failed');
    }
  };
  
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
  
  return (
    <YStack 
      flex={1} 
      backgroundColor="$background" 
      padding="$4" 
      space="$4" 
      alignItems="center" 
      justifyContent="center"
    >
      <YStack space="$4" width="100%" maxWidth={400} padding="$4">
        {/* Logo/App Name */}
        <YStack alignItems="center" space="$3" marginBottom="$6">
          <View 
            backgroundColor="$blue2" 
            padding="$4" 
            borderRadius={60} 
            marginBottom="$2"
          >
            <Ionicons 
              name="wallet-outline" 
              size={56} 
              color={theme.blue9.get()} 
            />
          </View>
          {/* <H1 color="$color" textAlign="center" fontWeight="bold">Finance App</H1> */}
          {/* <H4 color="$color" opacity={0.7} textAlign="center">Secure your financial future</H4> */}
        </YStack>

        {/* Login Form */}
        <YStack 
          space="$5" 
          width="100%" 
          backgroundColor="$backgroundStrong" 
          padding="$5" 
          borderRadius="$6"
        >
          {error ? (
            <View 
              backgroundColor="$red2" 
              paddingVertical="$2" 
              paddingHorizontal="$3" 
              borderRadius="$4"
              borderLeftWidth={4}
              borderLeftColor="$red9"
            >
              <Text color="$red9">{error}</Text>
            </View>
          ) : null}
          
          {/* Username Field */}
          <YStack space="$2">
            <Text color="$color" fontWeight="bold" fontSize="$3">Email</Text>
            <View 
              borderWidth={1} 
              borderColor="$borderColor" 
              borderRadius="$4" 
              paddingHorizontal="$3"
              paddingVertical="$2"
              backgroundColor="$backgroundHover"
            >
              <XStack alignItems="center" space="$3">
                <Ionicons name="mail-outline" size={20} color={theme.blue9.get()} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.color.get() + '60'}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </XStack>
            </View>
          </YStack>

          {/* Password Field */}
          <YStack space="$2">
            <Text color="$color" fontWeight="bold" fontSize="$3">Password</Text>
            <View 
              borderWidth={1} 
              borderColor="$borderColor" 
              borderRadius="$4" 
              paddingHorizontal="$3"
              paddingVertical="$2"
              backgroundColor="$backgroundHover"
            >
              <XStack alignItems="center" space="$3">
                <Ionicons name="lock-closed-outline" size={20} color={theme.blue9.get()} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.color.get() + '60'}
                  secureTextEntry={!isPasswordVisible}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={togglePasswordVisibility}>
                  <Ionicons 
                    name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={theme.color.get() + 'AA'} 
                  />
                </TouchableOpacity>
              </XStack>
            </View>
          </YStack>

          {/* Remember Me & Forgot Password */}
          <XStack justifyContent="space-between" alignItems="center">
            <XStack alignItems="center" space="$2">
              <View 
                width={18} 
                height={18} 
                borderRadius="$2" 
                borderWidth={1} 
                borderColor="$blue9"
                justifyContent="center" 
                alignItems="center"
                backgroundColor="$blue2"
              >
                <Ionicons name="checkmark" size={14} color={theme.blue9.get()} />
              </View>
              <Text color="$color" fontSize="$2">Remember me</Text>
            </XStack>
            <Text color="$blue9" fontWeight="600" fontSize="$2">Forgot Password?</Text>
          </XStack>

          {/* Login Button */}
          <Button 
            backgroundColor="$blue9" 
            color="white" 
            fontWeight="bold" 
            size="$4" 
            marginTop="$1"
            onPress={handleLogin}
            disabled={isLoading}
            pressStyle={{ opacity: 0.8 }}
            animation="quick"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>

          {/* OR Divider */}
          <XStack alignItems="center" justifyContent="center" space="$2" marginVertical="$1">
            <Separator flex={1} />
            <Text color="$colorFocus">or</Text>
            <Separator flex={1} />
          </XStack>

          {/* Biometric Auth */}
          {isBiometricAvailable ? (
            <TouchableOpacity 
              onPress={handleBiometricAuth}
              style={styles.biometricButton}
            >
              <XStack space="$2" alignItems="center" justifyContent="center">
                <Ionicons 
                  name="finger-print-outline" 
                  size={22} 
                  color={theme.color.get()} 
                />
                <Text color="$color" fontWeight="600">Login with Biometrics</Text>
              </XStack>
            </TouchableOpacity>
          ) : null}
        </YStack>

        {/* Create Account */}
        <XStack space="$2" justifyContent="center" marginTop="$4">
          <Text color="$colorFocus">Don't have an account?</Text>
          <Text color="$blue9" fontWeight="600">Sign Up</Text>
        </XStack>
      </YStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  input: {
    flex: 1,
    height: 42,
    fontSize: 16,
    color: Platform.select({ ios: undefined, android: '#000' }), // Fix for Android text color
  },
  biometricButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  }
});