import type { ReactElement } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link, Stack } from 'expo-router';
import { useAppTheme } from '../src/theme';

export default function NotFoundScreen(): ReactElement {
  const { theme } = useAppTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Sayfa Bulunamadı' }} />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>Bu ekran mevcut değil.</Text>
        <Link href="/" style={[styles.link, { color: theme.primary }]}>
          Ana sayfaya dön
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  link: {
    fontSize: 16,
    fontWeight: '600',
  },
});
