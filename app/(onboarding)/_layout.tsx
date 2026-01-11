import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen 
        name="welcome" 
        options={{
          animation: 'fade',
        }}
      />
      <Stack.Screen 
        name="auth" 
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="interests" 
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="complete"
        options={{
          animation: 'fade',
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}

