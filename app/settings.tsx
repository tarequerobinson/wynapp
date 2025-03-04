import { 
  Text, 
  YStack, 
  XStack,
  Switch,
  Separator,
  Button,
  ScrollView,
  H3,
  Input,
  Select,
  Checkbox,
  Label 
} from 'tamagui';
import { useState, useEffect } from 'react';
import { ChevronDown, User, Mail, Lock, DollarSign, LogOut } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { useAuth } from './context/AuthContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  
  // State management for all profile fields
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@example.com");
  const [riskTolerance, setRiskTolerance] = useState("Moderate");
  const [age, setAge] = useState("30");
  const [investmentGoal, setInvestmentGoal] = useState("Wealth Growth");
  const [annualIncome, setAnnualIncome] = useState("$50,001 - $100,000");
  const [netWorth, setNetWorth] = useState("$100,001 - $500,000");
  const [investmentExperience, setInvestmentExperience] = useState("Intermediate");
  const [preferredIndustries, setPreferredIndustries] = useState<string[]>([]);
  const [subscribeMarketUpdates, setSubscribeMarketUpdates] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('SettingsScreen: Redirecting to / due to unauthenticated user');
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  // Only render settings if authenticated (optional for security)
  if (!isAuthenticated) {
    return null; // Prevent rendering until authenticated
  }

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  const handleIndustryChange = (industry: string) => {
    setPreferredIndustries(prev =>
      prev.includes(industry)
        ? prev.filter(item => item !== industry)
        : [...prev, industry]
    );
  };

  const handleSubmit = () => {
    console.log("Profile updated:", { 
      name, 
      email, 
      riskTolerance,
      age,
      investmentGoal,
      annualIncome,
      netWorth,
      investmentExperience,
      preferredIndustries,
      subscribeMarketUpdates
    });
  };
  
  return (
    <ScrollView>
      <YStack padding="$4" space="$4" backgroundColor="$background">
        <H3 fontWeight="bold">Investment Profile</H3>

        {/* Personal Information */}
        <YStack space="$2">
          <Text fontSize="$6" fontWeight="600">Personal Information</Text>
          <YStack backgroundColor="$gray1" borderRadius="$4" padding="$3" space="$3">
            <Input
              placeholder="Name"
              value={name}
              onChangeText={setName}
              startAdornment={<User size="$1" />}
            />
            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              startAdornment={<Mail size="$1" />}
            />
            <Input
              placeholder="Age"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />
          </YStack>
        </YStack>

        {/* Investment Preferences */}
        <YStack space="$2">
          <Text fontSize="$6" fontWeight="600">Investment Preferences</Text>
          <YStack backgroundColor="$gray1" borderRadius="$4" padding="$3" space="$3">
            <Select value={riskTolerance} onValueChange={setRiskTolerance}>
              <Select.Trigger iconAfter={<ChevronDown />}>
                <Select.Value placeholder="Risk Tolerance" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item index={0} value="Low"><Text>Low</Text></Select.Item>
                <Select.Item index={1} value="Moderate"><Text>Moderate</Text></Select.Item>
                <Select.Item index={2} value="High"><Text>High</Text></Select.Item>
              </Select.Content>
            </Select>

            <Select value={investmentGoal} onValueChange={setInvestmentGoal}>
              <Select.Trigger iconAfter={<ChevronDown />}>
                <Select.Value placeholder="Investment Goal" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item index={0} value="Retirement"><Text>Retirement</Text></Select.Item>
                <Select.Item index={1} value="Wealth Growth"><Text>Wealth Growth</Text></Select.Item>
                <Select.Item index={2} value="Education"><Text>Education</Text></Select.Item>
                <Select.Item index={3} value="Other"><Text>Other</Text></Select.Item>
              </Select.Content>
            </Select>

            <Select value={annualIncome} onValueChange={setAnnualIncome}>
              <Select.Trigger iconAfter={<ChevronDown />}>
                <Select.Value placeholder="Annual Income" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item index={0} value="$0 - $50,000"><Text>$0 - $50,000</Text></Select.Item>
                <Select.Item index={1} value="$50,001 - $100,000"><Text>$50,001 - $100,000</Text></Select.Item>
                <Select.Item index={2} value="$100,001+"><Text>$100,001+</Text></Select.Item>
              </Select.Content>
            </Select>

            <Select value={investmentExperience} onValueChange={setInvestmentExperience}>
              <Select.Trigger iconAfter={<ChevronDown />}>
                <Select.Value placeholder="Investment Experience" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item index={0} value="Novice"><Text>Novice</Text></Select.Item>
                <Select.Item index={1} value="Intermediate"><Text>Intermediate</Text></Select.Item>
                <Select.Item index={2} value="Advanced"><Text>Advanced</Text></Select.Item>
              </Select.Content>
            </Select>
          </YStack>
        </YStack>

        {/* Industry Preferences */}
        <YStack space="$2">
          <Text fontSize="$6" fontWeight="600">Industry Preferences</Text>
          <YStack backgroundColor="$gray1" borderRadius="$4" padding="$3" space="$2">
            {['Technology', 'Real Estate', 'Healthcare', 'Energy', 'Consumer Goods', 'Financials'].map((industry) => (
              <XStack key={industry} space="$2" alignItems="center">
                <Checkbox
                  id={industry}
                  checked={preferredIndustries.includes(industry)}
                  onCheckedChange={() => handleIndustryChange(industry)}
                  size="$4"
                >
                  <Checkbox.Indicator>
                    <Text>✓</Text>
                  </Checkbox.Indicator>
                </Checkbox>
                <Label htmlFor={industry}>{industry}</Label>
              </XStack>
            ))}
          </YStack>
        </YStack>

        {/* Newsletter */}
        <XStack space="$2" alignItems="center">
          <Switch
            size="$3"
            checked={subscribeMarketUpdates}
            onCheckedChange={setSubscribeMarketUpdates}
          >
            <Switch.Thumb animation="quick" />
          </Switch>
          <Text>Subscribe to Market Updates</Text>
        </XStack>

        {/* Submit Button */}
        <Button
          theme="green"
          borderRadius="$4"
          onPress={handleSubmit}
          icon={<DollarSign size="$1" />}
        >
          Update Profile
        </Button>

        <Separator marginVertical="$4" />

        {/* Logout Button */}
        <Button
          theme="red"
          borderRadius="$4"
          onPress={handleLogout}
          icon={<LogOut size="$1" />}
        >
          Logout
        </Button>
      </YStack>
    </ScrollView>
  );
}