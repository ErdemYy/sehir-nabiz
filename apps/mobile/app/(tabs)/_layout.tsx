import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { FloatingTabBar } from '../../src/components/ui/FloatingTabBar';
import { useAppTheme } from '../../src/theme';

export default function TabsLayout(): React.ReactElement {
  const { theme } = useAppTheme();
  const router = useRouter();

  return (
    <Tabs
      tabBar={(props) => {
        const currentRoute = props.state.routes[props.state.index]?.name || 'index';
        return (
          <FloatingTabBar
            currentRoute={currentRoute}
            onSelectTab={(routeName) => {
              if (routeName === 'index') {
                router.navigate('/(tabs)');
              } else {
                router.navigate(`/(tabs)/${routeName}` as any);
              }
            }}
          />
        );
      }}
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: theme.background,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Harita',
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Akış',
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Bildir',
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Bildirimler',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
        }}
      />
    </Tabs>
  );
}
