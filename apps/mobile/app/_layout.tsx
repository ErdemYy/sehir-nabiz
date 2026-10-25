import type { ReactElement } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '../src/providers/AppProvider';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { useAppTheme } from '../src/theme';

function RootLayoutNav(): ReactElement {
  const { isDark, theme } = useAppTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.surface,
          },
          headerTintColor: theme.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: theme.background,
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'ŞehirNabız',
            headerLargeTitle: false,
          }}
        />
        <Stack.Screen
          name="+not-found"
          options={{
            title: 'Sayfa Bulunamadı',
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
