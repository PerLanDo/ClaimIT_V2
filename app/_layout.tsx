import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '../contexts/AuthContext';
import 'react-native-url-polyfill/auto';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="report-item" />
        <Stack.Screen name="item-detail" />
        <Stack.Screen name="claim-process" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" backgroundColor="#A85751" />
    </AuthProvider>
  );
}