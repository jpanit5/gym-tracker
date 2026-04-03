import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// 🔥 ICONS
import { BarChart3, Dumbbell, Home, PieChart } from 'lucide-react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme() || 'light';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors[colorScheme].tint,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Home size={26} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="create-plan"
        options={{
          title: 'Plan',
          tabBarIcon: ({ color }) => (
            <Dumbbell size={26} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color }) => (
            <BarChart3 size={26} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color }) => (
            <PieChart size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}