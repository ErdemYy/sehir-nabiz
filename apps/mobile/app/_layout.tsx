import type { ReactElement } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '../src/providers/AppProvider';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { useAppTheme } from '../src/theme';
import { useAppFonts } from '../src/hooks/useAppFonts';

function RootLayoutNav(): ReactElement {
  const { isDark, theme } = useAppTheme();
  useAppFonts();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: theme.background,
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="showcase" options={{ headerShown: false }} />
        <Stack.Screen
          name="+not-found"
          options={{
            headerShown: true,
            title: 'Sayfa Bulunamadı',
            headerStyle: { backgroundColor: theme.surface },
            headerTintColor: theme.text,
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout(): ReactElement {
  return (
    <ErrorBoundary>
      <AppProvider>
        <RootLayoutNav />
      </AppProvider>
    </ErrorBoundary>
  );
}
